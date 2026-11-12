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

if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
    configurable: true,
    writable: true,
  });
}

if (typeof Element.prototype.scrollTo !== "function") {
  Element.prototype.scrollTo = function scrollTo() {};
}
import "fake-indexeddb/auto";
