import { createHmac, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export type StoredPurchase = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  variantName: string;
  createdAt: string;
};

const DATA_DIR = join(process.cwd(), "data");
const PURCHASES_FILE = join(DATA_DIR, "purchases.json");

async function ensurePurchasesFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(PURCHASES_FILE, "utf8");
  } catch {
    await writeFile(PURCHASES_FILE, "[]", "utf8");
  }
}

async function readPurchases(): Promise<StoredPurchase[]> {
  await ensurePurchasesFile();
  const raw = await readFile(PURCHASES_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as StoredPurchase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePurchases(purchases: StoredPurchase[]) {
  await ensurePurchasesFile();
  await writeFile(PURCHASES_FILE, JSON.stringify(purchases, null, 2), "utf8");
}

export async function storePurchase(purchase: StoredPurchase) {
  const existing = await readPurchases();
  const withoutDuplicate = existing.filter(
    (item) => !(item.orderId === purchase.orderId && item.customerEmail === purchase.customerEmail)
  );
  withoutDuplicate.unshift(purchase);
  await writePurchases(withoutDuplicate.slice(0, 5000));
}

export async function hasPurchased(customerEmail: string, orderId?: string): Promise<boolean> {
  const normalizedEmail = customerEmail.trim().toLowerCase();
  const purchases = await readPurchases();
  return purchases.some((purchase) => {
    const emailMatch = purchase.customerEmail.trim().toLowerCase() === normalizedEmail;
    const orderMatch = orderId ? purchase.orderId === orderId : true;
    return emailMatch && orderMatch;
  });
}

export function verifyLemonSqueezyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(digestBuffer, signatureBuffer);
}

export function getLemonCheckoutUrl(): string {
  const configured = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID?.trim() ?? "";
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured;
  }

  if (configured.length > 0) {
    return `https://checkout.lemonsqueezy.com/buy/${configured}`;
  }

  return "";
}
