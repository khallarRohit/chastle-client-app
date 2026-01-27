"use client"

import { AuthActionButton } from "@/components/auth/better-auth-action-button"
import { Button } from "@/components/ui/button"
// import { authClient } from "@/lib/auth/auth-client"
import {
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  SUPPORTED_OAUTH_PROVIDERS,
} from "@/lib/auth/o-auth-provider"
import "dotenv/config"

export function SocialAuthButtons() {
  return SUPPORTED_OAUTH_PROVIDERS.map(provider => {
    const Icon = SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].Icon

    return (
      <AuthActionButton
        variant="outline"
        key={provider}
        action={async () => {
              window.location.href = `http://localhost:8000/auth/${provider}`;
              return { error: null }; 
        }}
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}
      </AuthActionButton>
    )
  })
}