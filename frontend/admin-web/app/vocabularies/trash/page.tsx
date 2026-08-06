import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi, PagedList, VocabularyDto, API_BASE_URL } from "../../../lib/api";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function TrashPage(props: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) redirect("/login");

  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: '20' });

  let data: PagedList<VocabularyDto> | null = null;
  let errorMsg = "";

  try {
    data = await fetchApi<PagedList<VocabularyDto>>(`/api/v1/admin/vocabularies/trash?${queryParams.toString()}`);
  } catch (e: any) {
    errorMsg = e.message;
  }

  async function restoreVocabulary(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    
    await fetch(`${API_BASE_URL}/api/v1/admin/vocabularies/${id}/restore`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    revalidatePath("/vocabularies/trash");
    revalidatePath("/vocabularies");
  }

  async function permanentDeleteVocabulary(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    
    await fetch(`${API_BASE_URL}/api/v1/admin/vocabularies/${id}/permanent`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    revalidatePath("/vocabularies/trash");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Trash</h1>
        <Link href="/vocabularies" className="text-slate-500 hover:text-slate-900">
          ← Back to Vocabularies
        </Link>
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
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data?.items.map((vocab: VocabularyDto) => (
              <tr key={vocab.id} className="hover:bg-slate-50 opacity-75">
                <td className="px-6 py-4 font-serif text-lg">{vocab.simplified}</td>
                <td className="px-6 py-4">{vocab.pinyin}</td>
                <td className="px-6 py-4 max-w-xs truncate">{vocab.meaningVi}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <form action={restoreVocabulary} className="inline">
                    <input type="hidden" name="id" value={vocab.id} />
                    <button type="submit" className="text-green-600 hover:text-green-800 font-medium">
                      Restore
                    </button>
                  </form>
                  <form action={permanentDeleteVocabulary} className="inline">
                    <input type="hidden" name="id" value={vocab.id} />
                    <button type="submit" className="text-red-600 hover:text-red-800 font-medium">
                      Delete Forever
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!data?.items.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Trash is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-500">
            Showing page {data.pageNumber} of {data.totalPages}
          </div>
          <div className="flex gap-2">
            {data.hasPreviousPage && (
              <Link href={`/vocabularies/trash?page=${data.pageNumber - 1}`} className="btn-secondary text-sm px-3 py-1.5">
                Previous
              </Link>
            )}
            {data.hasNextPage && (
              <Link href={`/vocabularies/trash?page=${data.pageNumber + 1}`} className="btn-secondary text-sm px-3 py-1.5">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
