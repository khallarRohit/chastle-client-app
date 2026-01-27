import { DiscordIcon, GitHubIcon } from "@/components/auth/o-auth-icons"
import { ComponentProps, ElementType } from "react"

export const SUPPORTED_OAUTH_PROVIDERS = ["github", "google"] as const
export type SupportedOAuthProvider = (typeof SUPPORTED_OAUTH_PROVIDERS)[number]

export const SUPPORTED_OAUTH_PROVIDER_DETAILS: Record<
  SupportedOAuthProvider,
  { name: string; Icon: ElementType<ComponentProps<"svg">> }
> = {
  google: { name: "Google", Icon: DiscordIcon },
  github: { name: "GitHub", Icon: GitHubIcon },
}