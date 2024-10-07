// pages/api/getVotes.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import { Vote } from '@/types'


// TypeScript API handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { lastVoteTimestamp } = req.query as { lastVoteTimestamp: string};

    console.log('Last Vote Timestamp:', lastVoteTimestamp);

    if (req.method === 'GET') {
        try {
            // Fallback to an early timestamp if none is provided
            const result = await sql<Vote[]>`
        SELECT *, created_at AT TIME ZONE 'UTC' AS utc_created_at FROM votes
        WHERE created_at > ${lastVoteTimestamp}::timestamp + interval '1 millisecond'
        ORDER BY created_at ASC;
      `;

            // Log the fetched votes
            console.log('Fetched Votes:', result.rows);

            // Return the result as JSON with proper typing
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching votes:', error);
            res.status(500).json({ error: 'Failed to fetch votes' });
        }
    } else {
        // Method not allowed for other than GET requests
        res.status(405).json({ message: 'Method not allowed' });
    }
}
