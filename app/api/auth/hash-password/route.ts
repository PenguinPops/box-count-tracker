// pages/api/auth/hash-password/route.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const { password } = req.body
        if (!password) {
            return res.status(400).json({ message: 'Password is required' })
        }

        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)
        return res.status(200).json({ hashedPassword })
    } catch (error) {
        return res.status(500).json({ message: 'Error hashing password' })
    }
}