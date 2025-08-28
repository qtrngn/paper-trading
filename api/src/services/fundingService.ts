import { broker } from "../alpaca/brokerClient";
import { getUser, upsertUser } from "../repos/usersRepo";

const FIRM = process.env.ALPACA_FIRM_ACCOUNT_ID || "";
const DEFAULT_CASH = String(process.env.ALPACA_STARTING_CASH ?? "10000");

export async function fundAccount(uid: string, amount?: string) {
  if (!FIRM) throw new Error("missing ALPACA_FIRM_ACCOUNT_ID");
  const doc = await getUser(uid);
  const account_id = doc?.alpaca?.account_id;
  if (!account_id) throw new Error("user has no account_id");

  const money = String(amount ?? DEFAULT_CASH);

  const jr = await broker.post("/v1/journals", {
    from_account: FIRM,
    to_account: account_id,
    entry_type: "JNLC",
    amount: money,
  });

  await upsertUser(uid, {
    alpaca: {
      ...doc.alpaca,
      lastJournalId: jr.data.id,
      lastJournalAmount: money,
      fundedAt: new Date().toISOString(),
    },
  });
  return { journal_id: jr.data.id, amount: money };
}
