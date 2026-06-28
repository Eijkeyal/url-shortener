import React, { useState, useEffect } from 'react';

export default function URLShortener() {
    // State management
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [clicks, setClicks] = useState(0);
    const [shortCode, setShortCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [totalLinks, setTotalLinks] = useState(0); // State for total links generated

    // Validate URL format
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    // Show error message
    const showError = (message) => {
        setError(message);
        setShowResult(false);
    };

    // Fetch click stats
    const fetchStats = async (code) => {
        if (!code) return;

        try {
            console.log(`Fetching stats for code: ${code}`);
            const statsResponse = await fetch(
                `http://localhost:8080/api/stats/${code}`
            );

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log(`Stats response:`, statsData);
                setClicks(statsData.clicks || 0);
            } else {
                console.error("Stats fetch failed with status:", statsResponse.status);
                setClicks(0);
            }
        } catch (statsError) {
            console.error("Failed to fetch stats:", statsError);
            setClicks(0);
        }
    };

    // Load saved data on component mount
    useEffect(() => {
        // Load saved URL data from localStorage
        const savedUrlData = localStorage.getItem('shortUrlData');
        if (savedUrlData) {
            try {
                const data = JSON.parse(savedUrlData);
                setShortUrl(data.shortUrl);
                setOriginalUrl(data.originalUrl);
                setShortCode(data.shortCode);
                setShowResult(true);
                fetchStats(data.shortCode);
            } catch (e) {
                console.error("Failed to load saved data:", e);
            }
        }

        // Load total links count from localStorage
        const savedTotalLinks = localStorage.getItem('totalLinks');
        if (savedTotalLinks) {
            setTotalLinks(parseInt(savedTotalLinks, 10));
        }

        // Auto-refresh clicks every 5 seconds
        const interval = setInterval(() => {
            if (shortCode) {
                console.log("Auto-refreshing clicks...");
                fetchStats(shortCode);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Update interval when shortCode changes
    useEffect(() => {
        if (shortCode) {
            fetchStats(shortCode);

            const interval = setInterval(() => {
                fetchStats(shortCode);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [shortCode]);

    const shortenUrl = async () => {
        const url = longUrl.trim();

        if (!url) {
            showError('Please enter a URL');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Please enter a valid URL');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/shorten",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: url
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to shorten URL");
            }

            const data = await response.json();
            console.log("Shorten response:", data);

            // Extract the code from the short URL
            const code = data.shortUrl.split("/").pop();

            setShortUrl(data.shortUrl);
            setOriginalUrl(url);
            setShortCode(code);
            setShowResult(true);
            setError("");
            setClicks(0);

            // Increment total links count
            const newTotalLinks = totalLinks + 1;
            setTotalLinks(newTotalLinks);
            localStorage.setItem('totalLinks', newTotalLinks.toString());

            // Save to localStorage
            localStorage.setItem('shortUrlData', JSON.stringify({
                shortUrl: data.shortUrl,
                originalUrl: url,
                shortCode: code
            }));

            // Fetch stats
            await fetchStats(code);

        } catch (error) {
            showError("Backend connection failed");
            console.error("Shorten URL error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Manual refresh
    const refreshClicks = () => {
        if (shortCode) {
            fetchStats(shortCode);
        }
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            showError('Failed to copy to clipboard');
        }
    };

    // Clear saved data and reset
    const clearSavedUrl = () => {
        localStorage.removeItem('shortUrlData');
        setShortUrl('');
        setOriginalUrl('');
        setShortCode('');
        setShowResult(false);
        setClicks(0);
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f2847] to-[#1a3a52]">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">Shorten Your Links</h1>
                    <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                        Create shorter, trackable links that engage your audience and connect them to the right information
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-10">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-300">
                            {error}
                        </div>
                    )}

                    {/* Short Link Section */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Shorten a long link</h2>
                        <p className="text-gray-600 mb-8">No credit card required.</p>

                        {/* Form Group */}
                        <div className="mb-6">
                            <label htmlFor="longUrl" className="block font-semibold text-gray-900 mb-3">
                                Paste your long link here
                            </label>
                            <input
                                type="url"
                                id="longUrl"
                                placeholder="https://example.com/my-very-long-url-that-needs-shortening"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Button */}
                        <button
                            onClick={shortenUrl}
                            disabled={isLoading}
                            className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>✨</span>
                            {isLoading ? 'Shortening...' : 'Get your Short link for free'}
                        </button>

                        {/* Results */}
                        {showResult && (
                            <div className="bg-gray-100 rounded-lg p-6 mt-8">
                                <div className="mb-6 pb-6 border-b border-gray-300">
                                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                        Original link
                                    </div>
                                    <div className="text-lg text-blue-500 font-medium break-all">
                                        {originalUrl}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                        Shortened link
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <a
                                            href={shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg text-blue-500 font-medium hover:underline break-all"
                                        >
                                            {shortUrl}
                                        </a>
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                                                copySuccess
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                        >
                                            {copySuccess ? '✓ Copied' : 'Copy'}
                                        </button>
                                        <button
                                            onClick={refreshClicks}
                                            className="px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap bg-gray-500 hover:bg-gray-600 text-white"
                                        >
                                            ↻ Refresh
                                        </button>
                                        <button
                                            onClick={clearSavedUrl}
                                            className="px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            ✕ Clear
                                        </button>
                                    </div>

                                    {/* Click counter with auto-refresh indicator */}
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-700">Total Clicks:</span>
                                                <span className="text-xs text-green-600 animate-pulse">● Auto-refresh</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {clicks}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Clicks update automatically every 5 seconds
                                        </p>
                                    </div>

                                    {/* Total Links Generated */}
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-gray-700">Total Links Generated:</span>
                                            <span className="text-2xl font-bold text-green-600">
                                                {totalLinks}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Total number of links you've created
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}