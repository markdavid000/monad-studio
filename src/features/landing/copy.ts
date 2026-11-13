import type {
  ForgeMockData,
  GaslensMockData,
  MonguardMockData,
  ParadebugMockData,
  SentinelMockData,
} from "./types";

export const landingCopy = {
  eyebrow: "Solidity tooling for Monad",
  titleLead: "Write the contract.",
  titleSuffix: "it on Monad.",
  titleVerbs: ["Review", "Optimise", "Deploy", "Watch", "Debug"],
  titleAccessible: "Write the contract. Review, optimise, deploy, watch and debug it on Monad.",
  lead: "Review a contract for security holes and wasted gas, generate one from a sentence, deploy it from your own wallet, then watch how it behaves on testnet.",
  cta: "Open the studio",
  secondaryCta: "Try the demo, no wallet needed",
  showcaseLabel: "Tool previews",
  pause: "Pause the previews",
  play: "Play the previews",
  exampleData: "Example output",
  openTool: "Open",
} as const;

export const showcaseTabs = [
  {
    id: "review",
    number: "01",
    label: "Review",
    caption: "every contract before it ships",
  },
  {
    id: "optimise",
    number: "02",
    label: "Optimise",
    caption: "gas line by line",
  },
  { id: "deploy", number: "03", label: "Deploy", caption: "from a description" },
  { id: "watch", number: "04", label: "Watch", caption: "calls as they land" },
  {
    id: "contention",
    number: "05",
    label: "Contention",
    caption: "inside each block",
  },
] as const;

export const flowCopy = {
  title: "Monad is fast. So are its bugs.",
  body: "Blocks land in well under a second and transactions run in parallel. A broken contract can be drained before anyone opens the explorer. Check it before it ships, and keep watching after.",
  sources: "Your contracts",
  hub: "MonadStudio",
  target: "Monad testnet",
} as const;

export const reviewFlowCopy = {
  eyebrow: "Inside a review",
  title: "What happens when you press Scan.",
  lead: "Five steps between pasting a contract and reading what is wrong with it.",
  stageLabel: "How a MonGuard review is built",
  contract: "VulnerableBank",
  functions: [
    "deposit()",
    "withdraw()",
    "emergencyDrain()",
    "adminTransfer()",
    "balances",
    "owner",
  ],
  checklist: ["Reentrancy", "Access control", "tx.origin", "Unchecked maths", "Fee bounds"],
  schemaTitle: "Reply shape",
  schemaFields: ["severity", "title", "lines", "explanation", "fix"],
  schemaValid: "Matches. Anything else is rejected.",
  scoreTitle: "Score",
  scoreRows: [
    { label: "Start", value: "100" },
    { label: "1 critical", value: "25" },
    { label: "2 high", value: "30" },
    { label: "1 low", value: "3" },
  ],
  scoreTotal: "42",
  nextTitle: "Send it on",
  nextTools: [
    { name: "GasLens", body: "Find the gas it wastes" },
    { name: "MonadForge", body: "Fix, compile and deploy it" },
  ],
  steps: [
    {
      title: "Your contract",
      body: "Up to 60 KB of Solidity, sent once with your request and never stored.",
    },
    {
      title: "A checklist, not a guess",
      body: "The model traces every external call, unchecked block, access check and fee path.",
    },
    {
      title: "A fixed answer shape",
      body: "The reply must match a strict schema. A reply that does not is rejected, never patched up.",
    },
    {
      title: "Scored by rules",
      body: "Critical 25, high 15, medium 8, low 3 and info 1, taken from 100. Same findings, same score.",
    },
    {
      title: "Straight to the next tool",
      body: "Send the same contract to GasLens or MonadForge without copying it around.",
    },
  ],
} as const;

