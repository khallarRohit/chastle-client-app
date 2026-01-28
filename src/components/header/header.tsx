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

    const [logout, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION, {
        onCompleted: async () => {
            await client.clearStore(); // Clear Apollo Cache
            router.refresh(); // Refresh Server Components
            router.push("/auth/login");
        }
    });

    if (loading) return <div className="w-20 h-9 bg-muted animate-pulse rounded" />;

    const user = data?.User;


    if (!user) {
        return (
        <Link href="/auth/login">
            <Button variant="ghost">Log In</Button>
        </Link>
        );
    }

    return (
        <div className="flex items-center gap-4">
        {/* 1. Verification Warning (if not verified) */}
        {!user.emailVerified && (
            <div className="flex items-center gap-2">
            <span className="text-xs text-yellow-600 hidden md:block">
                Email not verified
            </span>
            <Link href={`/auth/verify-email?email=${user.email}`}>
                <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                Verify Now
                </Button>
            </Link>
            </div>
        )}

        {/* 2. User Greeting (Optional) */}
        <span className="text-sm font-medium hidden sm:block">
            {user.username}
        </span>

        {/* 3. Logout Button */}
        <Button 
            variant="ghost" 
            onClick={() => logout()} 
            disabled={logoutLoading}
        >
            <LoadingSwap isLoading={logoutLoading}>Log Out</LoadingSwap>
        </Button>
        </div>
    );


}
