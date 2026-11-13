export const forgeCopy = {
  title: "MonadForge",
  about: "About MonadForge",
  lead: "Describe a contract and MonadForge writes it, or compile the contract in your workspace with the Solidity compiler and read its bytecode and ABI.",
  settings:
    "Compiled on our server with solc 0.8.38, optimizer on at 200 runs, EVM version prague, with no changes to your source.",
  untitled: "Untitled.sol",
  generate: {
    heading: "Write a contract",
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
    useNote: "Replaces the contract in your workspace.",
    usedTitle: "Loaded into the workspace",
    copy: "Copy",
    copied: "Copied",
  },
  compile: {
    heading: "Compile",
    codeLabel: "Workspace contract",
    compiledCodeLabel: "Compiled contract",
    resultsTitle: "Compile results",
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

export function lineLabel(line: number) {
  return `Line ${line}`;
}

export function sizeLabel(kilobytes: string) {
  return `${kilobytes} of runtime bytecode`;
}

export function compilerLabel(version: string) {
  return `solc ${version}`;
}
