import * as THREE from 'three';
import { BRASILIA_DISTRICTS } from '../data/brasiliaData';
import {
  CameraPerspective,
  CharacterCustomization,
  GraphicsPreset,
  OnlinePlayer,
  VehicleSpec,
  WeatherType
} from '../types/game';

export interface WorldCallbacks {
  onUpdateTelemetry: (data: {
    x: number;
    z: number;
    speedKmh: number;
    districtName: string;
    nearbyInteractable: string | null;
    fuelDelta: number;
  }) => void;
}

interface LandmarkSpot {
  name: string;
  type: 'bank' | 'dealership' | 'hospital' | 'police' | 'fire' | 'gas' | 'store' | 'workshop';
  x: number;
  z: number;
}

export class BrasiliaWorld3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private callbacks: WorldCallbacks;

  private playerGroup: THREE.Group;
  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;
  private leftArm!: THREE.Mesh;
  private rightArm!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private torsoMesh!: THREE.Mesh;

  private vehicleGroup: THREE.Group;
  private vehicleBodyMesh!: THREE.Mesh;
  private vehicleWheels: THREE.Mesh[] = [];
  private sirenLightMesh!: THREE.Mesh;

  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private rainSystem: THREE.Points;

  private remotePlayerMeshes: Map<string, THREE.Group> = new Map();
  private sectorGroups: Map<string, THREE.Group> = new Map();
  private landmarks: LandmarkSpot[] = [];

  // Estado dinâmico
  private playerPos = new THREE.Vector3(0, 0, 18);
  private playerYaw = Math.PI;
  private cameraYaw = Math.PI;
  private cameraPitch = 0.24;
  private walkCycle = 0;

  private inVehicle = false;
  private currentVehicle: VehicleSpec | null = null;
  private vehicleSpeed = 0;
  private vehicleHeading = Math.PI;

  private moveInput = { x: 0, y: 0 };
  private isSprinting = false;
  private verticalVelocity = 0;
  private isGrounded = true;

  private perspective: CameraPerspective = 'third';
  private viewDistance = 420;
  private timeOfDay = 10.5;
  private weather: WeatherType = 'Ensolarado';
  private graphicsPreset: GraphicsPreset = 'Ultra';

  private animFrameId = 0;
  private lastTime = performance.now();
  private disposed = false;

  constructor(
    container: HTMLElement,
    character: CharacterCustomization,
    initialPos: { x: number; y: number; z: number },
    graphics: GraphicsPreset,
    viewDistance: number,
    callbacks: WorldCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.playerPos.set(initialPos.x, initialPos.y, initialPos.z);
    this.graphicsPreset = graphics;
    this.viewDistance = viewDistance;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#7dd3fc');
    this.scene.fog = new THREE.FogExp2('#93c5fd', 0.0016);

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, w / h, 0.25, 950);

    this.renderer = new THREE.WebGLRenderer({
      antialias: graphics === 'Ultra' || graphics === 'Alta',
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = graphics !== 'Baixa';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    container.appendChild(this.renderer.domElement);

    // Iluminação dinâmica (Sol + Céu do Cerrado)
    this.hemiLight = new THREE.HemisphereLight('#e0f2fe', '#78350f', 0.75);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight('#ffffff', 0.28);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight('#fffbeb', 1.85);
    this.sunLight.position.set(140, 220, 110);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 650;
    const d = 180;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Construção do mundo de Brasília por setores
    this.buildGroundAndRoads();
    this.buildBrasiliaMonuments();
    this.buildAdministrativeSectors();

    // Personagem 3D articulado
    this.playerGroup = this.buildCharacterMesh(character);
    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);

    // Veículo ativo 3D
    this.vehicleGroup = this.buildVehicleMesh();
    this.vehicleGroup.visible = false;
    this.scene.add(this.vehicleGroup);

    // Sistema de partículas de chuva dinâmica
    this.rainSystem = this.createRainSystem();
    this.scene.add(this.rainSystem);

    this.applyGraphicsPreset(graphics, viewDistance);

    window.addEventListener('resize', this.handleResize);
    this.lastTime = performance.now();
    this.animate();
  }

  private buildGroundAndRoads(): void {
    // Solo do Planalto Central (terra vermelha + vegetação do Cerrado)
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#4d7c0f',
      roughness: 0.92,
      metalness: 0.04
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Lago Paranoá (Leste de Brasília)
    const lakeGeo = new THREE.PlaneGeometry(360, 920);
    const lakeMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.15,
      metalness: 0.75
    });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(270, 0.08, 0);
    this.scene.add(lake);

    // Malha viária principal (Eixo Monumental, Eixão Norte/Sul e vias satélites)
    const roadMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#facc15' });

    const createHighway = (w: number, l: number, x: number, z: number, rotY = 0) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(w, l), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = rotY;
      road.position.set(x, 0.12, z);
      road.receiveShadow = true;
      this.scene.add(road);

      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.45, l * 0.96), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.rotation.z = rotY;
      stripe.position.set(x, 0.14, z);
      this.scene.add(stripe);
    };

    // Eixão Norte-Sul
    createHighway(18, 620, 0, 0, 0);
    // Eixo Monumental Leste-Oeste
    createHighway(22, 740, -160, 0, Math.PI / 2);
    // Estrada Parque Taguatinga / Águas Claras / Ceilândia
    createHighway(16, 480, -320, 45, 0.25);
    // Ligação Samambaia / Gama
    createHighway(14, 420, -320, 210, Math.PI / 2.3);
    // Acesso Lago Sul / Ponte JK
    createHighway(14, 340, 120, 165, Math.PI / 3);
    // Acesso Lago Norte
    createHighway(14, 340, 120, -165, -Math.PI / 3);
  }

  private buildBrasiliaMonuments(): void {
    const whiteConcrete = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.35,
      metalness: 0.1
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      roughness: 0.12,
      metalness: 0.85
    });

    // Congresso Nacional (Torres Gêmeas + Cúpulas do Senado e Câmara)
    const congressGroup = new THREE.Group();
    congressGroup.position.set(125, 0, 0);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(36, 4, 54), whiteConcrete);
    platform.position.y = 2;
    platform.castShadow = true;
    congressGroup.add(platform);

    const tower1 = new THREE.Mesh(new THREE.BoxGeometry(7, 46, 11), whiteConcrete);
    tower1.position.set(4, 25, -8);
    tower1.castShadow = true;
    congressGroup.add(tower1);

    const tower2 = new THREE.Mesh(new THREE.BoxGeometry(7, 46, 11), whiteConcrete);
    tower2.position.set(4, 25, 8);
    tower2.castShadow = true;
    congressGroup.add(tower2);

    // Cúpula Senado (invertida/convexa)
    const domeSenado = new THREE.Mesh(
      new THREE.SphereGeometry(9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      whiteConcrete
    );
    domeSenado.position.set(-6, 4, -14);
    congressGroup.add(domeSenado);

    // Cúpula Câmara (tigela)
    const domeCamara = new THREE.Mesh(
      new THREE.SphereGeometry(11, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      whiteConcrete
    );
    domeCamara.position.set(-6, 14, 14);
    congressGroup.add(domeCamara);
    this.scene.add(congressGroup);

    // Catedral Metropolitana de Brasília (Pilares hiperboloides)
    const cathedralGroup = new THREE.Group();
    cathedralGroup.position.set(62, 0, 22);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 22, 1.8), whiteConcrete);
      pillar.position.set(Math.cos(angle) * 11, 10, Math.sin(angle) * 11);
      pillar.lookAt(0, 14, 0);
      pillar.rotateX(0.35);
      pillar.castShadow = true;
      cathedralGroup.add(pillar);
    }
    const stainedGlass = new THREE.Mesh(new THREE.ConeGeometry(13, 18, 16), glassMat);
    stainedGlass.position.y = 9;
    cathedralGroup.add(stainedGlass);
    this.scene.add(cathedralGroup);

    // Torre de TV de Brasília (Eixo Monumental)
    const tvTower = new THREE.Group();
    tvTower.position.set(-78, 0, 0);
    const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(3, 10, 26, 4), whiteConcrete);
    towerBase.position.y = 13;
    tvTower.add(towerBase);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 2.5, 58, 8),
      new THREE.MeshStandardMaterial({ color: '#ef4444', metalness: 0.6, roughness: 0.3 })
    );
    mast.position.y = 48;
    tvTower.add(mast);
    this.scene.add(tvTower);

    // Caixa d'Água de Ceilândia
    const ceilandiaTower = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 4.5, 30, 16),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 })
    );
    ceilandiaTower.position.set(-455, 15, -65);
    ceilandiaTower.castShadow = true;
    this.scene.add(ceilandiaTower);
  }

  private buildAdministrativeSectors(): void {
    const palette = ['#cbd5e1', '#94a3b8', '#e2e8f0', '#64748b', '#f1f5f9'];
    const roofMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.8 });
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#713f12' });
    const treeLeafMat = new THREE.MeshStandardMaterial({ color: '#15803d' });

    BRASILIA_DISTRICTS.forEach((district, idx) => {
      const sectorGroup = new THREE.Group();
      const buildingCount = district.id === 'aguas_claras' || district.id === 'taguatinga' ? 18 : 12;

      for (let i = 0; i < buildingCount; i++) {
        const angle = (i / buildingCount) * Math.PI * 2 + idx * 0.4;
        const dist = 26 + ((i * 19) % Math.max(45, district.radius - 30));
        const bx = district.centerX + Math.cos(angle) * dist;
        const bz = district.centerZ + Math.sin(angle) * dist;

        // Evita bloquear as avenidas principais
        if (Math.abs(bx) < 16 || Math.abs(bz) < 18) continue;

        const isHighRise = district.id === 'aguas_claras' || district.id === 'plano_piloto';
        const isSuperquadra = district.id === 'asa_sul' || district.id === 'asa_norte';
        const width = isSuperquadra ? 18 : 11 + (i % 6);
        const depth = isSuperquadra ? 9 : 11 + ((i * 3) % 6);
        const height = isHighRise ? 24 + (i % 5) * 9 : isSuperquadra ? 15 : 8 + (i % 4) * 4;

        const bMat = new THREE.MeshStandardMaterial({
          color: palette[(i + idx) % palette.length],
          roughness: 0.55,
          metalness: 0.12
        });

        const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bMat);
        building.position.set(bx, height / 2, bz);
        building.castShadow = true;
        building.receiveShadow = true;
        sectorGroup.add(building);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(width + 0.4, 0.6, depth + 0.4), roofMat);
        roof.position.set(bx, height + 0.3, bz);
        sectorGroup.add(roof);

        // Vegetação urbana (Ipês e árvores do Cerrado)
        if (i % 2 === 0) {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.2, 6), treeTrunkMat);
          trunk.position.set(bx + width * 0.7, 1.6, bz + 4);
          sectorGroup.add(trunk);

          const crownColor = i % 6 === 0 ? '#facc15' : i % 8 === 0 ? '#ec4899' : '#15803d';
          const crown = new THREE.Mesh(
            new THREE.DodecahedronGeometry(2.8, 1),
            i % 6 === 0 || i % 8 === 0
              ? new THREE.MeshStandardMaterial({ color: crownColor })
              : treeLeafMat
          );
          crown.position.set(bx + width * 0.7, 4.5, bz + 4);
          sectorGroup.add(crown);
        }
      }

      // Pontos de serviço da RA (Banco, Hospital, Delegacia, Posto, Concessionária)
      const serviceSpots: Array<{
        type: LandmarkSpot['type'];
        label: string;
        color: string;
        ox: number;
        oz: number;
      }> = [
        { type: 'bank', label: `Banco BRB — ${district.name}`, color: '#2563eb', ox: 22, oz: 22 },
        { type: 'gas', label: `Posto Petrobras — ${district.name}`, color: '#eab308', ox: -24, oz: 22 },
        { type: 'store', label: `Supermercado & Loja — ${district.name}`, color: '#10b981', ox: 22, oz: -24 }
      ];

      if (idx % 3 === 0) {
        serviceSpots.push({ type: 'police', label: `Delegacia / Batalhão PMDF — ${district.name}`, color: '#1d4ed8', ox: -26, oz: -26 });
      }
      if (idx % 3 === 1) {
        serviceSpots.push({ type: 'hospital', label: `Hospital Regional — ${district.name}`, color: '#f8fafc', ox: -26, oz: -26 });
      }
      if (idx % 3 === 2) {
        serviceSpots.push({ type: 'dealership', label: `Concessionária & Oficina — ${district.name}`, color: '#9333ea', ox: -26, oz: -26 });
      }

      serviceSpots.forEach((spot) => {
        const sx = district.centerX + spot.ox;
        const sz = district.centerZ + spot.oz;
        const beacon = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.4, 0.25, 16),
          new THREE.MeshBasicMaterial({ color: spot.color })
        );
        beacon.position.set(sx, 0.2, sz);
        sectorGroup.add(beacon);

        this.landmarks.push({ name: spot.label, type: spot.type, x: sx, z: sz });
      });

      this.scene.add(sectorGroup);
      this.sectorGroups.set(district.id, sectorGroup);
    });
  }

  private buildCharacterMesh(custom: CharacterCustomization): THREE.Group {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: custom.skinTone, roughness: 0.65 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: custom.shirtColor, roughness: 0.75 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: custom.pantsColor, roughness: 0.8 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: custom.shoesColor, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: custom.hairColor, roughness: 0.85 });

    // Cabeça
    this.headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.46), skinMat);
    this.headMesh.position.y = 1.62;
    this.headMesh.castShadow = true;
    group.add(this.headMesh);

    // Cabelo
    const hairHeight = custom.hairStyle === 'Longo' ? 0.34 : 0.16;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.5, hairHeight, 0.5), hairMat);
    hair.position.set(0, custom.hairStyle === 'Longo' ? 1.72 : 1.84, -0.02);
    group.add(hair);

    // Olhos
    const eyeMat = new THREE.MeshBasicMaterial({ color: custom.eyeColor });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.04), eyeMat);
    leftEye.position.set(-0.11, 1.64, 0.23);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.04), eyeMat);
    rightEye.position.set(0.11, 1.64, 0.23);
    group.add(leftEye, rightEye);

    // Acessório
    if (custom.accessory === 'Óculos Escuros') {
      const glasses = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.1, 0.06),
        new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.8, roughness: 0.1 })
      );
      glasses.position.set(0, 1.65, 0.24);
      group.add(glasses);
    } else if (custom.accessory === 'Boné BSB') {
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.12, 0.62),
        new THREE.MeshStandardMaterial({ color: '#1d4ed8' })
      );
      cap.position.set(0, 1.88, 0.06);
      group.add(cap);
    }

    // Tronco
    this.torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.32), shirtMat);
    this.torsoMesh.position.y = 1.04;
    this.torsoMesh.castShadow = true;
    group.add(this.torsoMesh);

    // Braços
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), shirtMat);
    this.leftArm.position.set(-0.4, 1.04, 0);
    this.leftArm.castShadow = true;

    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), shirtMat);
    this.rightArm.position.set(0.4, 1.04, 0);
    this.rightArm.castShadow = true;
    group.add(this.leftArm, this.rightArm);

    // Pernas + Calçados
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.66, 0.24), pantsMat);
    this.leftLeg.position.set(-0.16, 0.38, 0);
    this.leftLeg.castShadow = true;
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.32), shoesMat);
    leftShoe.position.set(0, -0.32, 0.04);
    this.leftLeg.add(leftShoe);

    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.66, 0.24), pantsMat);
    this.rightLeg.position.set(0.16, 0.38, 0);
    this.rightLeg.castShadow = true;
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.32), shoesMat);
    rightShoe.position.set(0, -0.32, 0.04);
    this.rightLeg.add(rightShoe);

    group.add(this.leftLeg, this.rightLeg);
    return group;
  }

  private buildVehicleMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.65,
      roughness: 0.22
    });
    this.vehicleBodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.85, 4.4), bodyMat);
    this.vehicleBodyMesh.position.y = 0.72;
    this.vehicleBodyMesh.castShadow = true;
    group.add(this.vehicleBodyMesh);

    const cabinMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.12
    });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.68, 2.35), cabinMat);
    cabin.position.set(0, 1.42, -0.15);
    group.add(cabin);

    // Giroflex para viaturas/ambulância/bombeiros
    this.sirenLightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.18, 0.28),
      new THREE.MeshBasicMaterial({ color: '#ef4444' })
    );
    this.sirenLightMesh.position.set(0, 1.84, -0.1);
    this.sirenLightMesh.visible = false;
    group.add(this.sirenLightMesh);

    // Faróis dianteiros
    const headlightMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.1), headlightMat);
    hl1.position.set(-0.7, 0.75, 2.21);
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.1), headlightMat);
    hl2.position.set(0.7, 0.75, 2.21);
    group.add(hl1, hl2);

    // 4 Rodas
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 18);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85 });

    const offsets = [
      [-1.08, 0.42, 1.38],
      [1.08, 0.42, 1.38],
      [-1.08, 0.42, -1.38],
      [1.08, 0.42, -1.38]
    ];
    offsets.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      group.add(wheel);
      this.vehicleWheels.push(wheel);
    });

    return group;
  }

  private createRainSystem(): THREE.Points {
    const count = 2400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = Math.random() * 65;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: '#bae6fd', size: 0.22, transparent: true, opacity: 0.65 });
    const points = new THREE.Points(geo, mat);
    points.visible = false;
    return points;
  }

  public updateCharacterAppearance(custom: CharacterCustomization): void {
    this.scene.remove(this.playerGroup);
    this.playerGroup = this.buildCharacterMesh(custom);
    this.playerGroup.position.copy(this.playerPos);
    this.playerGroup.visible = !this.inVehicle;
    this.scene.add(this.playerGroup);
  }

  public enterVehicle(vehicle: VehicleSpec): void {
    this.inVehicle = true;
    this.currentVehicle = vehicle;
    this.vehicleSpeed = 0;
    this.vehicleHeading = this.playerYaw;
    this.vehicleGroup.visible = true;
    this.vehicleGroup.position.copy(this.playerPos);
    this.vehicleGroup.rotation.y = this.vehicleHeading;
    this.playerGroup.visible = false;

    const mat = this.vehicleBodyMesh.material as THREE.MeshStandardMaterial;
    mat.color.set(vehicle.color);

    const isEmergency =
      vehicle.category === 'Viatura Policial' ||
      vehicle.category === 'Ambulância' ||
      vehicle.category === 'Bombeiros';
    this.sirenLightMesh.visible = isEmergency;

    const scaleX = vehicle.category === 'Ônibus' || vehicle.category === 'Caminhão' ? 1.25 : vehicle.category === 'Motocicleta' ? 0.45 : 1;
    const scaleZ = vehicle.category === 'Ônibus' ? 1.95 : vehicle.category === 'Caminhão' ? 1.65 : vehicle.category === 'Motocicleta' ? 0.65 : 1;
    this.vehicleGroup.scale.set(scaleX, 1, scaleZ);
  }

  public exitVehicle(): void {
    if (!this.inVehicle) return;
    this.inVehicle = false;
    this.currentVehicle = null;
    this.vehicleSpeed = 0;
    this.vehicleGroup.visible = false;
    this.playerPos.x += Math.cos(this.vehicleHeading) * 2.4;
    this.playerPos.z -= Math.sin(this.vehicleHeading) * 2.4;
    this.playerGroup.position.copy(this.playerPos);
    this.playerGroup.visible = this.perspective === 'third';
  }

  public setMoveInput(x: number, y: number): void {
    this.moveInput.x = x;
    this.moveInput.y = y;
  }

  public setSprint(sprint: boolean): void {
    this.isSprinting = sprint;
  }

  public jump(): void {
    if (!this.inVehicle && this.isGrounded) {
      this.verticalVelocity = 7.8;
      this.isGrounded = false;
    }
  }

  public rotateCamera(deltaX: number, deltaY: number): void {
    this.cameraYaw -= deltaX * 0.0065;
    this.cameraPitch = Math.max(-0.15, Math.min(0.85, this.cameraPitch + deltaY * 0.005));
  }

  public togglePerspective(): CameraPerspective {
    this.perspective = this.perspective === 'third' ? 'first' : 'third';
    if (!this.inVehicle) {
      this.playerGroup.visible = this.perspective === 'third';
    }
    return this.perspective;
  }

  public teleportTo(x: number, z: number): void {
    this.playerPos.set(x, 0, z);
    this.playerGroup.position.copy(this.playerPos);
    if (this.inVehicle) {
      this.vehicleGroup.position.copy(this.playerPos);
    }
  }

  public setEnvironment(timeOfDay: number, weather: WeatherType): void {
    this.timeOfDay = timeOfDay;
    this.weather = weather;
    this.rainSystem.visible = weather === 'Chuva Tropical';

    // Ciclo Dia / Noite realista
    const sunAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle);
    this.sunLight.position.set(
      this.playerPos.x + Math.cos(sunAngle) * 180,
      Math.max(18, sunHeight * 220),
      this.playerPos.z + 95
    );

    if (weather === 'Pôr do Sol Cerrado' || (timeOfDay >= 17 && timeOfDay <= 18.8)) {
      this.scene.background = new THREE.Color('#ea580c');
      (this.scene.fog as THREE.FogExp2).color.set('#fb923c');
      this.sunLight.color.set('#fdba74');
      this.sunLight.intensity = 1.45;
    } else if (timeOfDay < 5.5 || timeOfDay > 19.2) {
      this.scene.background = new THREE.Color('#060b19');
      (this.scene.fog as THREE.FogExp2).color.set('#090d16');
      this.sunLight.color.set('#60a5fa');
      this.sunLight.intensity = 0.35;
    } else if (weather === 'Chuva Tropical' || weather === 'Nublado') {
      this.scene.background = new THREE.Color('#475569');
      (this.scene.fog as THREE.FogExp2).color.set('#64748b');
      this.sunLight.intensity = 0.75;
    } else {
      this.scene.background = new THREE.Color('#38bdf8');
      (this.scene.fog as THREE.FogExp2).color.set('#7dd3fc');
      this.sunLight.color.set('#fffbeb');
      this.sunLight.intensity = 1.85;
    }
  }

  public applyGraphicsPreset(preset: GraphicsPreset, viewDistance: number): void {
    this.graphicsPreset = preset;
    this.viewDistance = viewDistance;
    this.camera.far = viewDistance + 220;
    this.camera.updateProjectionMatrix();

    const pixelRatio =
      preset === 'Ultra' ? Math.min(window.devicePixelRatio, 2) :
      preset === 'Alta' ? Math.min(window.devicePixelRatio, 1.5) :
      preset === 'Média' ? 1.1 : 0.85;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.shadowMap.enabled = preset !== 'Baixa';
  }

  public syncOnlinePlayers(players: OnlinePlayer[]): void {
    const activeIds = new Set(players.map((p) => p.id));
    for (const [id, mesh] of this.remotePlayerMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.remotePlayerMeshes.delete(id);
      }
    }

    players.forEach((p) => {
      let mesh = this.remotePlayerMeshes.get(p.id);
      if (!mesh) {
        mesh = this.buildCharacterMesh({
          name: p.name,
          gender: 'Masculino',
          skinTone: '#c68642',
          hairColor: '#090d16',
          hairStyle: 'Curto',
          eyeColor: '#1e293b',
          shirtColor: p.color,
          pantsColor: '#0f172a',
          shoesColor: '#ffffff',
          accessory: 'Nenhum'
        });
        this.scene.add(mesh);
        this.remotePlayerMeshes.set(p.id, mesh);
      }
      mesh.position.set(p.x, 0, p.z);
    });
  }

  private getCurrentDistrictName(): string {
    let closest = BRASILIA_DISTRICTS[0];
    let bestDist = Infinity;
    for (const d of BRASILIA_DISTRICTS) {
      const dist = Math.hypot(this.playerPos.x - d.centerX, this.playerPos.z - d.centerZ);
      if (dist < bestDist) {
        bestDist = dist;
        closest = d;
      }
    }
    return `${closest.name} (${closest.code})`;
  }

  private getNearbyInteractable(): string | null {
    for (const spot of this.landmarks) {
      const dist = Math.hypot(this.playerPos.x - spot.x, this.playerPos.z - spot.z);
      if (dist < 14) {
        return spot.name;
      }
    }
    return null;
  }

  private updateSectorLOD(): void {
    // Carregamento progressivo por setores para otimizar memória/GPU Android
    for (const d of BRASILIA_DISTRICTS) {
      const group = this.sectorGroups.get(d.id);
      if (!group) continue;
      const dist = Math.hypot(this.playerPos.x - d.centerX, this.playerPos.z - d.centerZ);
      group.visible = dist <= this.viewDistance + d.radius;
    }
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    let speedKmh = 0;
    let fuelDelta = 0;

    if (this.inVehicle && this.currentVehicle) {
      // Física de direção
      const hasFuel = this.currentVehicle.fuel > 0;
      const throttle = hasFuel ? -this.moveInput.y : 0;
      const steer = -this.moveInput.x;

      if (throttle > 0) {
        this.vehicleSpeed = Math.min(
          this.currentVehicle.maxSpeed,
          this.vehicleSpeed + throttle * this.currentVehicle.acceleration * dt
        );
      } else if (throttle < 0) {
        this.vehicleSpeed = Math.max(
          -this.currentVehicle.maxSpeed * 0.4,
          this.vehicleSpeed + throttle * (this.currentVehicle.acceleration * 1.3) * dt
        );
      } else {
        this.vehicleSpeed *= Math.pow(0.25, dt);
      }

      if (Math.abs(this.vehicleSpeed) > 0.3) {
        const reverseFactor = this.vehicleSpeed >= 0 ? 1 : -1;
        this.vehicleHeading += steer * 1.85 * dt * reverseFactor;
      }

      const vx = Math.sin(this.vehicleHeading) * this.vehicleSpeed;
      const vz = Math.cos(this.vehicleHeading) * this.vehicleSpeed;
      this.playerPos.x = Math.max(-680, Math.min(240, this.playerPos.x + vx * dt));
      this.playerPos.z = Math.max(-580, Math.min(580, this.playerPos.z + vz * dt));

      this.vehicleGroup.position.copy(this.playerPos);
      this.vehicleGroup.rotation.y = this.vehicleHeading;
      this.cameraYaw = this.vehicleHeading + Math.PI;

      this.vehicleWheels.forEach((w) => {
        w.rotation.x += this.vehicleSpeed * dt * 2.2;
      });

      if (this.sirenLightMesh.visible) {
        const mat = this.sirenLightMesh.material as THREE.MeshBasicMaterial;
        mat.color.set(Math.floor(now / 180) % 2 === 0 ? '#ef4444' : '#3b82f6');
      }

      speedKmh = Math.round(Math.abs(this.vehicleSpeed) * 3.1);
      if (Math.abs(this.vehicleSpeed) > 1) {
        fuelDelta = -dt * 0.18;
      }
    } else {
      // Movimentação a pé
      const inputLen = Math.hypot(this.moveInput.x, this.moveInput.y);
      if (inputLen > 0.05) {
        const moveAngle = this.cameraYaw + Math.atan2(this.moveInput.x, this.moveInput.y);
        this.playerYaw = moveAngle;
        const speed = (this.isSprinting ? 12.5 : 6.4) * Math.min(1, inputLen);
        this.playerPos.x = Math.max(-680, Math.min(240, this.playerPos.x + Math.sin(moveAngle) * speed * dt));
        this.playerPos.z = Math.max(-580, Math.min(580, this.playerPos.z + Math.cos(moveAngle) * speed * dt));
        speedKmh = Math.round(speed * 3.6);

        this.walkCycle += dt * (this.isSprinting ? 14 : 9);
        this.leftLeg.rotation.x = Math.sin(this.walkCycle) * 0.65;
        this.rightLeg.rotation.x = -Math.sin(this.walkCycle) * 0.65;
        this.leftArm.rotation.x = -Math.sin(this.walkCycle) * 0.55;
        this.rightArm.rotation.x = Math.sin(this.walkCycle) * 0.55;
      } else {
        this.leftLeg.rotation.x *= 0.8;
        this.rightLeg.rotation.x *= 0.8;
        this.leftArm.rotation.x *= 0.8;
        this.rightArm.rotation.x *= 0.8;
      }

      // Gravidade & pulo
      if (!this.isGrounded) {
        this.verticalVelocity -= 21 * dt;
        this.playerPos.y += this.verticalVelocity * dt;
        if (this.playerPos.y <= 0) {
          this.playerPos.y = 0;
          this.verticalVelocity = 0;
          this.isGrounded = true;
        }
      }

      this.playerGroup.position.copy(this.playerPos);
      this.playerGroup.rotation.y = this.playerYaw;
    }

    // Atualização da câmera (1ª ou 3ª pessoa)
    if (this.perspective === 'first') {
      const eyeHeight = this.inVehicle ? 1.45 : 1.72;
      const forwardYaw = this.inVehicle ? this.vehicleHeading : this.cameraYaw + Math.PI;
      this.camera.position.set(
        this.playerPos.x + Math.sin(forwardYaw) * 0.25,
        this.playerPos.y + eyeHeight,
        this.playerPos.z + Math.cos(forwardYaw) * 0.25
      );
      this.camera.lookAt(
        this.camera.position.x + Math.sin(forwardYaw) * 15,
        this.camera.position.y - Math.sin(this.cameraPitch) * 8,
        this.camera.position.z + Math.cos(forwardYaw) * 15
      );
    } else {
      const camDist = this.inVehicle ? 8.2 : 5.4;
      const camHeight = this.inVehicle ? 3.2 : 2.35;
      this.camera.position.set(
        this.playerPos.x + Math.sin(this.cameraYaw) * camDist,
        this.playerPos.y + camHeight + Math.sin(this.cameraPitch) * 3.2,
        this.playerPos.z + Math.cos(this.cameraYaw) * camDist
      );
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.35, this.playerPos.z);
    }

    // Chuva dinâmica
    if (this.rainSystem.visible) {
      this.rainSystem.position.set(this.playerPos.x, 0, this.playerPos.z);
      const posAttr = this.rainSystem.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - 38 * dt;
        if (y < 0) y = 65;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    this.sunLight.target.position.copy(this.playerPos);
    this.updateSectorLOD();

    this.callbacks.onUpdateTelemetry({
      x: this.playerPos.x,
      z: this.playerPos.z,
      speedKmh,
      districtName: this.getCurrentDistrictName(),
      nearbyInteractable: this.getNearbyInteractable(),
      fuelDelta
    });

    this.renderer.render(this.scene, this.camera);
  };

  private handleResize = (): void => {
    if (!this.container || this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
