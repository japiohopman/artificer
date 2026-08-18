import { Character } from '../../../store/useCharacterStore';

export type CreationStep =
  | 'welcome'
  | 'slot'
  | 'identity'
  | 'species'
  | 'class'
  | 'background'
  | 'alignment'
  | 'stats'
  | 'choices'
  | 'spells'
  | 'equipment'
  | 'appearance'
  | 'describe'
  | 'languages'
  | 'review';

export interface ValidationError {
  step: CreationStep;
  field: string;
  message: string;
  actionLabel: string;
}

export const validateStep = (
  step: CreationStep,
  newChar: Partial<Character>,
  selectedSlot: number | null
): ValidationError[] => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 'slot':
      if (!selectedSlot) {
        errors.push({
          step: 'slot',
          field: 'selectedSlot',
          message: 'Choose a save slot for your character.',
          actionLabel: 'GO TO SAVE SLOT'
        });
      }
      break;

    case 'identity':
      if (!newChar.gender) {
        errors.push({
          step: 'identity',
          field: 'gender',
          message: 'Select your character’s gender polarity.',
          actionLabel: 'GO TO IDENTITY'
        });
      }
      if (!newChar.name || !newChar.name.trim()) {
        errors.push({
          step: 'identity',
          field: 'name',
          message: 'Provide a moniker or name for your character.',
          actionLabel: 'GO TO IDENTITY'
        });
      }
      break;

    case 'species':
      if (!newChar.race) {
        errors.push({
          step: 'species',
          field: 'species',
          message: 'Select a species and heritage for your hero.',
          actionLabel: 'GO TO SPECIES'
        });
      }
      break;

    case 'class':
      if (!newChar.class) {
        errors.push({
          step: 'class',
          field: 'class',
          message: 'Select a class and primary calling.',
          actionLabel: 'GO TO CLASS'
        });
      }
      break;

    case 'background':
      if (!newChar.background) {
        errors.push({
          step: 'background',
          field: 'background',
          message: 'Select a character background and origin.',
          actionLabel: 'GO TO BACKGROUND'
        });
      }
      break;

    case 'alignment':
      if (!newChar.alignment) {
        errors.push({
          step: 'alignment',
          field: 'alignment',
          message: 'Select your ethical ethos / alignment.',
          actionLabel: 'GO TO ALIGNMENT'
        });
      }
      break;

    case 'appearance':
      if (!newChar.appearance?.bodyType) {
        errors.push({
          step: 'appearance',
          field: 'appearance.bodyType',
          message: 'Select a body type for your appearance.',
          actionLabel: 'GO TO APPEARANCE'
        });
      }
      if (!newChar.appearance?.hairStyle) {
        errors.push({
          step: 'appearance',
          field: 'appearance.hairStyle',
          message: 'Select a hair style for your appearance.',
          actionLabel: 'GO TO APPEARANCE'
        });
      }
      break;

    default:
      break;
  }

  return errors;
};

export const validateFullCharacter = (
  newChar: Partial<Character>,
  selectedSlot: number | null
): ValidationError[] => {
  const stepsToValidate: CreationStep[] = [
    'slot',
    'identity',
    'species',
    'class',
    'background',
    'alignment',
    'appearance'
  ];

  let allErrors: ValidationError[] = [];
  for (const st of stepsToValidate) {
    const errs = validateStep(st, newChar, selectedSlot);
    allErrors = allErrors.concat(errs);
  }

  return allErrors;
};
