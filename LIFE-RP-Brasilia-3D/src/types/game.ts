export type GameMode = 'offline' | 'online';
export type GraphicsPreset = 'Baixa' | 'Média' | 'Alta' | 'Ultra';
export type CameraPerspective = 'third' | 'first';
export type WeatherType = 'Ensolarado' | 'Nublado' | 'Chuva Tropical' | 'Pôr do Sol Cerrado';

export interface CharacterCustomization {
  name: string;
  gender: 'Masculino' | 'Feminino';
  skinTone: string;
  hairColor: string;
  hairStyle: 'Curto' | 'Fade' | 'Longo' | 'Coque';
  eyeColor: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  accessory: 'Nenhum' | 'Óculos Escuros' | 'Boné BSB' | 'Relógio Ouro';
}

export type JobId =
  | 'civil'
  | 'policial'
  | 'bombeiro'
  | 'medico'
  | 'enfermeiro'
  | 'motorista_onibus'
  | 'entregador'
  | 'mecanico'
  | 'taxista'
  | 'comerciante'
  | 'supermercado'
  | 'empresario'
  | 'transportador';

export interface JobDefinition {
  id: JobId;
  title: string;
  department: 'Civil' | 'Segurança Pública' | 'Saúde' | 'Transporte & Logística' | 'Comércio & Negócios';
  salaryPerShift: number;
  uniformShirt: string;
  uniformPants: string;
  description: string;
  spawnDistrict: string;
}

export type VehicleCategory =
  | 'Popular'
  | 'Sedã'
  | 'SUV'
  | 'Esportivo'
  | 'Caminhonete'
  | 'Motocicleta'
  | 'Ônibus'
  | 'Caminhão'
  | 'Viatura Policial'
  | 'Ambulância'
  | 'Bombeiros';

export interface VehicleSpec {
  id: string;
  brand: string;
  model: string;
  category: VehicleCategory;
  price: number;
  maxSpeed: number;
  acceleration: number;
  color: string;
  wheelColor: string;
  fuel: number;
  condition: number;
  owned: boolean;
  storedInGarage: boolean;
}

export interface PropertySpec {
  id: string;
  name: string;
  type: 'Casa' | 'Apartamento' | 'Terreno' | 'Estabelecimento Comercial';
  district: string;
  price: number;
  rentPrice: number;
  garageSlots: number;
  x: number;
  z: number;
  owned: boolean;
  rented: boolean;
  incomePerCycle: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Alimento' | 'Bebida' | 'Ferramenta' | 'Documento' | 'Médico';
  quantity: number;
  price: number;
  effectValue: number;
}

export interface DistrictRegion {
  id: string;
  name: string;
  code: string;
  centerX: number;
  centerZ: number;
  radius: number;
  color: string;
  description: string;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  job: string;
  district: string;
  x: number;
  z: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
  channel: 'Global' | 'RP' | 'Rádio Polícia/Emergência';
}

export interface SaveState {
  mode: GameMode;
  accountEmail?: string;
  serverName?: string;
  character: CharacterCustomization;
  health: number;
  hunger: number;
  thirst: number;
  cash: number;
  bank: number;
  currentJob: JobId;
  shiftProgress: number;
  position: { x: number; y: number; z: number };
  currentVehicleId: string | null;
  vehicles: VehicleSpec[];
  properties: PropertySpec[];
  inventory: InventoryItem[];
  graphics: GraphicsPreset;
  viewDistance: number;
  timeOfDay: number;
  weather: WeatherType;
}
