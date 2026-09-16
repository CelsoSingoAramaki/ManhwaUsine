import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Chapter, Episode } from '../types';
import { generateEpisodePanels } from '../data/initialManhwa';
import { updateEpisodePanels, resetAllDataToDefault } from '../services/firebase';

interface AdminPanelProps {
  chapters: Chapter[];
  episodes: Episode[];
  onBackToDashboard: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  chapters,
  episodes,
  onBackToDashboard,
  onRefreshData,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || 'ch-1');
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('ep-c1-e1');
  const [rawUrlsInput, setRawUrlsInput] = useState<string>('');
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter episodes belonging to selected chapter
  const availableEpisodes = episodes.filter((e) => e.chapterId === selectedChapterId);

  // Current selected episode
  const activeEpisode = episodes.find((e) => e.id === selectedEpisodeId) || availableEpisodes[0];

  // Update selectedEpisodeId when chapter changes
  useEffect(() => {
    if (availableEpisodes.length > 0) {
      if (!availableEpisodes.some((e) => e.id === selectedEpisodeId)) {
        setSelectedEpisodeId(availableEpisodes[0].id);
      }
    }
  }, [selectedChapterId, availableEpisodes, selectedEpisodeId]);

  // Load active episode's current panels into textarea on selection
  useEffect(() => {
    if (activeEpisode) {
      setRawUrlsInput(activeEpisode.panelUrls.join('\n'));
      setParsedUrls(activeEpisode.panelUrls);
    }
  }, [activeEpisode?.id]);

  // Parse input when textarea changes
  const handleInputChange = (text: string) => {
    setRawUrlsInput(text);
    // Split by newlines, commas, or semicolons
    const list = text
      .split(/[\n,;]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image'));
    setParsedUrls(list);
  };

  // Generate 100 placeholder URLs
  const handleGenerate100 = () => {
    if (!activeEpisode) return;
    const generated = generateEpisodePanels(activeEpisode.chapterNumber, activeEpisode.episodeNumber, 100);
    setRawUrlsInput(generated.join('\n'));
    setParsedUrls(generated);
    showToast('Generated 100 webtoon placeholder URLs');
  };

  // Clear all
  const handleClear = () => {
    setRawUrlsInput('');
    setParsedUrls([]);
  };

  // Save panels
  const handleSavePanels = async () => {
    if (!activeEpisode) return;
    if (parsedUrls.length === 0) {
      alert('Please enter at least one valid image URL');
      return;
    }

    setIsSaving(true);
    try {
      await updateEpisodePanels(activeEpisode.id, parsedUrls);
      showToast(`Successfully saved ${parsedUrls.length} panels for ${activeEpisode.title}!`);
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Failed to update episode panels.');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset entire database to defaults
  const handleResetCatalog = () => {
    if (window.confirm('Reset all 10 chapters and 60 episodes back to default 100 panels?')) {
      resetAllDataToDefault();
      onRefreshData();
      showToast('Reset all manhwa data to initial state');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                Batch Episode Panel Manager
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Populate and update 100 vertical-scroll image panels per episode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCatalog}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All to Defaults
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {toastMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chapter & Episode Selection */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#121620] border border-gray-800">
              <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Select Target Story Arc
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">1. Choose Chapter (1-10)</label>
                  <select
                    id="admin-chapter-select"
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-medium focus:outline-none focus:border-purple-500"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold">2. Choose Episode (1-6)</label>
                  <select
                    id="admin-episode-select"
                    value={selectedEpisodeId}
                    onChange={(e) => setSelectedEpisodeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-medium focus:outline-none focus:border-purple-500"
                  >
                    {availableEpisodes.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        Episode {ep.episodeNumber}: {ep.title} ({ep.panelCount || ep.panelUrls.length} panels)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeEpisode && (
                <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 space-y-1">
                  <div>
                    <span className="font-semibold text-gray-300">Target: </span>
                    <span className="text-purple-300">{activeEpisode.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-300">Current Panels: </span>
                    <span className="text-cyan-300 font-bold">{activeEpisode.panelUrls.length}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-300">Firestore ID: </span>
                    <span className="font-mono text-[10px] text-gray-500">{activeEpisode.id}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-2">
              <h4 className="font-bold text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Batch Format Tips
              </h4>
              <p>• Paste up to 100 image URLs separated by line breaks.</p>
              <p>• Images hosted on Cloud Storage, Firebase Storage, Imgur, or CDN work directly.</p>
              <p>• The vertical reader automatically lazy-loads all 100 panels sequentially.</p>
            </div>
          </div>

          {/* Center & Right Column: Batch URL Textarea & Live Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#121620] border border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-200">
                    Paste Image URLs for 100 Panels
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      parsedUrls.length === 100
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {parsedUrls.length} / 100 URLs
                  </span>
                </div>

                {/* Batch Helper Actions */}
                <div className="flex items-center gap-2">
                  <button
                    id="admin-generate-100-btn"
                    onClick={handleGenerate100}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 transition-colors flex items-center gap-1"
                    title="Generate 100 placeholder URLs"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-300" />
                    Fill 100 Test URLs
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                id="admin-batch-urls-textarea"
                rows={10}
                value={rawUrlsInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="https://example.com/panel_001.jpg&#10;https://example.com/panel_002.jpg&#10;https://example.com/panel_003.jpg&#10;..."
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 font-mono text-xs focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
              />

              {/* Save Button */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {parsedUrls.length === 0
                    ? 'No valid URLs pasted yet'
                    : `Ready to save ${parsedUrls.length} ordered panels`}
                </span>

                <button
                  id="admin-save-panels-btn"
                  onClick={handleSavePanels}
                  disabled={isSaving || parsedUrls.length === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                    isSaving || parsedUrls.length === 0
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  {isSaving ? 'Saving to Database...' : `Save ${parsedUrls.length} Panels to Episode`}
                </button>
              </div>
            </div>

            {/* Live Visual Preview Strip */}
            {parsedUrls.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#121620] border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Live Panel Preview Strip (First 12 of {parsedUrls.length})
                  </h3>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {parsedUrls.slice(0, 12).map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden bg-gray-900 border border-gray-700/80 aspect-[2/3] group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
