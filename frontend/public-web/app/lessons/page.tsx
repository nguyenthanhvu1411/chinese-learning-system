"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BookOpen, Clock, ChevronRight, GraduationCap } from "lucide-react";
import { fetchApi } from "../../lib/api";

interface Lesson {
  id: string;
  topicId: string;
  slug: string;
  titleVi: string;
  descriptionVi?: string;
  estimatedMinutes: number;
}

interface PagedResult {
  items: Lesson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function LessonListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialTopic = searchParams.get("topic") || "";
  
  const [data, setData] = useState<PagedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [page, setPage] = useState(initialPage);
  const [topic, setTopic] = useState(initialTopic);

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          size: "20"
        });
        
        if (topic) {
          queryParams.append("topic", topic);
        }
        
        const res = await fetchApi<PagedResult>(`/api/v1/lessons?${queryParams.toString()}`);
        setData(res);
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set("page", page.toString());
        if (topic) {
          url.searchParams.set("topic", topic);
        } else {
          url.searchParams.delete("topic");
        }
        router.push(url.pathname + url.search, { scroll: false });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLessons();
  }, [page, topic, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 font-serif">Bài học tiếng Trung</h1>
          <p className="text-ink-500 mt-2 font-medium">Khám phá các bài học theo chủ đề để nâng cao trình độ</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-500 p-4 rounded-md mb-8 border border-danger-500 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse h-48"></div>
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((lesson) => (
              <Link href={`/lessons/${lesson.slug}`} key={lesson.id} className="group flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FAF7F2] rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    {lesson.estimatedMinutes} phút
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 font-serif mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                  {lesson.titleVi}
                </h3>
                
                <p className="text-sm text-slate-600 mb-6 line-clamp-2 flex-1">
                  {lesson.descriptionVi || "Chưa có mô tả cho bài học này."}
                </p>
                
                <div className="flex items-center justify-between text-sm font-bold text-primary-600 border-t border-slate-100 pt-4 mt-auto">
                  Bắt đầu học
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-12 flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              <span className="inline-flex items-center px-4 py-3 text-slate-700 font-bold">
                Trang {data.pageNumber} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={!data.hasNextPage}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <div className="text-slate-500 font-medium text-lg mb-4">Không tìm thấy bài học nào.</div>
          {topic && (
            <button onClick={() => setTopic("")} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all">
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonList() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>}>
      <LessonListContent />
    </Suspense>
  );
}
