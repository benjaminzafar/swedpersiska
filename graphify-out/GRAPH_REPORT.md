# Graph Report - swedpersiska  (2026-11-16)

## Corpus Check
- 29 files · ~143,181 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 134 nodes · 184 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d77f452`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `CATEGORIES` - 9 edges
2. `supabase` - 7 edges
3. `COUNTRIES` - 7 edges
4. `t` - 6 edges
5. `Core Principle` - 6 edges
6. `scripts` - 5 edges
7. `ErrorBoundary` - 5 edges
8. `Astryx Design System & Guidelines (Meta)` - 5 edges
9. `handler()` - 4 edges
10. `handler()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `PostAdModal()` --calls--> `generatePinCode()`  [EXTRACTED]
  src/components/PostAdModal.jsx → src/lib/supabase.js

## Import Cycles
- None detected.

## Communities (17 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.25
Nodes (7): 1. Never Load Unnecessary Data, 2. Separate Active Data from Historical Data, 3. Use Pagination & Range / Cursor-Based Loading, 4. Lazy-Loaded Archive, 5. Universal Enforcement Across All Sections, Core Principle, Dashboard Performance Architecture Rule

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (14): dependencies, lucide-react, react, react-dom, @supabase/supabase-js, name, private, scripts (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (11): AVAILABLE_CATEGORY_ICONS, CATEGORY_ICON_MAP, DEFAULT_CATEGORIES, NORDIC_FLAGS, adminApi, API_BASE, getAdminPortalUrl(), getMainSiteUrl() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/react, @types/react-dom, vite (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (6): 1. Starta utvecklingsservern, 2. Bygg för produktion, 🗄️ Databas (Supabase), 🌟 Huvudfunktioner, 🚀 Kom igång, SwedPersiska (سوئد پرشیا)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): buildCommand, cleanUrls, framework, headers, outputDirectory, rewrites

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (5): 1. Frame-First Layouts, 2. Semantic Tokens Over Hardcoded Values, 3. High-End Master-Detail CRM UX, 4. Tactile Controls & Action Buttons, Astryx Design System & Guidelines (Meta)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (6): currentYear, CATEGORY_META, CATEGORIES, COUNTRIES, t, AdminPanel

### Community 14 - "Community 14"
Cohesion: 0.38
Nodes (6): PostAdModal(), generatePinCode(), generateReferenceNumber(), isSafeHttpUrl(), secureRandomInt(), supabase

### Community 15 - "Community 15"
Cohesion: 0.43
Nodes (5): generatePinCode(), generateReferenceNumber(), handler(), setCorsHeaders(), supabase

### Community 16 - "Community 16"
Cohesion: 0.53
Nodes (5): createAdminToken(), handler(), setCorsHeaders(), supabase, verifyAdminToken()

## Knowledge Gaps
- **54 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `supabase` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._