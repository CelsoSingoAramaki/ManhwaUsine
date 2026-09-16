import React from 'react';
import { BookOpen, ShieldCheck, Database, Server, User as UserIcon, Bookmark as BookmarkIcon, Sparkles } from 'lucide-react';
import { Bookmark, UserProfile } from '../types';

interface HeaderProps {
  currentView: 'dashboard' | 'reader' | 'admin';
  onNavigate: (view: 'dashboard' | 'reader' | 'admin') => void;
  latestBookmark: Bookmark | null;
  onResumeReading: () => void;
  onOpenGoDaddyModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
  isFirebaseLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  latestBookmark,
  onResumeReading,
  onOpenGoDaddyModal,
  onOpenFirebaseModal,
  onOpenAuthModal,
  currentUser,
  isFirebaseLive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div
          id="header-brand"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1117] rounded-[7px] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-sm sm:text-base bg-gradient-to-r from-gray-100 via-white to-gray-300 bg-clip-text text-transparent">
                SHADOW SOVEREIGN
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                Manhwa
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              10 Chapters • 60 Episodes • Vertical Reader
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Continue Reading Quick Jump */}
          {latestBookmark && currentView !== 'reader' && (
            <button
              id="header-continue-reading-btn"
              onClick={onResumeReading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors shadow-sm"
              title={`Resume Episode ${latestBookmark.episodeNumber}`}
            >
              <BookmarkIcon className="w-3.5 h-3.5 text-purple-400 fill-purple-400/30" />
              <span className="hidden md:inline">Resume:</span>
              <span className="font-semibold text-white">Ch {latestBookmark.chapterNumber} • Ep {latestBookmark.episodeNumber}</span>
            </button>
          )}

          {/* GoDaddy cPanel Export Guide Button */}
          <button
            id="header-godaddy-guide-btn"
            onClick={onOpenGoDaddyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 transition-colors"
            title="Deploy to GoDaddy Shared Server (Linux/cPanel)"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">cPanel Deploy</span>
          </button>

          {/* Firebase Status & Config Button */}
          <button
            id="header-firebase-status-btn"
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isFirebaseLive
                ? 'bg-amber-950/30 text-amber-300 border-amber-500/30 hover:bg-amber-900/40'
                : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:bg-gray-750'
            }`}
            title={isFirebaseLive ? 'Connected to Cloud Firestore' : 'Running on Offline-First Storage. Click to configure Firebase.'}
          >
            <Database className={`w-3.5 h-3.5 ${isFirebaseLive ? 'text-amber-400' : 'text-gray-400'}`} />
            <span className="hidden lg:inline">{isFirebaseLive ? 'Firestore Live' : 'Firebase Offline'}</span>
          </button>

          {/* Admin Panel Toggle */}
          <button
            id="header-admin-panel-btn"
            onClick={() => onNavigate(currentView === 'admin' ? 'dashboard' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              currentView === 'admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/40'
                : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300 border-gray-700'
            }`}
            title="Batch Panel URL Manager"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* User Auth Profile Button */}
          <button
            id="header-user-auth-btn"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-800/90 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="User"
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className="hidden md:inline max-w-[90px] truncate">
              {currentUser ? currentUser.displayName || 'Reader' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
