import {Link} from "react-router";

const TermsOfUsePage = () => {
    const lastUpdated = "January 6, 2025";

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="mb-8">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
                    Legal
                </p>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Terms of Use
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last updated: {lastUpdated}
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Agreement to Terms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        By accessing or using Apollo, you agree to be bound by these Terms of Use. If you
                        disagree with any part of these terms, you may not access or use Apollo.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        What Apollo Is
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Apollo is an open-source client application for interacting with the NOSTR protocol.
                        It provides a user interface for:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Asking and answering questions</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Voting on content</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Sending and receiving Bitcoin tips via the Lightning Network</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Managing your NOSTR identity and relay connections</span>
                        </li>
                    </ul>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo does not operate the NOSTR protocol, run relays, or control the network.
                        We provide software; you interact with a decentralized protocol.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Your NOSTR Identity
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        To use Apollo, you need a NOSTR keypair. You are solely responsible for:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Securing your private key</strong> — If you lose your private key, you lose access to your identity. There is no recovery mechanism.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">Protecting your private key</strong> — If someone else obtains your private key, they can act as you. We cannot reverse or undo their actions.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-teal-500 shrink-0">•</span>
                            <span><strong className="text-slate-900 dark:text-slate-100">All activity under your key</strong> — You are responsible for all content published using your keypair.</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Acceptable Use
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        While Apollo is censorship-resistant by design, you agree not to use Apollo to:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Post content that is illegal in your jurisdiction</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Harass, threaten, or abuse other users</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Distribute malware or engage in phishing</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Impersonate others with intent to deceive</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Spam or flood relays with low-quality content</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-red-400 shrink-0">×</span>
                            <span>Attempt to exploit or attack the application or connected relays</span>
                        </li>
                    </ul>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        Note: Because content is published to decentralized relays, we cannot remove content
                        from the NOSTR network. Individual relay operators may choose to filter content
                        according to their own policies.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Content Ownership
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        You retain ownership of content you create. By publishing content through Apollo,
                        you broadcast it to NOSTR relays where it becomes publicly accessible. You grant
                        other users the right to view, share, and interact with your public content as
                        permitted by the NOSTR protocol.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Bitcoin & Lightning Payments
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        Apollo facilitates Bitcoin tips (zaps) between users via the Lightning Network.
                        You acknowledge that:
                    </p>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Payments are peer-to-peer and irreversible</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>Apollo does not custody, process, or have access to your funds</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>You are responsible for understanding the tax implications in your jurisdiction</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-slate-400 shrink-0">—</span>
                            <span>We cannot refund, reverse, or mediate payment disputes</span>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Open Source License
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo is open-source software licensed under the{" "}
                        <strong className="text-slate-900 dark:text-slate-100">GNU Affero General Public License v3.0 (AGPL-3.0)</strong>.
                        You are free to use, modify, and distribute the software in accordance with the
                        license terms. If you run a modified version of Apollo on a server, you must make
                        the source code available to users. See the{" "}
                        <a
                            href="https://github.com/anthropics/apollo/blob/main/LICENSE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 dark:text-teal-400 hover:underline"
                        >
                            LICENSE file
                        </a>{" "}
                        for full terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Disclaimer of Warranties
                    </h2>
                    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                            APOLLO IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                            WE DO NOT WARRANT THAT APOLLO WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                            WE MAKE NO WARRANTIES ABOUT THE RELIABILITY, AVAILABILITY, OR PERFORMANCE OF
                            THIRD-PARTY RELAYS OR THE NOSTR NETWORK.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Limitation of Liability
                    </h2>
                    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA,
                            LOSS OF FUNDS, OR LOSS OF ACCESS TO YOUR NOSTR IDENTITY. OUR TOTAL LIABILITY
                            SHALL NOT EXCEED THE AMOUNT YOU PAID TO USE APOLLO (WHICH IS ZERO, AS APOLLO IS FREE SOFTWARE).
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Indemnification
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        You agree to indemnify and hold harmless Apollo's contributors from any claims,
                        damages, or expenses arising from your use of Apollo, your violation of these terms,
                        or your violation of any rights of another party.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Third-Party Services
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Apollo interacts with third-party services including NOSTR relays and Lightning
                        Network nodes. These services are operated by independent parties with their own
                        terms and policies. We are not responsible for the actions, content, or policies
                        of third-party services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Changes to Terms
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        We may modify these terms at any time. Changes will be posted on this page with
                        an updated revision date. Your continued use of Apollo after changes constitutes
                        acceptance of the modified terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Governing Law
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        These terms shall be governed by and construed in accordance with applicable law,
                        without regard to conflict of law principles.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Contact
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        Questions about these terms can be directed to our{" "}
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
                    to="/privacy"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                >
                    ← View Privacy Policy
                </Link>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
