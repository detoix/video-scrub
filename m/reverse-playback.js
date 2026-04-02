export function createReversePlayback({
  stepSize = 1 / 30,
  onSeek,
  onProgress = () => {},
  onComplete = () => {}
}) {
  let active = false;

  function requestSeek(fromTime) {
    const targetTime = Math.max(0, Number((fromTime - stepSize).toFixed(4)));
    onSeek(targetTime);
  }

  function start(fromTime) {
    active = true;
    requestSeek(fromTime);
  }

  function handleSeeked(currentTime) {
    if (!active) {
      return;
    }

    onProgress(currentTime);

    if (currentTime <= 0) {
      active = false;
      onComplete();
      return;
    }

    requestSeek(currentTime);
  }

  function cancel() {
    active = false;
  }

  return {
    start,
    handleSeeked,
    cancel
  };
}
