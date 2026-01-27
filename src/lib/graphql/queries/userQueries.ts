import { gql } from "../../../generated/gql";

export const ME_QUERY = gql(`
  query getUser {
    getUser {
      id
      username
      email
      emailVerified
    }
  }
`);