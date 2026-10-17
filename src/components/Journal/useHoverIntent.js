import {useCallback, useEffect, useRef} from 'react';

// Reads a millisecond token (e.g. `650ms`) from the nearest `.journal-scope`,
// so timing stays tunable in tokens.css instead of being hard-coded in JS.
export function readMsToken(element, name, fallback) {
  if (!element || typeof window === 'undefined') {
    return fallback;
  }

  const value = parseFloat(window.getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

// Fires `onIntent` only after a mouse/pen pointer has rested on the element for
// `--journal-immerse-dwell`; passing quickly over it does nothing. Touch input is
// ignored here and handled as a tap by the caller.
export default function useHoverIntent({onApproachChange, onIntent}) {
  const timerRef = useRef(null);
  // After an immersion closes, the pointer is often still over the card. Stay
  // disarmed until it leaves once, so the card doesn't immediately reopen.
  const armedRef = useRef(true);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const onPointerEnter = useCallback(
    (event) => {
      if (event.pointerType === 'touch' || !armedRef.current) {
        return;
      }

      const dwell = readMsToken(event.currentTarget, '--journal-immerse-dwell', 650);
      onApproachChange(true);
      cancel();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        armedRef.current = false;
        onIntent();
      }, dwell);
    },
    [cancel, onApproachChange, onIntent],
  );

  const onPointerLeave = useCallback(
    (event) => {
      if (event.pointerType === 'touch') {
        return;
      }

      armedRef.current = true;
      cancel();
      onApproachChange(false);
    },
    [cancel, onApproachChange],
  );

  // Call when the immersion closes. The card is uncovered under a pointer that
  // may still rest on it; decide on the next pointer move whether to re-arm.
  const rearmAfterClose = useCallback((element) => {
    cancel();
    armedRef.current = false;
    document.addEventListener(
      'pointermove',
      (event) => {
        armedRef.current = !element || !element.contains(event.target);
      },
      {once: true},
    );
  }, [cancel]);

  return {onPointerEnter, onPointerLeave, cancel, rearmAfterClose};
}
