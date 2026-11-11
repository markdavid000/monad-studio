# Security policy

## Reporting a vulnerability

Report vulnerabilities privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability**. Do not open a public issue, pull request or discussion.

Include what you found, how to reproduce it, and the impact you expect. We acknowledge reports within three working days and keep you informed until the issue is fixed.

## Supported versions

Only the code on `main`, deployed to production, is supported. Fixes ship from `main`.

## Handling secrets

Secrets never enter the repository. They live in Vercel environment variables. Every pull request is scanned with gitleaks. If a secret is committed by mistake, treat it as leaked: rotate it first, then remove it from history.
