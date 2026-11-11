import { flowCopy } from "../copy";
import { step } from "../lib/step";
import { FlowDiagram } from "./flow-diagram";
import { Scene } from "./scene";

export function FlowSection() {
  return (
    <Scene className="border-t py-20 sm:py-28">
      <section
        aria-labelledby="flow-title"
        className="grid items-center gap-12 lg:grid-cols-[1.6fr_1fr]"
      >
        <div className="relative" data-step style={step(1)}>
          <FlowDiagram />
        </div>
        <div className="flex flex-col gap-4">
          <p
            data-step
            style={step(0)}
            className="font-mono text-xs tracking-wide text-eyebrow uppercase"
          >
            {flowCopy.eyebrow}
          </p>
          <h2
            id="flow-title"
            data-step
            style={step(1)}
            className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl"
          >
            {flowCopy.title}
          </h2>
          <p data-step style={step(2)} className="text-lg text-muted-foreground">
            {flowCopy.body}
          </p>
        </div>
      </section>
    </Scene>
  );
}
