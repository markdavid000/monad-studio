if (!("AnimationEvent" in window)) {
  Object.defineProperty(window, "AnimationEvent", {
    value: class AnimationEvent extends Event {},
    configurable: true,
    writable: true,
  });
}

if (!("IntersectionObserver" in window)) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    value: IntersectionObserverStub,
    configurable: true,
    writable: true,
  });
}
