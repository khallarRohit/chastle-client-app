/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateUser($username: String!, $email: String!, $password: String!) {\n    createUser(data: { username: $username, email: $email, password: $password }) {\n      id\n      username\n      email\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation VerifyEmailOtp($code: String!) {\n    verifyEmailOtp(code: $code)\n  }\n": typeof types.VerifyEmailOtpDocument,
    "\n  mutation ResendVerificationOtp($email: String!) {\n    resendVerificationOtp(email: $email)\n  }\n": typeof types.ResendVerificationOtpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      status\n      user {\n        id\n        username\n        email\n        emailVerified\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  query me {\n    User {\n      id\n      username\n      email\n      emailVerified\n    }\n  }\n": typeof types.MeDocument,
};
const documents: Documents = {
    "\n  mutation CreateUser($username: String!, $email: String!, $password: String!) {\n    createUser(data: { username: $username, email: $email, password: $password }) {\n      id\n      username\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation VerifyEmailOtp($code: String!) {\n    verifyEmailOtp(code: $code)\n  }\n": types.VerifyEmailOtpDocument,
    "\n  mutation ResendVerificationOtp($email: String!) {\n    resendVerificationOtp(email: $email)\n  }\n": types.ResendVerificationOtpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      status\n      user {\n        id\n        username\n        email\n        emailVerified\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  query me {\n    User {\n      id\n      username\n      email\n      emailVerified\n    }\n  }\n": types.MeDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateUser($username: String!, $email: String!, $password: String!) {\n    createUser(data: { username: $username, email: $email, password: $password }) {\n      id\n      username\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($username: String!, $email: String!, $password: String!) {\n    createUser(data: { username: $username, email: $email, password: $password }) {\n      id\n      username\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation VerifyEmailOtp($code: String!) {\n    verifyEmailOtp(code: $code)\n  }\n"): (typeof documents)["\n  mutation VerifyEmailOtp($code: String!) {\n    verifyEmailOtp(code: $code)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResendVerificationOtp($email: String!) {\n    resendVerificationOtp(email: $email)\n  }\n"): (typeof documents)["\n  mutation ResendVerificationOtp($email: String!) {\n    resendVerificationOtp(email: $email)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      status\n      user {\n        id\n        username\n        email\n        emailVerified\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      status\n      user {\n        id\n        username\n        email\n        emailVerified\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query me {\n    User {\n      id\n      username\n      email\n      emailVerified\n    }\n  }\n"): (typeof documents)["\n  query me {\n    User {\n      id\n      username\n      email\n      emailVerified\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;