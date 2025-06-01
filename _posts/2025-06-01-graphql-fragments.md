---
layout: post
title: "GraphQL Fragments: Why are they useful?"
date: 2025-04-25 09:00:00 +0100
categories: Engineering
published: false
---

Imagine you're building a bookstore website. The first page you make is the list of books. The page consists of the books, each with a title, author, description, price, and availability. You also have a button to add the book to the basket.

So you write a single query that fetches all the data you need for the entire page, and you pass that data down to each component.

```tsx
// queries/BookListPage.ts
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

const BookListPage = () => {
  const { data } = useQuery(BookListQuery);

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
```

This works great so far. Next you add a new page that shows the details of a single book. The page has a similar structure as the `BookCard` component, but it also includes a list of reviews and related books.

```tsx
// queries/BookPage.ts
import { graphql } from "../gql";

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

const BookPage = ({ id }) => {
  const { data } = useQuery(BookPageQuery, { variables: { id } });

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
```

So far so good, you keep expanding the app, adding new pages and components. But soon you find yourself needing to extend the `PriceInfo` component to show the availability of the book and an estimated ship date.

You have two options:

1. Find all the pages that use the `PriceInfo` component and update the query to include the new fields. This is tedious and hard to maintain, especially if you have a lot of pages that use the same component. You also run the risk of breaking something if you forget to update one of the queries.
2. Make the component fetch the data itself — this makes the component less reusable, harder to test, and makes the page slower because it has to make multiple requests.

### This Is Where Fragments Help

Rather than repeating the same field list in every query, you can define a fragment for the `PriceInfo` component — and importantly, you define the fragment **next to the component** that uses it.

Using [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with `@graphql-codegen/client-preset`, we’ll define fragments and operations using the `graphql()` tagged function, and [fragment masking](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#fragment-masking) to ensure type safety.

Here's how it looks:

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

Now, your queries can spread the fragment whenever the `PriceInfo` component is used, ensuring that it always has the data it needs without duplicating field definitions.

```tsx
// queries/BookListPage.ts
import { graphql } from '../gql';

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
// queries/BookPage.ts
import { graphql } from '../gql';

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

### Why This Pattern Works Well

With this setup:

- Fragments are colocated with the components that use them.
- Fragment masking ensures that components only access the fields declared in their fragment.
- Codegen keeps everything typesafe and consistent.

This is a clean, scalable pattern that scales beautifully as your app grows.

Next time you find yourself copying the same fields between queries, reach for a fragment—and put it where it belongs: **next to the component that needs it.**
