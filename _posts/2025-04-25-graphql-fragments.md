---
layout: post
title: "GraphQL Fragments: Why are they useful?"
date: 2025-04-25 09:00:00 +0100
categories: Engineering
---

Imagine you have a page that displays a bunch of graphs. Instead of writing separate queries for each graph, you write a single parent query and pass the result down to each graph component. Each graph then picks out the data it needs.

This works well on a single page, but becomes painful when you try to render a graph on another page or in isolation—like in Storybook. You end up having to pass/mock the entire parent query result, even though the graph only uses a small piece of it.

There are a couple of ways to improve this:

1. Use a mapper function: Extract just the data the graph needs from the full query result and pass that to the graph.

   - Downside: You need to define new TypeScript types that mirror parts of your schema, and if the graph is reused in a different context, you have to write a new mapper for each parent query.

2. Use GraphQL fragments: Define a fragment for each graph that describes exactly what data it needs. Then, include that fragment in whatever parent query you’re writing for the page.

   - Advantage: It keeps the graph’s data requirements self-contained and reusable, and lets Storybook or other contexts just mock the fragment’s shape directly.
