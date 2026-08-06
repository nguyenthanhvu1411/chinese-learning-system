"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, BookOpen, Bell, Leaf, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface AdminVocabulary {
  id: string;
  topicId: string;
  simplified: string;
  traditional?: string;
  pinyin: string;
  meaningVi: string;
  partOfSpeech?: string;
  audioUrl?: string;
  imageUrl?: string;
  hskLevel: number;
  status: number | string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
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
        pageSize: "10",
        sortBy: "CreatedAt",
        descending: "true"
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

  const handleDelete = async (id: string) => {
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2 text-slate-800">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-sm">Từ vựng</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">Quản lý từ vựng</span>
        </div>
        <div className="flex items-center gap-5">
          <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-[#FAF7F2]"></span>
          </button>
          
          <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-success-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 text-sm">
              A
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-bold text-slate-900 leading-tight">Admin User</p>
              <p className="text-[10px] text-slate-500 leading-tight">Quản trị viên</p>
            </div>
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative bg-[#F4EFE6] rounded-3xl overflow-hidden shadow-sm border border-[#EBE3D5]">
        <div className="absolute inset-y-0 right-0 w-2/3 z-0 opacity-80 mix-blend-multiply" style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 40%)" }}>
          <Image 
            src="/images/admin/banner-bg.png" 
            alt="Banner background" 
            fill 
            className="object-cover object-right"
            priority
          />
        </div>
        <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="max-w-md">
            <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight mb-3">Quản lý từ vựng</h1>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Quản lý, thêm mới và chỉnh sửa từ vựng để xây dựng kho từ vựng phong phú cho người học.
            </p>
            <div className="w-12 h-1 bg-primary-600 rounded-full mt-4"></div>
          </div>
          <Link href="/vocabularies/new" className="shrink-0 bg-[#d32f2f] hover:bg-danger-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-danger-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 relative z-20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Thêm từ vựng
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4 text-success-600" />
              Lọc
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-warning-600" />
              Sắp xếp
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-danger-50 text-danger-700 border-b border-danger-100 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-16">STT</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Chữ Hán</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pinyin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nghĩa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {isLoading && !data ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">Không tìm thấy từ vựng nào</td>
                </tr>
              ) : (
                data?.items.map((vocab, index) => (
                  <tr key={vocab.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-400 font-medium">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xl font-bold text-slate-900 font-serif">{vocab.simplified}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">{vocab.pinyin}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 truncate max-w-[200px]">{vocab.meaningVi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${vocab.status === 2 || vocab.status === 'Published' ? 'bg-success-500' : 'bg-warning-500'}`}></div>
                        <span className={`text-xs font-bold ${vocab.status === 2 || vocab.status === 'Published' ? 'text-success-700' : 'text-warning-700'}`}>
                          {vocab.status === 2 || vocab.status === 'Published' ? "Xuất bản" : "Bản nháp"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link href={`/vocabularies/${vocab.id}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-bold">Xem</span>
                        </Link>
                        <Link href={`/vocabularies/${vocab.id}/edit`} className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 transition-colors" title="Chỉnh sửa">
                          <Pencil className="w-4 h-4" />
                          <span className="text-xs font-bold">Sửa</span>
                        </Link>
                        <button onClick={() => handleDelete(vocab.id)} className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Xóa</span>
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
            Hiển thị <span className="text-slate-900 font-bold">{(page - 1) * 10 + 1}</span> đến <span className="text-slate-900 font-bold">{data ? Math.min(page * 10, data.totalPages * 10) : 0}</span> từ vựng
          </div>
          
          {data && data.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPreviousPage} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Simple page numbers */}
              {[...Array(data.totalPages)].map((_, i) => {
                // only show nearby pages
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
          
          <div className="hidden sm:flex items-center gap-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option>10 / trang</option>
              <option>20 / trang</option>
              <option>50 / trang</option>
            </select>
          </div>
        </div>
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
