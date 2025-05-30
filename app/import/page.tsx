import { getCompanies, getSetting } from "@/lib/db"
import CSVImport from "@/components/csv-import"
import { Company } from "@/app/types"
import { t, Lang } from "@/lib/i18n"

export default async function ImportPage() {
    const [companiesData, languageSetting] = await Promise.all([
        getCompanies(),
        getSetting("language")
    ])
    
    const companies: Company[] = companiesData.map((company) => ({
        id: company.id,
        name: company.name
    }))

    const language: Lang = languageSetting as Lang;

    if (!companies || companies.length === 0) {
        return (
            <>
                <div className="container mx-auto py-8 space-y-4">
                    <h1 className="text-2xl font-bold">{t(language, "importCSVEntries")}</h1>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{t(language, "noCompaniesFound")}</span>
                        <div className="mt-4">
                            <a
                                href="/companies"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {t(language, "goToCompanies")}
                            </a>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="container mx-auto py-8">
                <CSVImport companies={companies} lang={language} />
            </div>
        </>
    )
}