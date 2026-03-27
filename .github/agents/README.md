# Agent Manifests — How to use these files later

This folder contains repository-level agent manifests (`*.agent.md`) that document detection rules, remediation guidance, and safe automation policies for repository checks (format/lint, OpenRouter safety, etc.). These files are documentation-first: they do not run by themselves.

When/why these are useful
- Provide on-repo policy and remediation guidance for contributors and reviewers.
- Drive optional automation later (CI runner, GitHub App, local CLI, or editor integration).
- Keep human-readable examples (code snippets, exact commands, suggested commit messages) close to the code they apply to.

Quick overview of common fields
- `name`: short id used for discovery.
- `description`: explain when and why this agent applies.
- `applyTo`: globs that limit scope (e.g. `docs/**`).
- `tags`: discovery keywords.
- `instructions`: human-friendly remediation steps, code samples, and safety guidance.

How they relate to CI (`.github/workflows`)
- CI jobs (like `ci.yml`) are the enforcement layer: they run tests, format checks, linting and can fail PRs.
- `*.agent.md` files are the remediation / policy layer: they explain how to fix failures and provide examples for maintainers.
- Optionally you can add a runner that parses `*.agent.md` and posts suggest-only comments on PRs to help contributors fix issues before or after CI fails.

Options to add automation later (safe, progressive)
1) Keep-as-docs (no automation)
   - No additional files required. Use these manifests as guidance for reviewers.

2) Suggest-only PR comments (recommended first step)
   - Implement `scripts/run-agents.js` that:
     - loads manifests from `.github/agents`,
     - checks changed files in the PR, and
     - posts suggest-only comments via the GitHub API with remediation snippets.
   - Run the script from a GitHub Action triggered on `pull_request` (use `GITHUB_TOKEN`).

   Example action step (pseudo):
   ```yaml
   - name: Run agent suggestions
     run: node scripts/run-agents.js --manifests .github/agents --pr ${{ github.event.pull_request.number }}
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

3) Enforced checks
   - Keep CI enforcement (lint/format/test) as the source of truth.
   - Optionally fail CI when critical violations are found (use sparingly).

4) Auto-apply small fixes (advanced / opt-in)
   - Have the runner create a follow-up PR with fixes, or commit to a branch.
   - Only enable after confidence & human review; include rate-limits and audit logs.

Testing and local usage
- You can run a runner locally against a branch to see suggestions before wiring CI.
- Test the runner on a representative PR to validate comment formatting and false-positive rates.

Next steps I can take
- Add a minimal `scripts/run-agents.js` suggest-only runner and a GitHub Action step to run it on PRs (I will not enable auto-apply). 
- Or keep the manifests as documentation only.

If you want the runner now, tell me and I’ll add a lightweight implementation and the CI step for review.
