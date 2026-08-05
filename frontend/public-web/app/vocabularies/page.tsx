"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Vocabulary {
  publicId: string;
  simplified: string;
  pinyin: string;
  meaning: string;
  topic?: string;
}

interface PagedResult {
  items: Vocabulary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function VocabularyListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSearch = searchParams.get("search") || "";
  
  const [data, setData] = useState<PagedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const fetchVocabularies = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const queryParams = new URLSearchParams({
          pageNumber: page.toString(),
          pageSize: "20"
        });
        
        if (searchTerm) {
          queryParams.append("searchTerm", searchTerm);
        }
        
        const res = await fetch(`/api/v1/public/vocabularies?${queryParams.toString()}`);
        
        if (!res.ok) {
          throw new Error("Không thể tải danh sách từ vựng. Vui lòng thử lại sau.");
        }
        
        const result = await res.json();
        setData(result);
        
        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.set("page", page.toString());
        if (searchTerm) {
          url.searchParams.set("search", searchTerm);
        } else {
          url.searchParams.delete("search");
        }
        router.push(url.pathname + url.search, { scroll: false });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add debounce for search
    const timer = setTimeout(() => {
      fetchVocabularies();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [page, searchTerm, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Từ vựng tiếng Trung</h1>
          <p className="text-ink-500 mt-1">Khám phá và học từ vựng mới mỗi ngày</p>
        </div>
        
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Tìm kiếm bằng chữ Hán, pinyin hoặc nghĩa..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="input-field w-full"
          />
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 text-danger-500 p-4 rounded-md mb-8 border border-danger-500">
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse h-40"></div>
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((vocab) => (
              <Link href={`/vocabularies/${vocab.publicId}`} key={vocab.publicId} className="card group">
                <div className="text-center">
                  <div className="text-4xl chinese-text font-bold text-ink-900 group-hover:text-primary-600 transition-colors mb-2">
                    {vocab.simplified}
                  </div>
                  <div className="text-sm font-medium text-ink-500 mb-2">{vocab.pinyin}</div>
                  <div className="text-base text-ink-800 line-clamp-2">{vocab.meaning}</div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-10 flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
                className="btn-secondary px-4 py-2"
              >
                Trước
              </button>
              <span className="inline-flex items-center px-4 py-2 text-ink-800">
                Trang {data.pageNumber} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={!data.hasNextPage}
                className="btn-secondary px-4 py-2"
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-ink-100">
          <div className="text-ink-500 text-lg mb-4">Không tìm thấy từ vựng nào.</div>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="btn-secondary">
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VocabularyList() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-ink-500">Đang tải dữ liệu...</div>}>
      <VocabularyListContent />
    </Suspense>
  );
}
