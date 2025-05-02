---
layout: post
title: "GraphQL Fragments: Why are they useful?"
date: 2025-04-25 09:00:00 +0100
categories: Engineering
---

Imagine you have a page that displays several graphs. Instead of writing a separate GraphQL query for each graph, you typically write a single parent query and pass the entire result down to the child components. Each graph then picks out the data it needs.

This setup works well when everything lives on the same page. But things get tricky when you try to render a graph in isolation—like in Storybook, unit tests, or even on a different page. Suddenly, you’re forced to mock or pass down the entire parent query result, even if the graph only uses a small slice of it.

There are a couple of ways to solve this:

### 1. Use a Mapper Function

You can define a function that extracts only the relevant data from the parent query result and passes it into the graph.

**Downsides:**

- You often end up creating TypeScript types that duplicate parts of your GraphQL schema.
- If the graph is reused in another context with a different parent query, you need to write a new mapper.
- You lose the clear connection between the component and its data needs.

### 2. Use GraphQL Fragments - The Better Approach

Instead, you can define a fragment that represents the exact data each graph needs. That fragment can then be included in any parent query.

**Benefits:**

- The graph component owns its data shape—making it easier to understand, mock, and reuse.
- You can mock just the fragment in Storybook or tests, without recreating the full parent structure.
- Your data requirements stay aligned with your schema, with no redundant TypeScript types or mappers.

Fragments make your components more portable, testable, and decoupled from the specifics of any one page. They’re a simple but powerful tool for scaling your GraphQL codebase cleanly.
