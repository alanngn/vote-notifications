import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import confetti from 'canvas-confetti';

export default function Home() {
    const [organizationName] = useState('Random Org'); // Placeholder for demo
    const [logoUrl] = useState('https://via.placeholder.com/50'); // Placeholder image for demo

    // Function to trigger toast notification and confetti
    const triggerVote = async () => {
        try {
            // Show toast notification with no close button
            toast(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={logoUrl} // Use logo from API response
                        alt={organizationName}
                        style={{ width: '50px', height: '50px', marginRight: '10px' }}
                    />
                    <span>Vote casted for {organizationName}</span>
                </div>,
                {
                    autoClose: 3000,
                    closeButton: false, // Removes the X close button
                }
            );

            // Trigger confetti animation with random Y position starting from at least 1/3 down the page
            const randomY = 0.33 + Math.random() * 0.67; // Y position between 1/3 and the bottom of the page
            const randomX = Math.random(); // X position anywhere across the width

            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: randomX, // Random X position (0 to 1)
                    y: randomY, // Random Y position between 0.33 and 1
                },
                shapes: ['circle'],
                colors: ['#bbdefb', '#ffcc80', '#ff8a65'],
            });
        } catch (error) {
            console.error('Error casting vote:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Vote Casting Demo</h1>
            <button onClick={triggerVote} style={{ padding: '10px 20px', fontSize: '16px' }}>
                Cast Random Vote
            </button>

            <ToastContainer />
        </div>
    );
}
