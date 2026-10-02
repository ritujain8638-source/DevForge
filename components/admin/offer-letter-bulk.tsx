"use client";

import { useMemo, useState } from "react";
import { Users, Send } from "lucide-react";
import type { BulkResult } from "@/app/api/admin/offer-letter/bulk/route";

interface Recipient {
    name: string;
    email: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;

/**
 * Parses pasted "Name <tab|comma> email" lines. Tolerates the tab-separated
 * shape you get from a spreadsheet, and a trailing verdict column, by taking
 * the first email-looking field and treating the first field as the name.
 */
export function parseRecipients(text: string): { rows: Recipient[]; invalid: string[]; duplicates: string[] } {
    const rows: Recipient[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;

        const parts = line.split(/\t|,|;|\s{2,}/).map((p) => p.trim()).filter(Boolean);
        const email = parts.find((p) => EMAIL_RE.test(p));
        const name = parts.find((p) => p !== email && !EMAIL_RE.test(p));

        if (!email || !name) {
            invalid.push(line);
            continue;
        }
        const key = email.toLowerCase();
        if (seen.has(key)) {
            duplicates.push(`${name} <${email}>`);
            continue;
        }
        seen.add(key);
        rows.push({ name: name.replace(/\s+/g, " "), email });
    }
    return { rows, invalid, duplicates };
}

const inputClass =
    "w-full glass-subtle !rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 " +
    "outline-none focus:outline focus:outline-2 focus:outline-cyan-400/50 transition-colors";

export function OfferLetterBulk({ defaults }: { defaults: { signatoryName: string; signatoryTitle: string } }) {
    const [text, setText] = useState("");
    const [role, setRole] = useState("Member");
    const [signatoryName, setSignatoryName] = useState(defaults.signatoryName);
    const [signatoryTitle, setSignatoryTitle] = useState(defaults.signatoryTitle);
    const [busy, setBusy] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [results, setResults] = useState<BulkResult[] | null>(null);

    const { rows, invalid, duplicates } = useMemo(() => parseRecipients(text), [text]);

    async function sendAll() {
        if (rows.length === 0) return;
        const confirmed = confirm(
            `Send the official offer letter to ${rows.length} recipient${rows.length === 1 ? "" : "s"}?\n\n` +
                `This emails each of them a PDF immediately and cannot be undone.`,
        );
        if (!confirmed) return;

        setBusy(true);
        setSummary(null);
        setResults(null);
        try {
            const res = await fetch("/api/admin/offer-letter/bulk", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    recipients: rows,
                    role: role.trim() || undefined,
                    signatoryName: signatoryName.trim() || undefined,
                    signatoryTitle: signatoryTitle.trim() || undefined,
                }),
            });
            const body = await res.json().catch(() => ({}));
            setSummary(body.message ?? (res.ok ? "Done." : "Couldn't send."));
            setResults(Array.isArray(body.results) ? body.results : null);
        } catch {
            setSummary("Couldn't reach the server.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="glass-strong rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2">
                <Users size={18} className="text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Send in bulk</h2>
            </div>
            <p className="text-sm text-neutral-400">
                Paste one recipient per line as <span className="font-mono text-neutral-300">Name</span> then a tab or
                comma then <span className="font-mono text-neutral-300">email</span>. Straight from a spreadsheet works.
                Duplicate addresses are dropped.
            </p>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"Aditi Sharma\taditi@example.com\nRahul Verma\trahul@example.com"}
                aria-label="Recipients"
                className={`${inputClass} min-h-[200px] font-mono text-xs resize-y`}
            />

            <div className="grid sm:grid-cols-3 gap-4">
                <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Role</span>
                    <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
                </label>
                <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Signatory</span>
                    <input
                        className={inputClass}
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                    />
                </label>
                <label className="block">
                    <span className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">Title</span>
                    <input
                        className={inputClass}
                        value={signatoryTitle}
                        onChange={(e) => setSignatoryTitle(e.target.value)}
                    />
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="text-cyan-300 font-semibold">
                    {rows.length} recipient{rows.length === 1 ? "" : "s"} ready
                </span>
                {duplicates.length > 0 && (
                    <span className="text-neutral-400">{duplicates.length} duplicate dropped</span>
                )}
                {invalid.length > 0 && (
                    <span className="text-yellow-400">{invalid.length} line(s) couldn&rsquo;t be read</span>
                )}
            </div>

            {rows.length > 0 && (
                <div className="max-h-52 overflow-y-auto glass-subtle !rounded-xl p-3 space-y-1">
                    {rows.map((r) => (
                        <div key={r.email} className="flex justify-between gap-3 text-xs">
                            <span className="text-neutral-200 truncate">{r.name}</span>
                            <span className="text-neutral-400 font-mono truncate">{r.email}</span>
                        </div>
                    ))}
                </div>
            )}

            {invalid.length > 0 && (
                <div className="text-xs text-yellow-400/90 space-y-1">
                    {invalid.slice(0, 5).map((l, i) => (
                        <div key={i} className="font-mono truncate">
                            skipped: {l}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={sendAll}
                disabled={busy || rows.length === 0}
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm rounded-full px-5 py-2.5 transition-colors"
            >
                <Send size={15} />
                {busy ? `Sending ${rows.length}…` : `Send to ${rows.length}`}
            </button>

            {summary && <p className="text-sm text-cyan-300">{summary}</p>}

            {results && (
                <div className="max-h-60 overflow-y-auto space-y-1">
                    {results.map((r) => (
                        <div key={r.email} className="flex justify-between gap-3 text-xs">
                            <span className="text-neutral-300 truncate">{r.name}</span>
                            <span className={r.ok ? "text-cyan-300" : "text-red-400"}>
                                {r.ok ? "sent" : r.message ?? "failed"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
