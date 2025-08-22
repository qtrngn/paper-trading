import { useSession } from "../stores/session";
import { api } from "../library/api";

export default function Dashboard() {
  const logout = useSession(s => s.logout);
  async function testAPI() {
    const r = await api("/api/me");
    alert(await r.text()); 
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="flex gap-2">
        <button onClick={testAPI} className="border rounded p-2">Test /api/me</button>
        <button onClick={logout} className="border rounded p-2">Logout</button>
      </div>
    </div>
  );
}
