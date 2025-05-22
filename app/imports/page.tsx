import { getCompanies } from "@/lib/db"
import CSVImport from "@/components/csv-import"
import { MainNav } from "@/components/nav"

export default async function ImportPage() {
    const companies = await getCompanies()

    if (!companies || companies.length === 0) {
        return (
            <div className="flex min-h-screen flex-col">
                <MainNav />
                <div className="container mx-auto py-8 space-y-4">
                    <h1 className="text-2xl font-bold">Import Entries from CSV</h1>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">No companies found in database.</span>
                        <div className="mt-4">
                            <a
                                href="/companies"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Go to Companies Management
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <div className="container mx-auto py-8">
                <CSVImport companies={companies} />
            </div>
        </div>
    )
}