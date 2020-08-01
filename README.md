# babel-plugin-rename-gql-operations

Rename graphql operation names

# Motivation

If your gql backend requires specific gql names, but those names are not known at author time

# Example

Input:

```
import gql from 'graphql-tag';
// if using apollo v3
import { gql } from '@apollo/client';

const foo = gql` query foo { bar } `
```

```
"nameMapping": {
  "foo": "renameFoo"
}
```

Output:

```
const foo = gql` query renameFoo { bar } `
```

## .babelrc

```
{
"plugins": [
    [
      "rename-gql-operations",
      {
        "nameMapping": {
          # your specific mappings
        },
        "importSources": [] # defaults to `["graphql-tag", "@apollo/client"]`
      }
    ]
  ]
}
```
