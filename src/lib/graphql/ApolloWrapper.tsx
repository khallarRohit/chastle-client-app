"use client";

import {
    HttpLink,
    ApolloClient,
    InMemoryCache,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

function makeClient() {
    const httpLink = new HttpLink({
        uri: "http://localhost:8000/graphql",
        credentials: "include", 
    });

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });
}

const client = makeClient();

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}