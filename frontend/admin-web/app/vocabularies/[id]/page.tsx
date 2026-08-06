"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface AdminVocabularyDetail {
  id: number;
  publicId: string;
  simplified: string;
  traditional?: string;
  pinyin: string;
  meaning: string;
  topic?: string;
  hskLevel?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  examples: any[];
}

export default function VocabularyDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<AdminVocabularyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const token = localStorage.getItem("hanyu_admin_token");
        const res = await fetch(`/api/v1/vocabularies/${id}`, {
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
    
    if (id) fetchVocab();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-danger-600 mb-4">{error || "Không tìm thấy dữ liệu"}</p>
        <Link href="/vocabularies" className="btn-secondary">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/vocabularies" className="text-slate-500 hover:text-slate-900">
            &larr; Quay lại
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Chi tiết từ vựng</h1>
        </div>
        <div className="flex space-x-3">
          <Link href={`/vocabularies/${id}/edit`} className="btn-primary">
            Sửa
          </Link>
        </div>
      </div>

      <div className="admin-panel overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg leading-6 font-medium text-slate-900">Thông tin cơ bản</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">ID: {data.publicId}</p>
        </div>
        <div className="px-6 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-slate-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Trạng thái</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  data.isPublished ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                }`}>
                  {data.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Chữ Hán</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900 sm:mt-0 sm:col-span-2">{data.simplified}</dd>
            </div>
            {data.traditional && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500">Phồn thể</dt>
                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{data.traditional}</dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Pinyin</dt>
              <dd className="mt-1 text-lg font-medium text-slate-700 sm:mt-0 sm:col-span-2">{data.pinyin}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Nghĩa tiếng Việt</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{data.meaning}</dd>
            </div>
            {data.topic && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500">Chủ đề</dt>
                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{data.topic}</dd>
              </div>
            )}
            {data.hskLevel && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-slate-500">Cấp độ HSK</dt>
                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">HSK {data.hskLevel}</dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-500">Ngày tạo</dt>
              <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{new Date(data.createdAt).toLocaleString('vi-VN')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
