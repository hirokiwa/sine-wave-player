export type SineWavePlayerState = {
  readonly context: AudioContext | null;
  readonly oscillator: OscillatorNode | null;
  readonly gain: GainNode | null;
  readonly playing: boolean;
  readonly endTime: number | null;
  readonly stopTimeoutId: number | null;
  readonly countdownIntervalId: number | null;
  readonly frequencyTimeoutId: number | null;
};

export const createInitialState = () => ({
  context: null,
  oscillator: null,
  gain: null,
  playing: false,
  endTime: null,
  stopTimeoutId: null,
  countdownIntervalId: null,
  frequencyTimeoutId: null,
});

const stateStore: { value: SineWavePlayerState } = {
  value: createInitialState(),
};

export const getState = () =>
  stateStore.value;

export const setState = (nextState: SineWavePlayerState) => {
  stateStore.value = nextState;
};

export const updateState = (
  createNextState: (state: SineWavePlayerState) => SineWavePlayerState,
) => {
  stateStore.value = createNextState(stateStore.value);
};

export const resetState = () => {
  stateStore.value = createInitialState();
};
