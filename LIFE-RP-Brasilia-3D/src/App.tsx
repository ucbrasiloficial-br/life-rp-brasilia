import React, { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Building2,
  Car,
  Heart,
  Landmark,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Shirt,
  Utensils
} from 'lucide-react';
import { ActiveModalTab, GameModals } from './components/GameModals';
import { MainMenu } from './components/MainMenu';
import { MiniMap } from './components/MiniMap';
import { TouchControls } from './components/TouchControls';
import { JOBS_LIST } from './data/brasiliaData';
import { BrasiliaWorld3D } from './engine/BrasiliaWorld3D';
import { saveGameState } from './services/storageService';
import {
  CharacterCustomization,
  ChatMessage,
  GraphicsPreset,
  JobId,
  OnlinePlayer,
  SaveState,
  WeatherType
} from './types/game';

const formatBRL = (val: number) =>
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function App() {
  const [gameState, setGameState] = useState<SaveState | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveModalTab>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [telemetry, setTelemetry] = useState({
    x: 0,
    z: 18,
    speedKmh: 0,
    districtName: 'Plano Piloto (RA-I)',
    nearbyInteractable: null as string | null
  });

  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([
    { id: 'op_1', name: 'Sgt_Oliveira_PMDF', job: 'Policial', district: 'Esplanada', x: 85, z: 12, color: '#1d4ed8' },
    { id: 'op_2', name: 'Dra_Camila_SAMU', job: 'Médica', district: 'Asa Sul', x: 15, z: 120, color: '#f8fafc' },
    { id: 'op_3', name: 'Rafa_Tagua', job: 'Empresário', district: 'Taguatinga', x: -330, z: 25, color: '#10b981' },
    { id: 'op_4', name: 'Bia_AguasClaras', job: 'Taxista', district: 'Águas Claras', x: -255, z: 90, color: '#eab308' }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Sistema LIFE RP',
      role: 'Servidor',
      text: 'Bem-vindo a Brasília! Respeite as leis de trânsito no Eixão e bom Roleplay.',
      time: '10:30',
      channel: 'Global'
    },
    {
      id: 'm2',
      sender: 'Sgt_Oliveira_PMDF',
      role: 'Policial',
      text: 'Viatura em patrulhamento preventivo na Esplanada dos Ministérios.',
      time: '10:31',
      channel: 'Rádio Polícia/Emergência'
    }
  ]);

  const worldContainerRef = useRef<HTMLDivElement | null>(null);
  const worldEngineRef = useRef<BrasiliaWorld3D | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 3200);
  };

  // Inicializa o motor 3D de Brasília quando o jogador entra
  useEffect(() => {
    if (!gameState || !worldContainerRef.current) return;

    const engine = new BrasiliaWorld3D(
      worldContainerRef.current,
      gameState.character,
      gameState.position,
      gameState.graphics,
      gameState.viewDistance,
      {
        onUpdateTelemetry: ({ x, z, speedKmh, districtName, nearbyInteractable, fuelDelta }) => {
          setTelemetry({ x, z, speedKmh, districtName, nearbyInteractable });
          if (fuelDelta !== 0) {
            setGameState((prev) => {
              if (!prev || !prev.currentVehicleId) return prev;
              const updatedVehicles = prev.vehicles.map((v) =>
                v.id === prev.currentVehicleId ? { ...v, fuel: Math.max(0, v.fuel + fuelDelta) } : v
              );
              return { ...prev, position: { x, y: 0, z }, vehicles: updatedVehicles };
            });
          }
        }
      }
    );

    engine.setEnvironment(gameState.timeOfDay, gameState.weather);
    if (gameState.mode === 'online') {
      engine.syncOnlinePlayers(onlinePlayers);
    }

    worldEngineRef.current = engine;
    return () => {
      engine.dispose();
      worldEngineRef.current = null;
    };
  }, [gameState?.mode]);

  // Salva progresso automaticamente
  useEffect(() => {
    if (gameState) {
      saveGameState({
        ...gameState,
        position: { x: telemetry.x, y: 0, z: telemetry.z }
      });
    }
  }, [gameState, telemetry.x, telemetry.z]);

  // Simulação de movimentação dos jogadores sincronizados no Modo Online
  useEffect(() => {
    if (!gameState || gameState.mode !== 'online') return;
    const interval = setInterval(() => {
      setOnlinePlayers((prev) => {
        const updated = prev.map((p, i) => ({
          ...p,
          x: p.x + Math.sin(Date.now() / 2000 + i) * 1.8,
          z: p.z + Math.cos(Date.now() / 2000 + i) * 1.8
        }));
        worldEngineRef.current?.syncOnlinePlayers(updated);
        return updated;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [gameState?.mode]);

  if (!gameState) {
    return <MainMenu onStartGame={(initial) => setGameState(initial)} />;
  }

  const activeVehicle = gameState.vehicles.find((v) => v.id === gameState.currentVehicleId) || null;

  const handleBankAction = (action: 'deposit' | 'withdraw' | 'transfer', amount: number, target?: string) => {
    if (amount <= 0 || Number.isNaN(amount)) return;
    setGameState((prev) => {
      if (!prev) return prev;
      if (action === 'deposit') {
        if (prev.cash < amount) {
          notify('Dinheiro em espécie insuficiente.');
          return prev;
        }
        notify(`Depósito de ${formatBRL(amount)} confirmado no BRB.`);
        return { ...prev, cash: prev.cash - amount, bank: prev.bank + amount };
      }
      if (action === 'withdraw') {
        if (prev.bank < amount) {
          notify('Saldo bancário insuficiente.');
          return prev;
        }
        notify(`Saque de ${formatBRL(amount)} realizado.`);
        return { ...prev, bank: prev.bank - amount, cash: prev.cash + amount };
      }
      if (action === 'transfer') {
        if (prev.bank < amount) {
          notify('Saldo insuficiente para transferência.');
          return prev;
        }
        notify(`Transferido ${formatBRL(amount)} para ${target || 'Cidadão'}.`);
        return { ...prev, bank: prev.bank - amount };
      }
      return prev;
    });
  };

  const handleSelectJob = (jobId: JobId) => {
    const job = JOBS_LIST.find((j) => j.id === jobId);
    if (!job) return;
    const updatedChar = {
      ...gameState.character,
      shirtColor: job.uniformShirt,
      pantsColor: job.uniformPants
    };
    worldEngineRef.current?.updateCharacterAppearance(updatedChar);
    setGameState({ ...gameState, currentJob: jobId, character: updatedChar });
    notify(`Função assumida: ${job.title}`);
  };

  const handleCompleteShift = () => {
    const job = JOBS_LIST.find((j) => j.id === gameState.currentJob);
    if (!job || job.salaryPerShift <= 0) return;
    setGameState({ ...gameState, bank: gameState.bank + job.salaryPerShift });
    notify(`Salário de ${formatBRL(job.salaryPerShift)} creditado em conta!`);
  };

  const handleVehicleAction = (
    action: 'buy' | 'drive' | 'repair' | 'refuel' | 'paint',
    vehicleId: string
  ) => {
    const target = gameState.vehicles.find((v) => v.id === vehicleId);
    if (!target) return;

    if (action === 'buy') {
      const totalFunds = gameState.bank + gameState.cash;
      if (totalFunds < target.price) {
        notify('Saldo insuficiente para comprar este veículo.');
        return;
      }
      const payFromBank = Math.min(gameState.bank, target.price);
      const payFromCash = target.price - payFromBank;
      setGameState({
        ...gameState,
        bank: gameState.bank - payFromBank,
        cash: gameState.cash - payFromCash,
        vehicles: gameState.vehicles.map((v) => (v.id === vehicleId ? { ...v, owned: true } : v))
      });
      notify(`${target.brand} ${target.model} adquirido e enviado à sua garagem!`);
    } else if (action === 'drive') {
      worldEngineRef.current?.enterVehicle(target);
      setGameState({ ...gameState, currentVehicleId: vehicleId });
      setActiveTab(null);
      notify(`Dirigindo ${target.brand} ${target.model}`);
    } else if (action === 'refuel') {
      if (gameState.cash < 150 && gameState.bank < 150) {
        notify('Saldo insuficiente para abastecer.');
        return;
      }
      setGameState({
        ...gameState,
        cash: gameState.cash >= 150 ? gameState.cash - 150 : gameState.cash,
        bank: gameState.cash >= 150 ? gameState.bank : gameState.bank - 150,
        vehicles: gameState.vehicles.map((v) => (v.id === vehicleId ? { ...v, fuel: 100 } : v))
      });
      notify('Tanque cheio (100%)!');
    } else if (action === 'repair') {
      if (gameState.cash < 300 && gameState.bank < 300) {
        notify('Saldo insuficiente para revisão.');
        return;
      }
      setGameState({
        ...gameState,
        cash: gameState.cash >= 300 ? gameState.cash - 300 : gameState.cash,
        bank: gameState.cash >= 300 ? gameState.bank : gameState.bank - 300,
        vehicles: gameState.vehicles.map((v) => (v.id === vehicleId ? { ...v, condition: 100 } : v))
      });
      notify('Veículo 100% revisado na oficina!');
    }
  };

  const handlePropertyAction = (action: 'buy' | 'rent' | 'collect', propertyId: string) => {
    const prop = gameState.properties.find((p) => p.id === propertyId);
    if (!prop) return;

    if (action === 'buy') {
      if (gameState.bank < prop.price) {
        notify('Saldo bancário insuficiente para compra do imóvel.');
        return;
      }
      setGameState({
        ...gameState,
        bank: gameState.bank - prop.price,
        properties: gameState.properties.map((p) =>
          p.id === propertyId ? { ...p, owned: true, rented: false } : p
        )
      });
      notify(`Escritura registrada: ${prop.name}!`);
    } else if (action === 'rent') {
      if (gameState.bank < prop.rentPrice) {
        notify('Saldo insuficiente para aluguel.');
        return;
      }
      setGameState({
        ...gameState,
        bank: gameState.bank - prop.rentPrice,
        properties: gameState.properties.map((p) => (p.id === propertyId ? { ...p, rented: true } : p))
      });
      notify(`Aluguel ativo: ${prop.name}`);
    } else if (action === 'collect') {
      setGameState({ ...gameState, bank: gameState.bank + prop.incomePerCycle });
      notify(`Lucro empresarial coletado: +${formatBRL(prop.incomePerCycle)}`);
    }
  };

  const handleUseInventory = (itemId: string) => {
    const item = gameState.inventory.find((i) => i.id === itemId);
    if (!item) return;

    if (item.quantity <= 0) {
      if (gameState.cash < item.price) {
        notify('Dinheiro insuficiente.');
        return;
      }
      setGameState({
        ...gameState,
        cash: gameState.cash - item.price,
        inventory: gameState.inventory.map((i) => (i.id === itemId ? { ...i, quantity: 1 } : i))
      });
      notify(`Comprou ${item.name}`);
      return;
    }

    setGameState({
      ...gameState,
      health: item.category === 'Médico' ? Math.min(100, gameState.health + item.effectValue) : gameState.health,
      hunger: item.category === 'Alimento' ? Math.min(100, gameState.hunger + item.effectValue) : gameState.hunger,
      thirst: item.category === 'Bebida' ? Math.min(100, gameState.thirst + item.effectValue) : gameState.thirst,
      inventory: gameState.inventory.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      )
    });
    notify(`Utilizou ${item.name}`);
  };

  const handleUpdateCharacter = (char: CharacterCustomization) => {
    worldEngineRef.current?.updateCharacterAppearance(char);
    setGameState({ ...gameState, character: char });
    notify('Visual atualizado!');
  };

  const handleSendChat = (text: string, channel: ChatMessage['channel']) => {
    const msg: ChatMessage = {
      id: String(Date.now()),
      sender: gameState.character.name,
      role: JOBS_LIST.find((j) => j.id === gameState.currentJob)?.title || 'Cidadão',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      channel
    };
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleUpdateSettings = (
    graphics: GraphicsPreset,
    viewDistance: number,
    timeOfDay: number,
    weather: WeatherType
  ) => {
    worldEngineRef.current?.applyGraphicsPreset(graphics, viewDistance);
    worldEngineRef.current?.setEnvironment(timeOfDay, weather);
    setGameState({ ...gameState, graphics, viewDistance, timeOfDay, weather });
  };

  const handleInteractNearby = () => {
    const spot = telemetry.nearbyInteractable || '';
    if (spot.includes('Banco')) setActiveTab('bank');
    else if (spot.includes('Posto')) {
      if (activeVehicle) handleVehicleAction('refuel', activeVehicle.id);
      else setActiveTab('vehicles');
    } else if (spot.includes('Concessionária')) setActiveTab('vehicles');
    else if (spot.includes('Delegacia') || spot.includes('Hospital')) setActiveTab('jobs');
    else setActiveTab('inventory');
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#090d16]">
      {/* Viewport 3D de Brasília */}
      <div ref={worldContainerRef} className="absolute inset-0 z-0" />

      {/* Minimapa Radar estilo GTA V */}
      <MiniMap
        playerX={telemetry.x}
        playerZ={telemetry.z}
        districtName={telemetry.districtName}
        onlinePlayers={gameState.mode === 'online' ? onlinePlayers : []}
        onOpenFullMap={() => setActiveTab('map')}
      />

      {/* HUD Superior Direito: Economia R$, Vida, Necessidades e Barra Rápida */}
      <div className="fixed top-3 right-3 z-20 flex flex-col items-end gap-2">
        <div className="hud-glass px-3.5 py-2 rounded-xl flex items-center gap-4 shadow-xl">
          <div className="text-right">
            <div className="text-xs font-extrabold text-emerald-400 gta-text-shadow">
              {formatBRL(gameState.cash)}
            </div>
            <div className="text-[11px] font-bold text-sky-300">
              Banco: {formatBRL(gameState.bank)}
            </div>
          </div>

          <div className="h-7 w-px bg-white/15" />

          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-current" /> {gameState.health}%
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <Utensils className="w-3.5 h-3.5" /> {gameState.hunger}%
            </span>
          </div>
        </div>

        {/* Atalhos de Sistemas do LIFE RP */}
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[260px] sm:max-w-none">
          <button onClick={() => setActiveTab('map')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Mapa DF">
            <MapPin className="w-4 h-4 text-sky-400" />
          </button>
          <button onClick={() => setActiveTab('bank')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Banco">
            <Landmark className="w-4 h-4 text-emerald-400" />
          </button>
          <button onClick={() => setActiveTab('jobs')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Profissões">
            <Briefcase className="w-4 h-4 text-amber-400" />
          </button>
          <button onClick={() => setActiveTab('vehicles')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Veículos">
            <Car className="w-4 h-4 text-purple-400" />
          </button>
          <button onClick={() => setActiveTab('properties')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Imóveis">
            <Building2 className="w-4 h-4 text-cyan-400" />
          </button>
          <button onClick={() => setActiveTab('inventory')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Inventário">
            <Package className="w-4 h-4 text-orange-400" />
          </button>
          <button onClick={() => setActiveTab('wardrobe')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Roupas">
            <Shirt className="w-4 h-4 text-pink-400" />
          </button>
          {gameState.mode === 'online' && (
            <button onClick={() => setActiveTab('chat')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Chat Online">
              <MessageSquare className="w-4 h-4 text-sky-300" />
            </button>
          )}
          <button onClick={() => setActiveTab('settings')} className="p-2 rounded-lg hud-glass hover:bg-white/15" title="Configurações">
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Painel do Veículo quando dirigindo */}
      {activeVehicle && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-20 hud-glass px-4 py-2 rounded-full flex items-center gap-4 text-xs font-bold shadow-xl">
          <span className="text-sky-300">{activeVehicle.model}</span>
          <span className="text-white text-sm">{telemetry.speedKmh} km/h</span>
          <span className="text-amber-400">Comb: {Math.round(activeVehicle.fuel)}%</span>
        </div>
      )}

      {/* Notificação rápida */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900/95 border border-sky-400/50 text-xs font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* Controles Mobile Touch */}
      <TouchControls
        inVehicle={Boolean(activeVehicle)}
        nearbyInteractable={telemetry.nearbyInteractable}
        onMove={(x, y) => worldEngineRef.current?.setMoveInput(x, y)}
        onCameraRotate={(dx, dy) => worldEngineRef.current?.rotateCamera(dx, dy)}
        onJump={() => worldEngineRef.current?.jump()}
        onSprintChange={(s) => worldEngineRef.current?.setSprint(s)}
        onInteract={handleInteractNearby}
        onToggleCamera={() => {
          const mode = worldEngineRef.current?.togglePerspective();
          notify(`Câmera: ${mode === 'first' ? 'Primeira Pessoa' : 'Terceira Pessoa'}`);
        }}
        onToggleVehicleExit={() => {
          worldEngineRef.current?.exitVehicle();
          setGameState({ ...gameState, currentVehicleId: null });
          notify('Saiu do veículo');
        }}
      />

      {/* Modais de Sistemas */}
      <GameModals
        activeTab={activeTab}
        state={gameState}
        onlinePlayers={onlinePlayers}
        chatMessages={chatMessages}
        onClose={() => setActiveTab(null)}
        onTeleport={(x, z, label) => {
          worldEngineRef.current?.teleportTo(x, z);
          setActiveTab(null);
          notify(`Chegou em ${label}`);
        }}
        onBankAction={handleBankAction}
        onSelectJob={handleSelectJob}
        onCompleteShift={handleCompleteShift}
        onVehicleAction={handleVehicleAction}
        onPropertyAction={handlePropertyAction}
        onUseInventory={handleUseInventory}
        onUpdateCharacter={handleUpdateCharacter}
        onSendChat={handleSendChat}
        onUpdateSettings={handleUpdateSettings}
        onExitToMenu={() => {
          setActiveTab(null);
          setGameState(null);
        }}
      />
    </div>
  );
}
