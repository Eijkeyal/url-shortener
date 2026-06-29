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
    const [totalLinks, setTotalLinks] = useState(0);

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

        const savedTotalLinks = localStorage.getItem('totalLinks');
        if (savedTotalLinks) {
            setTotalLinks(parseInt(savedTotalLinks, 10));
        }

        const interval = setInterval(() => {
            if (shortCode) {
                console.log("Auto-refreshing clicks...");
                fetchStats(shortCode);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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

            const code = data.shortUrl.split("/").pop();

            setShortUrl(data.shortUrl);
            setOriginalUrl(url);
            setShortCode(code);
            setShowResult(true);
            setError("");
            setClicks(0);

            const newTotalLinks = totalLinks + 1;
            setTotalLinks(newTotalLinks);
            localStorage.setItem('totalLinks', newTotalLinks.toString());

            localStorage.setItem('shortUrlData', JSON.stringify({
                shortUrl: data.shortUrl,
                originalUrl: url,
                shortCode: code
            }));

            await fetchStats(code);

        } catch (error) {
            showError("Backend connection failed");
            console.error("Shorten URL error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshClicks = () => {
        if (shortCode) {
            fetchStats(shortCode);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            showError('Failed to copy to clipboard');
        }
    };

    const clearSavedUrl = () => {
        localStorage.removeItem('shortUrlData');
        setShortUrl('');
        setOriginalUrl('');
        setShortCode('');
        setShowResult(false);
        setClicks(0);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            shortenUrl();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-5 py-16 max-w-2xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-4 leading-tight">
                        Create short links
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Turn long URLs into clean, trackable short links. Get insights into who clicks, when, and where.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Top accent line */}
                    <div className="h-0.5 bg-gradient-to-r from-blue-500 via-slate-300 to-slate-200"></div>

                    <div className="p-8 md:p-10">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Form Section */}
                        <div className="mb-10">
                            <label htmlFor="longUrl" className="block text-sm font-semibold text-slate-900 mb-3">
                                Paste your long URL
                            </label>
                            <input
                                type="url"
                                id="longUrl"
                                placeholder="https://example.com/my-very-long-url-that-needs-shortening"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-transparent transition-all placeholder-slate-400 bg-white"
                            />
                        </div>

                        {/* Button */}
                        <button
                            onClick={shortenUrl}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Creating link...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Generate short link
                                </>
                            )}
                        </button>

                        {/* Results Section */}
                        {showResult && (
                            <div className="mt-10 pt-10 border-t border-slate-200">
                                {/* Success indicator */}
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">Link created successfully</h3>
                                </div>

                                {/* Original URL */}
                                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Original URL</p>
                                    <p className="text-slate-700 break-all text-sm leading-relaxed">{originalUrl}</p>
                                </div>

                                {/* Shortened URL - Highlighted */}
                                <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Your short link</p>
                                    <div className="flex items-start gap-3 mb-4">
                                        <a
                                            href={shortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 font-semibold text-lg break-all transition-colors"
                                        >
                                            {shortUrl}
                                        </a>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={copyToClipboard}
                                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                                copySuccess
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {copySuccess ? '✓ Copied to clipboard' : 'Copy link'}
                                        </button>
                                        <button
                                            onClick={refreshClicks}
                                            className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-200"
                                        >
                                            Refresh stats
                                        </button>
                                        <button
                                            onClick={clearSavedUrl}
                                            className="px-4 py-2 rounded-lg font-medium text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-200"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Stats Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Clicks */}
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Clicks</p>
                                            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                                Live
                                            </span>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">{clicks}</p>
                                        <p className="text-xs text-slate-500 mt-1">Updates every 5s</p>
                                    </div>

                                    {/* Total Links */}
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Total created</p>
                                        <p className="text-3xl font-bold text-slate-900">{totalLinks}</p>
                                        <p className="text-xs text-slate-500 mt-1">Links generated</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">No signup required</span> • Fast & reliable • Real-time tracking
                    </p>
                </div>
            </div>
        </div>
    );
}