export interface ExampleContract {
  id: string;
  name: string;
  summary: string;
  source: string;
}

export const exampleContracts: readonly ExampleContract[] = [
  {
    id: "vulnerable-bank",
    name: "VulnerableBank.sol",
    summary: "Reentrancy, missing access control, tx.origin",
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balances[msg.sender] -= amount;
    }

    function emergencyDrain() external {
        payable(owner).transfer(address(this).balance);
    }

    function adminTransfer(address to, uint256 amount) external {
        require(tx.origin == owner, "Not authorized");
        balances[to] += amount;
    }
}
`,
  },
  {
    id: "staking-pool",
    name: "StakingPool.sol",
    summary: "Unbounded fee inside an unchecked block",
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract StakingPool {
    mapping(address => uint256) public staked;
    address public owner;
    address public treasury;
    uint256 public feeBps = 100;

    constructor(address treasury_) {
        owner = msg.sender;
        treasury = treasury_;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function stake() external payable {
        staked[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(staked[msg.sender] >= amount, "Too much");
        staked[msg.sender] -= amount;
        uint256 fee = (amount * feeBps) / 10_000;
        unchecked {
            payable(msg.sender).transfer(amount - fee);
        }
        payable(treasury).transfer(fee);
    }

    function setFee(uint256 newFeeBps) external onlyOwner {
        feeBps = newFeeBps;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }
}
`,
  },
  {
    id: "gas-heavy",
    name: "GasHeavy.sol",
    summary: "Storage reads in loops, memory instead of calldata",
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract GasHeavy {
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    address[] public holders;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function batchTransfer(address[] memory to, uint256[] memory amounts) public {
        for (uint256 i = 0; i < to.length; i++) {
            require(balances[msg.sender] >= amounts[i], "Insufficient balance");
            balances[msg.sender] = balances[msg.sender] - amounts[i];
            balances[to[i]] = balances[to[i]] + amounts[i];
        }
    }

    function distributeRewards(uint256 rewardPerHolder) public {
        uint256 totalReward = 0;
        for (uint256 i = 0; i < holders.length; i++) {
            balances[holders[i]] = balances[holders[i]] + rewardPerHolder;
            totalReward = totalReward + rewardPerHolder;
        }
        totalSupply = totalSupply + totalReward;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only the owner of this contract can call the mint function");
        totalSupply = totalSupply + amount;
        balances[to] = balances[to] + amount;
        holders.push(to);
    }
}
`,
  },
];
