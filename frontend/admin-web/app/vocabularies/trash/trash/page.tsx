"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TrashedVocabulary {
  id: number;
  publicId: string;
  simplified: string;
  pinyin: string;
  meaning: string;
  deletedAt: string;
}

export default function TrashPage() {
  const router = useRouter();
  const [data, setData] = useState<TrashedVocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrash = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/vocabularies/trash`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Không thể tải danh sách thùng rác.");
      }
      
      const result = await res.json();
      setData(result.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/vocabularies/${id}/restore`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Không thể khôi phục.");
      fetchTrash();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN? Hành động này không thể hoàn tác và sẽ được lưu vào audit log.")) return;
    
    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const res = await fetch(`/api/v1/vocabularies/${id}/permanent`, {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">Thùng rác</h1>
      </div>

      <div className="admin-panel overflow-hidden">
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
                <th className="table-header">Ngày xóa</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">Đang tải...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">Thùng rác trống</td>
                </tr>
              ) : (
                data.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50">
                    <td className="table-cell text-slate-500 font-mono text-xs">{vocab.publicId.split('-')[0]}</td>
                    <td className="table-cell font-bold">{vocab.simplified}</td>
                    <td className="table-cell text-slate-600">{vocab.pinyin}</td>
                    <td className="table-cell">{vocab.meaning}</td>
                    <td className="table-cell text-slate-500">{new Date(vocab.deletedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="table-cell text-right text-sm font-medium">
                      <button onClick={() => handleRestore(vocab.id)} className="text-primary-600 hover:text-primary-900 mr-4">Khôi phục</button>
                      <button onClick={() => handlePermanentDelete(vocab.id)} className="text-danger-600 hover:text-danger-900">Xóa vĩnh viễn</button>
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
