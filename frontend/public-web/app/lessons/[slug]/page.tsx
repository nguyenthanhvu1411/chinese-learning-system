"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, BookOpen, Volume2, ArrowRight } from "lucide-react";

interface Vocabulary {
  id: string;
  publicId: string;
  simplified: string;
  pinyin: string;
  meaningVi: string;
}

interface LessonDetail {
  id: string;
  topicId: string;
  slug: string;
  titleVi: string;
  descriptionVi?: string;
  estimatedMinutes: number;
  vocabularies: Vocabulary[];
}

export default function LessonDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
  const [data, setData] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVocab, setActiveVocab] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/v1/lessons/${slug}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Không tìm thấy bài học này.");
          }
          throw new Error("Không thể tải thông tin bài học.");
        }
        
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) fetchLesson();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm max-w-md mx-auto">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-danger-600 mb-8">{error || "Không tìm thấy bài học"}</p>
          <Link href="/lessons" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link href="/lessons" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tất cả bài học
        </Link>
        
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold">
                <Clock className="w-4 h-4" />
                {data.estimatedMinutes} phút
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                <BookOpen className="w-4 h-4" />
                {data.vocabularies?.length || 0} từ vựng
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif mb-4 leading-tight">
              {data.titleVi}
            </h1>
            
            {data.descriptionVi && (
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                {data.descriptionVi}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif mb-6 flex items-center gap-2">
          Danh sách từ vựng
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">{data.vocabularies?.length || 0}</span>
        </h2>

        {(!data.vocabularies || data.vocabularies.length === 0) ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">Bài học này chưa có từ vựng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.vocabularies.map((vocab, index) => (
              <div 
                key={vocab.id} 
                className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer ${activeVocab === vocab.id ? 'border-primary-500 shadow-md ring-2 ring-primary-500/10' : 'border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-md'}`}
                onClick={() => setActiveVocab(activeVocab === vocab.id ? null : vocab.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 font-serif mb-1">{vocab.simplified}</h3>
                      <p className="text-primary-600 font-medium text-sm">{vocab.pinyin}</p>
                    </div>
                  </div>
                  
                  <button className="w-10 h-10 rounded-full bg-slate-50 hover:bg-primary-50 text-slate-400 hover:text-primary-600 flex items-center justify-center transition-colors">
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className={`mt-4 pt-4 border-t border-slate-100 transition-all ${activeVocab === vocab.id ? 'block' : 'hidden sm:block'}`}>
                  <p className="text-slate-700 font-medium">{vocab.meaningVi}</p>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/vocabularies/${vocab.publicId}`} className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      Xem chi tiết <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Footer */}
      {data.vocabularies && data.vocabularies.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left mt-12 shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 max-w-xl">
            <h3 className="text-2xl font-bold text-white mb-2">Sẵn sàng học?</h3>
            <p className="text-slate-300 font-medium">Luyện tập {data.vocabularies.length} từ vựng trong bài học này với các bài tập flashcard và trắc nghiệm.</p>
          </div>
          
          <button className="relative z-10 shrink-0 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl shadow-lg transition-all hover:-translate-y-1 w-full sm:w-auto">
            Bắt đầu học ngay
          </button>
        </div>
      )}
    </div>
  );
}
