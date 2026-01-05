import {Link} from "react-router";

const PrivacyPolicyPage = () => {
    const lastUpdated = "January 6, 2025";

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="mb-8">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                    Legal
                </p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Privacy Policy
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last updated: {lastUpdated}
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Overview
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo is a decentralized Q&A platform built on the NOSTR protocol. Unlike traditional
                        platforms, we do not operate centralized servers that store your data. This privacy
                        policy explains how data flows through Apollo and what information may be collected.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        The Decentralized Nature of NOSTR
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Apollo operates on the NOSTR protocol, which means:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Your content is stored on relays</strong> — independent servers operated by third parties that you choose to connect to. Apollo does not control these relays.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Your keys are your identity</strong> — your NOSTR keypair (public/private keys) is your account. We never have access to your private key.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Content is public by design</strong> — NOSTR events (questions, answers, votes) are publicly broadcast to relays. Do not share sensitive personal information in your posts.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        What We Do Not Collect
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Apollo is a client application. We do not:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Store your private keys (they remain in your browser or signing extension)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Operate databases containing your questions, answers, or profile information</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Track your activity across other websites</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Sell or share data with advertisers</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Local Storage
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo stores certain preferences locally in your browser using localStorage. This includes:
                    </p>
                    <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Your theme preference (light/dark mode)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Your relay configuration</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Session data for your NOSTR identity</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Whether you've seen the welcome message</span>
                        </li>
                    </ul>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        This data never leaves your device and can be cleared by clearing your browser data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Bitcoin & Lightning Payments
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo supports Bitcoin tips via the Lightning Network (zaps). These payments are
                        peer-to-peer transactions between users. Apollo does not process, store, or have
                        access to your Bitcoin or Lightning wallet. Payment information is handled by your
                        Lightning wallet provider according to their privacy policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Third-Party Relays
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        When you use Apollo, your content is published to NOSTR relays. Each relay operator
                        has their own privacy practices. We recommend reviewing the privacy policies of the
                        relays you choose to connect to. You can configure which relays Apollo uses in your
                        settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Your Rights & Control
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Because NOSTR is decentralized, you have significant control over your data:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Portability</strong> — Your NOSTR identity works across any NOSTR client. You can leave Apollo at any time and your content remains accessible.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Relay choice</strong> — You decide which relays to publish to and read from.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Deletion requests</strong> — You can publish deletion events (NIP-09), though relay compliance is not guaranteed as relays operate independently.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Changes to This Policy
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We may update this privacy policy from time to time. Changes will be reflected on
                        this page with an updated revision date. Continued use of Apollo after changes
                        constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Contact
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        If you have questions about this privacy policy, you can reach us through our{" "}
                        <a
                            href="https://github.com/anthropics/apollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 dark:text-teal-400 hover:underline"
                        >
                            GitHub repository
                        </a>.
                    </p>
                </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <Link
                    to="/terms"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                    View Terms of Use →
                </Link>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
