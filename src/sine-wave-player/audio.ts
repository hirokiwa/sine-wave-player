import { AUDIO_GAIN_VALUE } from "./constants.ts";

export type ToneNode = {
  readonly oscillator: OscillatorNode;
  readonly gain: GainNode;
};

export const createAudioContext = () =>
  new AudioContext();

export const createOscillator = (context: AudioContext) =>
  context.createOscillator();

export const createGain = (context: AudioContext) =>
  context.createGain();

export const startToneNode = ({
  context,
  frequency,
}: {
  readonly context: AudioContext;
  readonly frequency: number;
}) => {
  const oscillator = createOscillator(context);
  const gain = createGain(context);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = AUDIO_GAIN_VALUE;

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();

  return { oscillator, gain };
};

export const stopToneNode = ({
  oscillator,
  gain,
  context,
}: {
  readonly oscillator: OscillatorNode | null;
  readonly gain: GainNode | null;
  readonly context: AudioContext | null;
}) => {
  oscillator?.stop();
  oscillator?.disconnect();
  gain?.disconnect();
  void context?.close();
};
