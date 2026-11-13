export const forgeCopy = {
  title: "MonadForge",
  about: "About MonadForge",
  lead: "Describe a contract and MonadForge writes it, or compile the contract in your workspace with the Solidity compiler and read its bytecode and ABI.",
  settings:
    "Compiled on our server with solc 0.8.38, optimizer on at 200 runs, EVM version prague, with no changes to your source.",
  untitled: "Untitled.sol",
  generate: {
    heading: "Write a contract",
    lead: "Describe what it should do. The result opens beside its code, and you choose whether it goes into the workspace.",
    lastLabel: "Last written",
    label: "Describe the contract",
    placeholder:
      "A token called Monad Gold with symbol MGLD, a fixed supply of one million minted to the deployer, and a burn function.",
    examplesLabel: "Try one of these",
    examples: [
      "An ERC20 token with a capped supply where only the owner can mint",
      "An escrow where a buyer deposits MON and releases it to the seller after delivery",
      "A voting contract where the owner adds proposals and each address votes once",
      "A piggy bank that accepts deposits and only lets the owner withdraw after a set date",
    ],
    run: "Write contract",
    running: "Writing",
    note: "AI written code. Read it and scan it with MonGuard before you deploy anything.",
    pendingTitle: "Writing the contract",
    pendingBody: "This usually takes 10 to 40 seconds.",
    doneTitle: "Contract written",
    failedTitle: "Could not write the contract",
    compiles: "Compiles",
    doesNotCompile: "Does not compile yet",
    notesLabel: "Before you deploy",
    codeLabel: "Written contract",
    resultsTitle: "Written contract",
    showResult: "Show contract",
    use: "Use in workspace",
    usedTitle: "Loaded into the workspace",
    statusWritten: "Written contract",
    statusInWorkspace: "Written contract, in your workspace",
    compileNow: "Compile",
    copy: "Copy",
    copied: "Copied",
  },
  compile: {
    heading: "Compile",
    lead: "Compiles the contract in your workspace exactly as written. Edit it in the workspace, compile it here.",
    lengthLabel: "Length",
    pragmaLabel: "Solidity",
    noPragma: "Not declared",
    declaresLabel: "Declares",
    noDeclarations: "No contract found yet",
    lastLabel: "Last compile",
    changedSince: "The workspace changed since then.",
    codeLabel: "Workspace contract",
    compiledCodeLabel: "Compiled contract",
    resultsTitle: "Compile results",
    statusCompiled: "Compiled contract",
    statusFailed: "Contract with compiler errors",
    fixes: {
      suggest: "Suggest fixes",
      suggesting: "Suggesting fixes",
      pendingTitle: "Suggesting fixes for the compiler errors",
      pendingBody: "This usually takes 10 to 40 seconds.",
      readyTitle: "Fixes suggested",
      failedTitle: "Could not suggest fixes",
      compiles: "Compiles after these fixes",
      noChange:
        "The AI could not find a change that fixes these errors. Edit the contract in the workspace instead.",
      changesLabel: "Suggested changes",
      remainingLabel: "Errors left after these fixes",
      back: "Back to compile result",
      show: "Show suggested fixes",
      accept: "Accept and compile",
      acceptedTitle: "Fixes accepted into the workspace",
      status: "Suggested fixes, not accepted yet",
      note: "Check every change on the left before you accept.",
      diffLabel: "Changes that fix the compiler errors",
    },
    showResults: "Show results",
    editInWorkspace: "Edit in workspace",
    emptyTitle: "No contract in the workspace yet",
    emptyBody: "Write one above, or paste a contract in the workspace, then compile it here.",
    openWorkspace: "Open the workspace",
    tooLarge:
      "This contract is over the 60 KB limit. Trim it in the workspace before compiling it.",
    run: "Compile",
    rerun: "Compile again",
    running: "Compiling",
    note: "Imports are not resolved, so the contract must fit in one file.",
    failedTitle: "Compile failed",
    stale: "The contract changed since this compile. Compile again to update it.",
    errorsLabel: "Errors",
    warningsLabel: "Warnings",
    contractsLabel: "Contracts",
    nothingToDeploy:
      "It compiled, but every contract in the file is an interface, a library with no code or abstract, so there is nothing to deploy.",
    constructor: "Constructor",
    noConstructor: "No constructor arguments",
    functions: "Functions",
    noFunctions: "No external or public functions",
    copyAbi: "Copy ABI",
    copyBytecode: "Copy bytecode",
    copied: "Copied",
  },
  deploy: {
    heading: "Deploy to Monad testnet",
    lead: "Deploys from your connected wallet. You pay the gas in testnet MON.",
    contractLabel: "Contract to deploy",
    argsLabel: "Constructor arguments",
    noArgs: "This contract takes no constructor arguments.",
    valueLabel: "MON to send",
    valueHint: "The constructor is payable. Leave empty to send nothing.",
    arrayHint: 'A JSON list, for example ["0x…", "0x…"]',
    run: "Deploy",
    running: "Deploying",
    again: "Deploy again",
    confirmTitle: "Confirm the deploy in your wallet",
    pendingTitle: "Deploying",
    pendingBody: "Waiting for Monad testnet to include the transaction.",
    doneTitle: "Contract deployed",
    cancelledTitle: "Deploy cancelled",
    cancelledBody: "Nothing was sent.",
    failedTitle: "Deploy failed",
    reverted: "The deploy transaction reverted, so no contract was created.",
    noWallet: "Connect your wallet to deploy.",
    deployedLabel: "Deployed",
    addressLabel: "Address",
    txLabel: "Transaction",
    viewOnExplorer: "View on MonadVision",
    copyAddress: "Copy address",
    copied: "Copied",
    status: "Deployed contract",
  },
  verify: {
    label: "Source on Sourcify",
    submitting: "Submitting to Sourcify",
    pending: "Verifying on Sourcify",
    pendingSlow: "Sourcify is still working. Check again in a minute.",
    exact: "Verified, exact match",
    partial: "Verified, partial match",
    partialNote:
      "The code matches but the metadata differs, usually a different file name or comment.",
    failed: "Not verified",
    unverified: "Not verified yet",
    retry: "Verify again",
    check: "Check again",
    submitFailed: "Could not reach Sourcify. Try again in a moment.",
  },
  tabs: {
    label: "MonadForge mode",
    build: "Write, compile, deploy",
    verify: "Verify a deployed contract",
  },
  verifySource: {
    heading: "Contract on chain",
    lead: "Publish the source of a contract already deployed on Monad testnet, by you or anyone else, on Sourcify.",
    sourceHeading: "Source",
    sourceLead:
      "The contract in your workspace is the source that gets checked. Paste it there first.",
    addressLabel: "Contract address",
    contractLabel: "Contract name",
    noContracts: "No contract found in the workspace source",
    versionLabel: "Compiler version",
    versionHint:
      "The version it was compiled with, like 0.8.28. A full build like 0.8.28+commit.7893614a works too.",
    fileLabel: "File name",
    fileHint: "Use the file name from your project to get an exact match.",
    optimizerLabel: "Optimizer was on",
    runsLabel: "Optimizer runs",
    evmLabel: "EVM version",
    evmDefault: "Default",
    run: "Verify on Sourcify",
    running: "Submitting",
    statusLabel: "Status",
    enterAddress: "Enter the address to see its status.",
    submittedTitle: "Submitted to Sourcify",
    failedTitle: "Could not submit to Sourcify",
  },
  intro: {
    title: "MonadForge: write and compile",
    body: "MonadForge writes contracts from a description and compiles the contract in your workspace.",
    points: [
      {
        title: "Describe it",
        body: "Write what the contract should do. MonadForge writes it and checks that it compiles.",
      },
      {
        title: "Edit it",
        body: "Load the result into the workspace and change what you need. Run MonGuard and GasLens on it.",
      },
      {
        title: "Compile it",
        body: "Compile with solc 0.8.38 and read the bytecode, ABI and any compiler errors on their lines.",
      },
    ],
    done: "Got it",
  },
} as const;

export function compiledTitle(count: number) {
  return count === 1 ? "Compiled 1 contract" : `Compiled ${count} contracts`;
}

export function errorsTitle(count: number) {
  return count === 1 ? "1 compiler error" : `${count} compiler errors`;
}

export function linesAndSize(lines: number, size: string) {
  return `${lines === 1 ? "1 line" : `${lines} lines`} · ${size}`;
}

export function lineLabel(line: number) {
  return `Line ${line}`;
}

export function sizeLabel(kilobytes: string) {
  return `${kilobytes} of runtime bytecode`;
}

export function compilerLabel(version: string) {
  return `solc ${version}`;
}

export function writtenSummary(compiles: boolean, errorCount: number) {
  return compiles ? "Written, compiles" : `Written, ${errorsTitle(errorCount)}`;
}

export function compileSummary(compiled: boolean, count: number) {
  return compiled ? compiledTitle(count) : errorsTitle(count);
}

export function deployLabel(name: string) {
  return `Deploy ${name}`;
}

export function deployedSummary(address: string) {
  return `Deployed at ${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function verifySummary(address: string) {
  return `Verification of ${address.slice(0, 6)}…${address.slice(-4)}`;
}
