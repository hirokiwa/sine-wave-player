import { DEFAULT_TITLE } from "./constants.ts";

export const setText = ({
  element,
  text,
}: {
  readonly element: HTMLSpanElement;
  readonly text: string;
}) => {
  element.textContent = text;
};

export const setTitle = ({
  frequency,
  time,
}: {
  readonly frequency: number;
  readonly time: string;
}) => {
  document.title = `${frequency}Hz | ${time}`;
};

export const resetTitle = () => {
  document.title = DEFAULT_TITLE;
};

export const setToggleButton = ({
  button,
  playIcon,
  stopIcon,
  label,
  playing,
}: {
  readonly button: HTMLButtonElement;
  readonly playIcon: SVGSVGElement;
  readonly stopIcon: SVGSVGElement;
  readonly label: HTMLSpanElement;
  readonly playing: boolean;
}) => {
  playIcon.classList.toggle("sine-wave-player__toggle-icon--hidden", playing);
  stopIcon.classList.toggle("sine-wave-player__toggle-icon--hidden", !playing);
  label.textContent = playing ? "Stop" : "Play";
  button.classList.toggle("sine-wave-player__toggle-button--playing", playing);
};
