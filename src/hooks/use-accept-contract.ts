import { journeyCopy } from "@/lib/copy";
import { toast } from "@/lib/toast";
import { useContractDraft } from "./use-contract-draft";

const UNDO_MS = 10_000;

export function useAcceptContract() {
  const draft = useContractDraft();

  return (title: string, name: string, source: string) => {
    const previous = { name: draft.name, source: draft.source };
    draft.load(name, source);
    toast.success(title, {
      id: "accept-contract",
      description: name,
      duration: UNDO_MS,
      action: {
        label: journeyCopy.undo,
        onClick: () => {
          draft.load(previous.name, previous.source);
          toast.info(journeyCopy.undone, { id: "accept-contract" });
        },
      },
    });
  };
}
