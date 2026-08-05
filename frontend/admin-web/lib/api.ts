import { cookies } from "next/headers";

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

export interface VocabularyDto {
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
  status: 'Draft' | 'Published' | 'Archived';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
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
