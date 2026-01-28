import { gql } from "../../../generated/gql";

export const ME_QUERY = gql(`
  query me {
    User {
      id
      username
      email
      emailVerified
    }
  }
`);