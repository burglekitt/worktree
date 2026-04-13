---
# Agent manifest template
# Fill in the fields below when creating a new `.agent.md` file under `.github/agents/`.
---

---
name: "your-agent-name"
description: "Short description explaining when to run this agent and why. Include trigger keywords for discovery."
applyTo:
  - "path/glob/**"
tags:
  - tag1
  - tag2
---

Instructions:

- Purpose: Briefly describe the agent's intent.
- Detection: Describe how the agent should detect relevant files or patterns (regex/imports).
- Suggested Response: Provide the recommended output or suggested code snippets.
- Safety: State whether changes should be suggest-only or allowed to auto-apply.

Example usage:

```
---
name: "fix-format-and-lint"
description: "Suggest formatting and lint fixes on PRs affecting source or docs files."
applyTo:
  - "src/**"
  - "docs/**"
tags:
  - format
  - lint
---
```
