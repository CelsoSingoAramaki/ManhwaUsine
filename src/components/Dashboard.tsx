import React, { useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  Heart,
  Play,
  Share2,
  Sparkles,
  Star,
  CheckCircle2,
  Layers,
  Clock,
} from 'lucide-react';
import { Bookmark, Chapter, Episode, ManhwaSeries } from '../types';

interface DashboardProps {
  series: ManhwaSeries;
  chapters: Chapter[];
  episodes: Episode[];
  latestBookmark: Bookmark | null;
  onSelectEpisode: (episode: Episode) => void;
  onOpenGoDaddyModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  series,
  chapters,
  episodes,
  latestBookmark,
  onSelectEpisode,
  onOpenGoDaddyModal,
}) => {
  // Set Chapter 1 open by default
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch-1': true,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'part1' | 'part2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    chapters.forEach((c) => (all[c.id] = true));
    setExpandedChapters(all);
  };

  const collapseAll = () => {
    setExpandedChapters({});
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Filter chapters based on active tab
  const filteredChapters = chapters.filter((c) => {
    if (activeTab === 'part1') return c.chapterNumber <= 5;
    if (activeTab === 'part2') return c.chapterNumber > 5;
    return true;
  }).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesChapter = c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    const hasMatchingEp = episodes
      .filter((e) => e.chapterId === c.id)
      .some((e) => e.title.toLowerCase().includes(q));
    return matchesChapter || hasMatchingEp;
  });

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-100 pb-20">
      {/* Hero Banner Section */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#161b22] to-[#0b0d11] border-b border-gray-800">
        {/* Atmospheric background glow */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-xl scale-105 pointer-events-none"
          style={{ backgroundImage: `url(${series.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d11] via-[#0b0d11]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            {/* Manhwa Cover Art */}
            <div className="w-full sm:w-64 md:w-72 flex-shrink-0 mx-auto md:mx-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-950/40 border border-gray-700/60 group">
                <img
                  src={series.coverUrl}
                  alt={series.title}
                  className="w-full aspect-[2/3] object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  Top Rated
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {series.status}
                </div>
              </div>
            </div>

            {/* Manhwa Info & Synopsis */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                  Official Webtoon
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400 font-medium">10 Chapters (60 Episodes)</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  100 Panels / Episode
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-1">
                {series.title}
              </h1>

              {series.koreanTitle && (
                <p className="text-sm font-medium text-gray-400 mb-4 tracking-wide font-sans">
                  {series.koreanTitle}
                </p>
              )}

              {/* Badges & Meta row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 text-sm">
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{series.rating}</span>
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-gray-500">Author: </span>
                  <span className="font-semibold text-gray-200">{series.author}</span>
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-gray-500">Artist: </span>
                  <span className="font-semibold text-gray-200">{series.artist}</span>
                </div>
              </div>

              {/* Genre tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {series.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-800/80 text-gray-300 border border-gray-700/60 hover:border-purple-500/40 transition-colors"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 line-clamp-4 md:line-clamp-none">
                {series.synopsis}
              </p>

              {/* Primary Call-to-actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* First episode or Resume button */}
                <button
                  id="dashboard-start-reading-btn"
                  onClick={() => {
                    if (latestBookmark) {
                      const targetEp = episodes.find((e) => e.id === latestBookmark.episodeId);
                      if (targetEp) {
                        onSelectEpisode(targetEp);
                        return;
                      }
                    }
                    if (episodes.length > 0) {
                      onSelectEpisode(episodes[0]);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {latestBookmark ? 'Resume Reading' : 'Start Reading Ep. 1'}
                </button>

                <button
                  id="dashboard-share-btn"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-sm font-medium border border-gray-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink ? 'Link Copied!' : 'Share'}
                </button>

                <button
                  id="dashboard-cpanel-notice-btn"
                  onClick={onOpenGoDaddyModal}
                  className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
                >
                  GoDaddy Linux Ready
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Continue Reading Card if Bookmark Exists */}
        {latestBookmark && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-gray-900 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
                <BookmarkIcon className="w-6 h-6 fill-purple-400/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                    Last Read Bookmark
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-medium">
                    {latestBookmark.scrollPercent}% Progress
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Chapter {latestBookmark.chapterNumber}, Episode {latestBookmark.episodeNumber}
                </h3>
                <p className="text-xs text-gray-400">
                  Panel {latestBookmark.lastPanelIndex + 1} of 100 • {latestBookmark.episodeTitle}
                </p>
              </div>
            </div>

            <button
              id="resume-reading-card-btn"
              onClick={() => {
                const target = episodes.find((e) => e.id === latestBookmark.episodeId);
                if (target) onSelectEpisode(target);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Resume Now
            </button>
          </div>
        )}

        {/* Chapters Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Chapters & Episodes Directory
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              10 Story Arcs • 6 Episodes each • 100 Vertical Webtoon Panels per Episode
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-900 rounded-xl border border-gray-800 text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                All (1-10)
              </button>
              <button
                onClick={() => setActiveTab('part1')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'part1' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Ch 1 - 5
              </button>
              <button
                onClick={() => setActiveTab('part2')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'part2' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Ch 6 - 10
              </button>
            </div>

            <button
              onClick={expandAll}
              className="text-xs px-2.5 py-1.5 bg-gray-800/80 hover:bg-gray-750 text-gray-300 rounded-lg border border-gray-700 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2.5 py-1.5 bg-gray-800/80 hover:bg-gray-750 text-gray-300 rounded-lg border border-gray-700 transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Structured List of Chapters (1 to 10) */}
        <div className="space-y-4">
          {filteredChapters.map((chapter) => {
            const isExpanded = !!expandedChapters[chapter.id];
            const chapterEpisodes = episodes.filter((ep) => ep.chapterId === chapter.id);

            return (
              <div
                key={chapter.id}
                className="rounded-2xl bg-[#12161f] border border-gray-800/80 overflow-hidden shadow-lg transition-all duration-200 hover:border-gray-700"
              >
                {/* Chapter Title Bar (Click to Reveal 6 Episodes) */}
                <button
                  id={`chapter-toggle-${chapter.chapterNumber}`}
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-850/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0 group-hover:border-purple-500/40 transition-colors">
                      {chapter.chapterNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                          {chapter.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {chapter.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                    <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 font-medium">
                      {chapterEpisodes.length} Episodes • 600 Panels
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Episodes Grid (Revealed when Chapter is clicked) */}
                {isExpanded && (
                  <div className="px-5 py-4 border-t border-gray-800/60 bg-[#0d1017]/70">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chapterEpisodes.map((ep) => {
                        const isCurrentBookmark = latestBookmark?.episodeId === ep.id;

                        return (
                          <div
                            key={ep.id}
                            id={`episode-card-${ep.id}`}
                            onClick={() => onSelectEpisode(ep)}
                            className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3.5 items-center ${
                              isCurrentBookmark
                                ? 'bg-purple-950/20 border-purple-500/50 shadow-md shadow-purple-950/30'
                                : 'bg-gray-900/60 hover:bg-gray-850 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 border border-gray-700/50">
                              <img
                                src={ep.thumbnailUrl}
                                alt={ep.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-cyan-300">
                                {ep.panelCount || 100}p
                              </div>
                            </div>

                            {/* Episode Meta */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">
                                  Episode {ep.episodeNumber}
                                </span>
                                {isCurrentBookmark && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-gray-100 group-hover:text-purple-300 transition-colors truncate">
                                {ep.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                <span>{ep.releaseDate}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <Heart className="w-2.5 h-2.5 text-rose-500" />
                                  {(ep.likesCount || 12000).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Quick Read Action Arrow */}
                            <div className="w-7 h-7 rounded-lg bg-gray-800/90 group-hover:bg-purple-600 text-gray-400 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm">
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
