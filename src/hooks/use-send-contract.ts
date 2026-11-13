import { useRouter } from "next/navigation";
import { useContractDraft } from "./use-contract-draft";

export type JourneyTool = "monguard" | "gaslens" | "forge";

export function useSendContract() {
  const draft = useContractDraft();
  const router = useRouter();

  return (tool: JourneyTool, source: string, name = draft.name) => {
    if (source !== draft.source || name !== draft.name) draft.load(name, source);
    router.push(`/studio/${tool}?run=new`);
  };
}
