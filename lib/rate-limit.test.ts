import { describe, expect, it } from "vitest";
import { clientIp } from "./rate-limit";

describe("clientIp", () => {
    it("extracts the first IP from x-forwarded-for", () => {
        const req = new Request("http://localhost", {
            headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
        });
        expect(clientIp(req)).toBe("1.2.3.4");
    });

    it("trims whitespace from x-forwarded-for", () => {
        const req = new Request("http://localhost", {
            headers: { "x-forwarded-for": "  1.2.3.4  , 10.0.0.1" },
        });
        expect(clientIp(req)).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip when x-forwarded-for is missing", () => {
        const req = new Request("http://localhost", {
            headers: { "x-real-ip": "5.6.7.8" },
        });
        expect(clientIp(req)).toBe("5.6.7.8");
    });

    it("trims whitespace from x-real-ip", () => {
        const req = new Request("http://localhost", {
            headers: { "x-real-ip": "  5.6.7.8  " },
        });
        expect(clientIp(req)).toBe("5.6.7.8");
    });

    it("prefers x-forwarded-for over x-real-ip", () => {
        const req = new Request("http://localhost", {
            headers: {
                "x-forwarded-for": "1.2.3.4",
                "x-real-ip": "5.6.7.8",
            },
        });
        expect(clientIp(req)).toBe("1.2.3.4");
    });

    it("returns 'unknown' when neither header is present", () => {
        const req = new Request("http://localhost");
        expect(clientIp(req)).toBe("unknown");
    });

    it("handles IPv6 addresses", () => {
        const reqForwarded = new Request("http://localhost", {
            headers: { "x-forwarded-for": "2001:db8::1, 10.0.0.1" },
        });
        expect(clientIp(reqForwarded)).toBe("2001:db8::1");

        const reqReal = new Request("http://localhost", {
            headers: { "x-real-ip": "2001:db8::2" },
        });
        expect(clientIp(reqReal)).toBe("2001:db8::2");
    });
});