// app/login/sign-in-form.tsx (Client Component)
"use client"

import React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { signInSchema } from "@/lib/zod"
import { ZodError } from "zod"
import { t, Lang } from "@/lib/i18n"

interface SignInFormProps {
  language: Lang
}

export default function SignInForm({ language }: SignInFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Validate form data with Zod
            const validatedData = signInSchema.parse(formData)

            // Attempt to sign in
            const result = await signIn("credentials", {
                email: validatedData.email,
                password: validatedData.password,
                redirect: false,
            })

            if (result?.error) {
                setError(t(language, "invalidCredentials"))
            } else if (result?.ok) {
                window.location.href = "/"
            }
        } catch (err) {
            if (err instanceof ZodError) {
                const firstError = err.errors[0]
                // Map Zod errors to localized messages
                if (firstError.path[0] === "email") {
                    setError(t(language, "invalidEmail"))
                } else if (firstError.path[0] === "password") {
                    setError(t(language, "passwordRequired"))
                } else {
                    setError(firstError.message)
                }
            } else {
                setError(t(language, "unexpectedError"))
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (error) setError(null)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="max-w-md w-full space-y-8 p-4">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        {t(language, "signInTitle")}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        {t(language, "signInSubtitle")}
                    </p>
                </div>

                <div className="bg-card text-card-foreground rounded-lg shadow-md p-8 border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">{t(language, "emailLabel")}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder={t(language, "emailPlaceholder")}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t(language, "passwordLabel")}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    placeholder={t(language, "passwordPlaceholder")}
                                    className="w-full pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? t(language, "hidePassword") : t(language, "showPassword")}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? t(language, "signingIn") : t(language, "signInButton")}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">
                                    {t(language, "orContinueWith")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => signIn("google", { redirectTo: "/" })}
                                disabled={true}
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {t(language, "continueWithGoogle")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-40 h-20 w-full"></div>
        </div>
    )
}