export const ctaCopy = {
  title: "Find the bug before it finds your users.",
  lead: "Pick a contract and run the scan. Then run it on yours.",
  primary: "Scan your own contract",
  facts: "Connect any wallet. No account. Nothing to install. Monad testnet.",
  tryLabel: "Try it",
  samplesLabel: "Example contracts",
  run: "Run the example scan",
  scanning: "Scanning",
  rerun: "Run it again",
  findingsLabel: "findings",
  outOf: " / 100",
  exampleNote: "Example output. The studio runs the same review on your code.",
  openReport: "Scan your own contract",
  samples: [
    {
      id: "bank",
      file: "VulnerableBank.sol",
      code: [
        "function withdraw(uint256 amount) public {",
        "  require(balances[msg.sender] >= amount);",
        '  (bool ok, ) = msg.sender.call{value: amount}("");',
        "  require(ok);",
        "  balances[msg.sender] -= amount;",
        "}",
      ],
      score: 42,
      findings: [
        { severity: "Critical", title: "Reentrancy in withdraw()" },
        { severity: "High", title: "emergencyDrain() has no access control" },
        { severity: "High", title: "tx.origin used for authorisation" },
        { severity: "Low", title: "No event on deposit()" },
      ],
    },
    {
      id: "staking",
      file: "StakingPool.sol",
      code: [
        "function withdraw(uint256 amount) external {",
        "  uint256 fee = amount * feeBps / 10_000;",
        "  unchecked {",
        "    payable(msg.sender).transfer(amount - fee);",
        "  }",
        "}",
      ],
      score: 64,
      findings: [
        { severity: "Critical", title: "Fee can exceed the amount withdrawn" },
        { severity: "Medium", title: "Owner can change the fee with no delay" },
        { severity: "Low", title: "setTreasury() accepts the zero address" },
      ],
    },
    {
      id: "airdrop",
      file: "Airdrop.sol",
      code: [
        "function claim(uint256 amount) external {",
        "  require(claimed[msg.sender] == false);",
        "  require(amount <= maxClaim);",
        "  claimed[msg.sender] = true;",
        "  token.transfer(msg.sender, amount);",
        "}",
      ],
      score: 89,
      findings: [
        { severity: "Medium", title: "Return value of transfer() is ignored" },
        { severity: "Low", title: "maxClaim could be a constant" },
      ],
    },
  ],
} as const;

export const checksCopy = {
  label: "What the reviews look for",
  items: [
    "Reentrancy",
    "Missing access control",
    "tx.origin authorisation",
    "Unchecked maths",
    "Unbounded fees",
    "Stale owner checks",
    "Storage reads in loops",
    "memory where calldata will do",
    "Revert strings",
    "Unchecked loop counters",
    "Values that could be immutable",
    "Missing events",
    "Front-running windows",
    "Centralisation risk",
  ],
} as const;

export type ShowcaseTabId = (typeof showcaseTabs)[number]["id"];

