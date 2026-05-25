export const isFiniteTimerValue = (value: number) =>
  !Number.isNaN(value) && value > 0;

export const minutesToMilliseconds = (minutes: number) =>
  minutes * 60 * 1000;

export const createEndTime = ({
  currentTime,
  durationMilliseconds,
}: {
  readonly currentTime: number;
  readonly durationMilliseconds: number;
}) =>
  currentTime + durationMilliseconds;

export const getRemainingMilliseconds = ({
  endTime,
  currentTime,
}: {
  readonly endTime: number;
  readonly currentTime: number;
}) =>
  endTime - currentTime;

export const padTwoDigits = (number: number) =>
  String(number).padStart(2, "0");

export const formatMillisecondsAsTimer = (milliseconds: number) => {
  const seconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${padTwoDigits(minutes)}:${padTwoDigits(remainingSeconds)}`;
};
