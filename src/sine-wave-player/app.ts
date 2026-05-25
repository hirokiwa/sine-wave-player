import {
  COUNTDOWN_INTERVAL_MILLISECONDS,
  FREQUENCY_DEBOUNCE_MILLISECONDS,
  FREQUENCY_RAMP_SECONDS,
  INFINITE_TIME_LABEL,
} from "./constants.ts";
import { createAudioContext, startToneNode, stopToneNode } from "./audio.ts";
import {
  getButtonDataValue,
  getNumberInputValue,
  getRequiredElementById,
  queryAll,
  queryRequired,
} from "./dom.ts";
import { getState, resetState, setState, updateState } from "./state.ts";
import {
  createEndTime,
  formatMillisecondsAsTimer,
  getRemainingMilliseconds,
  isFiniteTimerValue,
  minutesToMilliseconds,
} from "./time.ts";
import { resetTitle, setText, setTitle, setToggleButton } from "./ui.ts";

type SineWavePlayerElements = {
  readonly frequencyInput: HTMLInputElement;
  readonly timerInput: HTMLInputElement;
  readonly toggleButton: HTMLButtonElement;
  readonly toggleIcon: HTMLSpanElement;
  readonly toggleLabel: HTMLSpanElement;
  readonly statusText: HTMLSpanElement;
  readonly countdownText: HTMLSpanElement;
  readonly frequencyPresetButtons: readonly HTMLButtonElement[];
  readonly timerPresetButtons: readonly HTMLButtonElement[];
};

const getElements = () => ({
  frequencyInput: getRequiredElementById<HTMLInputElement>("frequency-input"),
  timerInput: getRequiredElementById<HTMLInputElement>("timer-input"),
  toggleButton: getRequiredElementById<HTMLButtonElement>("toggle-button"),
  toggleIcon: queryRequired<HTMLSpanElement>(".sine-wave-player__toggle-icon"),
  toggleLabel: queryRequired<HTMLSpanElement>(".sine-wave-player__toggle-label"),
  statusText: getRequiredElementById<HTMLSpanElement>("status-text"),
  countdownText: getRequiredElementById<HTMLSpanElement>("countdown-text"),
  frequencyPresetButtons: queryAll<HTMLButtonElement>("[data-frequency]"),
  timerPresetButtons: queryAll<HTMLButtonElement>("[data-timer]"),
}) satisfies SineWavePlayerElements;

const getFrequency = (elements: SineWavePlayerElements) =>
  getNumberInputValue(elements.frequencyInput);

const getTimerMinutes = (elements: SineWavePlayerElements) =>
  getNumberInputValue(elements.timerInput);

const renderStopped = (elements: SineWavePlayerElements) => {
  setText({ element: elements.statusText, text: "Stop" });
  setText({ element: elements.countdownText, text: INFINITE_TIME_LABEL });
  setToggleButton({
    button: elements.toggleButton,
    icon: elements.toggleIcon,
    label: elements.toggleLabel,
    playing: false,
  });
  resetTitle();
};

const renderPlaying = ({
  elements,
  frequency,
}: {
  readonly elements: SineWavePlayerElements;
  readonly frequency: number;
}) => {
  setText({ element: elements.statusText, text: `${frequency}Hz playback` });
  setToggleButton({
    button: elements.toggleButton,
    icon: elements.toggleIcon,
    label: elements.toggleLabel,
    playing: true,
  });
};

const clearScheduledStop = () => {
  clearTimeout(getState().stopTimeoutId ?? undefined);
};

const clearFrequencyDebounce = () => {
  clearTimeout(getState().frequencyTimeoutId ?? undefined);
};

