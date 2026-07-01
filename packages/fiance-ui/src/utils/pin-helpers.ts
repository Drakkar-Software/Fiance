/** Result returned by {@link handlePinDigit}. */
export interface PinDigitResult {
  /** The new pin string after the digit was appended. */
  nextPin: string;
  /** True when the pin has reached pinLength and is ready for verification. */
  isComplete: boolean;
}

/**
 * Append a digit to the current pin.
 * If the pin is already at capacity, returns the input unchanged with isComplete=false.
 */
export function handlePinDigit(
  currentPin: string,
  digit: string,
  pinLength: number
): PinDigitResult {
  if (currentPin.length >= pinLength) {
    return { nextPin: currentPin, isComplete: false };
  }
  const nextPin = currentPin + digit;
  return { nextPin, isComplete: nextPin.length === pinLength };
}

/**
 * Remove the last character from the pin.
 */
export function handlePinDelete(currentPin: string): string {
  return currentPin.slice(0, -1);
}
