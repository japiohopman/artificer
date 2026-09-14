import React from 'react';
import { SpellSheet, SpellSheetProps } from './SpellSheet';

export type SpellCardProps = SpellSheetProps;

/**
 * @deprecated Use SpellSheet from './SpellSheet' instead.
 * SpellCard is retained as a compatibility export.
 */
export const SpellCard: React.FC<SpellCardProps> = (props) => {
  return <SpellSheet {...props} />;
};

export { SpellSheet };
