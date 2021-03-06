import { gql, useQuery } from "@apollo/client";

const query1 = gql`
  query foo {
    bar {
      baz
    }
  }
`;

const query2 = gql`
  query baz {
    a {
      b
    }
  }
`;

export function useRunQuery() {
  return useQuery(query1);
}
export function useRunQuery2() {
  return useQuery(query2);
}
