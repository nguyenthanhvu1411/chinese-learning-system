import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("accessToken")) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-panel p-6">
          <h3 className="text-lg font-medium text-slate-700 mb-2">Total Vocabularies</h3>
          <p className="text-3xl font-bold text-primary-600">--</p>
        </div>
      </div>
    </div>
  );
}
