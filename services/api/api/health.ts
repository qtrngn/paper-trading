export default function handler(req: any, res: any) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "";
    const obj = JSON.parse(raw);
    res.status(200).json({ ok: true, projectId: obj.project_id });
  } catch (e: any) {
    res.status(200).json({ ok: false, error: e.message });
  }
}