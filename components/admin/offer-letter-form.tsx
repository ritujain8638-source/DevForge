"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Send } from "lucide-react";

interface Defaults {
    signatoryName: string;
    signatoryTitle: string;
}

const inputClass =
    "w-full glass-subtle !rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 " +
    "outline-none focus:outline focus:outline-2 focus:outline-cyan-400/50 transition-colors";
const labelClass = "block text-xs uppercase tracking-wider text-neutral-400 mb-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className={labelClass}>{label}</span>
            {children}
        </label>
    );
}

function OfferLetterFields({ defaults }: { defaults: Defaults }) {
    // Prefill once from the query when arriving from a member row (…?usn=&name=&email=).
    const params = useSearchParams();
    const [name, setName] = useState(() => params.get("name") ?? "");
    const [email, setEmail] = useState(() => params.get("email") ?? "");
    const usn = params.get("usn") ?? ""; // from the member-row link only; not editable here
    const [role, setRole] = useState("Member");
    const [term, setTerm] = useState("");
    const [signatoryName, setSignatoryName] = useState(defaults.signatoryName);
    const [signatoryTitle, setSignatoryTitle] = useState(defaults.signatoryTitle);
    const [note, setNote] = useState("");

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [busy, setBusy] = useState<null | "preview" | "send">(null);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        };
    }, []);

    function payload(mode: "preview" | "send") {
        return {
            mode,
            usn: usn.trim() || undefined,
            name: name.trim() || undefined,
            email: email.trim() || undefined,
            role: role.trim() || undefined,
            term: term.trim() || undefined,
            signatoryName: signatoryName.trim() || undefined,
            signatoryTitle: signatoryTitle.trim() || undefined,
            note: note.trim() || undefined,
        };
    }

    async function preview() {
        if (!name.trim()) {
            setResult({ ok: false, message: "Enter the recipient's name first." });
            return;
        }
        setBusy("preview");
        setResult(null);
        try {
            const res = await fetch("/api/admin/offer-letter", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload("preview")),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setResult({ ok: false, message: body.message ?? "Couldn't build the preview." });
                return;
            }
            const blob = await res.blob();
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
            const url = URL.createObjectURL(blob);
            previewUrlRef.current = url;
            setPreviewUrl(url);
        } catch {
            setResult({ ok: false, message: "Couldn't reach the server." });
        } finally {
            setBusy(null);
        }
    }

    async function send() {
        if (!name.trim() || !email.trim()) {
            setResult({ ok: false, message: "Name and email are both required to send." });
            return;
        }
        if (!confirm(`Send the official offer letter to ${name.trim()} at ${email.trim()}?`)) return;
        setBusy("send");
        setResult(null);
        try {
            const res = await fetch("/api/admin/offer-letter", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload("send")),
            });
            const body = await res.json().catch(() => ({}));
            setResult({ ok: res.ok, message: body.message ?? (res.ok ? "Sent." : "Couldn't send.") });
        } catch {
            setResult({ ok: false, message: "Couldn't reach the server." });
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Recipient name">
                        <input
                            className={inputClass}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Aditi Sharma"
                        />
                    </Field>
                    <Field label="Recipient email">
                        <input
                            className={inputClass}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="aditi@example.com"
                        />
                    </Field>
                    <Field label="Membership role">
                        <input
                            className={inputClass}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Member"
                        />
                    </Field>
                    <Field label="Term (optional)">
                        <input
                            className={inputClass}
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder="Auto from today's date"
                        />
                    </Field>
                    <Field label="Signatory name">
                        <input
                            className={inputClass}
                            value={signatoryName}
                            onChange={(e) => setSignatoryName(e.target.value)}
                            placeholder="Geetansh Goyal"
                        />
                    </Field>
                    <Field label="Signatory title">
                        <input
                            className={inputClass}
                            value={signatoryTitle}
                            onChange={(e) => setSignatoryTitle(e.target.value)}
                            placeholder="President, DevForge Executive Council"
                        />
                    </Field>
                </div>
                <Field label="Custom paragraph (optional)">
                    <textarea
                        className={`${inputClass} min-h-[80px] resize-y`}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Anything specific to this offer — left out when empty."
                    />
                </Field>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        onClick={preview}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-2 glass-subtle hover:border-cyan-400/40 disabled:opacity-50 text-neutral-200 text-sm font-medium rounded-full px-4 py-2.5 transition-colors"
                    >
                        <Eye size={15} />
                        {busy === "preview" ? "Building…" : "Preview PDF"}
                    </button>
                    <button
                        onClick={send}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 text-black font-bold text-sm rounded-full px-5 py-2.5 transition-colors"
                    >
                        <Send size={15} />
                        {busy === "send" ? "Sending…" : "Send offer letter"}
                    </button>
                    {result && (
                        <span className={`text-sm ${result.ok ? "text-cyan-300" : "text-red-400"}`}>
                            {result.message}
                        </span>
                    )}
                </div>
            </div>

            {previewUrl && (
                <div className="glass rounded-3xl p-2 overflow-hidden">
                    <iframe
                        title="Offer letter preview"
                        src={previewUrl}
                        className="w-full rounded-2xl bg-white"
                        style={{ height: "780px" }}
                    />
                </div>
            )}
        </div>
    );
}

export function OfferLetterForm({ defaults }: { defaults: Defaults }) {
    return (
        <Suspense fallback={<div className="glass-strong rounded-3xl h-64 animate-pulse" />}>
            <OfferLetterFields defaults={defaults} />
        </Suspense>
    );
}
