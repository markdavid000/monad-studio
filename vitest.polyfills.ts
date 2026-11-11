if (!("AnimationEvent" in window)) {
  Object.defineProperty(window, "AnimationEvent", { value: class AnimationEvent extends Event {} });
}
