<p align="center">
<img src="https://raw.githubusercontent.com/tonyketcham/flatbread/main/assets/flatbread%20logo%20v2%20x4%401-1728x1080%20centered%20header.png"/>
</p>

<h1 align="center">Flatbread 🥪</h1>

<p align="center">
  <a href="https://github.com/tonyketcham/flatbread/actions/workflows/pipeline.yml">
    <img src="https://github.com/tonyketcham/flatbread/actions/workflows/pipeline.yml/badge.svg" alt="pipeline status"/>
  </a>
  <a href="https://join.slack.com/t/flatbreadworkspace/shared_invite/zt-1bvnhr38j-oHFun85aGfaNp9qwizOORw">
    <img src="https://img.shields.io/static/v1?label=Slack&message=Flatbread&color=ECB22E&logo=slack" alt="Join the Flatbread slack" />
  </a>
  <a href="https://www.npmjs.com/package/flatbread">
    <img src="https://img.shields.io/npm/v/flatbread?color=%23ed225d" alt="NPM version">
  </a>
</p>

Eat your relational markdown data _and query it, too,_ with [GraphQL](https://graphql.org/) inside damn near any framework (statement awaiting peer-review).

If it runs ES Modules + Node 16+, it's down to clown.

Born out of a desire to [Gridsome](https://gridsome.org/) (or [Gatsby](https://www.gatsbyjs.com/)) anything, this project harnesses a plugin architecture to be easily customizable to fit your use cases.

# Install + Use

🚧 This project is currently experimental, and the API may change considerably before `v1.0`. Feel free to hop in and contribute some issues or PRs!

To use the most common setup for markdown files sourced from the filesystem, Flatbread interally ships with + exposes the [`source-filesystem`](https://github.com/tonyketcham/flatbread/tree/main/packages/source-filesystem) + [`transformer-markdown`](https://github.com/tonyketcham/flatbread/tree/main/packages/transformer-markdown) plugins.

The following example takes you through the default flatbread setup.

```bash
pnpm i flatbread@latest
```

Automatically create a `flatbread.config.js` file:

```bash
npx flatbread init
```

> If you're lookin for different use cases, take a peek through the various [`packages`](https://github.com/tonyketcham/flatbread/tree/main/packages) to see if any of those plugins fit your needs. You can find the relevant usage API contained therein.

Take this example where we have a content folder in our repo containing posts and author data:

```gql
content/
├─ posts/
│  ├─ example-post.md
│  ├─ funky-monkey-friday.md
├─ authors/
│  ├─ me.md
│  ├─ my-cat.md
...
flatbread.config.js
package.json
```

In reference to that structure, set up a `flatbread.config.js` in the root of your project:

```js
import { defineConfig, markdownTransformer, filesystem } from 'flatbread';

const transformerConfig = {
  markdown: {
    gfm: true,
    externalLinks: true,
  },
};
export default defineConfig({
  source: filesystem(),
  transformer: markdownTransformer(transformerConfig),

  content: [
    {
      path: 'content/posts',
      collection: 'Post',
      refs: {
        authors: 'Author',
      },
    },
    {
      path: 'content/authors',
      collection: 'Author',
      refs: {
        friend: 'Author',
      },
    },
  ],
});
```

Now hit your `package.json` and put the keys in the truck:

```js
// before
"scripts": {
  "dev": "svelte-kit dev",
  "build": "svelte-kit build",
},

// after becoming based and flatbread-pilled
"scripts": {
  "dev": "flatbread start -- svelte-kit dev",
  "build": "flatbread start -- svelte-kit build",
},
```

The Flatbread CLI will capture any script you add in after the `--` and appropriately unite them to live in a land of fairies and wonder while they dance into the sunset as you query your brand spankin new GraphQL server however you'd like from within your app.

## Run that shit 🏃‍♀️

```bash
pnpm run dev
```

## Construct queries 👩‍🍳

If everything goes well, you'll see a pretty `graphql` endpoint echoed out to your console by Flatbread. If you open that link in your browser, Apollo Studio will open for you to explore the schema Flatbread generated. Apollo Studio has some nice auto-prediction and gives you helpers in the schema explorer for building your queries.

You can query that same endpoint in your app in any way you'd like. Flatbread doesn't care what framework you use.

## Query arguments

The following arguments are listed in their order of operation.

### `filter`

Each collection in the GraphQL schema can be passed a `filter` argument to constrain your results, sifting for only what you want. Any leaf field should be able to be used in a filter.

The syntax for `filter` is based on a subset of [MongoDB's query syntax](https://docs.mongodb.com/manual/reference/operator/query/).

#### `filter` syntax

A filter is composed of a nested object with a shape that matches the path to the value you want to compare on every entry in the given collection. The deepest nested level that does not have a JSON object as its value will be used to build the comparison where the `key` is the comparison operation and `value` is the value to compare every entry against.

#### Example

```js
filter = { postMeta: { rating: { gt: 80 } } };

entries = [
  { id: 1, title: 'My pretzel collection', postMeta: { rating: 97 } },
  { id: 2, title: 'Debugging the simulation', postMeta: { rating: 20 } },
  {
    id: 3,
    title: 'Liquid Proust is a great tea vendor btw',
    postMeta: { rating: 99 },
  },
  { id: 4, title: 'Sitting in a chair', postMeta: { rating: 74 } },
];
```

The above filter would return entries with a rating greater than 80:

```js
result = [
  { id: 1, title: 'My pretzel collection', postMeta: { rating: 97 } },
  {
    id: 3,
    title: 'Liquid Proust is a great tea vendor btw',
    postMeta: { rating: 99 },
  },
];
```

#### Supported `filter` operations

- `eq` - equal
  - This is like `filterValue === resultValue` in JavaScript
- `ne` - not equal
  - This is like `filterValue !== resultValue` in JavaScript
- `in`
  - This is like `filterValue.includes(resultValue)` in JavaScript
  - Can only be passed an array of values which pass strict comparison
- `nin`
  - This is like `!filterValue.includes(resultValue)` in JavaScript
  - Can only be passed an array of values which pass strict comparison
- `includes`
  - This is like `resultValue.includes(filterValue)` in JavaScript
  - Can only be passed a single value which passes strict comparison
- `excludes`
  - This is like `!resultValue.includes(filterValue)` in JavaScript
  - Can only be passed a single value which passes strict comparison
- `lt`, `lte`, `gt`, `gte`
  - This is like `<`, `<=`, `>`, `>=` respectively
  - Can only be used with numbers, strings, and booleans
- `exists`
  - This is like `filterValue ? resultValue != undefined : resultValue == undefined`
  - Accepts `true` or `false` as a value to compare against (`filterValue`)
  - For checking against a property that could be both `null` or `undefined`
- `strictlyExists`
  - This is like `filterValue ? resultValue !== undefined : resultValue === undefined`
  - Accepts `true` or `false` as a value to compare against (`filterValue`)
  - Checking against a property for `undefined`
- `regex`
  - This is like new RegExp(filterValue).test(resultValue) in JavaScript
- `wildcard`
  - This is an abstraction on top of `regex` for loose string matching
  - Case insensitive
  - Uses [matcher](https://github.com/sindresorhus/matcher) and matcher's [API](https://github.com/sindresorhus/matcher#usage)

Caveats:

- Currently cannot infer date strings and then compare `Date` types in filters
  - should work if you dynamically pass in a `Date` object from your client, though not extensively tested
  - if you wanna take a shot at that, start a PR for [adding arg typeOf checks and subsequent unique comparator functions 🥪](https://github.com/tonyketcham/flatbread/blob/main/packages/core/src/utils/sift.ts)

#### Combining multiple filters

You can union multiple filters together by adding peer objects within your filter object to point to multiple paths.

#### Example

Using the `entries` from the previous example, let's combine multiple filters.

```graphql
query FilteredPosts {
  allPosts(
    filter: { title: { wildcard: "*tion" }, postMeta: { rating: { gt: 80 } } }
  ) {
    title
  }
}
```

Results in:

```js
result = [{ title: 'My pretzel collection' }];
```

### `sortBy`

Sorts by the given field. Accepts a root-level field name. Defaults to not sortin' at all.

### `order`

The direction of sorting. Accepts `ASC` or `DESC`. Defaults to `ASC`.

### `skip`

Skips the specified number of entries. Accepts an integer.

### `limit`

Limits the number of returned entries to the specified amount. Accepts an integer.

## Query within your app ❓❓

[Check out the playground for an example](https://github.com/tonyketcham/flatbread/tree/main/playground) of using Flatbread with SvelteKit to safely shoot off GraphQL queries using a static (or node) adapter.

## Field Overrides

field overrides allow you to define custom types or transforms for specific data based on what field it is in in the content

### Example

```js
{
  content: {
    ...
    overrides: [
      {
        // using the field name
        field: 'name'
        // the resulting type is string
        // this can be a custom gql type
        type: 'String',
        // capitalize the name
        resolve: name => capitalize(name)
      },
    ]
  }
}
```

### Supported syntax for field

- basic nested objects

  `nested.object`

- a basic array (will map array values)

  `an.array[]`

- a nested object inside an array (will also map array)

  `an.array[]with.object`

for more information in Overrides, they adhere to the GraphQLFieldConfig outlined here https://graphql-compose.github.io/docs/basics/what-is-resolver.html

# ☀️ Contributing

You're encouraged to [join our Slack](https://join.slack.com/t/flatbreadworkspace/shared_invite/zt-1bvnhr38j-oHFun85aGfaNp9qwizOORw) and ask questions! Let us know if anything is unclear - if so, that just means we need to improve our docs 😁 We can help set you off on the right foot so you don't feel like you're flying blind.

## **init**

Clone the entire monorepo! Once you've installed dependencies with `pnpm -w i`, start a development server:

## **development server** 🎒

This will run a dev server across packages in the monorepo

```bash
pnpm -w dev
```

## **working on a package** ⚒️

Open another **terminal** tab.

| ☝️ Keep the dev server running in your other tab |
| ------------------------------------------------ |

### Option 1: use the Playground as a demo project

This allows you to work in the full context of a Flatbread instance as an end-user would, except you can tinker with the `packages` internals.

```bash
cd playground
pnpm dev
```

This is a good option when you want to test without creating temporary clutter per-package that you wouldn't want to commit.

### Option 2: scope to a specific package

In the new tab, scope yourself into the specific package you wanna mess with.

```bash
cd packages/<package>
```

Run the file containing where you invoke your function at the top level.

```bash
node dist/index.mjs # ya need Node v16+
```

## **build for production** 📦

This will use `tsup` to build each package linked in the monorepo unless opted out per-package.

```bash
pnpm build
```

# 📓 Sidenotes

The transpiled TS files in the [`playground`](https://github.com/tonyketcham/flatbread/tree/main/playground) are being tracked in the repo to appease the Vite gods so I can develop quicker. As the project progresses, I'll likely yeet those outta here.

Huge shoutouts to [@antfu](https://github.com/antfu/) and [@sveltejs/kit](https://github.com/sveltejs/kit) for both having invaluable reference points to guide me through learning more advanced Node, Typescript, and monorepo design all in parallel during this project.
