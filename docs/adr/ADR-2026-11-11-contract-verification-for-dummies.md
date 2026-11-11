# Publishing a contract's source, in plain English

- **Status:** Accepted
- **Technical version:** [ADR-2026-11-11-contract-verification.md](ADR-2026-11-11-contract-verification.md)

## What is the problem?

After deploying, developers publish their contract's source code so anyone can read it on the block explorer. This is called verification. Our "Verify" button says it worked, but it never actually sends anything. That is misleading.

## What are we doing about it?

We connect the button to Sourcify, the free public service Monad's explorers use. We also make sure the code we deploy is exactly the code we publish, otherwise verification can never succeed. The button only says "Verified" when Sourcify confirms it.

## What changes for people?

Verification works, and failures show the real reason. Before building it we run one end-to-end test on the Monad test network to confirm the service behaves as documented.

## What could go wrong?

Sourcify could be down or change its address. Users would then see an honest failure message and can retry later.
