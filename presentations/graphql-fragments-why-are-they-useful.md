---
title: GraphQL Fragments - Why Are They Useful?
author: Brooke Hatton
---

## Why Fragments?

As your app grows, you’ll often reuse the same components across pages.

Each of those pages might query the same fields.

Keeping all those queries in sync manually is:

- Painful
- Error-prone

<!-- pause -->

GraphQL fragments solve this problem.

<!-- end_slide -->

## A Bookstore Example

<!-- column_layout: [1, 2] -->

<!-- column: 0 -->

Let’s say you’re building a bookstore website.

On your main list page, you show:

- Title
- Author
- Description
- Price
- Basket status

And you use that data in a `BookCard` component.

<!-- column: 1 -->

```typescript {1-20} +line_numbers
// pages/Books.tsx
import { graphql } from "../gql";
import { useQuery } from "@apollo/client";
import { BookCard } from "../components/BookCard";

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

export default function BookList() {
  const { data } = useQuery(BookListQuery);
  if (!data) return null;

  return (
    <div>
      {data.books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```

<!-- end_slide -->

## Reusing Components

<!-- column_layout: [1, 2] -->
<!-- column: 0 -->

Then, you add a **Book Detail** page and reuse the `PriceInfo` component.

<!-- column: 1 -->

```typescript {1-100|14,15|40} +line_numbers
// pages/book/[id].tsx
import { graphql } from "../gql";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { PriceInfo } from "../components/PriceInfo";

export const BookPageQuery = graphql(`
  query BookPage($id: ID!) {
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

export default function BookPage() {
  const { id } = useRouter().query;
  const { data } = useQuery(BookPageQuery, { variables: { id } });
  if (!data?.book) return null;

  const book = data.book;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.description}</p>
      <PriceInfo price={book.price} inBasket={book.inBasket} />
      {/* ... */}
    </div>
  );
}
```

<!-- end_slide -->

## Requirements Change

The product team now wants:

> “Can we show **availability** and **ship date** in the `PriceInfo` component?”

Now you have two _bad_ options:

1. Update every query manually.
2. Let the component fetch its own data.

<!-- pause -->

Neither scales well.

<!-- end_slide -->

## Use Fragments Instead

Fragments let you define the required fields **once**, **next to the component**.

```typescript {5-14|17|21} +line_numbers
// components/PriceInfo.tsx
import { graphql } from "../gql";
import { useFragment, FragmentType } from "../gql/fragment-masking";

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

export function PriceInfo({ book }: Props) {
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
}
```

<!-- end_slide -->

## Consuming Fragments in Pages

You just need to **spread** the fragment into your queries:

<!-- column_layout: [1, 2] -->

<!-- column: 0 -->

```typescript {1-30|9}
// pages/Books.tsx
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
```

<!-- column: 1 -->

```typescript {1-30|9}
// pages/book/[id].tsx
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
```

<!-- end_slide -->

## Why This Pattern Works

- ✅ **Colocated data requirements.**

<!-- pause -->
<!-- speaker_note: Fragments live next to the components that use them, so it’s clear what data each component needs. -->

- ✅ **Safe, minimal refactors.**

<!-- pause -->
<!-- speaker_note: Update the fragment in one place when requirements change — without touching every query. -->

- ✅ **Avoids overfetching.**

<!-- pause -->
<!-- speaker_note: Fragments limit components to only the fields they declare, preventing unused fields from lingering after refactors. -->

- ✅ **Encourages modular components.**

<!-- pause -->
<!-- speaker_note: Components define their own data contract, making them easier to reuse, test, and maintain. -->

The result?

> **Components define what data they need.**

> **Pages just provide it.**

<!-- end_slide -->

## Takeaway

Next time you're repeating the same fields between queries...

Don't copy-paste. Use a **fragment**.

Put it next to the component that needs it.

**Simple. Maintainable. Powerful.**

<!-- end_slide -->
