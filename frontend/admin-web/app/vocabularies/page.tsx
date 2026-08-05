"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface AdminVocabulary {
  id: number;
  publicId: string;
  simplified: string;
  pinyin: string;
  meaning: string;
  isPublished: boolean;
  createdAt: string;
}

function AdminVocabularyListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSearch = searchParams.get("search") || "";
  
  const [data, setData] = useState<{items: AdminVocabulary[], totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  const fetchVocabularies = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const queryParams = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: "10"
      });
      
      if (searchTerm) queryParams.append("searchTerm", searchTerm);
      
      const res = await fetch(`/api/v1/vocabularies?${queryParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Không thể tải danh sách từ vựng.");
      }
      
      const result = await res.json();
      setData(result);
      
      const url = new URL(window.location.href);
      url.searchParams.set("page", page.toString());
      if (searchTerm) url.searchParams.set("search", searchTerm);
      else url.searchParams.delete("search");
      router.push(url.pathname + url.search, { scroll: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVocabularies();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa từ vựng này vào thùng rác?")) return;
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/vocabularies/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể xóa từ vựng.");
      fetchVocabularies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Quản lý từ vựng</h1>
        <Link href="/vocabularies/new" className="btn-primary">
          + Thêm từ vựng
        </Link>
      </div>

      <div className="admin-panel overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="input-field text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm h-10">Lọc</button>
            <button className="btn-secondary text-sm h-10">Sắp xếp</button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-danger-50 text-danger-600 border-b border-danger-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Chữ Hán</th>
                <th className="table-header">Pinyin</th>
                <th className="table-header">Nghĩa</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading && !data ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">Đang tải...</td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">Không có dữ liệu</td>
                </tr>
              ) : (
                data?.items.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-500 font-mono text-xs">{vocab.publicId.split('-')[0]}</td>
                    <td className="table-cell font-bold text-lg">{vocab.simplified}</td>
                    <td className="table-cell text-slate-600">{vocab.pinyin}</td>
                    <td className="table-cell truncate max-w-xs">{vocab.meaning}</td>
                    <td className="table-cell">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vocab.isPublished ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                      }`}>
                        {vocab.isPublished ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <Link href={`/vocabularies/${vocab.id}`} className="text-slate-600 hover:text-slate-900 mr-4">Xem</Link>
                      <Link href={`/vocabularies/${vocab.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-4">Sửa</Link>
                      <button onClick={() => handleDelete(vocab.id)} className="text-danger-600 hover:text-danger-900">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPreviousPage} className="btn-secondary text-sm">Trước</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={!data.hasNextPage} className="btn-secondary text-sm">Sau</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPreviousPage} className="btn-secondary text-sm">Trước</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={!data.hasNextPage} className="btn-secondary text-sm">Sau</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminVocabularyList() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Đang tải...</div>}>
      <AdminVocabularyListContent />
    </Suspense>
  );
}
