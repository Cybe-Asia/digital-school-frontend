# AGENTS.md

This file defines the engineering contract for this repository. Treat it as the default operating manual for humans and AI agents working on the project.

## 1. Product and stack baseline

- Build on the stable App Router stack already used in this repo: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, TanStack Query 5, React Hook Form, Zod, and Vitest.
- Keep the repo on current stable major versions unless there is a written migration plan.
- Prefer platform-native Next.js capabilities before adding third-party abstraction layers.
- Use one package manager only. This repository should standardize on `npm` unless the team intentionally migrates and updates lockfiles, CI, and docs in the same change.

## 2. Non-negotiable architecture rules

- `src/app` owns routing, metadata, layouts, loading states, error boundaries, and server-first page composition.
- `src/features/*` owns business capabilities. Keep the existing slice shape:
  - `application`: use cases and orchestration
  - `domain`: types, business rules, ports
  - `infrastructure`: API clients, repository implementations, persistence adapters
  - `presentation`: UI components, hooks, and view-specific state
- `src/shared/ui` contains reusable design-system primitives only. No feature-specific copy, business logic, or API calls.
- `src/shared/lib` contains pure helpers with no business ownership.
- Cross-feature imports are allowed only through stable domain/application contracts. Do not import another feature's `presentation` or `infrastructure` modules directly.
- Route files must stay thin. Push logic into feature or shared modules instead of growing `page.tsx` files.

## 3. Component rules

- Default to Server Components. Add `"use client"` only when the component needs browser APIs, event handlers, local interactivity, or client-only hooks.
- Keep client islands small. Move data fetching and heavy composition back to the server whenever possible.
- Pass only serializable props from Server Components into Client Components.
- Mark server-only modules with `import "server-only"` when they touch secrets, server env vars, or privileged backend access.
- Shared UI components must be reusable, typed, accessible, and visually consistent with the design system.
- Feature-specific composed components belong inside that feature, not in `src/shared/ui`.
- Prefer composition over large variant matrices. If a component has too many boolean props, split it.
- Do not fetch data directly inside shared presentational primitives.

## 4. Data, state, and side effects

- Make data ownership explicit. Every fetch must declare its caching intent instead of relying on implicit behavior.
- For server reads, prefer `fetch` in Server Components, Route Handlers, or server-only modules with explicit `cache`, `next.revalidate`, tags, or dynamic behavior.
- For mutations, prefer Server Actions or Route Handlers when they fit the flow. Revalidate with `revalidatePath` or `revalidateTag` deliberately.
- Use TanStack Query for client-side async state, retries, cache invalidation, and optimistic UX when server-only flows are not enough.
- Use Zustand only for local UI/app state that does not belong in the URL, form state, or server cache.
- Validate external inputs and outputs with Zod at system boundaries.
- Keep environment variable access centralized and validated. Never leak secrets into `NEXT_PUBLIC_*` variables.

## 4A. Mock and real API strategy

- Every external backend integration must be represented by a domain port interface first.
- Each port should have at least two implementations when mock support is needed:
  - real API repository for production-like network behavior
  - mock repository for local development, tests, demos, and backend-independent UI work
- Route files, components, and hooks must depend on the port or use case, never directly on `Api*Repository` or `Mock*Repository`.
- Repository selection must happen in one composition point or factory, following the pattern already used in [create-admissions-auth-repository.ts](/Users/arief/Documents/digital-school/digital-school-frontend/src/features/admissions-auth/infrastructure/create-admissions-auth-repository.ts).
- Do not scatter `if (mock)` branching across presentation code.
- Mock and real repositories must return the same domain result shapes and error semantics.
- Mock repositories should model realistic latency, success paths, validation failures, expired states, and edge cases, not only happy paths.
- When the backend contract changes, update in the same change:
  - domain types
  - API repository mapping
  - mock repository behavior
  - tests for both contract mapping and UI behavior
