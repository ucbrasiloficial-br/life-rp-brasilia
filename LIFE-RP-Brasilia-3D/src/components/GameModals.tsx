import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  CloudSun,
  Landmark,
  MapPin,
  MessageSquare,
  Package,
  Send,
  Settings,
  Shirt,
  Users,
  X
} from 'lucide-react';
import { BRASILIA_DISTRICTS, JOBS_LIST } from '../data/brasiliaData';
import {
  CharacterCustomization,
  ChatMessage,
  GraphicsPreset,
  JobId,
  OnlinePlayer,
  PropertySpec,
  SaveState,
  VehicleSpec,
  WeatherType
} from '../types/game';

export type ActiveModalTab =
  | null
  | 'map'
  | 'bank'
  | 'jobs'
  | 'vehicles'
  | 'properties'
  | 'inventory'
  | 'wardrobe'
  | 'chat'
  | 'settings';

interface GameModalsProps {
  activeTab: ActiveModalTab;
  state: SaveState;
  onlinePlayers: OnlinePlayer[];
  chatMessages: ChatMessage[];
  onClose: () => void;
  onTeleport: (x: number, z: number, label: string) => void;
  onBankAction: (action: 'deposit' | 'withdraw' | 'transfer', amount: number, target?: string) => void;
  onSelectJob: (jobId: JobId) => void;
  onCompleteShift: () => void;
  onVehicleAction: (action: 'buy' | 'drive' | 'repair' | 'refuel' | 'paint', vehicleId: string, color?: string) => void;
  onPropertyAction: (action: 'buy' | 'rent' | 'collect', propertyId: string) => void;
  onUseInventory: (itemId: string) => void;
  onUpdateCharacter: (char: CharacterCustomization) => void;
  onSendChat: (text: string, channel: ChatMessage['channel']) => void;
  onUpdateSettings: (graphics: GraphicsPreset, viewDistance: number, timeOfDay: number, weather: WeatherType) => void;
  onExitToMenu: () => void;
}

