"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, GraduationCap, Edit, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";

interface Vocabulary {
  id: string;
  simplified: string;
  pinyin: string;
  meaningVi: string;
}

interface AdminLessonDetail {
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
  vocabularies: Vocabulary[];
}

export default function LessonDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<AdminLessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [vocabIdToAdd, setVocabIdToAdd] = useState("");
  const [vocabOrderToAdd, setVocabOrderToAdd] = useState("1");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể tải thông tin chi tiết.");
      
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePublish = async (action: 'publish' | 'unpublish') => {
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Không thể ${action === 'publish' ? 'xuất bản' : 'huỷ xuất bản'}.`);
      fetchLesson();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabIdToAdd) return;
    setIsAssigning(true);
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}/vocabularies`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vocabularyId: vocabIdToAdd,
          sortOrder: parseInt(vocabOrderToAdd) || 1
        })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Lỗi khi gán từ vựng.");
      }
      setVocabIdToAdd("");
      fetchLesson();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveVocab = async (vocabId: string) => {
    if (!window.confirm("Bỏ gán từ vựng này khỏi bài học?")) return;
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/admin/lessons/${id}/vocabularies/${vocabId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Lỗi khi bỏ gán từ vựng.");
      fetchLesson();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger-600 mb-4">{error || "Không tìm thấy dữ liệu"}</p>
        <Link href="/lessons" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Quay lại danh sách</Link>
      </div>
    );
  }

  const isPublished = data.status === 2 || data.status === 'Published';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <Link href="/lessons" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 font-serif flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-600" />
            Chi tiết Bài học
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {isPublished ? (
            <button onClick={() => handlePublish('unpublish')} className="flex items-center gap-1.5 px-4 py-2 bg-warning-50 text-warning-700 hover:bg-warning-100 font-bold rounded-lg transition-colors text-sm">
              <XCircle className="w-4 h-4" />
              Huỷ xuất bản
            </button>
          ) : (
            <button onClick={() => handlePublish('publish')} className="flex items-center gap-1.5 px-4 py-2 bg-success-50 text-success-700 hover:bg-success-100 font-bold rounded-lg transition-colors text-sm">
              <CheckCircle className="w-4 h-4" />
              Xuất bản
            </button>
          )}
          <Link href={`/lessons/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-lg transition-colors shadow-sm text-sm">
            <Edit className="w-4 h-4" />
            Sửa bài học
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Thông tin cơ bản</h3>
          <p className="mt-1 text-sm text-slate-500 font-mono">ID: {data.id}</p>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Tên bài học</dt>
              <dd className="mt-1 text-xl font-bold text-slate-900">{data.titleVi}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Slug</dt>
              <dd className="mt-1 text-sm font-mono text-slate-700">{data.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Trạng thái</dt>
              <dd className="mt-1">
                <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${isPublished ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'}`}>
                  {isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Mô tả</dt>
              <dd className="mt-1 text-sm text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-100">{data.descriptionVi || <span className="text-slate-400 italic">Không có mô tả</span>}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Thời lượng dự kiến</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{data.estimatedMinutes} phút</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Thứ tự hiển thị</dt>
              <dd className="mt-1 text-sm font-bold text-slate-900">{data.sortOrder}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">Từ vựng trong bài học ({data.vocabularies?.length || 0})</h3>
          
          <form onSubmit={handleAssignVocab} className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Nhập Vocabulary ID..." 
              value={vocabIdToAdd}
              onChange={e => setVocabIdToAdd(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-mono w-full sm:w-64"
            />
            <input 
              type="number" 
              placeholder="Thứ tự" 
              value={vocabOrderToAdd}
              onChange={e => setVocabOrderToAdd(e.target.value)}
              className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-20"
            />
            <button type="submit" disabled={isAssigning || !vocabIdToAdd} className="flex items-center justify-center p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Chữ Hán</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pinyin</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nghĩa</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {(!data.vocabularies || data.vocabularies.length === 0) ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500 font-medium">Chưa có từ vựng nào được gán</td>
                </tr>
              ) : (
                data.vocabularies.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xl font-bold text-slate-900 font-serif">{v.simplified}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">{v.pinyin}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{v.meaningVi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleRemoveVocab(v.id)} className="text-danger-500 hover:text-danger-700 p-2 opacity-70 group-hover:opacity-100 transition-opacity" title="Gỡ từ vựng">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
