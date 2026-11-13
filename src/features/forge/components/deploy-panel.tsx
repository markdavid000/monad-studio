import { cn } from "@/lib/utils";
import { forgeCopy } from "../copy";
import type { useDeployForm } from "../hooks/use-deploy-form";
import { inputKey } from "../hooks/use-deploy-form";

interface DeployPanelProps {
  form: ReturnType<typeof useDeployForm>;
}

const copy = forgeCopy.deploy;
const fieldClass =
  "w-full rounded-md border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DeployPanel({ form }: DeployPanelProps) {
  if (!form.contract) return null;

  return (
    <section
      aria-labelledby="deploy-title"
      className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-4"
    >
      <div className="flex flex-col gap-1">
        <h3 id="deploy-title" className="text-sm font-medium">
          {copy.heading}
        </h3>
        <p className="text-xs text-muted-foreground">{copy.lead}</p>
      </div>
      {form.contracts.length > 1 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-xs text-muted-foreground">{copy.contractLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {form.contracts.map((contract) => (
              <label
                key={contract.name}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs",
                  contract.name === form.contract?.name && "border-eyebrow bg-eyebrow/10"
                )}
              >
                <input
                  type="radio"
                  name="deploy-contract"
                  value={contract.name}
                  checked={contract.name === form.contract?.name}
                  onChange={() => form.chooseContract(contract.name)}
                  className="accent-[var(--eyebrow)]"
                />
                {contract.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">{copy.argsLabel}</p>
        {form.inputs.length === 0 ? <p className="text-sm">{copy.noArgs}</p> : null}
        {form.inputs.map((input, index) => {
          const key = inputKey(input, index);
          const id = `deploy-arg-${key}`;
          const error = form.errors[key];
          return (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={id} className="flex items-baseline gap-2 text-sm">
                <span className="font-mono">{input.name || key}</span>
                <span className="font-mono text-xs text-muted-foreground">{input.type}</span>
              </label>
              <input
                id={id}
                value={form.values[key] ?? ""}
                onChange={(event) => form.setValue(key, event.target.value)}
                placeholder={input.type.endsWith("]") ? copy.arrayHint : input.type}
                aria-invalid={error !== undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                spellCheck={false}
                className={cn(fieldClass, error && "border-severity-critical")}
              />
              {error ? (
                <p id={`${id}-error`} className="text-xs text-severity-critical">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
        {form.isPayable ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="deploy-value" className="text-sm">
              {copy.valueLabel}
            </label>
            <input
              id="deploy-value"
              value={form.valueText}
              onChange={(event) => form.setValueText(event.target.value)}
              inputMode="decimal"
              placeholder="0"
              aria-invalid={form.valueError !== undefined}
              className={cn(fieldClass, form.valueError && "border-severity-critical")}
            />
            <p
              className={cn(
                "text-xs",
                form.valueError ? "text-severity-critical" : "text-muted-foreground"
              )}
            >
              {form.valueError ?? copy.valueHint}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
