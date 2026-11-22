import React from 'react';
import { BRASILIA_DISTRICTS } from '../data/brasiliaData';
import { OnlinePlayer } from '../types/game';

interface MiniMapProps {
  playerX: number;
  playerZ: number;
  districtName: string;
  onlinePlayers: OnlinePlayer[];
  onOpenFullMap: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  playerX,
  playerZ,
  districtName,
  onlinePlayers,
  onOpenFullMap
}) => {
  // Converte coordenadas de Brasília (-550..300) para viewport do radar
  const mapScale = 0.22;

  return (
    <div
      onClick={onOpenFullMap}
      className="fixed top-3 left-3 z-20 cursor-pointer group"
    >
      <div className="w-36 h-28 rounded-xl hud-glass overflow-hidden relative border-2 border-white/20 shadow-2xl">
        {/* Fundo radar */}
        <div className="absolute inset-0 bg-[#0b1324]" />

        {/* Lago Paranoá */}
        <div
          style={{
            left: `${72 + (270 - playerX) * mapScale}px`,
            top: `${56 + (0 - playerZ) * mapScale}px`
          }}
          className="w-14 h-36 bg-sky-500/35 rounded-full -translate-x-1/2 -translate-y-1/2 absolute"
        />

        {/* Regiões Administrativas */}
        {BRASILIA_DISTRICTS.map((d) => {
          const rx = 72 + (d.centerX - playerX) * mapScale;
          const rz = 56 + (d.centerZ - playerZ) * mapScale;
          return (
            <div
              key={d.id}
              style={{ left: `${rx}px`, top: `${rz}px`, backgroundColor: d.color }}
              className="w-2 h-2 rounded-full opacity-75 -translate-x-1/2 -translate-y-1/2 absolute"
            />
          );
        })}

        {/* Jogadores Online Sincronizados */}
        {onlinePlayers.map((op) => {
          const ox = 72 + (op.x - playerX) * mapScale;
          const oz = 56 + (op.z - playerZ) * mapScale;
          return (
            <div
              key={op.id}
              style={{ left: `${ox}px`, top: `${oz}px` }}
              className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black -translate-x-1/2 -translate-y-1/2 absolute"
            />
          );
        })}

        {/* Indicador Central do Jogador */}
        <div className="w-3 h-3 rounded-full bg-white border-2 border-sky-500 shadow-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-sky-300 truncate">
          {districtName}
        </div>
      </div>
    </div>
  );
};
