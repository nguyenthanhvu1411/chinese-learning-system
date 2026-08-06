"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface VocabularyDetail {
  publicId: string;
  simplified: string;
  traditional?: string;
  pinyin: string;
  meaning: string;
  topic?: string;
  hskLevel?: number;
  examples: {
    chinese: string;
    pinyin: string;
    meaning: string;
  }[];
}

export default function VocabularyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [data, setData] = useState<VocabularyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/v1/public/vocabularies/${id}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Không tìm thấy từ vựng này.");
          }
          throw new Error("Có lỗi xảy ra khi tải dữ liệu.");
        }
        
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-ink-100 rounded-lg max-w-sm mx-auto"></div>
          <div className="h-8 bg-ink-100 rounded w-64 mx-auto"></div>
          <div className="h-24 bg-ink-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900 mb-4">Lỗi</h2>
        <p className="text-danger-500 mb-8">{error || "Không tìm thấy dữ liệu"}</p>
        <button onClick={() => router.push("/vocabularies")} className="btn-primary">
          Trở về danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/vocabularies" className="text-primary-600 hover:text-primary-700 font-medium mb-8 inline-flex items-center">
        &larr; Trở về danh sách
      </Link>
      
      <div className="card text-center py-16 mb-8 relative">
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-ink-50 transition-colors"
          aria-label="Favorite"
        >
          <svg className={`w-8 h-8 ${isFavorite ? "text-primary-500 fill-current" : "text-ink-300"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        
        <div className="text-8xl chinese-text font-bold text-ink-900 mb-6">{data.simplified}</div>
        <div className="text-2xl font-medium text-ink-500 mb-6">{data.pinyin}</div>
        <div className="text-3xl text-ink-800">{data.meaning}</div>
        
        {data.hskLevel && (
          <div className="mt-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
              HSK {data.hskLevel}
            </span>
          </div>
        )}
      </div>

      {data.examples && data.examples.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-ink-900 mb-6 border-b border-ink-100 pb-4">Ví dụ sử dụng</h3>
          <ul className="space-y-6">
            {data.examples.map((ex, idx) => (
              <li key={idx} className="pb-6 border-b border-ink-50 last:border-0 last:pb-0">
                <div className="text-xl chinese-text text-ink-900 mb-2">{ex.chinese}</div>
                <div className="text-sm text-ink-500 mb-2">{ex.pinyin}</div>
                <div className="text-base text-ink-800">{ex.meaning}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
