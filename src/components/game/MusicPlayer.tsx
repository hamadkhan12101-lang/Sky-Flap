import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Volume2, VolumeX } from 'lucide-react';

export const MusicPlayer = () => {
  const { gameState, isSpeedingUp } = useGameStore();
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C4 to C5
  const melody = [0, 4, 7, 4, 2, 5, 4, 2];
  const stepRef = useRef(0);

  const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'square', volume = 0.05) => {
    if (!audioCtxRef.current || muted) return;

    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    // Add a slight vibrato if speeding up
    if (isSpeedingUp) {
       osc.frequency.exponentialRampToValueAtTime(freq * 1.05, time + duration);
    }
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + duration);
  };

  const scheduler = () => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;

    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      const time = nextNoteTimeRef.current;
      // Faster beat when speeding up
      const beatDuration = isSpeedingUp ? 0.12 : 0.2;

      // Bassline
      const bassFreq = gameState === 'PLAYING' ? 65.41 : 49.00;
      if (stepRef.current % 4 === 0) {
        playNote(bassFreq * (isSpeedingUp ? 1.5 : 1), time, beatDuration * 1.8, 'triangle', 0.08);
      }

      // Melody
      if (gameState !== 'GAME_OVER') {
        const noteIndex = melody[stepRef.current % melody.length];
        const freq = notes[noteIndex] * (isSpeedingUp ? 1.5 : 1);
        playNote(freq, time, beatDuration * 0.8, 'square', 0.02);
      }

      nextNoteTimeRef.current += beatDuration;
      stepRef.current++;
    }
    
    requestAnimationFrame(scheduler);
  };

  useEffect(() => {
    if (gameState === 'PLAYING' && !isPlayingRef.current) {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        isPlayingRef.current = true;
        nextNoteTimeRef.current = audioCtxRef.current.currentTime;
        scheduler();
    }
  }, [gameState]);

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-auto">
      <button 
        onClick={() => setMuted(!muted)}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};
