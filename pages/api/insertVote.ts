// pages/api/insertVote.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { Vote } from '@/types';

// TypeScript API handler function for inserting a new vote
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method === 'POST') {
        const { organizationName} = req.body as { organizationName: string, logoUrl: string };

        try {
            // Insert a new vote with a default created_at timestamp
            const result = await sql<Vote[]>`
        INSERT INTO votes (organization_name)
        VALUES (${organizationName})
        RETURNING *;
      `;

            // Respond with the inserted row data
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(500).json({ error: 'Failed to insert vote' });
            }
        } catch (error) {
            console.error('Error inserting vote:', error);
            res.status(500).json({ error: 'Failed to insert vote' });
        }
    } else {
        // Method not allowed for other than POST requests
        res.status(405).json({ message: 'Method not allowed' });
    }
}
