import { broker } from "../alpaca/brokerClient";
import { getUser, upsertUser } from "../repos/usersRepo";

export async function createAlpacaAccountFor(
  uid: string,
  emailFromClaims: string | undefined,
  body: any,
  ip: any,
) {
  const existing = await getUser(uid);
  if (existing?.alpaca?.account_id) {
    return {
      account_id: existing.alpaca.account_id,
      status: existing.alpaca.status ?? "undefined",
    };
  }

  const nowISO = new Date().toISOString();
  const email =
    emailFromClaims || body?.contact?.email_address || "test@example.com";

  const payload = {
    contact: { ...body.contact, email_address: email },
    identity: body.identity,
    disclosures: body.disclosures,
    agreements: body.agreements.map((a: any) => ({
      agreement: a.agreement || "customer_agreement",
      signed_at: nowISO,
      ip_address: ip || "127.0.0.1",
    })),
  };
  const r = await broker.post("/v1/accounts", payload);
  const account_id = r.data.id;
  await upsertUser(uid, {
    email,
    alpaca: {
      account_id,
      status: r.data.status,
      created_at: nowISO,
    },
  });
  return { account_id, status: r.data.status };
}

export async function getTradingAccountSnapshot(uid: string) {
  const doc = await getUser(uid);
  const account_id = doc?.alpaca?.account_id;
  if (!account_id) {
    throw new Error("No Alpaca account_id found for user");
  }

  const r = await broker.get(`/v1/trading/accounts/${account_id}/account`);
  const a = r.data;
  return {
    id: a.id,
    status: a.status,
    cash: a.cash,
    equity: a.equity,
    buying_power: a.buying_power,
    portfolio_value: a.portfolio_value,
  };
}
