"use client"

import { AuthActionButton } from "@/components/auth/better-auth-action-button"
import { RESEND_OTP_MUTATION, VERIFY_EMAIL_OTP_MUTATION } from "@/lib/graphql/mutations/authMutations"
import { useMutation } from "@apollo/client/react"
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/ui/loading-swap"


export function EmailVerification({ email }: { email: string }) {
    const router = useRouter()
    const [otp, setOtp] = useState("")

    const [timeToNextResend, setTimeToNextResend] = useState(30)
    const interval = useRef<NodeJS.Timeout>(undefined)

    const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_EMAIL_OTP_MUTATION)
    const [resendOtp] = useMutation(RESEND_OTP_MUTATION)

    useEffect(() => {
        startEmailVerificationCountdown()
    }, [])

    function startEmailVerificationCountdown(time = 30) {
        setTimeToNextResend(time)

        clearInterval(interval.current)
        interval.current = setInterval(() => {
        setTimeToNextResend(t => {
            const newT = t - 1

            if (newT <= 0) {
            clearInterval(interval.current)
            return 0
            }
            return newT
        })
        }, 1000)
    }

    async function handleVerify() {
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit code.")
            return
        }

        try {
            const { data } = await verifyOtp({ variables: { code: otp } })
            console.log("sent otp");

            if (data?.verifyEmailOtp) {
                toast.success("Email verified successfully!")
                // Refresh to update session cookies/state
                window.location.href = "/" 
            }
        } catch (error: any) {
            toast.error(error.message || "Verification failed")
        }
    }

    return (
        <div className="space-y-4">
            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                    Please enter it below.
                </p>
            </div>
            <div className="flex justify-center py-2">
                <InputOTP 
                    maxLength={6} 
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={verifying}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>

           <Button 
                className="w-full" 
                onClick={handleVerify} 
                disabled={verifying || otp.length < 6}
            >
                <LoadingSwap isLoading={verifying}>Verify Account</LoadingSwap>
            </Button>

            <AuthActionButton
                variant="outline"
                className="w-full"
                successMessage="Code resent successfully!"
                disabled={timeToNextResend > 0}
                action={async () => {
                    try {
                        startEmailVerificationCountdown()
                        const res = await resendOtp({ variables: { email } });
                        const message = res.error?.message;

                        if(message){
                            return {error: {message}};
                        }else{
                            return {error: null};
                        }
                    } catch (error: any) {
                        return { 
                            error: { message: error.message || "Failed to resend" } 
                        }
                    }
                }}
            >
                {timeToNextResend > 0
                    ? `Resend code in ${timeToNextResend}s`
                    : "Resend Code"}
            </AuthActionButton>
        </div>
    )

}