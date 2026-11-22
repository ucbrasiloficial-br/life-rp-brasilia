import React, { useRef, useState } from 'react';
import { ArrowUp, Car, Eye, Hand, Zap } from 'lucide-react';

interface TouchControlsProps {
  inVehicle: boolean;
  nearbyInteractable: string | null;
  onMove: (x: number, y: number) => void;
  onCameraRotate: (dx: number, dy: number) => void;
  onJump: () => void;
  onSprintChange: (sprinting: boolean) => void;
  onInteract: () => void;
  onToggleCamera: () => void;
  onToggleVehicleExit: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inVehicle,
  nearbyInteractable,
  onMove,
  onCameraRotate,
  onJump,
  onSprintChange,
  onInteract,
  onToggleCamera,
  onToggleVehicleExit
}) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const joystickCenter = useRef<{ x: number; y: number } | null>(null);
  const lastLookTouch = useRef<{ x: number; y: number } | null>(null);

  const handleJoystickStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    joystickCenter.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!joystickCenter.current) return;
    const touch = e.changedTouches[0];
    const maxRadius = 44;
    const dx = touch.clientX - joystickCenter.current.x;
    const dy = touch.clientY - joystickCenter.current.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setKnobPos({ x: nx, y: ny });
    onMove(nx / maxRadius, ny / maxRadius);
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    joystickCenter.current = null;
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const handleLookStart = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    if (!lastLookTouch.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - lastLookTouch.current.x;
    const dy = touch.clientY - lastLookTouch.current.y;
    lastLookTouch.current = { x: touch.clientX, y: touch.clientY };
    onCameraRotate(dx, dy);
  };

  const handleLookEnd = () => {
    lastLookTouch.current = null;
  };

  return (
    <>
      {/* Área invisível direita para arrastar e girar a câmera */}
      <div
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        className="fixed inset-y-0 right-0 w-1/2 z-10"
      />

      {/* Controles esquerdos: Joystick (a pé) ou Direção (veículo) */}
      <div className="fixed bottom-6 left-6 z-20 flex items-center gap-3">
        {!inVehicle ? (
          <div
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            className="w-32 h-32 rounded-full hud-glass flex items-center justify-center relative shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full border border-white/10" />
            <div
              style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
              className="w-12 h-12 rounded-full bg-sky-500/85 border-2 border-white shadow-lg absolute transition-transform duration-75"
            />
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onTouchStart={() => onMove(-1, 0)}
              onTouchEnd={() => onMove(0, 0)}
              onMouseDown={() => onMove(-1, 0)}
              onMouseUp={() => onMove(0, 0)}
              className="w-16 h-16 rounded-2xl hud-glass active:bg-sky-500/40 flex items-center justify-center font-bold text-xl"
            >
              ◀
            </button>
            <button
              onTouchStart={() => onMove(1, 0)}
              onTouchEnd={() => onMove(0, 0)}
              onMouseDown={() => onMove(1, 0)}
              onMouseUp={() => onMove(0, 0)}
              className="w-16 h-16 rounded-2xl hud-glass active:bg-sky-500/40 flex items-center justify-center font-bold text-xl"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* Controles direitos: Ações */}
      <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-3">
        {nearbyInteractable && (
          <button
            onClick={onInteract}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce"
          >
            <Hand className="w-4 h-4" />
            Interagir: {nearbyInteractable}
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleCamera}
            title="Alternar Câmera 1ª/3ª Pessoa"
            className="w-12 h-12 rounded-full hud-glass active:scale-95 flex items-center justify-center text-sky-300"
          >
            <Eye className="w-5 h-5" />
          </button>

          {inVehicle && (
            <button
              onClick={onToggleVehicleExit}
              className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 active:scale-95 flex items-center justify-center shadow-lg"
            >
              <Car className="w-5 h-5" />
            </button>
          )}
        </div>

        {!inVehicle ? (
          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => onSprintChange(true)}
              onTouchEnd={() => onSprintChange(false)}
              onMouseDown={() => onSprintChange(true)}
              onMouseUp={() => onSprintChange(false)}
              className="w-14 h-14 rounded-full hud-glass active:bg-amber-500/50 flex flex-col items-center justify-center text-[10px] font-bold"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              CORRER
            </button>

            <button
              onClick={onJump}
              className="w-16 h-16 rounded-full bg-sky-500/90 text-slate-950 active:scale-95 flex flex-col items-center justify-center text-[10px] font-extrabold shadow-xl"
            >
              <ArrowUp className="w-6 h-6" />
              PULAR
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onTouchStart={() => onMove(0, 1)}
              onTouchEnd={() => onMove(0, 0)}
              onMouseDown={() => onMove(0, 1)}
              onMouseUp={() => onMove(0, 0)}
              className="w-16 h-16 rounded-2xl bg-rose-600/90 active:scale-95 flex flex-col items-center justify-center text-[10px] font-extrabold shadow-lg"
            >
              FREIO / RÉ
            </button>
            <button
              onTouchStart={() => onMove(0, -1)}
              onTouchEnd={() => onMove(0, 0)}
              onMouseDown={() => onMove(0, -1)}
              onMouseUp={() => onMove(0, 0)}
              className="w-20 h-20 rounded-2xl bg-emerald-500 text-slate-950 active:scale-95 flex flex-col items-center justify-center text-xs font-extrabold shadow-xl"
            >
              ACELERAR
            </button>
          </div>
        )}
      </div>
    </>
  );
};
