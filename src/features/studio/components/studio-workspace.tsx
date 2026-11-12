"use client";

import { studioCopy } from "../copy";
import { exampleContracts } from "../examples";
import { useContractDraft } from "../hooks/use-contract-draft";
import { ActionBar } from "./action-bar";
import { ExamplePicker } from "./example-picker";
import { SourceEditor } from "./source-editor";
import { StatusRail } from "./status-rail";

export function StudioWorkspace() {
  const draft = useContractDraft();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-[-0.02em]">{studioCopy.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{studioCopy.lead}</p>
      </div>
      <ExamplePicker
        examples={exampleContracts}
        activeName={draft.name}
        onPick={(example) => draft.load(example.name, example.source)}
      />
      <SourceEditor
        name={draft.name}
        source={draft.source}
        onChange={draft.setSource}
        onClear={draft.clear}
      />
      <ActionBar />
      <div className="lg:hidden">
        <StatusRail />
      </div>
    </div>
  );
}
