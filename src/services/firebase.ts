import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
} from 'firebase/auth';
import { Bookmark, Chapter, Episode, FirebaseConfigState, ManhwaSeries, UserProfile } from '../types';
import { DEFAULT_CHAPTERS, DEFAULT_EPISODES, DEFAULT_SERIES } from '../data/initialManhwa';

const STORAGE_KEY_CONFIG = 'manhwa_firebase_config';
const STORAGE_KEY_SERIES = 'manhwa_cached_series';
const STORAGE_KEY_CHAPTERS = 'manhwa_cached_chapters';
const STORAGE_KEY_EPISODES = 'manhwa_cached_episodes';
const STORAGE_KEY_BOOKMARKS = 'manhwa_cached_bookmarks';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

// Retrieve saved or env config
export function getSavedFirebaseConfig(): FirebaseConfigState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read firebase config from storage', e);
  }
  return null;
}

// Initialize Firebase if credentials exist
export function initFirebaseService(customConfig?: FirebaseConfigState | null) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, auth: null, isLive: false };
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth, isLive: true };
  } catch (err) {
    console.warn('Firebase init error:', err);
    return { app: null, db: null, auth: null, isLive: false };
  }
}

// Initial bootstrap attempt
initFirebaseService();

// Local Storage Helper Fallbacks
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

/* =========================================================================
   AUTH SERVICES
   ========================================================================= */

export async function loginWithGoogle(): Promise<UserProfile | null> {
  const { auth } = initFirebaseService();
  if (!auth) {
    // Return mock demo login if Firebase isn't configured yet
    const demoUser: UserProfile = {
      uid: 'demo-user-123',
      displayName: 'Demon Hunter',
      email: 'reader@example.com',
      isAdmin: true,
    };
    localStorage.setItem('manhwa_demo_user', JSON.stringify(demoUser));
    return demoUser;
  }

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      isAdmin: user.email === 'celsosingo@gmail.com',
    };
  } catch (error) {
    console.error('Google Sign-in failed', error);
    throw error;
  }
}

export async function loginAsGuest(): Promise<UserProfile> {
  const { auth } = initFirebaseService();
  if (auth) {
    try {
      const cred = await signInAnonymously(auth);
      return {
        uid: cred.user.uid,
        displayName: 'Guest Reader',
        isAdmin: false,
      };
    } catch (e) {
      console.warn('Anonymous auth failed, falling back to local guest', e);
    }
  }

  const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
  const guestUser: UserProfile = {
    uid: guestId,
    displayName: 'Guest Reader',
    isAdmin: false,
  };
  localStorage.setItem('manhwa_demo_user', JSON.stringify(guestUser));
  return guestUser;
}

export async function logoutUser(): Promise<void> {
  const { auth } = initFirebaseService();
  if (auth) {
    await fbSignOut(auth);
  }
  localStorage.removeItem('manhwa_demo_user');
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  const { auth } = initFirebaseService();
  if (!auth) {
    const demo = localStorage.getItem('manhwa_demo_user');
    if (demo) {
      try {
        callback(JSON.parse(demo));
        return () => {};
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, (fbUser: User | null) => {
    if (fbUser) {
      callback({
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Manhwa Reader',
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        isAdmin: fbUser.email === 'celsosingo@gmail.com',
      });
    } else {
      const demo = localStorage.getItem('manhwa_demo_user');
      callback(demo ? JSON.parse(demo) : null);
    }
  });
}

/* =========================================================================
   DATA SERVICES (SERIES, CHAPTERS, EPISODES)
   ========================================================================= */

export async function fetchSeries(): Promise<ManhwaSeries> {
  const { db } = initFirebaseService();
  if (db) {
    try {
      const docRef = doc(db, 'series', DEFAULT_SERIES.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ManhwaSeries;
      }
    } catch (err) {
      console.warn('Firestore fetch series error, using fallback cache', err);
    }
  }
  return getLocalItem<ManhwaSeries>(STORAGE_KEY_SERIES, DEFAULT_SERIES);
}

export async function fetchChapters(): Promise<Chapter[]> {
  const { db } = initFirebaseService();
  if (db) {
    try {
      const colRef = collection(db, 'chapters');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const chapters = snap.docs.map((d) => d.data() as Chapter);
        chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
        return chapters;
      }
    } catch (err) {
      console.warn('Firestore fetch chapters error, using fallback', err);
    }
  }
  return getLocalItem<Chapter[]>(STORAGE_KEY_CHAPTERS, DEFAULT_CHAPTERS);
}

export async function fetchEpisodes(): Promise<Episode[]> {
  const { db } = initFirebaseService();
  if (db) {
    try {
      const colRef = collection(db, 'episodes');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const episodes = snap.docs.map((d) => d.data() as Episode);
        episodes.sort((a, b) => a.absoluteNumber - b.absoluteNumber);
        return episodes;
      }
    } catch (err) {
      console.warn('Firestore fetch episodes error, using fallback', err);
    }
  }
  return getLocalItem<Episode[]>(STORAGE_KEY_EPISODES, DEFAULT_EPISODES);
}

