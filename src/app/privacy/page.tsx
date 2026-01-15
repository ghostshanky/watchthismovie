import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans pt-32">
            <div className="max-w-3xl mx-auto bg-gray-900/50 shadow-2xl rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                <h1 className="text-3xl font-bold mb-2 text-white">Privacy Policy</h1>
                <p className="text-gray-400 mb-6 text-sm">Last Updated: January 15, 2026</p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
                    <p className="mb-2 text-gray-300">
                        Welcome to <strong>WatchThisMovie</strong> ("we", "our", or "us").
                        We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website
                        <a href="https://watchthismovieonline.vercel.app" className="text-blue-400 hover:text-blue-300 hover:underline ml-1">watchthismovieonline.vercel.app</a>.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">2. Information We Collect</h2>
                    <p className="mb-2 text-gray-300">We only collect the minimum amount of data necessary to provide our service:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                        <li><strong>Google Account Information:</strong> When you sign in using Google, we receive your name, email address, and profile picture.</li>
                        <li><strong>Usage Data:</strong> We may collect information on which movies you interact with to provide recommendations.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">3. How We Use Your Information</h2>
                    <p className="mb-2 text-gray-300">We use your information solely for:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                        <li>Authenticating your identity securely via Supabase and Google OAuth.</li>
                        <li>Personalizing movie recommendations.</li>
                        <li>We <strong>do not</strong> sell, trade, or rent your personal identification information to others.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">4. Third-Party Services</h2>
                    <p className="mb-2 text-gray-300">We use the following third-party services:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                        <li><strong>Supabase:</strong> For database hosting and authentication management.</li>
                        <li><strong>Google OAuth:</strong> For secure user sign-in.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 text-white">5. Contact Us</h2>
                    <p className="text-gray-300">
                        If you have any questions about this Privacy Policy, please contact us at: <br />
                        <a href="mailto:noreply.watchthismovie@gmail.com" className="text-blue-400 font-medium hover:text-blue-300">noreply.watchthismovie@gmail.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
