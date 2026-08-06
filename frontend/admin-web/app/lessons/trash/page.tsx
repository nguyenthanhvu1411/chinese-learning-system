"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Trash2, RotateCcw, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

interface AdminLesson {
  id: string;
  topicId: string;
  slug: string;
  titleVi: string;
  descriptionVi?: string;
  estimatedMinutes: number;
  sortOrder: number;
  status: number | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

function AdminLessonTrashListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  
  const [data, setData] = useState<{items: AdminLesson[], totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(initialPage);

  const fetchTrash = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: "10"
      });
      
      const res = await fetch(`/api/v1/admin/lessons/trash?${queryParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Không thể tải danh sách thùng rác.");
      }
      
      const result = await res.json();
      setData(result);
      
      const url = new URL(window.location.href);
      url.searchParams.set("page", page.toString());
      router.push(url.pathname + url.search, { scroll: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRestore = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn khôi phục bài học này?")) return;
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}/restore`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể khôi phục bài học.");
      fetchTrash();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("Bạn có CHẮC CHẮN muốn xóa vĩnh viễn bài học này? Thao tác này không thể hoàn tác!")) return;
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}/permanent`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể xóa vĩnh viễn.");
      fetchTrash();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
        <Link href="/lessons" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 font-serif flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-slate-400" />
          Thùng rác Bài học
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {error && (
          <div className="p-4 bg-danger-50 text-danger-700 border-b border-danger-100 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-16">STT</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tên bài học</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Thời lượng</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {isLoading && !data ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 font-medium">Thùng rác trống</td>
                </tr>
              ) : (
                data?.items.map((lesson, index) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-400 font-medium">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-slate-900">{lesson.titleVi}</div>
                      <div className="text-sm text-slate-500">{lesson.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">{lesson.estimatedMinutes} phút</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleRestore(lesson.id)} className="flex items-center gap-1.5 text-success-600 hover:text-success-700 transition-colors" title="Khôi phục">
                          <RotateCcw className="w-4 h-4" />
                          <span className="text-xs font-bold">Khôi phục</span>
                        </button>
                        <button onClick={() => handlePermanentDelete(lesson.id)} className="flex items-center gap-1.5 text-danger-600 hover:text-danger-700 transition-colors" title="Xóa vĩnh viễn">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Xóa vĩnh viễn</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 font-medium">
            Hiển thị <span className="text-slate-900 font-bold">{data?.items.length ? (page - 1) * 10 + 1 : 0}</span> đến <span className="text-slate-900 font-bold">{data ? Math.min(page * 10, (page - 1) * 10 + data.items.length) : 0}</span> bài học
          </div>
          
          {data && data.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPreviousPage} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(data.totalPages)].map((_, i) => {
                if (i + 1 === 1 || i + 1 === data.totalPages || (i + 1 >= page - 1 && i + 1 <= page + 1)) {
                  return (
                    <button 
                      key={i} 
                      onClick={() => setPage(i + 1)} 
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors flex items-center justify-center ${
                        page === i + 1 ? "bg-primary-600 text-white shadow-md shadow-primary-600/30" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (i + 1 === page - 2 || i + 1 === page + 2) {
                  return <span key={i} className="text-slate-400">...</span>;
                }
                return null;
              })}

              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={!data.hasNextPage} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLessonTrashList() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Đang tải...</div>}>
      <AdminLessonTrashListContent />
    </Suspense>
  );
}
