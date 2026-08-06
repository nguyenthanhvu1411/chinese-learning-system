"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditVocabulary() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState({
    simplified: "",
    traditional: "",
    pinyin: "",
    meaning: "",
    topic: "",
    hskLevel: "",
    isPublished: false
  });
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const token = localStorage.getItem("hanyu_admin_token");
        const res = await fetch(`/api/v1/vocabularies/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Không thể tải thông tin từ vựng.");
        
        const data = await res.json();
        setFormData({
          simplified: data.simplified || "",
          traditional: data.traditional || "",
          pinyin: data.pinyin || "",
          meaning: data.meaning || "",
          topic: data.topic || "",
          hskLevel: data.hskLevel?.toString() || "",
          isPublished: data.isPublished || false
        });
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setIsFetching(false);
      }
    };
    
    if (id) fetchVocab();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("hanyu_admin_token");
      const payload = {
        ...formData,
        hskLevel: formData.hskLevel ? parseInt(formData.hskLevel) : null,
      };

      const res = await fetch(`/api/v1/vocabularies/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Lỗi khi cập nhật từ vựng.");
      }

      router.push("/vocabularies");
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger-600 mb-4">{fetchError}</p>
        <Link href="/vocabularies" className="btn-secondary">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/vocabularies" className="text-slate-500 hover:text-slate-900">
          &larr; Quay lại
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Cập nhật từ vựng</h1>
      </div>

      <div className="admin-panel p-6">
        {error && (
          <div className="mb-6 p-4 bg-danger-50 text-danger-600 rounded-md border border-danger-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="simplified" className="block text-sm font-medium text-slate-700">Chữ Hán (Giản thể) *</label>
              <input type="text" name="simplified" id="simplified" required value={formData.simplified} onChange={handleChange} className="mt-1 input-field" />
            </div>
            <div>
              <label htmlFor="traditional" className="block text-sm font-medium text-slate-700">Phồn thể (Tuỳ chọn)</label>
              <input type="text" name="traditional" id="traditional" value={formData.traditional} onChange={handleChange} className="mt-1 input-field" />
            </div>
            <div>
              <label htmlFor="pinyin" className="block text-sm font-medium text-slate-700">Pinyin *</label>
              <input type="text" name="pinyin" id="pinyin" required value={formData.pinyin} onChange={handleChange} className="mt-1 input-field" />
            </div>
            <div>
              <label htmlFor="hskLevel" className="block text-sm font-medium text-slate-700">Cấp độ HSK</label>
              <select name="hskLevel" id="hskLevel" value={formData.hskLevel} onChange={handleChange} className="mt-1 input-field">
                <option value="">Không phân cấp</option>
                {[1,2,3,4,5,6,7,8,9].map(level => (
                  <option key={level} value={level}>HSK {level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="meaning" className="block text-sm font-medium text-slate-700">Nghĩa tiếng Việt *</label>
            <input type="text" name="meaning" id="meaning" required value={formData.meaning} onChange={handleChange} className="mt-1 input-field" />
          </div>

          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700">Chủ đề (Topic)</label>
            <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange} className="mt-1 input-field" />
          </div>

          <div className="flex items-center mt-4">
            <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-slate-900">
              Xuất bản (Hiển thị cho người dùng)
            </label>
          </div>

          <div className="pt-5 border-t border-slate-200 flex justify-end space-x-3">
            <Link href="/vocabularies" className="btn-secondary">Hủy</Link>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
