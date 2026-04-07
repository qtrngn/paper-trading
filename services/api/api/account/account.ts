import { requireUid } from "../_lib/auth/requireUid";
import { requireMethod } from "../_lib/http/requireMethod";
import { getOrCreateAccount } from "../_lib/trading/account";


export default async function handler(req: any, res: any) {
  if (!requireMethod(req, res, "GET")) return;
  try {
    const uid = await requireUid(req);

    const account = await getOrCreateAccount(uid);
    return res.status(200).json({ account });
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error in api/account:", err);
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
}
