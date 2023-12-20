type Callback = (...args: any[]) => any;

export function safeCallback<F extends Callback>(
  callback?: F | void,
  ...args: Parameters<F>
) {
  try {
    return callback?.(...args);
  } catch (e) {
    console.error(e);
  }
}

const queueMicrotaskFallback = (callback: () => void) => {
  Promise.resolve().then(callback);
};

export const asap = queueMicrotask ?? queueMicrotaskFallback;
