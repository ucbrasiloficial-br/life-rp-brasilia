import { DistrictRegion, InventoryItem, JobDefinition, PropertySpec, VehicleSpec } from '../types/game';

export const BRASILIA_DISTRICTS: DistrictRegion[] = [
  { id: 'plano_piloto', name: 'Plano Piloto', code: 'RA-I', centerX: 0, centerZ: 0, radius: 130, color: '#38bdf8', description: 'Centro arquitetônico e administrativo projetado por Lúcio Costa.' },
  { id: 'esplanada', name: 'Esplanada dos Ministérios', code: 'RA-I', centerX: 95, centerZ: 0, radius: 95, color: '#60a5fa', description: 'Blocos ministeriais, Congresso Nacional e Praça dos Três Poderes.' },
  { id: 'eixo_monumental', name: 'Eixo Monumental', code: 'RA-I', centerX: -85, centerZ: 0, radius: 95, color: '#818cf8', description: 'Torre de TV, Estádio Nacional e avenidas centrais de 6 faixas.' },
  { id: 'asa_sul', name: 'Asa Sul', code: 'RA-I', centerX: 0, centerZ: 155, radius: 120, color: '#34d399', description: 'Superquadras arborizadas, comércio local e estações de metrô.' },
  { id: 'asa_norte', name: 'Asa Norte', code: 'RA-I', centerX: 0, centerZ: -155, radius: 120, color: '#2dd4bf', description: 'Superquadras residenciais, universidades e centros comerciais.' },
  { id: 'lago_sul', name: 'Lago Sul', code: 'RA-XVI', centerX: 165, centerZ: 175, radius: 115, color: '#0ea5e9', description: 'Mansões à beira do Lago Paranoá e Ponte JK.' },
  { id: 'lago_norte', name: 'Lago Norte', code: 'RA-XVIII', centerX: 165, centerZ: -175, radius: 115, color: '#06b6d4', description: 'Península residencial nobre e áreas náuticas.' },
  { id: 'guara', name: 'Guará', code: 'RA-X', centerX: -175, centerZ: 125, radius: 100, color: '#f59e0b', description: 'Quadras residenciais, Polo de Modas e Feira do Guará.' },
  { id: 'aguas_claras', name: 'Águas Claras', code: 'RA-XX', centerX: -270, centerZ: 95, radius: 105, color: '#a855f7', description: 'Arranha-céus residenciais modernos, parques e comércio intenso.' },
  { id: 'taguatinga', name: 'Taguatinga', code: 'RA-III', centerX: -355, centerZ: 20, radius: 125, color: '#ec4899', description: 'Maior polo comercial satélite do DF, Taguacenter e Pistão Sul.' },
  { id: 'ceilandia', name: 'Ceilândia', code: 'RA-IX', centerX: -455, centerZ: -65, radius: 130, color: '#f97316', description: 'Caixa d’Água histórica, Feira Central e avenidas movimentadas.' },
  { id: 'samambaia', name: 'Samambaia', code: 'RA-XII', centerX: -410, centerZ: 170, radius: 115, color: '#eab308', description: 'Região em expansão, terminal rodoviário e comércio urbano.' },
  { id: 'gama', name: 'Gama', code: 'RA-II', centerX: -245, centerZ: 295, radius: 120, color: '#22c55e', description: 'Setores tradicionais, Estádio Bezerrão e comércio regional.' }
];

