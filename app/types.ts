// This file contains the TypeScript interfaces for the application.
// @/app/types

export interface Company {
    id: number
    name: string
}

export interface Entry {
    id: number
    entry_date: string
    company_id: number
    E2in: number
    E1in: number
    E2out: number
    E1out: number
    photo_url: string | null
    is_starting_balance: boolean
}