export const sectionCopy = {
  monguard: {
    eyebrow: "01 Security review",
    title: "Find the bug before someone else does.",
    lead: "MonGuard reads your contract the way an attacker would: reentrancy, missing access control, unchecked maths, broken fee logic.",
    points: [
      {
        title: "Findings you can act on",
        body: "Each issue names the function and lines, explains the attack and shows the fix.",
      },
      {
        title: "A score that matches the list",
        body: "Worked out from the findings by fixed rules, so the same issues always give the same score.",
      },
      {
        title: "Straight into the next step",
        body: "Send the contract to GasLens or MonadForge without copying it around.",
      },
    ],
  },
  gaslens: {
    eyebrow: "02 Gas review",
    title: "Every wasted SLOAD, in a diff.",
    lead: "GasLens finds storage reads in loops, memory where calldata will do, string reverts and counters that cannot overflow, then rewrites the contract.",
    points: [
      {
        title: "Estimated savings per finding",
        body: "Ranked by impact so the biggest wins come first.",
      },
      {
        title: "A full rewritten contract",
        body: "Shown as a diff against yours, ready to copy.",
      },
      {
        title: "Plain reasons",
        body: "Each change says why it costs less, not just that it does.",
      },
    ],
  },
  forge: {
    eyebrow: "03 Generate and deploy",
    title: "From a sentence to a verified contract.",
    lead: "Describe what you need, edit what MonadForge writes, then compile, deploy from your wallet and publish the source on Sourcify in one panel.",
    points: [
      {
        title: "Your wallet, your contract",
        body: "MetaMask, Rabby, Coinbase Wallet or any WalletConnect wallet. Nothing is signed for you.",
      },
      {
        title: "Verified for real",
        body: "The exact compiler input that built your bytecode is sent to Sourcify, so explorers show your source.",
      },
      {
        title: "Already verified elsewhere?",
        body: "Verify any testnet contract from its address and source.",
      },
    ],
  },
  sentinel: {
    eyebrow: "04 Contract activity",
    title: "Know when something odd happens.",
    lead: "SentinelMon follows the calls to a deployed contract and flags patterns worth a look: drains, bursts of failures, admin calls from new addresses.",
    points: [
      {
        title: "Refreshes every few seconds",
        body: "Monad blocks are fast, so the feed is too.",
      },
      {
        title: "Flagged, not alarmed",
        body: "Each flag says what was seen and links to the transaction.",
      },
      {
        title: "Stays in your browser",
        body: "Your watch list is saved locally. No account needed.",
      },
    ],
  },
  paradebug: {
    eyebrow: "05 Block contention",
    title: "See which functions collide.",
    lead: "Monad runs transactions in parallel and re-runs the ones that touch the same state. ParaDebug shows which of your functions are called together in the same block, so you know where to look.",
    points: [
      {
        title: "Block by block",
        body: "Every block in the scanned range with your contract's calls grouped by function.",
      },
      {
        title: "Hot functions ranked",
        body: "How often each function shares a block with itself.",
      },
      {
        title: "Honest about what it is",
        body: "A signal of possible contention, not a measurement of the scheduler.",
      },
    ],
  },
} as const;

export const mockLabels = {
  scoreLabel: "Security score",
  scoreOutOf: "/ 100",
  fixLabel: "Suggested fix",
  promptLabel: "Describe your contract",
  deployTitle: "Deploy",
  network: "Monad testnet",
  chainId: "10143",
  live: "Watching",
  flagLink: "View transaction",
  range: "Last 50 blocks",
  blocksLabel: "Blocks with calls",
  functionsLabel: "Same-block repeats",
  blocksSuffix: "of 50 blocks",
  showRaw: "Example output",
  hideRaw: "Back to preview",
  rawTitle: "What the tool returns for this example",
  status: { ok: "Succeeded", flagged: "Flagged", failed: "Reverted" },
  pickFunction: "Pick a function to see where it repeats",
} as const;

export function callSummary(method: string, from: string, ago: string, status: string) {
  return `${method} called by ${from}, ${ago} ago. ${status}.`;
}