const formatBRL = (val: number) =>
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const GameModals: React.FC<GameModalsProps> = ({
  activeTab,
  state,
  onlinePlayers,
  chatMessages,
  onClose,
  onTeleport,
  onBankAction,
  onSelectJob,
  onCompleteShift,
  onVehicleAction,
  onPropertyAction,
  onUseInventory,
  onUpdateCharacter,
  onSendChat,
  onUpdateSettings,
  onExitToMenu
}) => {
  const [bankAmount, setBankAmount] = useState('1000');
  const [transferTarget, setTransferTarget] = useState('Cidadão_DF_02');
  const [chatText, setChatText] = useState('');
  const [chatChannel, setChatChannel] = useState<ChatMessage['channel']>('RP');

  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0b1120] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {activeTab === 'map' && <MapPin className="w-5 h-5 text-sky-400" />}
            {activeTab === 'bank' && <Landmark className="w-5 h-5 text-emerald-400" />}
            {activeTab === 'jobs' && <Briefcase className="w-5 h-5 text-amber-400" />}
            {activeTab === 'vehicles' && <Car className="w-5 h-5 text-purple-400" />}
            {activeTab === 'properties' && <Building2 className="w-5 h-5 text-cyan-400" />}
            {activeTab === 'inventory' && <Package className="w-5 h-5 text-orange-400" />}
            {activeTab === 'wardrobe' && <Shirt className="w-5 h-5 text-pink-400" />}
            {activeTab === 'chat' && <MessageSquare className="w-5 h-5 text-sky-400" />}
            {activeTab === 'settings' && <Settings className="w-5 h-5 text-slate-300" />}

            <h2 className="font-display text-lg font-bold tracking-wide uppercase">
              {activeTab === 'map' && 'Mapa de Brasília — Regiões Administrativas (DF)'}
              {activeTab === 'bank' && 'Banco Regional de Brasília (BRB Digital)'}
              {activeTab === 'jobs' && 'Central de Profissões & Roleplay Espontâneo'}
              {activeTab === 'vehicles' && 'Concessionária, Garagem & Oficina'}
              {activeTab === 'properties' && 'Imobiliária & Negócios do Distrito Federal'}
              {activeTab === 'inventory' && 'Mochila & Inventário Pessoal'}
              {activeTab === 'wardrobe' && 'Loja de Roupas & Estilo'}
              {activeTab === 'chat' && `Servidor Online — ${state.serverName}`}
              {activeTab === 'settings' && 'Configurações Gráficas & Clima'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* MAPA DE BRASÍLIA */}
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BRASILIA_DISTRICTS.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{d.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                        {d.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{d.description}</p>
                  </div>
                  <button
                    onClick={() => onTeleport(d.centerX, d.centerZ, d.name)}
                    className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white"
                  >
                    Viajar para {d.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ECONOMIA & BANCO */}
          {activeTab === 'bank' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 uppercase font-semibold">Dinheiro em Espécie</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{formatBRL(state.cash)}</div>
                </div>
                <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/30">
                  <div className="text-xs text-sky-300 uppercase font-semibold">Saldo em Conta Bancária</div>
                  <div className="text-2xl font-extrabold text-sky-400 mt-1">{formatBRL(state.bank)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <label className="text-xs text-slate-400 block">Valor da Operação (R$)</label>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-white/15 text-white font-bold"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onBankAction('deposit', Number(bankAmount))}
                    className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-sm"
                  >
                    Depositar na Conta
                  </button>
                  <button
                    onClick={() => onBankAction('withdraw', Number(bankAmount))}
                    className="py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-sm"
                  >
                    Sacar em Espécie
                  </button>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <label className="text-xs text-slate-400 block">Transferência PIX / Conta para Jogador</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={transferTarget}
                      onChange={(e) => setTransferTarget(e.target.value)}
                      placeholder="Nome ou chave do cidadão"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-sm"
                    />
                    <button
                      onClick={() => onBankAction('transfer', Number(bankAmount), transferTarget)}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-sm"
                    >
                      Transferir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFISSÕES E SERVIÇOS */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-amber-300 font-semibold uppercase">Atividade Atual</div>
                  <div className="text-lg font-bold">
                    {JOBS_LIST.find((j) => j.id === state.currentJob)?.title}
                  </div>
                  <p className="text-xs text-slate-300">
                    Roleplay livre sem missões obrigatórias. Conclua um turno quando quiser receber seu salário.
                  </p>
                </div>
                {state.currentJob !== 'civil' && (
                  <button
                    onClick={onCompleteShift}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Receber Turno ({formatBRL(JOBS_LIST.find((j) => j.id === state.currentJob)?.salaryPerShift || 0)})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {JOBS_LIST.map((job) => {
                  const active = state.currentJob === job.id;
                  return (
                    <div
                      key={job.id}
                      className={`p-3.5 rounded-xl border ${
                        active ? 'bg-sky-950/50 border-sky-400' : 'bg-slate-900/80 border-white/10'
                      } flex flex-col justify-between gap-2`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{job.title}</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {job.salaryPerShift > 0 ? `${formatBRL(job.salaryPerShift)}/turno` : 'Livre'}
                          </span>
                        </div>
                        <div className="text-[11px] text-sky-300 mt-0.5">
                          {job.department} • Base: {job.spawnDistrict}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{job.description}</p>
                      </div>

                      <button
                        onClick={() => onSelectJob(job.id)}
                        className={`w-full py-2 rounded-lg text-xs font-bold ${
                          active ? 'bg-sky-500 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {active ? 'Em Serviço' : 'Assumir Função'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VEÍCULOS, CONCESSIONÁRIA E GARAGEM */}
          {activeTab === 'vehicles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.vehicles.map((v: VehicleSpec) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase text-sky-400 font-bold">{v.brand} • {v.category}</span>
                        <h3 className="font-bold text-base">{v.model}</h3>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {v.owned ? 'Na Garagem' : formatBRL(v.price)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-slate-300 bg-black/30 p-2 rounded-lg">
                      <div>Vel: {Math.round(v.maxSpeed * 3.1)} km/h</div>
                      <div>Comb: {Math.round(v.fuel)}%</div>
                      <div>Estado: {v.condition}%</div>
                    </div>
                  </div>

                  {v.owned ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onVehicleAction('drive', v.id)}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
                      >
                        Dirigir Agora
                      </button>
                      <button
                        onClick={() => onVehicleAction('refuel', v.id)}
                        className="px-3 py-2 rounded-lg bg-amber-600/80 text-xs font-bold"
                      >
                        Abastecer (R$ 150)
                      </button>
                      <button
                        onClick={() => onVehicleAction('repair', v.id)}
                        className="px-3 py-2 rounded-lg bg-sky-600/80 text-xs font-bold"
                      >
                        Revisão (R$ 300)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onVehicleAction('buy', v.id)}
                      className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs"
                    >
                      Comprar Veículo ({formatBRL(v.price)})
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PROPRIEDADES E EMPRESAS */}
          {activeTab === 'properties' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.properties.map((p: PropertySpec) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                        {p.type} • {p.district}
                      </span>
                      <span className="text-xs text-slate-400">{p.garageSlots} vagas</span>
                    </div>
                    <h3 className="font-bold text-base mt-1">{p.name}</h3>
                    <div className="text-xs text-slate-300 mt-1">
                      Compra: <strong className="text-emerald-400">{formatBRL(p.price)}</strong> | Aluguel:{' '}
                      <strong className="text-amber-400">{formatBRL(p.rentPrice)}</strong>
                    </div>
                    {p.incomePerCycle > 0 && (
                      <div className="text-xs text-emerald-300 mt-1">
                        Lucro empresarial: +{formatBRL(p.incomePerCycle)} por ciclo
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {p.owned || p.rented ? (
                      <>
                        <button
                          onClick={() => onTeleport(p.x, p.z, p.name)}
                          className="flex-1 py-2 rounded-lg bg-sky-600 font-bold text-xs"
                        >
                          Ir até o Imóvel
                        </button>
                        {p.owned && p.incomePerCycle > 0 && (
                          <button
                            onClick={() => onPropertyAction('collect', p.id)}
                            className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
                          >
                            Coletar Lucro
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onPropertyAction('buy', p.id)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
                        >
                          Comprar
                        </button>
                        <button
                          onClick={() => onPropertyAction('rent', p.id)}
                          className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-xs"
                        >
                          Alugar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INVENTÁRIO */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      {item.category} • Qtd: {item.quantity} • Efeito: +{item.effectValue}
                    </div>
                  </div>
                  <button
                    onClick={() => onUseInventory(item.id)}
                    className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold"
                  >
                    {item.quantity > 0 ? 'Usar' : `Comprar (${formatBRL(item.price)})`}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* GUARDA-ROUPA / LOJA DE ROUPAS */}
          {activeTab === 'wardrobe' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cor da Camiseta</label>
                  <div className="flex gap-2">
                    {['#2563eb', '#dc2626', '#16a34a', '#f8fafc', '#090d16', '#eab308'].map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateCharacter({ ...state.character, shirtColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-8 h-8 rounded-full border-2 border-white/40"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cor da Calça</label>
                  <div className="flex gap-2">
                    {['#1e293b', '#090d16', '#334155', '#78350f', '#cbd5e1'].map((c) => (
                      <button
                        key={c}
                        onClick={() => onUpdateCharacter({ ...state.character, pantsColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-8 h-8 rounded-full border-2 border-white/40"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Acessório</label>
                  <select
                    value={state.character.accessory}
                    onChange={(e) =>
                      onUpdateCharacter({
                        ...state.character,
                        accessory: e.target.value as CharacterCustomization['accessory']
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-sm"
                  >
                    <option value="Nenhum">Nenhum</option>
                    <option value="Óculos Escuros">Óculos Escuros</option>
                    <option value="Boné BSB">Boné BSB</option>
                    <option value="Relógio Ouro">Relógio Ouro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MULTIPLAYER & CHAT */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase">
                  <Users className="w-4 h-4" />
                  Jogadores Conectados ({onlinePlayers.length + 1}/16)
                </div>
                <div className="text-xs p-2 rounded bg-emerald-500/15 border border-emerald-500/30 font-semibold">
                  • {state.character.name} (Você)
                </div>
                {onlinePlayers.map((p) => (
                  <div key={p.id} className="text-xs p-2 rounded bg-white/5 flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-slate-400">{p.district}</span>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 flex flex-col h-72 bg-slate-950 rounded-xl border border-white/10 p-3">
                <div className="flex gap-2 mb-2">
                  {(['RP', 'Global', 'Rádio Polícia/Emergência'] as ChatMessage['channel'][]).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setChatChannel(ch)}
                      className={`px-2.5 py-1 rounded text-xs font-bold ${
                        chatChannel === ch ? 'bg-sky-600 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 text-xs pr-1">
                  {chatMessages.map((m) => (
                    <div key={m.id} className="p-2 rounded bg-white/5">
                      <span className="text-sky-400 font-bold">[{m.channel}] {m.sender}: </span>
                      <span className="text-slate-200">{m.text}</span>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatText.trim()) return;
                    onSendChat(chatText.trim(), chatChannel);
                    setChatText('');
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Digite uma mensagem de Roleplay..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* CONFIGURAÇÕES GRÁFICAS, CLIMA E HORÁRIO */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-2">Qualidade Gráfica (Padrão: Ultra)</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Baixa', 'Média', 'Alta', 'Ultra'] as GraphicsPreset[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => onUpdateSettings(preset, state.viewDistance, state.timeOfDay, state.weather)}
                      className={`py-2.5 rounded-xl font-bold text-xs border ${
                        state.graphics === preset
                          ? 'bg-sky-500 text-slate-950 border-sky-300'
                          : 'bg-slate-900 border-white/10 text-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Distância de Visão / Carregamento de Setores: {state.viewDistance}m
                </label>
                <input
                  type="range"
                  min={180}
                  max={650}
                  step={20}
                  value={state.viewDistance}
                  onChange={(e) =>
                    onUpdateSettings(state.graphics, Number(e.target.value), state.timeOfDay, state.weather)
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Ciclo Dia/Noite ({Math.floor(state.timeOfDay)}h)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={23.5}
                    step={0.5}
                    value={state.timeOfDay}
                    onChange={(e) =>
                      onUpdateSettings(state.graphics, state.viewDistance, Number(e.target.value), state.weather)
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <CloudSun className="w-3.5 h-3.5" /> Condição Climática Dinâmica
                  </label>
                  <select
                    value={state.weather}
                    onChange={(e) =>
                      onUpdateSettings(
                        state.graphics,
                        state.viewDistance,
                        state.timeOfDay,
                        e.target.value as WeatherType
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-sm"
                  >
                    <option value="Ensolarado">Ensolarado</option>
                    <option value="Pôr do Sol Cerrado">Pôr do Sol Cerrado</option>
                    <option value="Nublado">Nublado</option>
                    <option value="Chuva Tropical">Chuva Tropical</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Modo ativo: <strong className="uppercase text-white">{state.mode}</strong> (Progresso salvo automaticamente)
                </span>
                <button
                  onClick={onExitToMenu}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold"
                >
                  Sair para Tela Inicial
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
