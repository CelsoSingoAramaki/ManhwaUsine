export interface ManhwaSeries {
  id: string;
  title: string;
  koreanTitle?: string;
  synopsis: string;
  coverUrl: string;
  bannerUrl: string;
  author: string;
  artist: string;
  genres: string[];
  status: 'Ongoing' | 'Completed';
  rating: number;
  totalChapters: number;
  totalEpisodes: number;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  episodeCount: number;
  episodeIds: string[];
}

export interface Episode {
  id: string;
  chapterId: string;
  chapterNumber: number;
  episodeNumber: number; // 1 to 6 within chapter, or absolute 1-60
  absoluteNumber: number;
  title: string;
  thumbnailUrl: string;
  panelUrls: string[];
  panelCount: number;
  releaseDate: string;
  likesCount?: number;
  viewsCount?: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  seriesId: string;
  chapterId: string;
  episodeId: string;
  chapterNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  lastPanelIndex: number;
  scrollPercent: number;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAdmin?: boolean;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ReaderSettings {
  readingWidth: 'normal' | 'wide' | 'full';
  brightness: number; // 50 to 100
  showPageNumbers: boolean;
  highQualityZoom: boolean;
  invertColors: boolean;
  autoScrollSpeed: number; // 0 for off, 1-5 for on
}