export const monguardMocks = {
  hero: {
    file: "VulnerableBank.sol",
    tool: "MonGuard",
    score: 42,
    findings: [
      {
        severity: "Critical",
        title: "Reentrancy in withdraw()",
        lines: "Lines 13 to 18",
        detail:
          "The balance is reduced after the external call, so a contract can re-enter withdraw() and drain the bank.",
      },
      {
        severity: "High",
        title: "emergencyDrain() has no access control",
        lines: "Line 21",
        detail:
          "Anyone can call emergencyDrain() and send the whole balance to the owner address, wiping out every depositor.",
      },
      {
        severity: "High",
        title: "tx.origin used for authorisation",
        lines: "Line 26",
        detail:
          "adminTransfer() trusts tx.origin, so a malicious contract the owner interacts with can credit itself any balance.",
      },
      {
        severity: "Low",
        title: "No event on deposit()",
        lines: "Line 9",
        detail:
          "Deposits change balances without an event, so indexers and monitors cannot see them.",
      },
    ],
    fix: [
      { kind: "remove", text: '(bool ok, ) = msg.sender.call{value: amount}("");' },
      { kind: "remove", text: "balances[msg.sender] -= amount;" },
      { kind: "add", text: "balances[msg.sender] -= amount;" },
      { kind: "add", text: '(bool ok, ) = msg.sender.call{value: amount}("");' },
    ],
  },
  section: {
    file: "StakingPool.sol",
    tool: "MonGuard",
    score: 64,
    findings: [
      {
        severity: "Critical",
        title: "Fee can exceed the amount withdrawn",
        lines: "Lines 31 to 35",
        detail:
          "feeBps has no upper bound, so a fee above 10,000 makes the unchecked subtraction in withdraw() wrap to a huge payout.",
      },
      {
        severity: "Medium",
        title: "Owner can change the fee with no delay",
        lines: "Line 48",
        detail:
          "setFee() takes effect at once, so stakers cannot react before a fee change hits their withdrawal.",
      },
      {
        severity: "Low",
        title: "setTreasury() accepts the zero address",
        lines: "Line 52",
        detail: "Setting the treasury to address(0) burns every fee collected from then on.",
      },
    ],
    fix: [
      { kind: "same", text: "function setFee(uint256 newFeeBps) external onlyOwner {" },
      { kind: "add", text: "    if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();" },
      { kind: "same", text: "    feeBps = newFeeBps;" },
    ],
  },
} satisfies Record<string, MonguardMockData>;

export const gaslensMocks = {
  hero: {
    file: "GasHeavy.sol",
    tool: "GasLens",
    summary: "3 findings",
    saving: "about 18% less gas per call",
    diff: [
      { kind: "same", text: "contract GasHeavy {" },
      {
        kind: "remove",
        text: "  function batchTransfer(address[] memory to, uint256[] memory amounts) public {",
      },
      {
        kind: "add",
        text: "  function batchTransfer(address[] calldata to, uint256[] calldata amounts) external {",
      },
      { kind: "remove", text: "    for (uint256 i = 0; i < to.length; i++) {" },
      { kind: "add", text: "    for (uint256 i; i < to.length; ) {" },
      { kind: "same", text: "      balances[to[i]] += amounts[i];" },
      { kind: "add", text: "      unchecked { ++i; }" },
      { kind: "same", text: "    }" },
    ],
    findings: [
      { impact: "High", title: "calldata instead of memory", saving: "~1,900 gas", lines: [1, 2] },
      { impact: "High", title: "Storage read inside loop", saving: "~2,100 gas", lines: [3, 4] },
      { impact: "Medium", title: "Unchecked loop counter", saving: "~60 gas per item", lines: [6] },
    ],
  },
  section: {
    file: "Airdrop.sol",
    tool: "GasLens",
    summary: "3 findings",
    saving: "about 31% less gas per claim",
    diff: [
      { kind: "same", text: "contract Airdrop {" },
      { kind: "remove", text: "  uint256 public maxClaim = 100e18;" },
      { kind: "add", text: "  uint256 public constant MAX_CLAIM = 100e18;" },
      { kind: "add", text: "  error AlreadyClaimed();" },
      { kind: "same", text: "  function claim(uint256 amount) external {" },
      {
        kind: "remove",
        text: '    require(claimed[msg.sender] == false, "Airdrop: already claimed");',
      },
      { kind: "add", text: "    if (claimed[msg.sender]) revert AlreadyClaimed();" },
      { kind: "same", text: "    claimed[msg.sender] = true;" },
    ],
    findings: [
      { impact: "High", title: "Constant instead of storage", saving: "~2,100 gas", lines: [1, 2] },
      {
        impact: "Medium",
        title: "Custom error instead of a string",
        saving: "~50 gas",
        lines: [3, 5, 6],
      },
      { impact: "Low", title: "Bool compared to false", saving: "~10 gas", lines: [5, 6] },
    ],
  },
} satisfies Record<string, GaslensMockData>;

