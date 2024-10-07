import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { Vote, Organization } from '@/types';

// Define a vibrant, professional color palette with easily distinguishable colors
const colorPalette = [
    '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#E377C2', '#17BECF', '#BCBD22',
];

let usedColorIndices = new Map(); // Keeps track of which color is assigned to each organization
let currentColorIndex = 0; // Tracks the current color index to ensure no repeats

// Function to map organization name to a unique color
const getColorForOrganization = (organizationName: string) => {
    if (!usedColorIndices.has(organizationName)) {
        usedColorIndices.set(organizationName, colorPalette[currentColorIndex]);
        currentColorIndex = (currentColorIndex + 1) % colorPalette.length;
    }
    return usedColorIndices.get(organizationName);
};

export default function Home() {
    const [lastVoteTimestamp, setLastVoteTimestamp] = useState<string | null>(null);
    const pollVotes = useRef<NodeJS.Timeout | null>(null);

    const presetOrganizations = [
        { name: 'Organization 1', logoUrl: 'https://via.placeholder.com/50/FF6347/FFFFFF?text=Org1', bgColor: '#FF6347' },
        { name: 'Organization 2', logoUrl: 'https://via.placeholder.com/50/4682B4/FFFFFF?text=Org2', bgColor: '#4682B4' },
        { name: 'Organization 3', logoUrl: 'https://via.placeholder.com/50/32CD32/FFFFFF?text=Org3', bgColor: '#32CD32' },
        { name: 'Organization 4', logoUrl: 'https://via.placeholder.com/50/FFD700/FFFFFF?text=Org4', bgColor: '#FFD700' },
        { name: 'Organization 5', logoUrl: 'https://via.placeholder.com/50/8A2BE2/FFFFFF?text=Org5', bgColor: '#8A2BE2' },
    ];

    const initializeVotes = async () => {
        try {
            const res = await fetch('/api/getLatestVote');
            const vote = await res.json();
            const latestVoteTimestamp = vote.utc_created_at;
            setLastVoteTimestamp(latestVoteTimestamp || '2024-01-01 00:00:00');
        } catch (error) {
            console.error('Error initializing votes:', error);
        }
    };

    useEffect(() => {
        initializeVotes();

        const pollInterval = 1000;

        const fetchVotes = async () => {
            try {
                const res = await fetch(`/api/getVotes?lastVoteTimestamp=${encodeURIComponent(lastVoteTimestamp || '')}`);
                const newVotes = await res.json();

                if (newVotes.length > 0) {
                    newVotes.forEach((vote: Vote) => {
                        triggerNotification(vote.organization_name, vote.logo_url);
                    });
                    const latestVoteTimestamp = newVotes[newVotes.length - 1].utc_created_at;
                    setLastVoteTimestamp(latestVoteTimestamp);
                }
            } catch (error) {
                console.error('Error fetching votes:', error);
            }
        };

        if (lastVoteTimestamp) {
            pollVotes.current = setInterval(fetchVotes, pollInterval);
        }

        return () => {
            if (pollVotes.current) {
                clearInterval(pollVotes.current);
            }
        };
    }, [lastVoteTimestamp]);

    const triggerNotification = (organizationName: string, logoUrl: string) => {
        toast(
            <div className="flex items-center text-lg justify-between" style={{ padding: '10px', borderRadius: '8px' }}>
                <div className="flex items-center flex-grow">
                    <img
                        src={logoUrl}
                        alt={organizationName}
                        className="w-16 h-16 mr-4"
                    />
                    <span className="font-bold">Vote casted for {organizationName}</span>
                </div>
                <CheckCircleIcon className="w-8 h-8 flex-shrink-0" style={{color: getColorForOrganization(organizationName)}} /> {/* Custom vote icon aligned to the right */}
            </div>,
            {
                autoClose: 3000,
                closeButton: false,
                progressStyle: {
                    background: getColorForOrganization(organizationName), // Apply the dynamic background color
                },
            }
        );

        confetti({
            particleCount: 50,
            spread: 50,
            startVelocity: 30,
            gravity: 0.8,
            origin: { x: Math.random(), y: 0.5 },
            shapes: ['square'],
            colors: ['#c5c6c7', '#a6a8ab', '#6d6f71'],
        });
    };

    const triggerVote = async (organization: Organization) => {
        try {
            await fetch('/api/insertVote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationName: organization.name,
                    logoUrl: organization.logoUrl,
                }),
            });
        } catch (error) {
            console.error('Error casting vote:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex flex-col items-start p-4 space-y-4">
                <img
                    src="https://assets.medtechinnovator.org/wp-content/uploads/2016/07/08103054/Medtech_Logo_Color-e1467418814934.png"
                    alt="Medtech Innovator Logo"
                    className="h-16 w-auto mb-4"
                />
                <div className="flex flex-col space-y-4">
                    {presetOrganizations.map((org, index) => (
                        <button
                            key={index}
                            onClick={() => triggerVote(org)}
                            className="bg-gray-800 text-white px-6 py-2 text-lg rounded shadow-md hover:bg-gray-700 transition duration-300"
                        >
                            Vote for {org.name}
                        </button>
                    ))}
                </div>
            </div>
            <ToastContainer position="top-center" style={{ width: '500px' }} />
        </div>
    );
}
