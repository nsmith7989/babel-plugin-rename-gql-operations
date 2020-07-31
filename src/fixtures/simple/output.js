import { gql, useQuery } from "@apollo/client";
import { abc } from "whatever";
const fragement = gql`
  fragment a on B {
    abc {
      def
    }
  }
`;
const query = gql`
  query renamed {
    bar {
      baz
      ...B
    }
  }
  ${fragment}
`;
const differentTTL = abc`
  abcd
`;
export function useRunQuery() {
  return useQuery(query);
}
