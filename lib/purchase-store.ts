import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const purchaseRecordSchema = z.object({
  email: z.string().email(),
  eventId: z.string().min(1),
  source: z.literal("stripe"),
  createdAt: z.string().datetime()
});

const purchaseStoreSchema = z.object({
  purchases: z.array(purchaseRecordSchema)
});

type PurchaseStore = z.infer<typeof purchaseStoreSchema>;

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "purchases.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_FILE);
  } catch {
    const initial: PurchaseStore = { purchases: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore(): Promise<PurchaseStore> {
  await ensureStore();
  const raw = await fs.readFile(STORE_FILE, "utf8");
  const parsed = purchaseStoreSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    const repaired: PurchaseStore = { purchases: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(repaired, null, 2), "utf8");
    return repaired;
  }
  return parsed.data;
}

async function writeStore(store: PurchaseStore): Promise<void> {
  await ensureStore();
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function markPurchase(email: string, eventId: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const store = await readStore();

  const exists = store.purchases.some((purchase) => purchase.email === normalizedEmail);
  if (exists) {
    return;
  }

  store.purchases.push({
    email: normalizedEmail,
    eventId,
    source: "stripe",
    createdAt: new Date().toISOString()
  });

  await writeStore(store);
}

export async function hasPurchased(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const store = await readStore();
  return store.purchases.some((purchase) => purchase.email === normalizedEmail);
}
