# AI Engineering Standards Repository

## Goal

Build a personal AI-native engineering standards repository intended primarily for AI agent consumption (Claude Code, AGENTS.md, Cursor, Continue, etc.), while still remaining readable for humans.

This repository should serve as:

- A reusable engineering standards system
- A source of truth for TypeScript and React best practices
- A reusable starter/reference kit for new projects
- A refactoring guide for older codebases
- A retrieval-friendly knowledge base for AI coding agents

The repository should optimize for:

- deterministic AI guidance
- maintainability
- composability
- readability
- scalability
- accessibility
- incremental architecture

The repository should NOT optimize for:

- excessive prose
- philosophical essays
- premature abstraction
- enterprise boilerplate
- giant generalized frameworks

---

# Core Engineering Philosophy

## Core Principle

Prefer explicit, composable, feature-oriented architecture over generalized abstractions and centralized complexity.

## Architectural Values

- Composition over inheritance
- Readability over cleverness
- Explicitness over magic
- Feature ownership over centralized organization
- Incremental abstraction over premature DRY
- Maintainability over premature optimization
- Colocation over fragmentation
- Accessibility-first development
- Strong type safety
- Predictable data flow

---

# AI Agent Behavior Rules

AI agents working with these standards should:

## Prioritize

- readability
- accessibility
- composability
- maintainability
- type safety
- feature isolation
- incremental refactoring
- explicit APIs
- predictable architecture

## Avoid

- giant files
- useEffect abuse
- premature abstractions
- hook mini-frameworks
- defensive memoization
- over-generalized utilities
- excessive inheritance
- Redux
- hidden side effects
- implementation testing
- state synchronization effects
- aggressive rewrites without approval

## Refactoring Rules

- Preserve behavior
- Prefer additive refactors
- Preserve architecture boundaries
- Ask before major architectural divergence
- Gently migrate legacy systems
- If possible, write tests before refactoring untested code
- Avoid massive rewrites unless explicitly requested

---

# Repository Structure

Create the repository roughly with this structure:

ai-engineering-standards/
├── README.md
│
├── philosophy/
│ ├── core-principles.md
│ ├── ai-agent-behavior.md
│ ├── incremental-abstraction.md
│ ├── maintainability.md
│ └── readability.md
│
├── typescript/
│ ├── rules.md
│ ├── anti-patterns.md
│ ├── validation.md
│ ├── naming.md
│ ├── error-handling.md
│ └── tsconfig/
│ ├── base.json
│ ├── react.json
│ └── nextjs.json
│
├── react/
│ ├── component-design.md
│ ├── hooks.md
│ ├── use-effect.md
│ ├── memoization.md
│ ├── state-management.md
│ ├── forms.md
│ ├── accessibility.md
│ ├── testing.md
│ └── anti-patterns.md
│
├── architecture/
│ ├── feature-driven.md
│ ├── shared-code.md
│ ├── monorepos.md
│ ├── folder-structure.md
│ ├── refactoring.md
│ └── dependency-boundaries.md
│
├── tooling/
│ ├── tanstack.md
│ ├── nx.md
│ ├── vite.md
│ ├── biome.md
│ ├── tailwind.md
│ ├── shadcn.md
│ └── prisma.md
│
├── security/
│ ├── validation.md
│ ├── secrets.md
│ ├── auth.md
│ └── api-security.md
│
├── examples/
│ ├── good/
│ └── bad/
│
├── templates/
│ ├── CLAUDE.md
│ ├── AGENTS.md
│ ├── project-readme.md
│ └── pull-request-template.md
│
└── packages/
├── tsconfig/
├── eslint-config/
└── biome-config/

---

# Documentation Style Requirements

Optimize all documentation for AI retrieval quality.

Documentation should be:

- directive
- concise
- hierarchical
- example-heavy
- low ambiguity
- deterministic
- composable

Avoid:

- giant essays
- vague wording
- contradictory guidance
- excessive prose

Preferred style:

md # Rules ## DO - ... ## DO NOT - ... ## PRIORITY Readability > micro-optimization

Separate:

- rules
- rationale
- examples

where appropriate.

---

# TypeScript Standards

## General

- "strict": true
- Avoid any
- Prefer unions over enums
- Avoid type assertions when possible
- Prefer generated API types
- Prefer schema-driven validation
- Prefer explicit naming
- Avoid type gymnastics
- Avoid unnecessary DTO duplication

## tsconfig Preferences

Include strong strictness rules such as:

- noUnusedLocals
- noUnusedParameters
- noUncheckedIndexedAccess
- noPropertyAccessFromIndexSignature
- noFallthroughCasesInSwitch
- allowUnreachableCode: false
- allowUnusedLabels: false
- noUncheckedSideEffectImports
- erasableSyntaxOnly

Use:

- ~/\* absolute imports

## Validation

