declare module '@3d-dice/dice-box' {
  export interface DiceBoxConfig {
    container?: string | HTMLElement;
    assetPath?: string;
    origin?: string;
    theme?: string;
    offscreen?: boolean;
    scale?: number;
    gravity?: number;
    friction?: number;
    wallBounce?: number;
    restitution?: number;
    [key: string]: any;
  }

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<void>;
    roll(notation: string | string[]): Promise<any[]>;
    clear(): void;
    show(): void;
    hide(): void;
  }
}

declare module '@3d-dice/dice-roller-parser' {
  export class DiceRoller {
    roll(notation: string): any;
  }
}
