import { gql, useQuery } from "@apollo/client";
import { abc } from "whatever";
import def from "def";

const fragement = gql`
  fragment a on B {
    abc {
      def
    }
  }
`;

const query = gql`
  query foo {
    bar {
      baz
      ...B
    }
  }
  ${fragement}
`;

const differentTTL = abc`
  abcd
`;

const thirdTTL = def`
  this will be not transformed
`;

export function useRunQuery() {
  return useQuery(query);
}