- Prefer Zod
- Investigate Valibot
- Schema-first validation is encouraged
- Shared FE/BE schemas are preferred

---

# React Standards

## Architecture

- Prefer feature-driven architecture
- Colocate feature-specific logic
- Avoid organization-by-type for large apps
- Prefer composition over deeply nested prop drilling
- Compound components are encouraged

## Components

- Keep components reasonably scoped
- Avoid gigantic files
- Large files should trigger decomposition review
- One file should generally have one primary responsibility

## Hooks

## DO

- Encapsulate reusable behavior
- Keep hooks composable
- Keep effects explicit

## DO NOT

- Create hook mini-frameworks
- Wrap useState purely for renaming
- Hide side effects unexpectedly

Before creating custom hooks:

- Check whether an existing solution already exists
- Investigate @uidotdev/usehooks

## useEffect Doctrine

useEffect should primarily be used for:

- external system synchronization
- subscriptions
- DOM APIs
- timers
- imperative bridges

Avoid useEffect for:

- state synchronization
- derived state
- unnecessary data flow orchestration

## Memoization

## DO

- Optimize proven bottlenecks
- Use useCallback for stable drilled callbacks when needed

## DO NOT

- Defensively memoize
- Abuse useMemo
- Use memoization to silence dependency warnings
- Overuse React.memo

Priority:

- Readability > micro-optimization

## State Management Hierarchy

Preferred order:

1. URL state
2. Server state (TanStack Query)
3. Local component state
4. Context
5. Zustand only when truly necessary
6. Never Redux

## Forms

- Prefer TanStack ecosystem where possible
- React Hook Form is acceptable
- Prefer controlled inputs
- Prefer shared schema validation
- Optimistic updates are encouraged

---

# Styling Standards

Preferred stack:

- Tailwind CSS
- Shadcn UI
- CSS variables for theming
- Design tokens
- Minimal arbitrary values

Avoid:

- CSS Modules unless necessary
- Excessive arbitrary Tailwind values

Preferred theming approach:

- CSS variable-based themes
- Tailwind integration
- Runtime-friendly tokens
- Dark/light mode support

---

# Testing Standards

## Philosophy

- Integration tests over implementation tests
- Test behavior, not implementation details
- Avoid snapshot tests
- Unit test pure utilities and logic
- Use Playwright only for critical E2E flows

## Preferred Tooling

- Vitest
- Testing Library
- Playwright

Follow the philosophy from:
https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

# Accessibility Standards

Accessibility standards should be strict.

## Requirements

- Semantic HTML first
- Keyboard navigation mandatory
- Screenreader friendliness mandatory
- Form labeling mandatory
- ARIA only when necessary
- Avoid clickable divs
- Ensure color contrast compliance

---

# Error Handling Standards

## Rules

- Never swallow errors
- Never hide original error context
- Avoid generic "Something went wrong" messages
- Preserve HTTP status codes and payloads
- Use contextual logging
- Avoid large ambiguous try/catch blocks
- Use custom error classes where appropriate
- Validate inputs before transitions

## Async Rules

- Avoid unhandled promise rejections
- Await async operations properly
- Use .catch() where appropriate

## User-Facing Errors

Every user-facing error should:

- explain the failure
- explain the next step
- remain actionable

---

# Dependency Philosophy

## DO

- Prefer browser-native APIs
- Prefer mature maintained libraries
- Check bundle impact

## DO NOT

- Add tiny unnecessary dependencies
- Add bloated libraries
- Use abandoned packages

---

# Monorepo Philosophy

Preferred tooling:

- Nx
- pnpm

Guidelines:

- Preserve feature isolation
- Avoid circular dependencies
- Avoid publishable packages unless explicitly required
- Group packages by domain when scaling

Example:

txt packages/ frontend/ backend/

---

# CI / PR Standards

Required:

- lint gating
- typecheck gating
- test gating
- formatting gating

Guidance:

- Smaller PRs are preferred for reviewability
- Large PRs are acceptable when necessary
- Prefer squash merges
- Prioritize high-quality PR titles/descriptions

When using PR workflows:

- Investigate @burglekitt/worktree

---

# Initial Implementation Plan

Start implementation in phases.

## Phase 1

- Repository structure
- README
- Core philosophy documents
- AI behavior document
- tsconfig package
- biome/eslint configs

## Phase 2

- React/TypeScript standards docs
- Examples
- AGENTS.md templates
- CLAUDE.md templates

## Phase 3

- Advanced architecture docs
- Security docs
- Monorepo docs
- Starter templates
- Scaffolding utilities

---

# Important Final Guidance

This repository is primarily intended for:

- AI retrieval
- deterministic engineering guidance
- reusable architectural consistency

Optimize for:

- clarity
- consistency
- composability
- maintainability
- AI adherence

Not for:

- excessive prose
- academic writing
- generalized enterprise abstraction
