export function createScrollSampler({
  readScrollY,
  onScrollPosition,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (frameId) => cancelAnimationFrame(frameId),
  stableFrames = 4
}) {
  let frameId = null;
  let lastScrollY = null;
  let unchangedFrames = 0;

  function stop() {
    if (frameId !== null) {
      cancelFrame(frameId);
      frameId = null;
    }
  }

  function tick() {
    frameId = null;

    const scrollY = readScrollY();
    if (scrollY !== lastScrollY) {
      lastScrollY = scrollY;
      unchangedFrames = 0;
      onScrollPosition(scrollY);
    } else {
      unchangedFrames += 1;
    }

    if (unchangedFrames < stableFrames) {
      frameId = requestFrame(tick);
    }
  }

  function wake() {
    unchangedFrames = 0;
    if (frameId === null) {
      frameId = requestFrame(tick);
    }
  }

  return {
    wake,
    stop
  };
}
