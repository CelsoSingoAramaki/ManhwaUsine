import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Chapter, Episode, ManhwaSeries, UserProfile } from './types';
import {
  fetchChapters,
  fetchEpisodeById,
  fetchEpisodes,
  fetchSeries,
  getLatestBookmark,
  initFirebaseService,
  subscribeToAuth,
} from './services/firebase';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Reader } from './components/Reader';
import { AdminPanel } from './components/AdminPanel';
import { GoDaddyExportModal } from './components/GoDaddyExportModal';
import { FirebaseModal } from './components/FirebaseModal';
import { AuthModal } from './components/AuthModal';
import { DEFAULT_SERIES, DEFAULT_CHAPTERS, DEFAULT_EPISODES } from './data/initialManhwa';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'reader' | 'admin'>('dashboard');
  const [series, setSeries] = useState<ManhwaSeries>(DEFAULT_SERIES);
  const [chapters, setChapters] = useState<Chapter[]>(DEFAULT_CHAPTERS);
  const [episodes, setEpisodes] = useState<Episode[]>(DEFAULT_EPISODES);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [latestBookmark, setLatestBookmark] = useState<Bookmark | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(false);

  // Modals state
  const [isGoDaddyModalOpen, setIsGoDaddyModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load all initial manhwa data
  const loadData = useCallback(async () => {
    try {
      const [loadedSeries, loadedChapters, loadedEpisodes] = await Promise.all([
        fetchSeries(),
        fetchChapters(),
        fetchEpisodes(),
      ]);
      setSeries(loadedSeries);
      setChapters(loadedChapters);
      setEpisodes(loadedEpisodes);

      const status = initFirebaseService();
      setIsFirebaseLive(status.isLive);
    } catch (err) {
      console.error('Error loading manhwa data:', err);
    }
  }, []);

  // Check and refresh latest bookmark
  const refreshBookmark = useCallback(async (user?: UserProfile | null) => {
    try {
      const bm = await getLatestBookmark(user?.uid);
      setLatestBookmark(bm);
    } catch (e) {
      console.warn('Bookmark fetch error', e);
    }
  }, []);

  // Bootstrap initial listeners
  useEffect(() => {
    loadData();

    // Subscribe to Firebase Auth
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      refreshBookmark(user);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [loadData, refreshBookmark]);

  // Handle selecting an episode to read
  const handleSelectEpisode = (episode: Episode) => {
    setActiveEpisode(episode);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Resume reading from bookmark
  const handleResumeReading = () => {
    if (latestBookmark) {
      const target = episodes.find((e) => e.id === latestBookmark.episodeId);
      if (target) {
        handleSelectEpisode(target);
        return;
      }
    }
    if (episodes.length > 0) {
      handleSelectEpisode(episodes[0]);
    }
  };

  // Return to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    refreshBookmark(currentUser);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Application Header */}
      {currentView !== 'reader' && (
        <Header
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          latestBookmark={latestBookmark}
          onResumeReading={handleResumeReading}
          onOpenGoDaddyModal={() => setIsGoDaddyModalOpen(true)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={currentUser}
          isFirebaseLive={isFirebaseLive}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            series={series}
            chapters={chapters}
            episodes={episodes}
            latestBookmark={latestBookmark}
            onSelectEpisode={handleSelectEpisode}
            onOpenGoDaddyModal={() => setIsGoDaddyModalOpen(true)}
          />
        )}

        {currentView === 'reader' && activeEpisode && (
          <Reader
            episode={activeEpisode}
            allEpisodes={episodes}
            chapters={chapters}
            currentUser={currentUser}
            savedBookmark={latestBookmark}
            onBackToDashboard={handleBackToDashboard}
            onSelectEpisode={handleSelectEpisode}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            chapters={chapters}
            episodes={episodes}
            onBackToDashboard={handleBackToDashboard}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Footer for non-reader views */}
      {currentView !== 'reader' && (
        <footer className="bg-[#090b0e] border-t border-gray-900 py-8 px-4 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-extrabold text-gray-300">SHADOW SOVEREIGN</span> — Mobile-First Vertical Webtoon Reader
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <button
                onClick={() => setIsGoDaddyModalOpen(true)}
                className="hover:text-cyan-300 transition-colors"
              >
                GoDaddy cPanel Setup
              </button>
              <span>•</span>
              <button
                onClick={() => setIsFirebaseModalOpen(true)}
                className="hover:text-amber-300 transition-colors"
              >
                Firestore Database
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentView('admin')}
                className="hover:text-purple-300 transition-colors"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <GoDaddyExportModal
        isOpen={isGoDaddyModalOpen}
        onClose={() => setIsGoDaddyModalOpen(false)}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        isFirebaseLive={isFirebaseLive}
        onConfigSaved={() => {
          loadData();
          refreshBookmark(currentUser);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => {
          setCurrentUser(u);
          refreshBookmark(u);
        }}
      />
    </div>
  );
}