const createSineWavePlayer = (elements: SineWavePlayerElements) => {
  const stop = () => {
    const state = getState();

    clearTimeout(state.stopTimeoutId ?? undefined);
    clearInterval(state.countdownIntervalId ?? undefined);
    clearTimeout(state.frequencyTimeoutId ?? undefined);
    stopToneNode(state);
    resetState();
    renderStopped(elements);
  };

  const applyInfiniteTimer = () => {
    updateState((state) => ({
      ...state,
      endTime: null,
      stopTimeoutId: null,
    }));
    setText({ element: elements.countdownText, text: INFINITE_TIME_LABEL });
  };

  const scheduleStop = (durationMilliseconds: number) =>
    window.setTimeout(stop, durationMilliseconds);

  const applyTimer = () => {
    clearScheduledStop();

    const timerMinutes = getTimerMinutes(elements);

    if (!isFiniteTimerValue(timerMinutes)) {
      applyInfiniteTimer();
      return;
    }

    const durationMilliseconds = minutesToMilliseconds(timerMinutes);
    const endTime = createEndTime({
      currentTime: Date.now(),
      durationMilliseconds,
    });

    updateState((state) => ({
      ...state,
      endTime,
      stopTimeoutId: scheduleStop(durationMilliseconds),
    }));
  };

  const updateCountdown = () => {
    const { endTime } = getState();
    const frequency = getFrequency(elements);

    if (!endTime) {
      setText({ element: elements.countdownText, text: INFINITE_TIME_LABEL });
      setTitle({ frequency, time: INFINITE_TIME_LABEL });
      return;
    }

    const remainingMilliseconds = getRemainingMilliseconds({
      endTime,
      currentTime: Date.now(),
    });

    if (remainingMilliseconds <= 0) {
      stop();
      alert("Finished");
      return;
    }

    const formattedTime = formatMillisecondsAsTimer(remainingMilliseconds);

    setText({ element: elements.countdownText, text: formattedTime });
    setTitle({ frequency, time: formattedTime });
  };

  const startCountdownLoop = () =>
    window.setInterval(updateCountdown, COUNTDOWN_INTERVAL_MILLISECONDS);

  const applyFrequency = () => {
    const state = getState();
    const frequency = getFrequency(elements);

    if (!state.oscillator || !state.context || Number.isNaN(frequency)) {
      return;
    }

    state.oscillator.frequency.setTargetAtTime(
      frequency,
      state.context.currentTime,
      FREQUENCY_RAMP_SECONDS,
    );
  };

  const start = () => {
    const context = createAudioContext();
    const frequency = getFrequency(elements);
    const toneNode = startToneNode({ context, frequency });
    const countdownIntervalId = startCountdownLoop();

    setState({
      ...getState(),
      context,
      ...toneNode,
      playing: true,
      countdownIntervalId,
    });

    renderPlaying({ elements, frequency });
    applyTimer();
  };

  const togglePlayback = () => {
    if (getState().playing) {
      stop();
      return;
    }

    start();
  };

  const debounceFrequencyChange = () => {
    clearFrequencyDebounce();

    updateState((state) => ({
      ...state,
      frequencyTimeoutId: window.setTimeout(
        applyFrequency,
        FREQUENCY_DEBOUNCE_MILLISECONDS,
      ),
    }));
  };

  const applyTimerInputChange = () => {
    clearScheduledStop();

    if (!getState().playing) {
      return;
    }

    applyTimer();
  };

  const applyFrequencyPreset = (button: HTMLButtonElement) => {
    elements.frequencyInput.value = getButtonDataValue({
      button,
      key: "frequency",
    });
    applyFrequency();
  };

  const applyTimerPreset = (button: HTMLButtonElement) => {
    const timerValue = getButtonDataValue({
      button,
      key: "timer",
    });

    elements.timerInput.value = timerValue === "infinite" ? "" : timerValue;

    if (getState().playing) {
      applyTimer();
    }
  };

  const bindEvents = () => {
    elements.toggleButton.addEventListener("click", togglePlayback);
    elements.frequencyInput.addEventListener("input", debounceFrequencyChange);
    elements.timerInput.addEventListener("input", applyTimerInputChange);
    elements.frequencyPresetButtons.map((button) =>
      button.addEventListener("click", () => applyFrequencyPreset(button)),
    );
    elements.timerPresetButtons.map((button) =>
      button.addEventListener("click", () => applyTimerPreset(button)),
    );
  };

  return { bindEvents };
};

export const initializeSineWavePlayer = () => {
  const sineWavePlayer = createSineWavePlayer(getElements());

  sineWavePlayer.bindEvents();
};