- Normalize backend responses inside the infrastructure layer. Do not leak transport-specific shapes into `application` or `presentation`.
- Prefer server-only environment variables for base URLs and secrets. If a mode flag must be public for client-driven flows, keep it minimal and never expose secret configuration.
- Default strategy by environment:
  - local development: `mock` by default unless a developer explicitly opts into `real`
  - CI and automated tests: use mock or stubbed deterministic test doubles unless the pipeline is explicitly for integration testing
  - preview and production: use `real`
- If the project needs richer request mocking later, prefer a single boundary tool such as MSW rather than ad hoc fetch monkey-patching throughout tests.
- Document expected real backend endpoints and required env vars in the repo docs whenever a feature adds or changes an API dependency.

## 5. Forms and validation

- Use React Hook Form with `zodResolver` for interactive forms.
- Co-locate schemas with the owning feature.
- Keep form submission logic in feature hooks or application services, not in route files.
- Map server validation errors back to field errors when possible.
- Preserve accessibility: proper labels, descriptions, keyboard flow, visible focus, and error messaging.

## 6. Styling and design system rules

- Use the existing shared primitives in `src/shared/ui` before creating new component bases.
- Design tokens live in CSS variables and shared theme configuration, not scattered hard-coded values.
- Tailwind utility usage is fine, but repeated patterns must graduate into shared primitives or semantic class helpers.
- Do not introduce another styling system unless there is a strong architectural reason and an approved migration plan.
- Respect responsive behavior from the start. Desktop-only implementations are not acceptable.
- Every new feature must be designed and implemented for mobile, tablet, and desktop from the first pass. Do not treat mobile responsiveness as cleanup work after the main implementation.
- Every new user-facing feature must work in both supported theme modes from the first change. Do not ship light-mode-only or dark-mode-only UI.
- New UI must use existing theme tokens, CSS variables, and shared theme state instead of hard-coded colors that break when the mode changes.
- Validate interaction states, surfaces, borders, text contrast, and focus visibility in both light and dark themes whenever a feature adds or changes visible UI.

## 6A. Internationalization rules

- Every new user-facing feature must support both English and Indonesian from the first change. Do not ship English-only UI copy, metadata, validation messages, or success/error states.
- All user-facing strings must come from the translation dictionaries in `src/i18n/translations/en.json` and `src/i18n/translations/id.json`. Do not hard-code copy in route files, components, hooks, or tests unless the test is intentionally asserting a translated output.
- When adding a new page or flow, localize both rendered UI copy and route metadata. Prefer server-side translation for metadata and server components, and `useI18n()` for client components.
- When adding new translation keys, add the English and Indonesian entries in the same change and keep the key structure aligned across both dictionaries.
- If a feature is intentionally language-neutral, document that decision in the PR rather than silently skipping translations.

## 6B. Responsible design rules

- Every new user-facing feature must consider responsible design from the start, not only visual styling after implementation.
- Design flows around the user's real responsibility, decision pressure, and likely context. Parents, students, and staff should always understand what the system knows, what they need to do next, and what happens after they act.
- Prefer clarity over decoration for operational product UI. Avoid ambiguous status labels, misleading urgency, hidden consequences, or CTA wording that obscures what will happen next.
- Surface critical information explicitly when a user may need it to make a decision: status, due dates, blockers, missing inputs, ownership, and next steps.
- Use safe, trustworthy UX patterns. Do not create deceptive defaults, fake scarcity, disguised destructive actions, or visual emphasis that pushes the user toward the wrong action.
- Reduce cognitive load by grouping related information, limiting competing calls to action, and preserving predictable navigation and information hierarchy across a flow.
- Treat accessibility, contrast, readable copy, mobile responsiveness, and error recovery as part of responsible design rather than optional QA items.
- When a feature introduces a multi-step flow, verify that the user can recover context after returning later, switching language, or switching theme.
- Motion must be subtle, purposeful, and supportive of comprehension. Prefer smooth transitions, section reveals, or state changes over decorative spectacle.
- Do not use snap scrolling, scroll hijacking, forced full-screen scroll sections, or other scroll behaviors that take control away from the user unless there is explicit product approval for that experience.
- If a design intentionally trades off simplicity, certainty, or user control, document that tradeoff in the PR instead of silently shipping it.

