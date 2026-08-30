import React from 'react';
import { Character } from '../../../store/useCharacterStore';
import { CharacterMirror } from './CharacterMirror/CharacterMirror';

interface CreatorRightPanelProps {
  newChar: Partial<Character>;
  currentStep: string;
}

export const CreatorRightPanel: React.FC<CreatorRightPanelProps> = ({ newChar, currentStep }) => {
  return <CharacterMirror newChar={newChar} currentStep={currentStep} />;
};
