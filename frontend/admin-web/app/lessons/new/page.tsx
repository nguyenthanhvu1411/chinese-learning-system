"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateLesson() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titleVi: "",
    descriptionVi: "",
    topicId: "00000000-0000-0000-0000-000000000000", // Will need a topic selector in a real app
    estimatedMinutes: "15",
    sortOrder: "1"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("hanyu_admin_token");
      
      const payload = {
        ...formData,
        estimatedMinutes: parseInt(formData.estimatedMinutes) || 0,
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      const res = await fetch("/api/v1/admin/lessons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Lỗi khi tạo bài học.");
      }

      router.push("/lessons");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
        <Link href="/lessons" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 font-serif">Thêm bài học mới</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {error && (
          <div className="mb-6 p-4 bg-danger-50 text-danger-700 rounded-xl border border-danger-100 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="titleVi" className="block text-sm font-bold text-slate-700 mb-2">Tên bài học *</label>
              <input type="text" name="titleVi" id="titleVi" required value={formData.titleVi} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all font-medium" placeholder="VD: Bài 1: Xin chào" />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="descriptionVi" className="block text-sm font-bold text-slate-700 mb-2">Mô tả (Tuỳ chọn)</label>
              <textarea name="descriptionVi" id="descriptionVi" rows={3} value={formData.descriptionVi} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all resize-none" placeholder="Nhập mô tả bài học..."></textarea>
            </div>

            <div>
              <label htmlFor="estimatedMinutes" className="block text-sm font-bold text-slate-700 mb-2">Thời gian dự kiến (phút) *</label>
              <input type="number" name="estimatedMinutes" id="estimatedMinutes" required min="1" value={formData.estimatedMinutes} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all font-medium" />
            </div>
            
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-bold text-slate-700 mb-2">Thứ tự hiển thị *</label>
              <input type="number" name="sortOrder" id="sortOrder" required min="0" value={formData.sortOrder} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all font-medium" />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="topicId" className="block text-sm font-bold text-slate-700 mb-2">Chủ đề ID * (Tạm thời)</label>
              <input type="text" name="topicId" id="topicId" required value={formData.topicId} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all font-mono text-sm" />
              <p className="mt-1 text-xs text-slate-500">Vì tính năng Topic chưa có UI, bạn có thể truyền ID topic hoặc GUID rỗng ở đây.</p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end space-x-3">
            <Link href="/lessons" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Hủy</Link>
            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
              {isLoading ? "Đang lưu..." : "Lưu bài học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
