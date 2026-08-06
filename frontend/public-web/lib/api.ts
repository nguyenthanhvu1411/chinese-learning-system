export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7196";

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PublicVocabularyDto {
  id: string;
  topicId: string;
  simplified: string;
  traditional: string | null;
  pinyin: string;
  meaningVi: string;
  partOfSpeech: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  hskLevel: number;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Use 'no-store' by default to ensure fresh data during MVP
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorBody = await response.json();
      errorDetail = errorBody.detail || errorBody.title || errorDetail;
    } catch {
      // Ignored
    }
    throw new Error(`API Error ${response.status}: ${errorDetail}`);
  }

  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}