export const JOBS_LIST: JobDefinition[] = [
  { id: 'civil', title: 'Cidadão Livre', department: 'Civil', salaryPerShift: 0, uniformShirt: '#2563eb', uniformPants: '#1e293b', description: 'Explore Brasília livremente, compre imóveis e administre negócios.', spawnDistrict: 'Plano Piloto' },
  { id: 'policial', title: 'Policial Militar (PMDF)', department: 'Segurança Pública', salaryPerShift: 4800, uniformShirt: '#1d4ed8', uniformPants: '#0f172a', description: 'Patrulhamento nas RAs, atendimento de ocorrências e segurança viária.', spawnDistrict: 'Esplanada dos Ministérios' },
  { id: 'bombeiro', title: 'Bombeiro Militar (CBMDF)', department: 'Segurança Pública', salaryPerShift: 4600, uniformShirt: '#dc2626', uniformPants: '#991b1b', description: 'Resgate urbano, combate a incêndios e emergências no DF.', spawnDistrict: 'Eixo Monumental' },
  { id: 'medico', title: 'Médico (Hospital de Base)', department: 'Saúde', salaryPerShift: 6200, uniformShirt: '#f8fafc', uniformPants: '#cbd5e1', description: 'Atendimento hospitalar e resgate avançado em ambulância.', spawnDistrict: 'Asa Sul' },
  { id: 'enfermeiro', title: 'Enfermeiro(a)', department: 'Saúde', salaryPerShift: 3400, uniformShirt: '#38bdf8', uniformPants: '#f1f5f9', description: 'Triagem, primeiros socorros e apoio clínico.', spawnDistrict: 'Asa Norte' },
  { id: 'motorista_onibus', title: 'Motorista de Ônibus (DFTrans)', department: 'Transporte & Logística', salaryPerShift: 2600, uniformShirt: '#0284c7', uniformPants: '#1e293b', description: 'Linhas integradas entre Plano Piloto, Taguatinga e Ceilândia.', spawnDistrict: 'Taguatinga' },
  { id: 'taxista', title: 'Taxista / Motorista App', department: 'Transporte & Logística', salaryPerShift: 2400, uniformShirt: '#eab308', uniformPants: '#1f2937', description: 'Corridas urbanas rápidas pelo Eixo Monumental e Aeroporto.', spawnDistrict: 'Plano Piloto' },
  { id: 'entregador', title: 'Entregador Express', department: 'Transporte & Logística', salaryPerShift: 1950, uniformShirt: '#ea580c', uniformPants: '#18181b', description: 'Entregas ágeis de motocicleta pelas quadras do DF.', spawnDistrict: 'Águas Claras' },
  { id: 'mecanico', title: 'Mecânico Automotivo', department: 'Transporte & Logística', salaryPerShift: 2900, uniformShirt: '#475569', uniformPants: '#0f172a', description: 'Reparos, revisão de motor, pintura e rodas nas oficinas.', spawnDistrict: 'Guará' },
  { id: 'comerciante', title: 'Comerciante Local', department: 'Comércio & Negócios', salaryPerShift: 2700, uniformShirt: '#10b981', uniformPants: '#1e293b', description: 'Operação de lojas nas entrequadras e feiras.', spawnDistrict: 'Ceilândia' },
  { id: 'supermercado', title: 'Funcionário de Supermercado', department: 'Comércio & Negócios', salaryPerShift: 1850, uniformShirt: '#16a34a', uniformPants: '#1e293b', description: 'Atendimento ao público e reposição de estoque.', spawnDistrict: 'Samambaia' },
  { id: 'transportador', title: 'Transportador de Cargas', department: 'Transporte & Logística', salaryPerShift: 3900, uniformShirt: '#7c3aed', uniformPants: '#1e293b', description: 'Logística pesada abastecendo centros comerciais do DF.', spawnDistrict: 'Gama' },
  { id: 'empresario', title: 'Empresário', department: 'Comércio & Negócios', salaryPerShift: 7500, uniformShirt: '#111827', uniformPants: '#090d16', description: 'Gestão de imóveis comerciais, contratação e lucros passivos.', spawnDistrict: 'Lago Sul' }
];

