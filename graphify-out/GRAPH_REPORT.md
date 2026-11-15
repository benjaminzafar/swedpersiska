# Graph Report - swedpersiska  (2026-11-15)

## Corpus Check
- 18 files · ~12,154 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 75 nodes · 98 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03060746`
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

## God Nodes (most connected - your core abstractions)
1. `CATEGORIES` - 7 edges
2. `t` - 6 edges
3. `scripts` - 5 edges
4. `supabase` - 5 edges
5. `CITIES` - 4 edges
6. `SwedPersiska (سوئد پرشیا)` - 4 edges
7. `rules` - 3 edges
8. `generatePinCode()` - 3 edges
9. `🚀 Kom igång` - 3 edges
10. `PostAdModal()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `PostAdModal()` --calls--> `generatePinCode()`  [EXTRACTED]
  src/components/PostAdModal.jsx → src/lib/supabase.js

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (5): currentYear, CATEGORIES, CITIES, t, CATEGORY_ICONS

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (14): dependencies, lucide-react, react, react-dom, @supabase/supabase-js, name, private, scripts (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.33
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

## Knowledge Gaps
- **36 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._