"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "devforge-learn-progress";

const EMPTY = new Set<string>();

let snapshot: Set<string> | undefined;
const listeners = new Set<() => void>();

function readSnapshot() {
    if (typeof window === "undefined") {
        return EMPTY;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        snapshot = raw ? new Set(JSON.parse(raw)) : EMPTY;
    } catch {
        snapshot = EMPTY;
    }

    return snapshot;
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            readSnapshot();
            listeners.forEach((listener) => listener());
        }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

const getSnapshot = () => snapshot ?? readSnapshot();
const getServerSnapshot = () => EMPTY;

export function useLearnProgress() {
    const done = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );

    const toggle = (nodeId: string) => {
        const next = new Set(done);

        if (next.has(nodeId)) {
            next.delete(nodeId);
        } else {
            next.add(nodeId);
        }

        snapshot = next;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(Array.from(next))
        );

        listeners.forEach((listener) => listener());
    };

    return { done, toggle, hydrated };
}