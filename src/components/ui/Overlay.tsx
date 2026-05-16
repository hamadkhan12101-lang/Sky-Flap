import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store/useGameStore';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Overlay = () => {
  const { gameState, score, highScore, setGameState, lastScore, isSpeedingUp, otherPlayers } = useGameStore();

  const otherPlayersCount = Object.keys(otherPlayers).length;

  const handleRestart = () => {
    setGameState('PLAYING');
  };

  React.useEffect(() => {
    if (gameState === 'GAME_OVER' && score > 0 && score >= highScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [gameState]);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-between p-8 font-sans overflow-hidden">
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-black">
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
         {otherPlayersCount + 1} PILOTS ONLINE
      </div>
      <AnimatePresence>
        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center gap-4 w-full h-full pointer-events-none relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-[80px] md:text-[120px] font-black text-white pixel-text z-10 leading-none mt-12"
            >
              {score}
            </motion.div>
            
            {isSpeedingUp && (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="bg-red-500 text-white font-black px-4 py-1 rounded italic text-xs md:text-sm tracking-widest shadow-lg mt-2"
               >
                 SUPER SPEED ACTIVE
               </motion.div>
            )}

            {/* Mobile Speed Up Button */}
            <div className="absolute bottom-10 right-0 pointer-events-auto">
              <button
                onPointerDown={() => useGameStore.getState().setIsSpeedingUp(true)}
                onPointerUp={() => useGameStore.getState().setIsSpeedingUp(false)}
                onPointerLeave={() => useGameStore.getState().setIsSpeedingUp(false)}
                className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all active:scale-90 touch-none select-none bg-black/40 ${isSpeedingUp ? 'border-red-500 text-red-500' : 'border-white/20 text-white/40'}`}
              >
                <div className="font-black text-xs italic tracking-tighter">BOOST</div>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 pointer-events-auto z-20"
          >
            <div className="text-center mb-4">
               <h1 className="text-[120px] md:text-[140px] leading-none italic text-white pixel-text mb-0">SKY<br/>WINGS</h1>
               <p className="text-white/80 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm">A Modern 3D Arcade Experience</p>
            </div>

            <div className="flex flex-col items-center gap-8">
              <button
                onClick={() => setGameState('PLAYING')}
                className="bg-[#F7BC00] hover:bg-yellow-400 text-black font-black py-5 px-16 rounded-2xl text-3xl border-b-[10px] border-[#B28700] transform active:translate-y-1 active:border-b-[4px] shadow-2xl cursor-pointer transition-all"
              >
                PLAY NOW
              </button>
              
              <div className="text-white/40 text-[10px] font-black tracking-widest uppercase flex flex-col items-center gap-1">
                <span>Space to Jump</span>
                <span>Hold "M" to Speed Up</span>
              </div>

              <div className="flex gap-4">
                <div className="glass px-8 py-4 flex flex-col items-center shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-black/60 font-black mb-1">BEST SCORE</span>
                  <span className="text-3xl font-black text-black">{highScore}</span>
                </div>
                <div className="glass px-8 py-4 flex flex-col items-center shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-black/60 font-black mb-1">LAST RUN</span>
                  <span className="text-3xl font-black text-black">{lastScore}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8 pointer-events-auto z-20"
          >
            <div className="text-center">
              <h2 className="text-[100px] leading-none italic text-white pixel-text mb-2">CRASH!</h2>
              <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-sm">Better luck next time, pilot</p>
            </div>
            
            <div className="flex gap-6 w-full justify-center">
                <div className="glass px-10 py-6 text-center shadow-2xl">
                    <p className="text-xs text-black/40 font-black uppercase tracking-widest mb-1">SCORE</p>
                    <p className="text-5xl font-black text-black">{lastScore}</p>
                </div>
                <div className="glass px-10 py-6 text-center shadow-2xl bg-yellow-400/20">
                    <p className="text-xs text-black/40 font-black uppercase tracking-widest mb-1">BEST</p>
                    <p className="text-5xl font-black text-black">{highScore}</p>
                </div>
            </div>

            <button
              onClick={handleRestart}
              className="bg-[#F7BC00] hover:bg-yellow-400 text-black font-black py-5 px-16 rounded-2xl text-3xl border-b-[10px] border-[#B28700] transform active:translate-y-1 active:border-b-[4px] shadow-2xl cursor-pointer transition-all"
            >
              TRY AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase mb-4 z-10 italic">
        SKYWINGS ARCADE ENGINE
      </div>
    </div>
  );
};
