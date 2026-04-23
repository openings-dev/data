/**
 * @param {number} milliseconds
 */
export function sleep(milliseconds) {
  if (milliseconds <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

