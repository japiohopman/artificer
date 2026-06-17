
export interface PackContent {
  template: string;
  quantity: number;
}

export const EQUIPMENT_PACKS: Record<string, PackContent[]> = {
  'burglars-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'ball-bearings-bag-of-1000', quantity: 1 },
    { template: 'string-10-feet', quantity: 1 },
    { template: 'bell', quantity: 1 },
    { template: 'candle', quantity: 5 },
    { template: 'crowbar', quantity: 1 },
    { template: 'hammer', quantity: 1 },
    { template: 'piton', quantity: 10 },
    { template: 'lantern-hooded', quantity: 1 },
    { template: 'oil-flask', quantity: 2 },
    { template: 'rations-1-day', quantity: 5 },
    { template: 'tinderbox', quantity: 1 },
    { template: 'waterskin', quantity: 1 },
    { template: 'rope-hempen-50-feet', quantity: 1 },
  ],
  'diplomats-pack': [
    { template: 'chest', quantity: 1 },
    { template: 'case-for-maps-and-scrolls', quantity: 2 },
    { template: 'clothes-fine', quantity: 1 },
    { template: 'ink-1-ounce-bottle', quantity: 1 },
    { template: 'ink-pen', quantity: 1 },
    { template: 'lamp', quantity: 1 },
    { template: 'oil-flask', quantity: 2 },
    { template: 'paper-one-sheet', quantity: 5 },
    { template: 'perfume-vial', quantity: 1 },
    { template: 'sealing-wax', quantity: 1 },
    { template: 'soap', quantity: 1 },
  ],
  'dungeoneers-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'crowbar', quantity: 1 },
    { template: 'hammer', quantity: 1 },
    { template: 'piton', quantity: 10 },
    { template: 'torch', quantity: 10 },
    { template: 'tinderbox', quantity: 1 },
    { template: 'rations-1-day', quantity: 10 },
    { template: 'waterskin', quantity: 1 },
    { template: 'rope-hempen-50-feet', quantity: 1 },
  ],
  'entertainers-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'bedroll', quantity: 1 },
    { template: 'costume', quantity: 2 },
    { template: 'candle', quantity: 5 },
    { template: 'rations-1-day', quantity: 5 },
    { template: 'waterskin', quantity: 1 },
    { template: 'disguise-kit', quantity: 1 },
  ],
  'explorers-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'bedroll', quantity: 1 },
    { template: 'mess-kit', quantity: 1 },
    { template: 'tinderbox', quantity: 1 },
    { template: 'torch', quantity: 10 },
    { template: 'rations-1-day', quantity: 10 },
    { template: 'waterskin', quantity: 1 },
    { template: 'rope-hempen-50-feet', quantity: 1 },
  ],
  'priests-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'blanket', quantity: 1 },
    { template: 'candle', quantity: 10 },
    { template: 'tinderbox', quantity: 1 },
    { template: 'alms-box', quantity: 1 },
    { template: 'incense-block', quantity: 2 },
    { template: 'censer', quantity: 1 },
    { template: 'vestments', quantity: 1 },
    { template: 'rations-1-day', quantity: 2 },
    { template: 'waterskin', quantity: 1 },
  ],
  'scholars-pack': [
    { template: 'backpack', quantity: 1 },
    { template: 'book-of-lore', quantity: 1 },
    { template: 'ink-1-ounce-bottle', quantity: 1 },
    { template: 'ink-pen', quantity: 1 },
    { template: 'parchment-one-sheet', quantity: 10 },
    { template: 'little-bag-of-sand', quantity: 1 },
    { template: 'knife-small', quantity: 1 },
  ],
};

export function getPackContents(index: string): PackContent[] | null {
    // Normalize index to lowercase and handle possible slashes or extensions
    const cleanIndex = index.toLowerCase().split('/').pop()?.replace('.json', '') || '';
    return EQUIPMENT_PACKS[cleanIndex] || null;
}
