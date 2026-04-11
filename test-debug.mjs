const contractAddress = "0xd40514b8ae67ac9a8b9e5d4048e684612f762dd4";
const contractName = "MonadGold";
const sourceCode = `pragma solidity ^0.8.20;
// SPDX-License-Identifier: MIT

error Unauthorized();
error InsufficientBalance();
error InvalidAmount();

contract MonadGold {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    address private _owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);

    constructor() {
        _name = 'Monad Gold';
        _symbol = 'MGLD';
        _totalSupply = 0;
        _owner = msg.sender;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
}

    function transfer(address to, uint256 amount) public {
        _transfer(msg.sender, to, amount);
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public {
        _approve(msg.sender, spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public {
        _transferFrom(from, to, amount);
    }

    function mint(address to, uint256 amount) public {
        if (msg.sender != _owner) revert Unauthorized();
        if (amount == 0) revert InvalidAmount();
        if (_totalSupply + amount > 1000000 * 10**18) revert InvalidAmount();
        _balances[to] += amount;
        _totalSupply += amount;
        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (_balances[from] < amount) revert InsufficientBalance();
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transferFrom(address from, address to, uint256 amount) internal {
        if (_balances[from] < amount) revert InsufficientBalance();
        if (_allowances[from][msg.sender] < amount) revert InsufficientBalance();
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
    }
}`;

const res = await fetch("http://localhost:3000/api/monadforge/debug", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ contractAddress, contractName, sourceCode }),
});

const data = await res.json();
console.log(JSON.stringify(data, null, 2));
