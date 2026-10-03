export interface DeterministicDiceParams {
  sides: number;
  value: number;
  label?: string;
  theme?: string;
}

export interface DeterministicDicePresenter {
  id: string;
  name: string;
  presentRoll(params: DeterministicDiceParams): Promise<void>;
}

class DeterministicDiceAdapterRegistry {
  private activePresenter: DeterministicDicePresenter | null = null;

  registerPresenter(presenter: DeterministicDicePresenter) {
    this.activePresenter = presenter;
  }

  unregisterPresenter(presenterId: string) {
    if (this.activePresenter?.id === presenterId) {
      this.activePresenter = null;
    }
  }

  getActivePresenter(): DeterministicDicePresenter | null {
    return this.activePresenter;
  }

  async presentRoll(params: DeterministicDiceParams): Promise<void> {
    if (this.activePresenter) {
      await this.activePresenter.presentRoll(params);
    } else {
      console.log(`[DeterministicDiceAdapter] Presenting predetermined roll: ${params.value} (d${params.sides})`);
    }
  }
}

export const deterministicDiceAdapter = new DeterministicDiceAdapterRegistry();
