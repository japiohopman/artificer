/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ArcaneCodex from './components/core/ArcaneCodex';
import { DiceBoxCanvas } from './dice_roller/DiceBoxCanvas';
import { DiceRollOverlay } from './dice_roller/DiceRollOverlay';
import { AdvancedRoller } from './components/dice/DiceRollerPanel';

export default function App() {
  return (
    <div className="min-h-screen">
      <ArcaneCodex />
      
      {/* Global Dice Layer */}
      <DiceRollOverlay />
      <DiceBoxCanvas />
      <AdvancedRoller />
    </div>
  );
}
