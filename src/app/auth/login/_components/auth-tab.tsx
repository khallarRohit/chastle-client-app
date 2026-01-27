"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import SignUpTab from './sign-up-tab'
import { SocialAuthButtons } from './social-auth-buttons'
import { useState } from 'react'
import { EmailVerification } from './email-verification'
import { ForgotPassword } from './forgot-password'
import SignInTab from './sign-in-tab'

type Tab = "signin" | "signup" | "email-verification" | "forgot-password"

export default function AuthTab() {

  const [email, setEmail] = useState("test@gmail.com")
  const [selectedTab, setSelectedTab] = useState<Tab>("signin")

  function openEmailVerificationTab(email: string) {
    setEmail(email)
    setSelectedTab("email-verification")
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={t => setSelectedTab(t as Tab)}
      className="max-auto w-full my-6 px-4"
    >
      {(selectedTab === "signin" || selectedTab === "signup") && (
        <TabsList>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
       )}
    <TabsContent value="signin">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInTab
              openEmailVerificationTab={openEmailVerificationTab}
              openForgotPassword={() => setSelectedTab("forgot-password")}
            ></SignInTab>
          </CardContent>

          <Separator/>

          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButtons />
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpTab
            openEmailVerificationTab={openEmailVerificationTab}
            ></SignUpTab>
          </CardContent>

          <Separator />

          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButtons />
            hello futter
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="email-verification">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerification email={email} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forgot-password">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPassword openSignInTab={() => setSelectedTab("signin")} />
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>


  )  
}