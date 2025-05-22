"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { initializeDatabase } from "@/app/actions"

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const result = await initializeDatabase()
      if (result.success) {
        setIsInitialized(true)
      } else {
        setError(result.error || "Failed to initialize database")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup Required</CardTitle>
        <CardDescription>The database tables need to be created before you can use the application.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {isInitialized ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Database initialized successfully! You can now refresh the page to start using the application.
          </div>
        ) : (
          <p>Click the button below to set up the database tables.</p>
        )}
      </CardContent>
      <CardFooter>
        {!isInitialized && (
          <Button onClick={handleInitialize} disabled={isInitializing} className="w-full">
            {isInitializing ? "Initializing..." : "Initialize Database"}
          </Button>
        )}
        {isInitialized && (
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
