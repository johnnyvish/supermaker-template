'use client';

import { useEffect, useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        // NEXT_PUBLIC_API_URL is defined in docker-compose.yml (e.g., http://localhost:8000)
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/ping`;

        fetch(apiUrl)
            .then((res) => res.json())
            .then((data: { message: string }) => setMessage(data.message))
            .catch((err) => setMessage(`Error: ${err.message}`));
    }, []);

    return (
        <main className=''>
            <div>navbar</div>
            <div>sidebar</div>
            <div>
                <p>{message}</p>
            </div>
            <div>footer</div>
        </main>
    );
}
