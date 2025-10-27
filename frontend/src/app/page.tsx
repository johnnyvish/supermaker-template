"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // NEXT_PUBLIC_API_URL is defined in docker-compose.yml (e.g., http://localhost:8000)
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/ping`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <h1>🚀 Next.js + FastAPI</h1>
      <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>{message}</p>
    </main>
  );
}
