import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Settings, PlusCircle, Database } from "lucide-react"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 px-8 h-16 border-b">
      <Link href="/" className="text-xl font-bold flex items-center">
        <Database className="mr-2 h-5 w-5" />
        <span>Box Count Tracker</span>
      </Link>
      <div className="ml-auto flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-sm">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/entries">
          <Button variant="ghost" size="sm" className="text-sm">
            <Database className="mr-2 h-4 w-4" />
            Entries
          </Button>
        </Link>
        <Link href="/statistics">
          <Button variant="ghost" size="sm" className="text-sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistics
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="text-sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Link href="/imports">
          <Button variant="ghost" size="sm" className="text-sm">
            <Database className="mr-2 h-4 w-4" />
            Import
          </Button>
        </Link>
        <Link href="/entries/new">
          <Button size="sm" className="text-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>
    </nav>
  )
}
