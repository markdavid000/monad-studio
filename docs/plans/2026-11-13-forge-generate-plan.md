# Plan: MonadForge, write and compile

Step 5 of the [rebuild plan](2026-11-11-rebuild-plan.md), under the accepted ADRs for AI analysis on the server and contract verification. Deploy and verification are step 6.

## Files

- `features/forge/`: `lib/schema.ts` (inputs, Groq reply, compile result), `lib/abi.ts`, `server/generate.ts`, `server/compile.ts`, hooks `useGenerate`, `useCompile`, `useForge`, components `ForgeTool`, `GeneratePanel`, `CompilePanel`, `GeneratedResults` and `CompileResults` (both in the shared `ResultsSheet`, code beside results), `CompileOutput`, `DiagnosticList`, `SourceCode`, `CopyButton`, `copy.ts`, `index.ts`, `server.ts`.
- `app/api/forge/generate` (AI limit, `maxDuration` 60) and `app/api/forge/compile` (own limit of 60 per 10 minutes, `maxDuration` 30), both behind the session proxy.
- `app/studio/forge/page.tsx`; sidebar and workspace action link to it.
- `solc` 0.8.38 pinned, listed in `serverExternalPackages` so its Emscripten build is loaded by Node, not bundled.

## Compile settings

Standard JSON input with the source exactly as written, one file named after the draft, optimizer on with 200 runs, `evmVersion: "prague"` (Monad's Hardhat guide), default metadata (IPFS hash kept). The route returns the full compiler version and the exact input string so step 6 can deploy and verify byte for byte. Compile errors are a 200 with `status: "failed"` and each error's line, worked out from solc's byte offset.

## Generate

One Groq call with a strict JSON schema (`contractName`, `summary`, `source`, `notes`), one file and no imports, then a compile of the result on the server. If it does not compile, one repair call sends the compiler errors and the numbered source back to the model and the result is compiled again. If it still fails, or the repair call cannot run, the contract is shown marked with its error lines. The prompt states that MON is the native currency (`msg.value`), not an ERC20, after the first live runs wrote escrows around a token interface. The written contract replaces the workspace draft only when the user presses Use in workspace. After a repair the notes of the first draft are kept, so the user never sees the model's notes about its own fix.

## Not in this step

Deploy, verification, and saving forge runs to Activity (deploys are recorded in step 6). Multi file sources and imports.

## Tests

- Compile route against the real compiler: compiled output and settings, parser error line, line after multi byte characters, interfaces only, warnings, file name and size checks, its own rate limit.
- Generate route with Groq mocked: cleaned reply and compile, repair pass (repaired, still failing, repair call failing, not run when it compiles), unsafe names, prompt length, 429, 502.
- `ForgeTool`: intro, prompt gating and examples, pending state, explicit load into the workspace, failed compile marking, error toast with retry, empty workspace, compile success, untitled file name, error lines and stale result, nothing to deploy, size limit.