## 7. Performance and rendering rules

- Prefer server rendering, streaming, and route-level `loading.tsx` boundaries for slow data.
- Keep bundle size down by avoiding unnecessary client components and large client-only dependencies.
- Lazy load heavy client-only features when they are not needed on initial render.
- Use optimized Next.js primitives such as metadata APIs, route segment boundaries, and font/image optimization where applicable.
- Measure before adding complexity. Do not cargo-cult caching, memoization, or micro-optimizations.

## 8. Testing and quality gates

- Every behavior change requires tests at the right level: unit, component, integration, or end-to-end.
- Keep Vitest and Testing Library as the default fast test layer.
- Prefer feature-local tests near the owning feature or module.
- For user-facing UI changes, especially layout, sticky behavior, scrolling, animation, responsive states, or multi-step flows, verify the experience in a real browser with Playwright before finishing.
- Do not merge code that only "works manually" without automated coverage for the changed logic.
- PR quality gate must pass:
  - `npm ci`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run test`
  - `npm run build`
- Lint suppressions, `@ts-ignore`, and `any` require a short justification in code. Use them rarely.

## 9. CI/CD contract

- CI must run on every pull request and on pushes to protected branches.
- CI must block merges when lint, typecheck, tests, or production build fail.
- Use GitHub Actions as the default CI orchestrator for repository checks.
- Use Vercel Git-based deployments for preview and production delivery unless the team intentionally moves to a custom pipeline.
- Every pull request should produce a preview deployment.
- `main` should be the production branch unless the team explicitly documents another branch strategy.
- Protect the production branch with required status checks and at least one reviewer.
- Separate Local, Preview, and Production environment variables. Never share production secrets with preview by default.
- Enable code scanning and secret scanning when repository plan and permissions allow it.
- Production deploys must be reversible. Keep rollback simple and documented.

## 10. Dependency and tooling rules

- Do not add a package if the platform or current stack already solves the problem well.
- New dependencies must be justified by clear value, maintenance quality, bundle impact, and compatibility with React 19 and Next.js 16.
- Keep local, CI, and deployment Node versions aligned through a single declared version file and workflow config.
- Avoid duplicate tooling. One linter path, one formatter path, one test runner strategy per layer.

## 11. Git and delivery workflow

- Prefer small, reviewable pull requests.
- Keep commits focused and descriptive.
- If architecture, API contracts, or environment behavior change, update docs in the same PR.
- Never mix refactors with unrelated feature work unless the refactor is required to unlock the change.
- Do not leave TODOs without owner, reason, and next action.

## 12. Agent execution rules

- Read the relevant feature, route, and shared modules before editing.
- Preserve user changes you did not make. Do not revert unrelated work.
- Match the existing architecture before introducing a new pattern.
- When adding a new component, decide explicitly:
  - generic and reusable -> `src/shared/ui`
  - business-specific -> feature `presentation/components`
- When adding a new async flow, decide explicitly:
  - server-first page/data composition -> server module or route layer
  - client cache/mutation UX -> TanStack Query hook
- When changing contracts, update tests first or in the same change.
- Before finishing, verify the diff against the quality gate in section 8.

## 13. Definition of done

- The change respects feature boundaries.
- Server/client boundaries are intentional.
- Types, tests, lint, and build are clean.
- Accessibility and responsive behavior are not degraded.
- New features are intentionally usable on mobile viewports, not only visually tolerable.
- English and Indonesian translations exist for every new user-facing string, including page metadata where applicable.
- New user-facing UI is verified in both light and dark modes and does not regress theme switching.
- Important user-facing UI changes are sanity-checked in Playwright for real browser behavior, especially responsive layout, sticky elements, scroll behavior, and motion.
- User-facing flows reflect responsible design: statuses are understandable, next actions are explicit, and important consequences are not hidden behind vague UI.
- Docs and environment assumptions are updated where needed.

If a proposed change conflicts with this file, either adjust the implementation to fit the contract or document a deliberate exception in the pull request.
