"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/graphql/queries/userQueries";
import { LOGOUT_MUTATION } from "@/lib/graphql/mutations/authMutations";
import { useRouter } from "next/navigation";
import { LoadingSwap } from "@/components/ui/loading-swap";

export function HeaderAuth() {
    const router = useRouter();

    const { data, loading, client } = useQuery(ME_QUERY, {
        fetchPolicy: "network-only" // Always check fresh status
    });



}
