import React, { useState, useEffect, useRef } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import confetti from "canvas-confetti";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router"; // Import useRouter to access query params
import { Vote } from "@/types";

// Define a vibrant, professional color palette with easily distinguishable colors
const colorPalette = [
  "#1F77B4",
  "#FF7F0E",
  "#2CA02C",
  "#D62728",
  "#9467BD",
  "#E377C2",
  "#17BECF",
  "#BCBD22",
];

const usedColorIndices = new Map(); // Keeps track of which color is assigned to each organization
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
  const [lastVoteTimestamp, setLastVoteTimestamp] = useState<string | null>(
    null
  );
  const pollVotes = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter(); // Use useRouter to access query parameters

  const presetOrganizations = [
    { name: "samay" },
    { name: "flowmedical" },
    { name: "brainspace" },
    { name: "juniperbiomedical" },
    { name: "neurobionics" },
  ];

  const initializeVotes = async () => {
    try {
      const res = await fetch("/api/getLatestVote");
      const vote = await res.json();
      const latestVoteTimestamp = vote.utc_created_at;
      setLastVoteTimestamp(latestVoteTimestamp || "2024-01-01 00:00:00");
    } catch (error) {
      console.error("Error initializing votes:", error);
    }
  };

  useEffect(() => {
    initializeVotes();
  }, []);

  useEffect(() => {
    const pollInterval = 500;

    const fetchVotes = async () => {
      try {
        const res = await fetch(
          `/api/getVotes?lastVoteTimestamp=${encodeURIComponent(
            lastVoteTimestamp || ""
          )}`
        );
        const newVotes = await res.json();
        console.log(newVotes, "newVotes", lastVoteTimestamp);
        if (newVotes.length > 0) {
          newVotes.forEach((vote: Vote) => {
            triggerNotification(vote.organization_name);
          });
          const latestVoteTimestampNew =
            newVotes[newVotes.length - 1].utc_created_at;
          console.log(newVotes, newVotes[newVotes.length - 1], "new votes");
          console.log(latestVoteTimestampNew, "latestTimestamp");
          setLastVoteTimestamp(latestVoteTimestampNew);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
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

  const triggerNotification = (organizationName: string) => {
    const id = toast(
      <div
        className="flex items-center text-lg justify-between"
        style={{
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <div className="flex items-center flex-grow">
          <img
            src={`/${organizationName}.png`}
            alt={organizationName}
            className="h-14 mr-4"
          />
        </div>
      </div>,
      {
        autoClose: 3000,
        closeButton: false,
        progressStyle: {
          background: getColorForOrganization(organizationName), // Apply the dynamic background color
        },
        style: {
          position: "absolute",
          left: Math.floor(Math.random() * 500),
          top: Math.floor(Math.random() * 500),
        },
      }
    );
    confetti({
      particleCount: 50,
      spread: 50,
      startVelocity: 30,
      gravity: 0.8,
      origin: { x: Math.random(), y: 0.5 },
      shapes: ["square"],
      colors: ["#c5c6c7", "#a6a8ab", "#6d6f71"],
    });
  };

  const triggerVote = async (organizationName: string) => {
    try {
      await fetch("/api/insertVote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: organizationName,
        }),
      });
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  // Check if the "debug" query parameter exists
  const showButtons = router.query.debug !== undefined;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col items-start p-4 space-y-4">
        <img
          src="https://assets.medtechinnovator.org/wp-content/uploads/2016/07/08103054/Medtech_Logo_Color-e1467418814934.png"
          alt="Medtech Innovator Logo"
          className="h-16 w-auto mb-4"
        />
        {showButtons && (
          <div className="flex flex-col space-y-4">
            {presetOrganizations.map((org, index) => (
              <button
                key={index}
                onClick={() => triggerVote(org.name)}
                className="bg-gray-800 text-white px-6 py-2 text-lg rounded shadow-md hover:bg-gray-700 transition duration-300"
              >
                Vote for {org.name}
              </button>
            ))}
            <button
              className="bg-gray-800 text-white px-6 py-2 text-lg rounded shadow-md hover:bg-gray-700 transition duration-300"
              onClick={() => {
                // every 0.5 seconds cast 20 votes for random presetOrganizations competitor names
                const interval = setInterval(() => {
                  for (let i = 0; i < 5; i++) {
                    const randomIndex = Math.floor(
                      Math.random() * presetOrganizations.length
                    );
                    triggerVote(presetOrganizations[randomIndex].name);
                  }
                }, 500);
                // stop the interval after 10 seconds
                setTimeout(() => {
                  clearInterval(interval);
                }, 10000);
              }}
            >
              Simulate Votes
            </button>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-center"
        style={{ width: "1000px" }}
        transition={Flip}
      />
    </div>
  );
}
