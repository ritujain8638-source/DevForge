/**
 * Checks that a pull request description is actually filled in.
 *
 * Used by .github/workflows/pr-description.yml (comment + label) and
 * .github/workflows/pr-description-sweep.yml (close the ones left unfixed).
 * Pure functions here; GitHub calls live in the workflows.
 */
export const LABEL = "needs-description";
export const MARKER = "<!-- pr-description-bot -->";
export const GRACE_DAYS = 2;

/** Template scaffolding that doesn't count as content. */
const PLACEHOLDERS = [
    /<!--[\s\S]*?-->/g, // HTML comments from the template
    /^#{1,3}\s.*$/gm, // headings
    /^-\s*\[[ x]\]\s.*$/gim, // checklist items
    /^fixes\s*#\s*\d*\s*$/gim, // the Fixes line itself
    /^\s*$/gm,
];

function strip(text) {
    return PLACEHOLDERS.reduce((acc, re) => acc.replace(re, ""), text).trim();
}

/** The text under a `## Heading`, up to the next heading. Null when there is no such heading. */
function section(body, heading) {
    const lines = body.split("\n");
    const start = lines.findIndex((l) => new RegExp(`^#{1,3}\\s*${heading}\\s*$`, "i").test(l.trim()));
    if (start === -1) return null;
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((l) => /^#{1,3}\s/.test(l.trim()));
    return strip((end === -1 ? rest : rest.slice(0, end)).join("\n"));
}

/** Everything that isn't template scaffolding — used when someone writes prose instead of headings. */
function prose(body) {
    return strip(body);
}

/** Did they say anything about testing at all? */
function mentionsTesting(body) {
    return /npm (run )?(lint|test|build)|npm test|tested|screenshot|verified|checked (it|the)/i.test(body);
}

/**
 * @returns {{ ok: boolean, problems: string[] }}
 */
export function checkDescription(body = "") {
    const text = String(body);
    const problems = [];

    // "Fixes #12" — the number is what links the PR to the issue and closes it.
    if (!/\b(fixes|closes|resolves)\s+#\d+/i.test(text)) {
        problems.push(
            /\b(fixes|closes|resolves)\s*#\s*$/im.test(text) || /\bfixes\s*#\s*\n/i.test(text)
                ? "**`Fixes #` has no issue number.** Write the number of the issue you were assigned, for example `Fixes #42`. That's what closes the issue when this merges."
                : "**No `Fixes #<issue>` line.** Add one (for example `Fixes #42`) so this PR is linked to its issue.",
        );
    }

    // The template's headings are the easy path, but a description written as plain
    // prose is fine too — this checks that something was actually said, not that a
    // particular shape was used.
    const what = section(text, "What");
    const described = what === null ? prose(text).length >= 80 : what.length >= 15;
    if (!described) {
        problems.push(
            what === null
                ? "**No description.** Say in a line or two what this changes and why — use the PR template's *What* section."
                : "**The *What* section is empty or too thin.** One or two real sentences: what changed and why.",
        );
    }

    const tested = section(text, "How I tested it");
    const testedOk = tested === null ? mentionsTesting(text) : tested.length >= 10;
    if (!testedOk) {
        problems.push(
            "**Nothing about testing.** Say what you ran (`npm run lint`, `npm test`, `npm run build`) and what you looked at. Add a screenshot for anything visible.",
        );
    }

    if (/^-\s*\[\s*\]/im.test(text) && !/^-\s*\[x\]/im.test(text)) {
        problems.push("**Nothing in the checklist is ticked.** Tick the boxes that are true (`- [x]`).");
    }

    return { ok: problems.length === 0, problems };
}

/** The comment the bot leaves. `deadline` is a Date. */
export function buildComment({ user, problems, deadline, ok }) {
    if (ok) {
        return `${MARKER}\n✅ Thanks @${user} — the description looks good now. This PR is no longer at risk of being closed.`;
    }

    const when = deadline.toUTCString().replace(/\s\(.+\)$/, "");
    return [
        MARKER,
        `Hi @${user} 👋 your PR description needs a bit more before this can be reviewed:`,
        "",
        ...problems.map((p) => `- [ ] ${p}`),
        "",
        "**How to fix it:** click the ✏️ next to the PR title and edit the description. No new commit needed — this check re-runs as soon as you save.",
        "",
        `⏳ **If it isn't fixed by ${when} (${GRACE_DAYS} days), this PR will be closed automatically.** ` +
            "Nothing is lost if that happens: your branch stays, and you can reopen the PR once the description is filled in.",
        "",
        "<sub>Why this matters: `Fixes #N` is what closes the issue and frees it for the next person, and reviewers read *What* and *How I tested it* before they read your code.</sub>",
    ].join("\n");
}
