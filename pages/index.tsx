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
            // Randomize toast position
            const randomTop = Math.floor(Math.random() * 80); // Random vertical position
            const randomLeft = Math.floor(Math.random() * 80); // Random horizontal position

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

            // Trigger confetti animation at a random position
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: Math.random(), // Random X position
                    y: Math.random(), // Random Y position
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