export const forgeMocks = {
  hero: {
    prompt: "An ERC20 called Monad Gold, symbol MGLD, 1 million cap, only the owner can mint.",
    file: "MonadGold.sol",
    code: [
      "contract MonadGold {",
      "  error Unauthorized();",
      "  error CapExceeded();",
      "  uint256 public constant MAX_SUPPLY = 1_000_000e18;",
      "  address public immutable owner;",
      "  function mint(address to, uint256 amount) external {",
      "    if (totalSupply + amount > MAX_SUPPLY) revert CapExceeded();",
    ],
    wallet: "0x71C7...3A9f",
    steps: [
      { label: "Compiled with solc 0.8.28", state: "done" },
      { label: "Deployed at 0x5FbD...0aa3", state: "done" },
      { label: "Verifying on Sourcify", state: "active" },
    ],
  },
  section: {
    prompt:
      "An escrow where the buyer deposits MON and the seller is paid when the buyer confirms delivery.",
    file: "Escrow.sol",
    code: [
      "contract Escrow {",
      "  error NotBuyer();",
      "  error AlreadyReleased();",
      "  address public immutable buyer;",
      "  address payable public immutable seller;",
      "  function confirmDelivery() external {",
      "    if (released) revert AlreadyReleased();",
    ],
    wallet: "0x4B20...9cD1",
    steps: [
      { label: "Compiled with solc 0.8.28", state: "done" },
      { label: "Deployed at 0x2279...B5E8", state: "done" },
      { label: "Verified on Sourcify, full match", state: "done" },
    ],
  },
} satisfies Record<string, ForgeMockData>;

export const sentinelMocks = {
  hero: {
    contract: "MonadGold",
    address: "0x5FbD...0aa3",
    rows: [
      { method: "transfer", from: "0x3f2a...91c4", ago: "2s", status: "ok" },
      { method: "transfer", from: "0x88b1...02de", ago: "4s", status: "ok" },
      { method: "mint", from: "0xc0ff...ee11", ago: "6s", status: "flagged" },
      { method: "approve", from: "0x3f2a...91c4", ago: "9s", status: "ok" },
      { method: "transfer", from: "0x19d0...7b3a", ago: "12s", status: "ok" },
    ],
    flagTitle: "Admin call from a new address",
    flagBody: "mint() was called by an address that has never called this contract before.",
  },
  section: {
    contract: "Escrow",
    address: "0x2279...B5E8",
    rows: [
      { method: "withdraw", from: "0x9a4e...c210", ago: "1s", status: "failed" },
      { method: "withdraw", from: "0x9a4e...c210", ago: "3s", status: "failed" },
      { method: "withdraw", from: "0x9a4e...c210", ago: "5s", status: "failed" },
      { method: "deposit", from: "0x4B20...9cD1", ago: "40s", status: "ok" },
    ],
    flagTitle: "Burst of failed calls",
    flagBody: "Three calls to withdraw() failed within five seconds from the same address.",
  },
} satisfies Record<string, SentinelMockData>;

export const paradebugMocks = {
  hero: {
    contract: "MonadGold",
    blocks: [
      { number: "4,812,331", calls: ["transfer", "transfer", "transfer", "approve"] },
      { number: "4,812,330", calls: ["mint"] },
      { number: "4,812,328", calls: ["transfer", "transfer", "approve"] },
      { number: "4,812,325", calls: ["transfer"] },
    ],
    functions: [
      { name: "transfer", blocks: 14, of: 50 },
      { name: "approve", blocks: 3, of: 50 },
      { name: "mint", blocks: 1, of: 50 },
    ],
  },
  section: {
    contract: "VotingPool",
    blocks: [
      { number: "4,901,112", calls: ["vote", "vote", "vote", "vote", "delegate"] },
      { number: "4,901,111", calls: ["vote", "vote"] },
      { number: "4,901,109", calls: ["propose"] },
    ],
    functions: [
      { name: "vote", blocks: 22, of: 50 },
      { name: "delegate", blocks: 4, of: 50 },
      { name: "propose", blocks: 1, of: 50 },
    ],
  },
} satisfies Record<string, ParadebugMockData>;
