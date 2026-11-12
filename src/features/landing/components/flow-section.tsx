import { flowCopy } from "../copy";
import { step } from "../lib/step";
import { ClientPreview } from "./client-preview";
import { FlowDiagram } from "./flow-diagram";
import { Scene } from "./scene";

export function FlowSection() {
  return (
    <Scene className="py-16 sm:py-24">
      <section aria-labelledby="flow-title" className="relative">
        <div data-step style={step(0)} className="lg:-mx-12 xl:-mx-30">
          <div className="aspect-[16/5]">
            <ClientPreview>
              <FlowDiagram />
            </ClientPreview>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:w-[36%]">
          <h2
            id="flow-title"
            data-step
            style={step(1)}
            className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:absolute lg:bottom-[calc(50%+2.5rem)]"
          >
            {flowCopy.title}
          </h2>
          <p
            data-step
            style={step(2)}
            className="text-lg text-muted-foreground lg:absolute lg:top-[calc(50%+2.5rem)]"
          >
            {flowCopy.body}
          </p>
        </div>
      </section>
    </Scene>
  );
}
