---
layout: post
title: "GraphQL Fragments: Why are they useful?"
date: 2025-06-01 22:07:00 +0100
categories: Engineering
hidden: true
---

As your app grows, you'll often reuse the same component across multiple pages and each of those pages might query the same fields. Manually keeping those queries in sync is painful and error-prone. This is where GraphQL fragments shine.

## A Bookstore example

Imagine you're building a bookstore website. The first page you make is the list of books with titles, authors, descriptions, prices, availabilities, and an add to basket button.

To render it, you fetch all the data up front and pass it down to components:

```tsx
// pages/Books.ts
import { graphql } from "../gql";

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
// pages/book/[id].ts
import { graphql } from "../gql";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { PriceInfo } from "@/components/PriceInfo";

export const BookQuery = graphql(`
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

## Requirements change

A few weeks later, the product team asks you to show book availability and estimated ship date in PriceInfo. That’s a reasonable request, but now this component needs more data, and **you have to update every query that uses it.**

You have two _bad_ options:

1. **Update every query manually** to include the new fields. Tedious, fragile, and easy to get wrong.
2. **Make the component fetch data itself**. That hurts testability, slows down the page, and breaks your clean data flow.

Theres a better way...

### GraphQL Fragments

Rather than repeating the same fields in every query, you can define a fragment for the `PriceInfo` component - and importantly, you define the fragment **next to the component** that uses it.

I'm using [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with the [`@graphql-codegen/client-preset`](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client), which gives:

- The `graphql()` tag for operations and fragments
- [Fragment masking](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#fragment-masking) for strict type safety
- Fully typed components, queries, and fragments

But, you can adapt this pattern to your own setup if you're not using the guilds client codegen preset.

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

Now any page using PriceInfo just needs to spread the fragment:

```tsx
// pages/Books.tsx
import { graphql } from '../gql';
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
import { graphql } from '../gql';
...

export const BookPageQuery = graphql(`
  query BookPage($id: ID!) {
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

### Why This Pattern Works

With this setup:

- ✅ Fragments are colocated with the components that use them.
- ✅ Fragment masking ensures that components only access the fields declared in their fragment.
- ✅ Codegen keeps everything typesafe and consistent.

Your components define **what data they need**, and pages simply provide it.

Next time you find yourself copying the same fields between queries, stop. Reach for a fragment and put it where it belongs: **next to the component that needs it.**
