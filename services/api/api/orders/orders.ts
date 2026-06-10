/* Method guard
   Auth guard (requireUid)
   Query orders by uid
   Sort newest order first 
   Return orders as json */
import { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod } from "../_lib/http/requireMethod";
import { requireUid } from "../_lib/auth/requireUid";
import { getDb } from "../_lib/db/mongo";
import type { OrderDoc } from "../_lib/trading/order";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  /*  METHOD GUARD
    GET method only */
  if (!requireMethod(req, res, "GET")) return;

  /* AUTH GUARD
    get the authenticated user's id
    if failed, stop immediately */
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unauthorized";
    return res.status(401).json({ error: "unauthorized", message });
  }

 /* QUERY ORDERS BY UID
 only get orders that belong to the user with matching uid 
 sort newest order first and turn the result into array
 */
try {
 const db = await getDb(); 
 const orders = db.collection<OrderDoc>("orders");
 const userOrders = await orders.find({uid}).sort({createdAt: -1}).toArray();
 return res.status(200).json({orders: userOrders});
} catch (err) {
  const message = err instanceof Error ? err.message : "failed to load orders";
  return res.status(500).json({
    error: "failed_to_load_orders",
    message,
  });
};
}