export async function fetchEpisodeById(episodeId: string): Promise<Episode | null> {
  const episodes = await fetchEpisodes();
  const ep = episodes.find((e) => e.id === episodeId);
  return ep || null;
}

export async function updateEpisodePanels(episodeId: string, panelUrls: string[]): Promise<boolean> {
  // Update local memory and cache first
  const episodes = getLocalItem<Episode[]>(STORAGE_KEY_EPISODES, DEFAULT_EPISODES);
  const targetIdx = episodes.findIndex((e) => e.id === episodeId);
  if (targetIdx !== -1) {
    episodes[targetIdx].panelUrls = panelUrls;
    episodes[targetIdx].panelCount = panelUrls.length;
    setLocalItem(STORAGE_KEY_EPISODES, episodes);
  }

  // Sync to Firestore if connected
  const { db } = initFirebaseService();
  if (db && targetIdx !== -1) {
    try {
      const docRef = doc(db, 'episodes', episodeId);
      await setDoc(docRef, episodes[targetIdx], { merge: true });
    } catch (err) {
      console.error('Failed to sync updated panels to Firestore:', err);
    }
  }

  return true;
}

/* =========================================================================
   BOOKMARK & READING PROGRESS SERVICES
   ========================================================================= */

export async function saveReadingBookmark(bookmark: Bookmark): Promise<void> {
  // Always update local cache for instant zero-latency resumes
  const bookmarks = getLocalItem<Record<string, Bookmark>>(STORAGE_KEY_BOOKMARKS, {});
  const userKey = bookmark.userId || 'guest';
  bookmarks[userKey] = bookmark;
  setLocalItem(STORAGE_KEY_BOOKMARKS, bookmarks);

  // Sync to Firestore if live connection
  const { db } = initFirebaseService();
  if (db && bookmark.userId) {
    try {
      const bookmarkRef = doc(db, 'users', bookmark.userId, 'bookmarks', bookmark.seriesId);
      await setDoc(bookmarkRef, {
        ...bookmark,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to sync bookmark to Firestore:', err);
    }
  }
}

export async function getLatestBookmark(userId?: string): Promise<Bookmark | null> {
  const userKey = userId || 'guest';
  const localBookmarks = getLocalItem<Record<string, Bookmark>>(STORAGE_KEY_BOOKMARKS, {});
  let bookmark: Bookmark | null = localBookmarks[userKey] || null;

  const { db } = initFirebaseService();
  if (db && userId) {
    try {
      const bookmarkRef = doc(db, 'users', userId, 'bookmarks', DEFAULT_SERIES.id);
      const snap = await getDoc(bookmarkRef);
      if (snap.exists()) {
        bookmark = snap.data() as Bookmark;
      }
    } catch (err) {
      console.warn('Could not read bookmark from Firestore', err);
    }
  }

  return bookmark;
}

// Reset all demo data to fresh seed
export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEY_SERIES);
  localStorage.removeItem(STORAGE_KEY_CHAPTERS);
  localStorage.removeItem(STORAGE_KEY_EPISODES);
  localStorage.removeItem(STORAGE_KEY_BOOKMARKS);
}
