'use client';

import { Flag, Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function ReportButton({ username }: { username: string }) {
    const [copied, setCopied] = useState(false);
    const email = "noreply.watchthismovie@gmail.com";
    const subject = `Report User: ${username}`;
    const body = `I want to report user ${username} for...`;

    const handleReport = () => {
        // 1. Try to open mail client
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // 2. Copy to clipboard as fallback
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleReport}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-500 transition-colors group"
            title="Click to report (opens email or copies address)"
        >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Flag className="w-3 h-3" />}
            {copied ? <span className="text-green-500 font-bold">Email Copied!</span> : <span>Report User</span>}
        </button>
    );
}
