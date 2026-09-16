import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FirebaseConfigState } from '../types';
import { getSavedFirebaseConfig, initFirebaseService } from '../services/firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirebaseLive: boolean;
  onConfigSaved: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  isFirebaseLive,
  onConfigSaved,
}) => {
  const existing = getSavedFirebaseConfig();

  const [apiKey, setApiKey] = useState(existing?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(existing?.authDomain || '');
  const [projectId, setProjectId] = useState(existing?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(existing?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(existing?.messagingSenderId || '');
  const [appId, setAppId] = useState(existing?.appId || '');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setStatusMessage({
        text: 'API Key and Project ID are required to connect Firebase.',
        success: false,
      });
      return;
    }

    const config: FirebaseConfigState = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    localStorage.setItem('manhwa_firebase_config', JSON.stringify(config));
    const result = initFirebaseService(config);

    if (result.isLive) {
      setStatusMessage({
        text: 'Connected successfully to Firebase Firestore!',
        success: true,
      });
    } else {
      setStatusMessage({
        text: 'Saved credentials. Restarting connection...',
        success: true,
      });
    }

    onConfigSaved();
  };

  const handleClear = () => {
    localStorage.removeItem('manhwa_firebase_config');
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setStorageBucket('');
    setMessagingSenderId('');
    setAppId('');
    setStatusMessage({
      text: 'Cleared custom Firebase configuration. Reverted to Local Storage engine.',
      success: true,
    });
    onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f131a] border border-gray-800 shadow-2xl p-6 sm:p-8 text-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Database Engine
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isFirebaseLive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}
              >
                {isFirebaseLive ? 'Cloud Firestore Connected' : 'Local Storage Engine Active'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Firebase & Firestore Settings
            </h2>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              statusMessage.success
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
            }`}
          >
            {statusMessage.success ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            {statusMessage.text}
          </div>
        )}

        <div className="mb-6 p-4 rounded-2xl bg-gray-900/70 border border-gray-800 text-xs text-gray-300 space-y-2">
          <p>
            The application functions 100% smoothly right now with built-in client data & local persistence. If you want to connect your live Cloud Firestore project (for multi-device sync or cross-user reading bookmarks):
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-400">
            <li>Create a project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
            <li>Enable <strong>Firestore Database</strong> and <strong>Firebase Auth</strong></li>
            <li>Paste the web credentials below and click <strong>Save & Connect</strong></li>
          </ol>
        </div>

        {/* Credential Inputs */}
        <div className="space-y-3 text-xs mb-6">
          <div>
            <label className="block text-gray-400 font-semibold mb-1">API Key *</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Project ID *</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-manhwa-project"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Auth Domain</label>
              <input
                type="text"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
                placeholder="my-manhwa-project.firebaseapp.com"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Storage Bucket</label>
              <input
                type="text"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
                placeholder="my-manhwa-project.appspot.com"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">App ID</label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="1:723805876001:web:..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
