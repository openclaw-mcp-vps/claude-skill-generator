import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "csg_paid";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getPaymentLink(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";
}

export function hasAccessCookie(cookieStore: { get: (name: string) => { value: string } | undefined }): boolean {
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value === "1";
}

export function verifyStripeSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) {
      return acc;
    }
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(value);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((sig) => {
    try {
      const left = Buffer.from(sig, "hex");
      const right = Buffer.from(expectedSignature, "hex");
      if (left.length !== right.length) {
        return false;
      }
      return crypto.timingSafeEqual(left, right);
    } catch {
      return false;
    }
  });
}
