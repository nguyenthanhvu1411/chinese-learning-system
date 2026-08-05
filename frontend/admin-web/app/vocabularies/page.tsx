import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi, PagedList, VocabularyDto, API_BASE_URL } from "../../lib/api";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function VocabulariesPage(props: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) redirect("/login");

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const hsk = typeof searchParams.hsk === 'string' ? searchParams.hsk : '';

  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: '20' });
  if (q) queryParams.append('search', q);
  if (hsk) queryParams.append('hskLevel', hsk);

  let data: PagedList<VocabularyDto> | null = null;
  let errorMsg = "";

  try {
    data = await fetchApi<PagedList<VocabularyDto>>(`/api/v1/admin/vocabularies?${queryParams.toString()}`);
  } catch (e: any) {
    errorMsg = e.message;
  }

  async function deleteVocabulary(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    
    await fetch(`${API_BASE_URL}/api/v1/admin/vocabularies/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    revalidatePath("/vocabularies");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Vocabularies</h1>
        <Link href="/vocabularies/new" className="btn-primary">
          Add New
        </Link>
      </div>

      <div className="admin-panel mb-6 p-4 flex gap-4">
        <form className="flex-1 flex gap-2" action="/vocabularies" method="GET">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search simplified, pinyin, or meaning..." 
            className="input-field"
          />
          <select name="hsk" defaultValue={hsk} className="input-field max-w-[150px]">
            <option value="">All HSK</option>
            {[1, 2, 3, 4, 5, 6].map(l => (
              <option key={l} value={l}>HSK {l}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">Filter</button>
        </form>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="admin-panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium">Simplified</th>
              <th className="px-6 py-3 font-medium">Pinyin</th>
              <th className="px-6 py-3 font-medium">Meaning</th>
              <th className="px-6 py-3 font-medium">Level</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data?.items.map((vocab: VocabularyDto) => (
              <tr key={vocab.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-serif text-lg">{vocab.simplified}</td>
                <td className="px-6 py-4">{vocab.pinyin}</td>
                <td className="px-6 py-4 max-w-xs truncate" title={vocab.meaningVi}>{vocab.meaningVi}</td>
                <td className="px-6 py-4">
                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-bold">
                    HSK {vocab.hskLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    vocab.status === 'Published' ? 'bg-green-50 text-green-700' :
                    vocab.status === 'Draft' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {vocab.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <Link href={`/vocabularies/${vocab.id}/edit`} className="text-primary-600 hover:text-primary-800 font-medium">
                    Edit
                  </Link>
                  <form action={deleteVocabulary} className="inline">
                    <input type="hidden" name="id" value={vocab.id} />
                    <button type="submit" className="text-red-600 hover:text-red-800 font-medium">
                      Trash
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!data?.items.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No vocabularies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-500">
            Showing page {data.pageNumber} of {data.totalPages} ({data.totalCount} total)
          </div>
          <div className="flex gap-2">
            {data.hasPreviousPage && (
              <Link href={`/vocabularies?page=${data.pageNumber - 1}${q ? `&q=${q}` : ''}${hsk ? `&hsk=${hsk}` : ''}`} className="btn-secondary text-sm px-3 py-1.5">
                Previous
              </Link>
            )}
            {data.hasNextPage && (
              <Link href={`/vocabularies?page=${data.pageNumber + 1}${q ? `&q=${q}` : ''}${hsk ? `&hsk=${hsk}` : ''}`} className="btn-secondary text-sm px-3 py-1.5">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
