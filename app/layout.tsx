import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/nav"
import { getSetting, isDatabaseConnected, isDatabaseInitialized } from "@/lib/db"
import DatabaseReconnect from "@/components/db-reconnect"
import { DatabaseInitializer } from "@/components/db-initializer"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

const METADATA = {
  en: {
    title: "Box Count Tracker",
    description: "Track and analyze box count data.",
  },
  pl: {
    title: "Statystyki Pojemników",
    description: "Śledź i analizuj dane dotyczące liczby pojemników.",
  },
} as const;

async function getLanguageSetting(): Promise<"en" | "pl"> {
  try {
    // First check if database is connected before attempting to get setting
    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      console.log("Database not connected, falling back to 'en' for language setting");
      return "en";
    }
    
    const language = await getSetting("language");
    return language === "pl" ? "pl" : "en";
  } catch (error) {
    console.error("Failed to get language setting from database, falling back to 'en':", error);
    return "en";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const lang = await getLanguageSetting();
    return METADATA[lang];
  } catch (error) {
    console.error("Failed to generate metadata, using default 'en':", error);
    return METADATA.en;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get language setting with fallback and connection check
  let lang: "en" | "pl" = "en";
  let dbConnectionState = false;
  let dbInitializedState = false;
  
  try {
    // Step 1: Check database connection first
    dbConnectionState = await isDatabaseConnected();
    
    if (!dbConnectionState) {
      console.log("Database not connected in root layout, using default language 'en'");
    } else {
      // Step 2: If connected, get language setting
      lang = await getLanguageSetting();
      
      // Step 3: Check if database is initialized
      try {
        dbInitializedState = await isDatabaseInitialized();
      } catch (error) {
        console.error("Error during isDatabaseInitialized() call:", error);
        // If initialization check fails, connection might be unstable
        dbConnectionState = false; // Treat as connection issue
      }
    }
  } catch (error) {
    console.error("Error in root layout database operations, using defaults:", error);
    // All states keep their default values (false/en)
  }

  // Determine what to render in main content
  let mainContent: React.ReactNode;
  
  if (!dbConnectionState) {
    // Database connection issue
    mainContent = <DatabaseReconnect initialCheckThrewError={true} />;
  } else if (!dbInitializedState) {
    // Database connected but not initialized
    mainContent = <DatabaseInitializer />;
  } else {
    // Database connected and initialized - show children
    mainContent = children;
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
      <Analytics />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col ">
            <MainNav language={lang} />
            <main className="flex-1 p-8">
              {mainContent}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}