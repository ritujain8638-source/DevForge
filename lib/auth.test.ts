import { describe, it, expect, beforeAll } from "vitest";

// hashPassword/verifyPassword/generatePassword don't touch secret(),
// but auth.ts throws at import-time paths that do call secret() elsewhere
// in the module graph, so we set a dummy value before importing —
// never a real secret — using a dynamic import so it runs after this
// executes.
let auth: typeof import("./auth");

beforeAll(async () => {
  process.env.JWT_SECRET = "test-only-dummy-secret-not-real-0123456789";
  auth = await import("./auth");
});

describe("hashPassword / verifyPassword", () => {
  it("hashes then verifies the correct password as true", async () => {
    const hash = await auth.hashPassword("correct-horse-battery-staple");
    await expect(
      auth.verifyPassword("correct-horse-battery-staple", hash)
    ).resolves.toBe(true);
  });

  it("verifies the wrong password as false", async () => {
    const hash = await auth.hashPassword("correct-horse-battery-staple");
    await expect(
      auth.verifyPassword("not-the-password", hash)
    ).resolves.toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const [hashA, hashB] = await Promise.all([
      auth.hashPassword("same-password"),
      auth.hashPassword("same-password"),
    ]);
    expect(hashA).not.toBe(hashB);
  });
});

describe("generatePassword", () => {
  it("defaults to length 14", () => {
    expect(auth.generatePassword()).toHaveLength(14);
  });

  it("respects a custom length", () => {
    expect(auth.generatePassword(8)).toHaveLength(8);
    expect(auth.generatePassword(20)).toHaveLength(20);
  });

  it("generates 100 unique passwords", () => {
    const passwords = new Set(
      Array.from({ length: 100 }, () => auth.generatePassword())
    );
    expect(passwords.size).toBe(100);
  });
});