export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
};

export type FriendRequestType = {
  __typename?: 'FriendRequestType';
  createdAt: Scalars['DateTimeISO']['output'];
  id: Scalars['ID']['output'];
  receiver: UserType;
  sender: UserType;
  status: Scalars['String']['output'];
};

/** The variant of chess being played */
export enum GameVariant {
  Blitz = 'BLITZ',
  Bullet = 'BULLET',
  Classical = 'CLASSICAL',
  Rapid = 'RAPID'
}

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  status: Scalars['String']['output'];
  user?: Maybe<UserType>;
};

export type Mutation = {
  __typename?: 'Mutation';
  Login: LoginResponse;
  createUser: UserType;
  logout: Scalars['Boolean']['output'];
  updateProfile: UserType;
  verifyMfa: Scalars['Boolean']['output'];
};


export type MutationLoginArgs = {
  data: LoginInput;
};


export type MutationCreateUserArgs = {
  data: UserInput;
};


export type MutationUpdateProfileArgs = {
  data: UpdateProfileInput;
};


export type MutationVerifyMfaArgs = {
  code: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  pendingFriendRequests: Array<FriendRequestType>;
};

export type Rating = {
  __typename?: 'Rating';
  rating: Scalars['Float']['output'];
  rd?: Maybe<Scalars['Float']['output']>;
  user?: Maybe<UserType>;
  userId: Scalars['String']['output'];
  variant: GameVariant;
  volatility: Scalars['Float']['output'];
};

export type UpdateProfileInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
};

export type UserInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type UserType = {
  __typename?: 'UserType';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mfaEnabled: Scalars['Boolean']['output'];
  ratings?: Maybe<Array<Rating>>;
  updatedAt: Scalars['DateTimeISO']['output'];
  username: Scalars['String']['output'];
};

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'UserType', id: string, username: string, email: string } };

export type LoginUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginUserMutation = { __typename?: 'Mutation', Login: { __typename?: 'LoginResponse', status: string, user?: { __typename?: 'UserType', id: string, username: string } | null } };
