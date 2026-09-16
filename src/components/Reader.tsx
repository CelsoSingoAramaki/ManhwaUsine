import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  Bookmark as BookmarkIcon,
  Check,
  RotateCcw,
  Sliders,
  Sun,
  Eye,
  ArrowUp,
  Share2,
} from 'lucide-react';
import { Bookmark, Chapter, Episode, ReaderSettings, UserProfile } from '../types';
import { saveReadingBookmark } from '../services/firebase';

interface ReaderProps {
  episode: Episode;
  allEpisodes: Episode[];
  chapters: Chapter[];
  currentUser: UserProfile | null;
  savedBookmark: Bookmark | null;
  onBackToDashboard: () => void;
  onSelectEpisode: (episode: Episode) => void;
  onOpenSettingsModal?: () => void;
}

export const Reader: React.FC<ReaderProps> = ({
  episode,
  allEpisodes,
  chapters,
  currentUser,
  savedBookmark,
  onBackToDashboard,
  onSelectEpisode,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [readingWidth, setReadingWidth] = useState<'normal' | 'wide' | 'full'>('normal');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showJumpDropdown, setShowJumpDropdown] = useState(false);
  const [bookmarkSavedToast, setBookmarkSavedToast] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastSaveTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const panelCount = episode.panelUrls.length;

  // Previous & Next Episodes
  const currentIdx = allEpisodes.findIndex((e) => e.id === episode.id);
  const prevEpisode = currentIdx > 0 ? allEpisodes[currentIdx - 1] : null;
  const nextEpisode = currentIdx < allEpisodes.length - 1 ? allEpisodes[currentIdx + 1] : null;

  // Find chapter title
  const chapter = chapters.find((c) => c.id === episode.chapterId);

  // Initialize bookmark restoration if user already read part of this episode
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurrentPanelIndex(0);
    setScrollPercent(0);

    if (savedBookmark && savedBookmark.episodeId === episode.id && savedBookmark.lastPanelIndex > 0) {
      const targetPanelIdx = savedBookmark.lastPanelIndex;
      setTimeout(() => {
        const el = panelRefs.current[targetPanelIdx];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [episode.id]);

  // Track scroll position and detect current active panel
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const percent = totalHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / totalHeight) * 100))) : 0;
          setScrollPercent(percent);

          // Find panel closest to top/middle of screen
          const viewportCenter = window.innerHeight * 0.35;
          let bestIdx = 0;
          let minDistance = Infinity;

          panelRefs.current.forEach((ref, idx) => {
            if (ref) {
              const rect = ref.getBoundingClientRect();
              const distance = Math.abs(rect.top - viewportCenter);
              if (distance < minDistance) {
                minDistance = distance;
                bestIdx = idx;
              }
            }
          });

          setCurrentPanelIndex(bestIdx);

          // Auto-save bookmark throttled every 4 seconds
          const now = Date.now();
          if (now - lastSaveTimeRef.current > 4000) {
            lastSaveTimeRef.current = now;
            const newBookmark: Bookmark = {
              id: `bm-${episode.id}`,
              userId: currentUser?.uid || 'guest',
              seriesId: 'shadow-monarch',
              chapterId: episode.chapterId,
              episodeId: episode.id,
              chapterNumber: episode.chapterNumber,
              episodeNumber: episode.episodeNumber,
              episodeTitle: episode.title,
              lastPanelIndex: bestIdx,
              scrollPercent: percent,
              updatedAt: new Date().toISOString(),
            };
            saveReadingBookmark(newBookmark);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [episode, currentUser]);

  // Toggle UI controls on reader area click
  const toggleControls = (e: React.MouseEvent) => {
    // If user clicked a button or interactive element, ignore
    if ((e.target as HTMLElement).closest('button, input, a, select')) {
      return;
    }
    setShowControls((prev) => !prev);
  };

  // Jump directly to specific panel index
  const jumpToPanel = (idx: number) => {
    const el = panelRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowJumpDropdown(false);
  };

  // Manual save bookmark
  const handleManualSaveBookmark = () => {
    const newBookmark: Bookmark = {
      id: `bm-${episode.id}`,
      userId: currentUser?.uid || 'guest',
      seriesId: 'shadow-monarch',
      chapterId: episode.chapterId,
      episodeId: episode.id,
      chapterNumber: episode.chapterNumber,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title,
      lastPanelIndex: currentPanelIndex,
      scrollPercent,
      updatedAt: new Date().toISOString(),
    };
    saveReadingBookmark(newBookmark);
    setBookmarkSavedToast(true);
    setTimeout(() => setBookmarkSavedToast(false), 2200);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Width classes
  const widthClass =
    readingWidth === 'full'
      ? 'w-full max-w-none'
      : readingWidth === 'wide'
      ? 'w-full max-w-4xl'
      : 'w-full max-w-2xl';

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#07090d] text-gray-100 select-none"
      onClick={toggleControls}
      style={{
        filter: brightness < 100 ? `brightness(${brightness}%)` : undefined,
      }}
    >
      {/* =========================================================================
          FLOATING TOP NAVIGATION BAR
          ========================================================================= */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } bg-[#0d1117]/95 backdrop-blur-md border-b border-gray-800/90 px-3 sm:px-6 py-2.5 shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back & Episode Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="reader-back-to-dashboard-btn"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to chapters"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Episodes</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                  Chapter {episode.chapterNumber}
                </span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-xs text-gray-300 font-semibold truncate hidden sm:inline">
                  {chapter?.title}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {episode.title}
              </h2>
            </div>
          </div>

          {/* Top Actions: Jump, Bookmark, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Panel Jump Selector */}
            <div className="relative">
              <button
                id="reader-jump-panel-btn"
                onClick={() => setShowJumpDropdown(!showJumpDropdown)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 flex items-center gap-1"
                title="Jump to Panel"
              >
                <span>Panel {currentPanelIndex + 1}/{panelCount}</span>
              </button>

              {/* Jump Dropdown Drawer */}
              {showJumpDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 grid grid-cols-5 gap-1.5 z-50">
                  {Array.from({ length: panelCount }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToPanel(i)}
                      className={`p-1.5 text-xs rounded font-medium ${
                        i === currentPanelIndex
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Bookmark button */}
            <button
              id="reader-manual-bookmark-btn"
              onClick={handleManualSaveBookmark}
              className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
              title="Save current reading progress"
            >
              <BookmarkIcon className="w-4 h-4 fill-purple-400/40" />
            </button>

            {/* Reader Settings Toggle */}
            <div className="relative">
              <button
                id="reader-settings-btn"
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                title="Reader display settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown */}
              {showSettingsDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/98 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-4">
                  <div>
                    <span className="font-bold text-gray-200 block mb-2">Column Width</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['normal', 'wide', 'full'] as const).map((w) => (
                        <button
                          key={w}
                          onClick={() => setReadingWidth(w)}
                          className={`py-1.5 rounded-lg capitalize font-medium ${
                            readingWidth === w
                              ? 'bg-purple-600 text-white font-bold'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-gray-200 mb-1.5">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                    <span className="text-gray-300">Show Panel Numbers</span>
                    <button
                      onClick={() => setShowPageNumbers(!showPageNumbers)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        showPageNumbers ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          showPageNumbers ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              id="reader-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bookmark Saved Toast Notification */}
      {bookmarkSavedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          Progress Bookmarked! (Panel {currentPanelIndex + 1}/{panelCount})
        </div>
      )}

      {/* =========================================================================
          VERTICAL SCROLL MANHWA PANELS STREAM (100 PANELS WITH LAZY LOADING)
          ========================================================================= */}
      <main className="pt-12 pb-24 flex justify-center">
        <div className={`${widthClass} mx-auto manhwa-panel-container`}>
          {episode.panelUrls.map((panelUrl, index) => (
            <PanelItem
              key={`${episode.id}-panel-${index}`}
              index={index}
              total={panelCount}
              src={panelUrl}
              showNumber={showPageNumbers}
              refCallback={(el) => {
                panelRefs.current[index] = el;
              }}
            />
          ))}

          {/* Episode Conclusion & Next Episode Transition Card */}
          <div className="mt-8 p-6 sm:p-8 mx-3 rounded-2xl bg-gradient-to-b from-[#121620] to-[#0a0d13] border border-gray-800 text-center shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1 block">
              Episode {episode.episodeNumber} Complete
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              {episode.title}
            </h3>
            <p className="text-xs text-gray-400 mb-6 max-w-md mx-auto">
              You've reached the end of this episode! Catch what happens next as the story intensifies.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {nextEpisode ? (
                <button
                  id="reader-end-next-episode-btn"
                  onClick={() => onSelectEpisode(nextEpisode)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Continue: {nextEpisode.title}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-sm text-emerald-400 font-bold p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                  🎉 You are caught up with the latest released chapter!
                </div>
              )}

              <button
                id="reader-end-back-btn"
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm border border-gray-700 transition-colors"
              >
                Back to Chapters
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FLOATING BOTTOM NAVIGATION & PROGRESS SCRUBBER
          ========================================================================= */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        } bg-[#0d1117]/95 backdrop-blur-md border-t border-gray-800/90 px-4 py-3 shadow-2xl`}
      >
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Progress Slider & Tracker */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-400 w-16 text-left">
              {currentPanelIndex + 1} / {panelCount}
            </span>

            {/* Scrub Slider */}
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={panelCount - 1}
                value={currentPanelIndex}
                onChange={(e) => jumpToPanel(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <span className="text-[11px] font-bold text-purple-400 w-12 text-right">
              {scrollPercent}%
            </span>
          </div>

          {/* Episode Pagination Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="reader-prev-episode-btn"
              disabled={!prevEpisode}
              onClick={() => prevEpisode && onSelectEpisode(prevEpisode)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                prevEpisode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                  : 'bg-gray-900/40 text-gray-600 border-gray-800/60 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Ep</span>
            </button>

            {/* Quick center indicator */}
            <div className="text-center hidden sm:block">
              <p className="text-xs font-extrabold text-gray-200">
                Episode {episode.episodeNumber} of 6
              </p>
              <p className="text-[10px] text-gray-400">
                Tap anywhere to toggle reader UI
              </p>
            </div>

            {/* Next Episode Button */}
            <button
              id="reader-next-episode-btn"
              disabled={!nextEpisode}
              onClick={() => nextEpisode && onSelectEpisode(nextEpisode)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                nextEpisode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-900/40'
                  : 'bg-gray-900/40 text-gray-600 border-gray-800/60 cursor-not-allowed'
              }`}
            >
              <span>Next Ep</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   LAZY LOADED SINGLE WEBTOON PANEL COMPONENT
   ========================================================================= */

interface PanelItemProps {
  index: number;
  total: number;
  src: string;
  showNumber: boolean;
  refCallback: (el: HTMLDivElement | null) => void;
}

const PanelItem: React.FC<PanelItemProps> = React.memo(({ index, total, src, showNumber, refCallback }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  return (
    <div
      ref={refCallback}
      data-panel-index={index}
      className="relative w-full bg-[#0a0d13] min-h-[400px] flex items-center justify-center overflow-hidden border-b border-gray-950/40"
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e121a] via-[#151c28] to-[#0e121a] flex flex-col items-center justify-center gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
          <span className="text-[11px] font-semibold text-gray-500 tracking-wider">
            Loading Panel {index + 1} / {total}...
          </span>
        </div>
      )}

      {/* Main Image */}
      {!hasError ? (
        <img
          key={retryKey}
          src={src}
          alt={`Panel ${index + 1}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-auto block select-none pointer-events-none transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Error & Retry view */
        <div className="w-full py-16 flex flex-col items-center justify-center gap-3 bg-gray-900/60 p-4 text-center">
          <p className="text-xs text-rose-400 font-semibold">Failed to load Panel {index + 1}</p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
              setRetryKey((prev) => prev + 1);
            }}
            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg flex items-center gap-1.5 border border-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Image
          </button>
        </div>
      )}

      {/* Subtle bottom-right panel watermark */}
      {showNumber && isLoaded && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-gray-400 pointer-events-none border border-white/5">
          #{index + 1}
        </div>
      )}
    </div>
  );
});
