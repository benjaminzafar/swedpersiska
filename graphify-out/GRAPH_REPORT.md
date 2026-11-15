# Graph Report - swedpersiska  (2026-11-15)

## Corpus Check
- 20 files · ~15,703 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 83 nodes · 108 edges · 15 communities (10 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a673b9e9`
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

## God Nodes (most connected - your core abstractions)
1. `CATEGORIES` - 8 edges
2. `t` - 6 edges
3. `scripts` - 5 edges
4. `supabase` - 5 edges
5. `COUNTRIES` - 5 edges
6. `Astryx Design System & Guidelines (Meta)` - 5 edges
7. `SwedPersiska (سوئد پرشیا)` - 4 edges
8. `rules` - 3 edges
9. `generatePinCode()` - 3 edges
10. `🚀 Kom igång` - 3 edges

## Surprising Connections (you probably didn't know these)
- `PostAdModal()` --calls--> `generatePinCode()`  [EXTRACTED]
  src/components/PostAdModal.jsx → src/lib/supabase.js

## Import Cycles
- None detected.

## Communities (15 total, 5 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (14): dependencies, lucide-react, react, react-dom, @supabase/supabase-js, name, private, scripts (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.43
Nodes (4): PostAdModal(), generatePinCode(), generateReferenceNumber(), supabase

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

## Knowledge Gaps
- **40 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+35 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _40 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._