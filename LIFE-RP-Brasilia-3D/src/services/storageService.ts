import { INITIAL_INVENTORY, INITIAL_PROPERTIES, INITIAL_VEHICLES } from '../data/brasiliaData';
import { GameMode, SaveState } from '../types/game';

const OFFLINE_KEY = 'liferp_offline_save_v1';
const ONLINE_KEY = 'liferp_online_account_v1';

export function createDefaultState(mode: GameMode, accountEmail?: string, serverName?: string): SaveState {
  return {
    mode,
    accountEmail,
    serverName: mode === 'online' ? serverName || 'BR-DF #01 (Brasília Oficial - 16 Slots)' : undefined,
    character: {
      name: mode === 'online' && accountEmail ? accountEmail.split('@')[0] : 'Cidadão BSB',
      gender: 'Masculino',
      skinTone: '#d99b72',
      hairColor: '#1c1917',
      hairStyle: 'Fade',
      eyeColor: '#3b2f2f',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      shoesColor: '#f8fafc',
      accessory: 'Óculos Escuros'
    },
    health: 100,
    hunger: 88,
    thirst: 85,
    cash: mode === 'offline' ? 12500 : 8000,
    bank: mode === 'offline' ? 45000 : 25000,
    currentJob: 'civil',
    shiftProgress: 0,
    position: { x: 0, y: 0, z: 18 },
    currentVehicleId: null,
    vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
    properties: JSON.parse(JSON.stringify(INITIAL_PROPERTIES)),
    inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY)),
    graphics: 'Ultra',
    viewDistance: 420,
    timeOfDay: 10.5,
    weather: 'Ensolarado'
  };
}

export function loadGameState(mode: GameMode): SaveState | null {
  try {
    const raw = localStorage.getItem(mode === 'offline' ? OFFLINE_KEY : ONLINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveState;
  } catch {
    return null;
  }
}

export function saveGameState(state: SaveState): void {
  try {
    const key = state.mode === 'offline' ? OFFLINE_KEY : ONLINE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn('Falha ao salvar progresso:', err);
  }
}
