"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Capitalise, deleteEntriesClient } from "@/lib/utils"
import { t, Lang } from "@/lib/i18n"

export default function EntriesTable({
    initialEntries,
    companyNames = [],
    lang,
    showActions = false
}: {
    initialEntries: any[]
    companyNames: string[]
    lang: Lang
    showActions?: boolean
}) {
    const [entries, setEntries] = useState(initialEntries)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [loading, setLoading] = useState(false)

    const [sortKey, setSortKey] = useState<string>("entry_date")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [filterText, setFilterText] = useState("")

    const [selectedCompany, setSelectedCompany] = useState<string>("")
    const companies = companyNames

    useEffect(() => {
        console.log("Initial entries:", initialEntries)
        console.log("Current entries:", entries)
        console.log("Selected IDs:", selectedIds)
        console.log("Sort key/order:", sortKey, sortOrder)
        console.log("Filter text:", filterText)
    }, [entries, selectedIds, sortKey, sortOrder, filterText])

    const toggleSelectAll = () => {
        const allSelected = selectedIds.length === entries.length
        setSelectedIds(allSelected ? [] : entries.map(entry => entry.id))
        console.log("Toggle select all:", !allSelected)
    }

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
        console.log("Toggle select:", id)
    }

    const handleDelete = async () => {
        if (!selectedIds.length) return
        setLoading(true)
        console.log("Deleting IDs:", selectedIds)

        await deleteEntriesClient(selectedIds)

        setEntries(prev => prev.filter(e => !selectedIds.includes(e.id)))
        setSelectedIds([])
        setLoading(false)
    }

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortOrder("asc")
        }
        console.log("Sorting by:", key)
    }

    const filteredAndSortedEntries = [...entries]
        .filter(entry => {
            const matchesCompany =
                !selectedCompany || entry.company.toLowerCase() === selectedCompany.toLowerCase()
            const matchesText = entry.company.toLowerCase().includes(filterText.toLowerCase())
            return matchesCompany && matchesText
        })
        .sort((a, b) => {
            let valA = a[sortKey]
            let valB = b[sortKey]
            if (sortKey === "entry_date") {
                valA = new Date(valA)
                valB = new Date(valB)
            }
            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
            }
            if (valA < valB) return sortOrder === "asc" ? -1 : 1
            if (valA > valB) return sortOrder === "asc" ? 1 : -1
            return 0
        })

    if (!entries.length) {
        return (
            <div className="text-center py-6">
                <p className="text-muted-foreground">{t(lang, "noEntries")}</p>
                {showActions && (
                    <Link href="/entries/new">
                        <Button variant="outline" className="mt-2">
                            {t(lang, "addFirstEntry")}
                        </Button>
                    </Link>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="flex gap-4 items-center mb-4">
                <input
                    type="text"
                    placeholder={t(lang, "filterByCompany")}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="border px-3 py-2 rounded-md w-64 hidden sm:block"
                />

                <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="border px-3 py-2 rounded-md w-auto"
                >
                    <option value="">{t(lang, "allCompanies")}</option>
                    {companies.map((name, idx) => (
                        <option key={idx} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedIds.length > 0 && showActions && (
                <div className="flex justify-end mb-4">
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {selectedIds.length === entries.length ? t(lang, "deleteAll") : t(lang, "deleteSelected")}
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-center py-3 px-2">
                                {showActions && (
                                    <Checkbox
                                        checked={selectedIds.length === entries.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                )}
                            </th>
                            <th
                                className="text-left py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("entry_date")}
                            >
                                {t(lang, "date")} {sortKey === "entry_date" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="text-left py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("company")}
                            >
                                {t(lang, "company")} {sortKey === "company" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="text-right py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("e2in")}
                            >
                                {t(lang, "e2Intake")} {sortKey === "e2in" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="text-right py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("e1in")}
                            >
                                {t(lang, "e1Intake")} {sortKey === "e1in" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="text-right py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("e2out")}
                            >
                                {t(lang, "e2Output")} {sortKey === "e2out" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="text-right py-3 px-2 cursor-pointer"
                                onClick={() => handleSort("e1out")}
                            >
                                {t(lang, "e1Output")} {sortKey === "e1out" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="text-center py-3 px-2">{t(lang, "photo")}</th>
                            {showActions && <th className="text-center py-3 px-2">{t(lang, "actions")}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedEntries.map((entry) => (
                            <tr key={entry.id} className="border-b hover:bg-muted/50">
                                <td className="text-center py-3 px-2">
                                    {showActions && (
                                        <Checkbox
                                            checked={selectedIds.includes(entry.id)}
                                            onCheckedChange={() => toggleSelect(entry.id)}
                                        />
                                    )}
                                </td>
                                <td className="py-3 px-2">
                                    {new Date(entry.entry_date).toLocaleDateString(lang === "pl" ? "pl-PL" : "en-US")}
                                </td>
                                <td className="py-3 px-2">{entry.company}</td>
                                <td className="text-right py-3 px-2">{Math.floor(entry.e2in)}</td>
                                <td className="text-right py-3 px-2">{Math.floor(entry.e1in)}</td>
                                <td className="text-right py-3 px-2">{Math.floor(entry.e2out)}</td>
                                <td className="text-right py-3 px-2">{Math.floor(entry.e1out)}</td>
                                <td className="text-center py-3 px-2">
                                    {entry.photo_url ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <ImageIcon className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <div className="aspect-video overflow-hidden rounded-md">
                                                    <img
                                                        src={entry.photo_url}
                                                        alt={t(lang, "proofForEntry").replace("{id}", entry.id.toString())}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </td>
                                {showActions && (
                                    <td className="text-center py-3 px-2">
                                        <Link href={`/entries/${entry.id}/edit`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}