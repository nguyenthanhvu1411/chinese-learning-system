import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { API_BASE_URL } from "../../../lib/api";
import Link from "next/link";

export default async function NewVocabularyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) redirect("/login");

  async function createVocabulary(formData: FormData) {
    "use server";
    
    const data = {
      simplified: formData.get("simplified") as string,
      traditional: formData.get("traditional") as string || null,
      pinyin: formData.get("pinyin") as string,
      meaningVi: formData.get("meaningVi") as string,
      partOfSpeech: formData.get("partOfSpeech") as string || null,
      hskLevel: parseInt(formData.get("hskLevel") as string, 10),
      topicId: "00000000-0000-0000-0000-000000000000", // Default empty GUID
      status: formData.get("status") as string
    };

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/vocabularies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      redirect("/vocabularies");
    }
    // Simple MVP error handling
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vocabularies" className="text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Vocabulary</h1>
      </div>

      <div className="admin-panel p-6">
        <form action={createVocabulary} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Simplified (Required)</label>
              <input type="text" name="simplified" required className="input-field font-serif text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Traditional</label>
              <input type="text" name="traditional" className="input-field font-serif text-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pinyin (Required)</label>
              <input type="text" name="pinyin" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Part of Speech</label>
              <input type="text" name="partOfSpeech" className="input-field" placeholder="e.g. noun, verb" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Meaning (Vietnamese) (Required)</label>
            <textarea name="meaningVi" required rows={3} className="input-field"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HSK Level</label>
              <select name="hskLevel" defaultValue="1" className="input-field">
                {[1, 2, 3, 4, 5, 6].map(l => (
                  <option key={l} value={l}>HSK {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" defaultValue="Published" className="input-field">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <Link href="/vocabularies" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary">
              Save Vocabulary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
