// Define a TypeScript interface for the vote object
export interface Vote {
    id: number;
    organization_name: string;
    created_at: string;
    utc_created_at: string; // The UTC-converted timestamp
}