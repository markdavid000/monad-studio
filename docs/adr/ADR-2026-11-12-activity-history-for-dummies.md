# Keeping a record of your work without signing up

- **Status:** Proposed
- **Technical version:** [ADR-2026-11-12-activity-history.md](ADR-2026-11-12-activity-history.md)

## What is the problem?

MonadStudio has no sign-up. That keeps it quick to try, but today nothing remembers what you did: refresh the page and your scan results are gone. People need to look back at the contracts they checked and the results they got.

## What are we doing about it?

Two layers, and neither needs an account.

1. **Saved in your browser, automatically.** Every scan and gas review is kept in the browser you used. A new Activity page lists them, and you can open any of them again without running the AI again. You can delete entries whenever you like.
2. **Saved to your wallet, if you choose.** If you connect your wallet, you can sign one message (free, no transaction) to prove the wallet is yours. From then on, your history is also stored on our server under your wallet address, so you see it on any computer where you connect the same wallet.

## What changes for people?

- A new "Activity" item in the studio sidebar.
- Without a wallet, history stays in that one browser. Clearing the browser's data erases it, and the page says so.
- With the wallet option, history follows you, but your contracts are stored on our server. We explain that before you sign, and there is a button to delete it.
- Running cost: a little more storage on the Upstash database we already use. The free plan is enough for now.

## What could go wrong?

- **Lost history:** people may expect browser-only history to follow them to another device. The Activity page says where history is kept and offers the wallet option.
- **Privacy:** someone may not want their contract source on our server. That is why syncing is opt in and can be deleted.
- **Access to someone else's history:** tests check that one wallet can never read another wallet's history.