export const INITIAL_VEHICLES: VehicleSpec[] = [
  { id: 'veh_gol_fict', brand: 'VolksBras', model: 'Voya 1.6', category: 'Popular', price: 38000, maxSpeed: 34, acceleration: 18, color: '#e2e8f0', wheelColor: '#334155', fuel: 92, condition: 100, owned: true, storedInGarage: false },
  { id: 'veh_corolla_fict', brand: 'ToyoMotors', model: 'Corolla BSB XEi', category: 'Sedã', price: 118000, maxSpeed: 44, acceleration: 23, color: '#1e293b', wheelColor: '#94a3b8', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_civic_fict', brand: 'Hondai', model: 'Civis Touring', category: 'Sedã', price: 135000, maxSpeed: 46, acceleration: 25, color: '#dc2626', wheelColor: '#1f2937', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_hilux_fict', brand: 'ToyoMotors', model: 'Cerrado 4x4 SRX', category: 'Caminhonete', price: 245000, maxSpeed: 45, acceleration: 22, color: '#0f172a', wheelColor: '#cbd5e1', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_bmw_fict', brand: 'Bavaria', model: 'M320i Lago Sul', category: 'Esportivo', price: 340000, maxSpeed: 58, acceleration: 32, color: '#2563eb', wheelColor: '#f8fafc', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_merc_fict', brand: 'Stuttgart', model: 'AMG GT Monumental', category: 'Esportivo', price: 590000, maxSpeed: 64, acceleration: 36, color: '#eab308', wheelColor: '#090d16', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_suv_fict', brand: 'HyunMotors', model: 'Creta DF Limited', category: 'SUV', price: 148000, maxSpeed: 42, acceleration: 21, color: '#475569', wheelColor: '#e2e8f0', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_moto_fict', brand: 'Hondai', model: 'CG 160 Entrega', category: 'Motocicleta', price: 16500, maxSpeed: 41, acceleration: 29, color: '#ea580c', wheelColor: '#1e293b', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_bus_fict', brand: 'Marcopolo DF', model: 'Expresso Eixo', category: 'Ônibus', price: 320000, maxSpeed: 32, acceleration: 13, color: '#0284c7', wheelColor: '#334155', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_truck_fict', brand: 'ChevroCarga', model: 'TransBrasília 240', category: 'Caminhão', price: 410000, maxSpeed: 33, acceleration: 14, color: '#7c3aed', wheelColor: '#1e293b', fuel: 100, condition: 100, owned: false, storedInGarage: true },
  { id: 'veh_police', brand: 'PMDF', model: 'Viatura Tática Brasília', category: 'Viatura Policial', price: 0, maxSpeed: 54, acceleration: 30, color: '#1d4ed8', wheelColor: '#0f172a', fuel: 100, condition: 100, owned: true, storedInGarage: false },
  { id: 'veh_ambulance', brand: 'SAMU DF', model: 'Unidade Avançada 192', category: 'Ambulância', price: 0, maxSpeed: 49, acceleration: 26, color: '#f8fafc', wheelColor: '#dc2626', fuel: 100, condition: 100, owned: true, storedInGarage: false },
  { id: 'veh_fire', brand: 'CBMDF', model: 'Auto Bomba Salvamento', category: 'Bombeiros', price: 0, maxSpeed: 45, acceleration: 22, color: '#dc2626', wheelColor: '#f8fafc', fuel: 100, condition: 100, owned: true, storedInGarage: false }
];

export const INITIAL_PROPERTIES: PropertySpec[] = [
  { id: 'prop_kitnet_tagua', name: 'Apartamento Taguatinga Centro', type: 'Apartamento', district: 'Taguatinga', price: 145000, rentPrice: 1200, garageSlots: 1, x: -340, z: 35, owned: false, rented: true, incomePerCycle: 0 },
  { id: 'prop_sq_asasul', name: 'Apartamento Superquadra 308 Sul', type: 'Apartamento', district: 'Asa Sul', price: 420000, rentPrice: 3200, garageSlots: 2, x: 25, z: 145, owned: false, rented: false, incomePerCycle: 0 },
  { id: 'prop_ap_aguas', name: 'Cobertura Águas Claras Park', type: 'Apartamento', district: 'Águas Claras', price: 560000, rentPrice: 4100, garageSlots: 3, x: -260, z: 85, owned: false, rented: false, incomePerCycle: 0 },
  { id: 'prop_casa_guara', name: 'Casa Residencial Guará II', type: 'Casa', district: 'Guará', price: 310000, rentPrice: 2300, garageSlots: 2, x: -165, z: 115, owned: false, rented: false, incomePerCycle: 0 },
  { id: 'prop_mansao_lago', name: 'Mansão QL 10 Lago Sul', type: 'Casa', district: 'Lago Sul', price: 1850000, rentPrice: 12000, garageSlots: 6, x: 175, z: 165, owned: false, rented: false, incomePerCycle: 0 },
  { id: 'prop_terreno_samambaia', name: 'Terreno Comercial Samambaia Norte', type: 'Terreno', district: 'Samambaia', price: 95000, rentPrice: 800, garageSlots: 2, x: -395, z: 160, owned: false, rented: false, incomePerCycle: 450 },
  { id: 'prop_loja_plano', name: 'Loja Comercial Asa Norte 206', type: 'Estabelecimento Comercial', district: 'Asa Norte', price: 680000, rentPrice: 5000, garageSlots: 2, x: -20, z: -145, owned: false, rented: false, incomePerCycle: 2800 },
  { id: 'prop_oficina_ceilandia', name: 'Auto Center & Oficina Ceilândia', type: 'Estabelecimento Comercial', district: 'Ceilândia', price: 490000, rentPrice: 3600, garageSlots: 4, x: -440, z: -50, owned: false, rented: false, incomePerCycle: 2100 }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'item_pastel', name: 'Pastel da Feira + Caldo de Cana', category: 'Alimento', quantity: 2, price: 22, effectValue: 35 },
  { id: 'item_agua', name: 'Água Mineral Cerrado 500ml', category: 'Bebida', quantity: 3, price: 6, effectValue: 40 },
  { id: 'item_kit_reparo', name: 'Kit de Reparo Automotivo', category: 'Ferramenta', quantity: 1, price: 250, effectValue: 50 },
  { id: 'item_galao', name: 'Galão de Combustível 20L', category: 'Ferramenta', quantity: 1, price: 130, effectValue: 60 },
  { id: 'item_medkit', name: 'Kit Primeiros Socorros', category: 'Médico', quantity: 1, price: 180, effectValue: 65 }
];
