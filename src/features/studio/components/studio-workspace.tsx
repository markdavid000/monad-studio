"use client";

import { studioCopy } from "../copy";
import { useContractDraft } from "@/hooks/use-contract-draft";
import { ActionBar } from "./action-bar";
import { SourceEditor } from "./source-editor";
import { StatusRail } from "./status-rail";
import { ExamplePicker } from "@/components/ui/example-picker";
import { IntroDialog } from "@/components/ui/intro-dialog";
import { exampleContracts } from "@/config/examples";
import { PageTitle } from "@/components/ui/page-title";

export function StudioWorkspace() {
  const draft = useContractDraft();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <IntroDialog screen="workspace" content={studioCopy.intro} />
      <PageTitle title={studioCopy.title} aboutLabel={studioCopy.about}>
        <p>{studioCopy.lead}</p>
      </PageTitle>
      <ExamplePicker
        label={studioCopy.examplesLabel}
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
