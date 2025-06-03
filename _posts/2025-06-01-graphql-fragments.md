---
layout: post
title: "GraphQL Fragments: Why Are They Useful?"
date: 2025-06-02 14:12:00 +0100
categories: Engineering
---

As your app grows, you'll often reuse the same component across multiple pages and each of those pages might query the same fields. Manually keeping those queries in sync is painful and error-prone. This is where GraphQL fragments shine.

## A Bookstore Example

Imagine you're building a bookstore website. The first page you create is a list of books, showing the title, author, description, and **price info**, including availability and an "add to basket" option.

To render it, you fetch all the data up front and pass it down to components:

```tsx
// pages/Books.tsx
import { graphql } from "../gql";
import { useQuery } from "@apollo/client";

export const BookListQuery = graphql(`
  query BookListPage {
    books {
      id
      title
      author
      description
      price
      inBasket
    }
  }
`);

const BookList = () => {
  const { data } = useQuery(BookListQuery);

  // TODO: Handle loading and error states
  if (!data) return null;

  return (
    <div>
      {data.books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

const BookCard = ({ book }) => (
  <div>
    <h2>{book.title}</h2>
    <p>{book.author}</p>
    <p>{book.description}</p>
    <PriceInfo price={book.price} inBasket={book.inBasket} />
  </div>
);

const PriceInfo = ({ price, inBasket }) => (
  <div>
    <p>Price: {price}</p>
    <button disabled={inBasket}>Add to basket</button>
  </div>
);

export default BookList;
```

A bit later, you add a page to show details for a single book. You reuse the `PriceInfo` component:

```tsx
// pages/book/[id].tsx
import { graphql } from "../gql";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { PriceInfo } from "@/components/PriceInfo";

export const BookPageQuery = graphql(`
  query Book($id: ID!) {
    book(id: $id) {
      id
      title
      author
      description
      price
      inBasket
      reviews {
        rating
        comment
      }
      relatedBooks {
        id
        title
      }
    }
  }
`);

const Book = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useQuery(BookPageQuery, { variables: { id } });

  // TODO: Handle loading and error states
  if (!data?.book) return null;

  const book = data.book;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.description}</p>
      <PriceInfo price={book.price} inBasket={book.inBasket} />
      <Reviews reviews={book.reviews} />
      <RelatedBooks books={book.relatedBooks} />
    </div>
  );
};

export default Book;
```

## Requirements Change

A few weeks later, the product team asks you to show book availability and the estimated ship date in `PriceInfo`. That’s a reasonable request, but now this component needs more data — and **you have to update every query that uses it.**

You have two _bad_ options:

1. **Update every query manually** to include the new fields. Tedious, fragile, and easy to get wrong.
2. **Make the component fetch data itself.** That hurts testability, slows down the page, and breaks your clean data flow.

There’s a better way...

## GraphQL Fragments

Rather than repeating the same fields in every query, you can define a fragment for the `PriceInfo` component — and importantly, you define the fragment **next to the component** that uses it.

I'm using [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with the [`@graphql-codegen/client-preset`](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client), which provides:

- The `graphql()` tag for operations and fragments
- [Fragment masking](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#fragment-masking) for strict type safety
- Fully typed components, queries, and fragments

But you can adapt this pattern to your own setup if you're not using The Guild's client codegen preset.

Here’s how it looks:

```tsx
// components/PriceInfo.tsx
import { graphql } from "../gql";
import { FragmentType, useFragment } from "../gql/fragment-masking";

export const PriceInfoFragment = graphql(`
  fragment PriceInfo on Book {
    price
    inBasket
    availability {
      inStock
      estimatedShipDate
    }
  }
`);

type Props = {
  book: FragmentType<typeof PriceInfoFragment>;
};

export const PriceInfo = ({ book }: Props) => {
  const data = useFragment(PriceInfoFragment, book);

  return (
    <div>
      <p>Price: {data.price}</p>
      {data.availability?.inStock ? (
        <p>In stock, ships by {data.availability.estimatedShipDate}</p>
      ) : (
        <p>Currently out of stock</p>
      )}
      <button disabled={data.inBasket}>Add to basket</button>
    </div>
  );
};
```

Now any page using `PriceInfo` just needs to spread the fragment:

```tsx
// pages/Books.tsx
import { graphql } from "../gql";
...

export const BookListQuery = graphql(`
  query BookListPage {
    books {
      id
      title
      author
      description

      ...PriceInfo
    }
  }
`);
...
```

```tsx
// pages/book/[id].tsx
import { graphql } from "../gql";
...

export const BookPageQuery = graphql(`
  query Book($id: ID!) {
    book(id: $id) {
      id
      title
      author
      description

      ...PriceInfo

      reviews {
        rating
        comment
      }
      relatedBooks {
        id
        title
      }
    }
  }
`);
...
```

## Why This Pattern Works

- ✅ **Colocated data requirements.**
  Fragments live next to the components that use them, so it’s clear what data each component needs.

- ✅ **Safe, minimal refactors.**
  Update the fragment in one place when requirements change — without touching every query.

- ✅ **Avoids overfetching.**
  Fragments limit components to only the fields they declare, preventing unused fields from lingering after refactors.

- ✅ **Encourages modular components.**
  Components define their own data contract, making them easier to reuse, test, and maintain.

Next time you find yourself copying the same fields between queries for a component, stop. Create a fragment and put it where it belongs: **next to the component that needs it.**
