export const getRequiredElementById = <ElementType extends Element>(
  id: string,
) => {
  const element = document.querySelector<ElementType>(`#${id}`);

  if (!element) {
    throw new Error(`Element not found: ${id}`);
  }

  return element;
};

export const queryRequired = <ElementType extends Element>(
  selector: string,
) => {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  return element as ElementType;
};

export const getNumberInputValue = (input: HTMLInputElement) =>
  Number.parseFloat(input.value);

export const getButtonDataValue = ({
  button,
  key,
}: {
  readonly button: HTMLButtonElement;
  readonly key: string;
}) =>
  button.dataset[key] ?? "";

export const queryAll = <ElementType extends Element>(
  selector: string,
) =>
  [...document.querySelectorAll<ElementType>(selector)];
