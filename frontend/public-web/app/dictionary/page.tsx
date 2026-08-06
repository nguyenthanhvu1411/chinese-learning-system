import { fetchApi, PagedList, PublicVocabularyDto } from "../../lib/api";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Dictionary - HANYU",
  description: "Search HSK vocabulary and Chinese characters.",
};

// Next.js 16 allows asynchronous Server Components.
// We handle searchParams asynchronously using React's use() if needed, but Next.js passes it as a Promise in Next 15+
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DictionaryPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const hsk = typeof searchParams.hsk === 'string' ? searchParams.hsk : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-4xl font-bold text-ink-900 mb-4 font-serif">Dictionary</h1>
        <p className="text-ink-600 mb-8">Search the HSK vocabulary database.</p>
        
        <form className="w-full max-w-2xl flex gap-2" action="/dictionary" method="GET">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search in Chinese, Pinyin, or English..." 
            className="input-field text-lg"
            autoFocus
          />
          <button type="submit" className="btn-primary text-lg px-8">
            Search
          </button>
        </form>
        
        <div className="flex gap-2 mt-4 text-sm">
          <span className="text-ink-500 mr-2 py-1">Quick Filters:</span>
          {[1, 2, 3, 4, 5, 6].map(level => (
            <Link 
              key={level} 
              href={`/dictionary?hsk=${level}`}
              className={`px-3 py-1 rounded-full border ${hsk === level.toString() ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50'}`}
            >
              HSK {level}
            </Link>
          ))}
          {hsk && (
            <Link href="/dictionary" className="px-3 py-1 text-ink-500 hover:text-ink-900 underline">
              Clear
            </Link>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-pulse w-12 h-12 bg-ink-200 rounded-full"></div></div>}>
        <VocabularyResults q={q} page={page} hsk={hsk} />
      </Suspense>
    </div>
  );
}

async function VocabularyResults({ q, page, hsk }: { q: string, page: number, hsk: string }) {
  const queryParams = new URLSearchParams({ page: page.toString(), pageSize: '20' });
  if (q) queryParams.append('search', q);
  if (hsk) queryParams.append('hskLevel', hsk);

  let data: PagedList<PublicVocabularyDto> | null = null;
  let errorMsg = "";

  try {
    data = await fetchApi<PagedList<PublicVocabularyDto>>(`/api/v1/vocabularies?${queryParams.toString()}`);
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
  }

  if (errorMsg) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 max-w-2xl mx-auto">
        <h3 className="font-bold">Error loading vocabulary</h3>
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="text-center py-20 card max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-ink-900 mb-2">No words found</h3>
        <p className="text-ink-600">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-ink-500 mb-4">{data.totalCount} results found</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((vocab: PublicVocabularyDto) => (
          <div key={vocab.id} className="card flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-4xl font-serif text-ink-900">{vocab.simplified}</h2>
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded">
                HSK {vocab.hskLevel}
              </span>
            </div>
            
            <div className="text-lg text-primary-600 font-medium mb-1">
              {vocab.pinyin}
            </div>
            
            <div className="text-ink-800 text-lg mb-4 flex-1">
              {vocab.meaningVi}
            </div>
            
            <div className="mt-auto pt-4 border-t border-ink-100 text-sm text-ink-500 flex gap-2">
              {vocab.partOfSpeech && (
                <span className="bg-ink-100 px-2 py-0.5 rounded">{vocab.partOfSpeech}</span>
              )}
              {vocab.traditional && vocab.traditional !== vocab.simplified && (
                <span>Trad: {vocab.traditional}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {data.hasPreviousPage && (
            <Link href={`/dictionary?page=${data.pageNumber - 1}${q ? `&q=${q}` : ''}${hsk ? `&hsk=${hsk}` : ''}`} className="btn-secondary px-4 py-2">
              Previous
            </Link>
          )}
          
          <div className="flex items-center px-4 font-medium text-ink-600">
            Page {data.pageNumber} of {data.totalPages}
          </div>
          
          {data.hasNextPage && (
            <Link href={`/dictionary?page=${data.pageNumber + 1}${q ? `&q=${q}` : ''}${hsk ? `&hsk=${hsk}` : ''}`} className="btn-secondary px-4 py-2">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
