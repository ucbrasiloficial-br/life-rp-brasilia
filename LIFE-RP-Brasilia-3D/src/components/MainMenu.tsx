import React, { useState } from 'react';
import { Globe, Play, ShieldCheck, UserPlus, WifiOff } from 'lucide-react';
import { createDefaultState, loadGameState } from '../services/storageService';
import { CharacterCustomization, GameMode, SaveState } from '../types/game';

interface MainMenuProps {
  onStartGame: (state: SaveState) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('offline');
  const [email, setEmail] = useState('cidadao.bsb@liferp.com.br');
  const [serverName, setServerName] = useState('BR-DF #01 (Brasília Oficial - 16 Slots)');
  const [showCreator, setShowCreator] = useState(false);

  const [character, setCharacter] = useState<CharacterCustomization>({
    name: 'Lucas Brasília',
    gender: 'Masculino',
    skinTone: '#d99b72',
    hairColor: '#1c1917',
    hairStyle: 'Fade',
    eyeColor: '#3b2f2f',
    shirtColor: '#2563eb',
    pantsColor: '#1e293b',
    shoesColor: '#f8fafc',
    accessory: 'Óculos Escuros'
  });

  const existingSave = loadGameState(selectedMode);

  const handleLaunch = (useExisting: boolean) => {
    if (useExisting && existingSave) {
      onStartGame(existingSave);
      return;
    }
    const fresh = createDefaultState(
      selectedMode,
      selectedMode === 'online' ? email : undefined,
      selectedMode === 'online' ? serverName : undefined
    );
    fresh.character = character;
    onStartGame(fresh);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#090d16_65%)] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl hud-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-6">
        {/* Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> BRASÍLIA • DISTRITO FEDERAL • BRASIL
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-wider text-white">
              LIFE <span className="text-sky-400">RP</span>
            </h1>
            <p className="text-xs sm:text-sm tracking-[0.22em] text-slate-300 font-semibold mt-1">
              YOUR CITY. YOUR LIFE. YOUR STORY.
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <div>Gráficos: <strong className="text-emerald-400">ULTRA 3D</strong></div>
            <div>13 Regiões Administrativas</div>
            <div>Economia Oficial em R$</div>
          </div>
        </div>

        {/* Seleção de Modo Independente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedMode('offline')}
            className={`p-4 rounded-2xl border text-left transition ${
              selectedMode === 'offline'
                ? 'bg-sky-500/20 border-sky-400 shadow-lg'
                : 'bg-slate-900/70 border-white/10 hover:border-white/25'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-base text-white">
              <WifiOff className="w-5 h-5 text-sky-400" /> MODO OFFLINE (Visitante)
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              Sem cadastro e sem internet. Exploração livre de Brasília, veículos, empregos, imóveis e salvamento local independente.
            </p>
          </button>

          <button
            onClick={() => setSelectedMode('online')}
            className={`p-4 rounded-2xl border text-left transition ${
              selectedMode === 'online'
                ? 'bg-emerald-500/20 border-emerald-400 shadow-lg'
                : 'bg-slate-900/70 border-white/10 hover:border-white/25'
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold text-base text-white">
              <Globe className="w-5 h-5 text-emerald-400" /> MODO ONLINE (Servidores RP)
            </div>
            <p className="text-xs text-slate-300 mt-1.5">
              Servidores de até 16 jogadores simultâneos, chat RP/Rádio, economia sincronizada e perfil associado à conta.
            </p>
          </button>
        </div>

        {/* Configurações de Conta Online */}
        {selectedMode === 'online' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-white/10">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Conta / E-mail do Jogador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Servidor Brasília (Máx. 16 Jogadores)</label>
              <select
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-sm"
              >
                <option>BR-DF #01 (Brasília Oficial - 16 Slots)</option>
                <option>BR-DF #02 (Plano Piloto & Esplanada - 16 Slots)</option>
                <option>BR-DF #03 (Taguatinga & Ceilândia RP - 16 Slots)</option>
              </select>
            </div>
          </div>
        )}

        {/* Personalização de Personagem */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-sky-300 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Identidade & Aparência do Personagem
            </span>
            <button
              onClick={() => setShowCreator(!showCreator)}
              className="text-xs text-sky-400 underline font-semibold"
            >
              {showCreator ? 'Ocultar Opções' : 'Personalizar Rosto, Cabelo e Roupas'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nome no Jogo</label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Gênero</label>
              <select
                value={character.gender}
                onChange={(e) =>
                  setCharacter({ ...character, gender: e.target.value as CharacterCustomization['gender'] })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-sm"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Penteado</label>
              <select
                value={character.hairStyle}
                onChange={(e) =>
                  setCharacter({ ...character, hairStyle: e.target.value as CharacterCustomization['hairStyle'] })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-sm"
              >
                <option value="Fade">Fade Urbano</option>
                <option value="Curto">Curto Clássico</option>
                <option value="Longo">Longo</option>
                <option value="Coque">Coque</option>
              </select>
            </div>
          </div>

          {showCreator && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tom de Pele</label>
                <div className="flex gap-1.5">
                  {['#f5d0b5', '#d99b72', '#a86b43', '#5c3822'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setCharacter({ ...character, skinTone: tone })}
                      style={{ backgroundColor: tone }}
                      className={`w-7 h-7 rounded-full border-2 ${
                        character.skinTone === tone ? 'border-sky-400 scale-110' : 'border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cor do Cabelo</label>
                <div className="flex gap-1.5">
                  {['#1c1917', '#451a03', '#ca8a04', '#991b1b'].map((hc) => (
                    <button
                      key={hc}
                      onClick={() => setCharacter({ ...character, hairColor: hc })}
                      style={{ backgroundColor: hc }}
                      className={`w-7 h-7 rounded-full border-2 ${
                        character.hairColor === hc ? 'border-sky-400 scale-110' : 'border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Camiseta Inicial</label>
                <div className="flex gap-1.5">
                  {['#2563eb', '#16a34a', '#dc2626', '#f8fafc'].map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setCharacter({ ...character, shirtColor: sc })}
                      style={{ backgroundColor: sc }}
                      className={`w-7 h-7 rounded-full border-2 ${
                        character.shirtColor === sc ? 'border-sky-400 scale-110' : 'border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Acessório</label>
                <select
                  value={character.accessory}
                  onChange={(e) =>
                    setCharacter({ ...character, accessory: e.target.value as CharacterCustomization['accessory'] })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-xs"
                >
                  <option value="Óculos Escuros">Óculos Escuros</option>
                  <option value="Boné BSB">Boné BSB</option>
                  <option value="Relógio Ouro">Relógio Ouro</option>
                  <option value="Nenhum">Nenhum</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Entrada */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleLaunch(false)}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl"
          >
            <Play className="w-5 h-5 fill-current" />
            {existingSave ? 'Novo Personagem em Brasília' : 'Entrar em Brasília'}
          </button>

          {existingSave && (
            <button
              onClick={() => handleLaunch(true)}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl"
            >
              Continuar Progresso Salvo ({existingSave.character.name})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
