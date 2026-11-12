import Link from "next/link";
import { tools } from "@/config/tools";
import { layoutCopy } from "./copy";

interface ToolListProps {
  headingLevel: "h2" | "h3";
}

export function ToolList({ headingLevel: Heading }: ToolListProps) {
  return (
    <ul className="divide-y border-y">
      {tools.map((tool) => (
        <li key={tool.slug} className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
          <div>
            <Heading className="font-medium">
              {tool.href ? (
                <Link href={tool.href} className="underline-offset-4 hover:underline">
                  {tool.name}
                </Link>
              ) : (
                tool.name
              )}
            </Heading>
            <p className="text-sm text-muted-foreground">{tool.summary}</p>
            {tool.href ? null : (
              <p className="text-xs text-muted-foreground">{layoutCopy.comingNext}</p>
            )}
          </div>
          <p className="text-sm">{tool.output}</p>
        </li>
      ))}
    </ul>
  );
}
