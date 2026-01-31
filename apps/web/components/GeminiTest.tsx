'use client';

import { useState } from 'react';

export default function GeminiTest() {
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('Driver');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse('');

        try {
            const res = await fetch('http://localhost:5000/api/assistant/ask-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, role }),
            });

            const data = await res.json();
            if (data.reply) {
                setResponse(data.reply);
            } else {
                setResponse(JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error:', error);
            setResponse('Failed to fetch response.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-black">
            <h2 className="text-xl font-bold">Test Gemini AI</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Message:</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                        rows={3}
                        required
                        placeholder="Ask something..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    >
                        <option value="Customer">Customer</option>
                        <option value="Driver">Driver</option>
                        <option value="Owner">Owner</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Asking AI...' : 'Ask AI'}
                </button>
            </form>
            {response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold text-gray-800">AI Response:</h3>
                    <p className="whitespace-pre-wrap text-gray-700">{response}</p>
                </div>
            )}
        </div>
    );
}
