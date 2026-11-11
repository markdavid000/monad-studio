#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const COPY_FILE = /^src\/.*\/copy\.ts$/;
const FILLER = [
  "seamless",
  "seamlessly",
  "robust",
  "leverage",
  "unleash",
  "supercharge",
  "supercharged",
  "elite",
  "cutting-edge",
  "state-of-the-art",
  "revolutionary",
  "revolutionize",
  "effortless",
  "effortlessly",
  "powerful",
  "next-generation",
  "next-gen",
  "game-changing",
  "game changer",
  "blazing",
  "lightning-fast",
  "world-class",
  "in seconds",
  "all-in-one",
  "one-stop",
  "empower",
  "unlock",
];
const FILLER_PATTERN = new RegExp(`(^|[^\\w-])(${FILLER.join("|")})(?![\\w-])`, "i");
const DASHES = /[–—]/;
const EMOJI = /\p{Extended_Pictographic}/u;
const EXCLAMATION = /!/;

function filesToCheck() {
  const args = process.argv.slice(2);
  const files =
    args.length > 0
      ? args
      : execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
          encoding: "utf8",
        }).split("\n");
  return files.filter((file) => COPY_FILE.test(file));
}

function stringLiterals(source, file) {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const literals = [];
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      literals.push({ text: node.text, start: node.getStart() });
    } else if (ts.isTemplateExpression(node)) {
      literals.push({ text: node.head.text, start: node.getStart() });
      for (const span of node.templateSpans) {
        literals.push({ text: span.literal.text, start: span.literal.getStart() });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return literals;
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

const problems = [];
for (const file of filesToCheck()) {
  const source = readFileSync(file, "utf8");
  for (const literal of stringLiterals(source, file)) {
    const where = `${file}:${lineOf(source, literal.start)}`;
    const filler = literal.text.match(FILLER_PATTERN);
    if (filler) problems.push(`${where} "${literal.text}" uses filler word "${filler[2]}"`);
    if (DASHES.test(literal.text))
      problems.push(`${where} "${literal.text}" uses an em or en dash`);
    if (EMOJI.test(literal.text)) problems.push(`${where} "${literal.text}" uses an emoji`);
    if (EXCLAMATION.test(literal.text))
      problems.push(`${where} "${literal.text}" uses an exclamation mark`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} wording problem(s). See docs/engineering-standards.md#copy.`);
  process.exit(1);
}
