// pages/api/getLatestVote.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { Vote } from '@/types';

// TypeScript API handler function for getting the most recent vote
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method === 'GET') {
        try {
            // Get the most recent vote based on created_at
            const result = await sql<Vote[]>`
                SELECT *, created_at AT TIME ZONE 'UTC' AS utc_created_at FROM votes
                ORDER BY created_at DESC
                LIMIT 1;
            `;

            console.log(result.rows[0]);

            if (result.rows.length > 0) {
                // Return the latest vote as JSON
                res.status(200).json(result.rows[0]);
            } else {
                // Return an empty object if no votes are found
                res.status(200).json({});
            }
        } catch (error) {
            console.error('Error fetching the latest vote:', error);
            res.status(500).json({ error: 'Failed to fetch the latest vote' });
        }
    } else {
        // Method not allowed for other than GET requests
        res.status(405).json({ message: 'Method not allowed' });
    }
}
