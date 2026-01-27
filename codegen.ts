import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:8000/graphql",
  
  // 👇 1. UPDATE THIS: Look for .ts AND .tsx files so it finds your mutations
  documents: ["src/**/*.{ts,tsx}"],
  
  generates: {
    // 👇 2. Output folder
    "src/generated/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql", // This lets you use `gql` instead of `graphql`
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;