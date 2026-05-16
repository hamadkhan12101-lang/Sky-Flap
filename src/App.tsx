/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameScene } from './components/game/GameScene';
import { Overlay } from './components/ui/Overlay';
import { MusicPlayer } from './components/game/MusicPlayer';
import { MultiplayerManager } from './components/MultiplayerManager';

export default function App() {
  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: 'linear-gradient(180deg, #4EC0CA 0%, #70C5CE 60%, #DED895 100%)' }}>
      <MultiplayerManager />
      <MusicPlayer />
      <GameScene />
      <Overlay />
    </div>
  );
}

