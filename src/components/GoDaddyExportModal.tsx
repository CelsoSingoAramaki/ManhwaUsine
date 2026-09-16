import React, { useState } from 'react';
import {
  X,
  Server,
  Download,
  Copy,
  Check,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  FileCode,
} from 'lucide-react';

interface GoDaddyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoDaddyExportModal: React.FC<GoDaddyExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);

  if (!isOpen) return null;

  const htaccessContent = `# Apache configuration for GoDaddy cPanel (Linux)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>`;

  const copyHtaccess = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(htaccessContent);
      setCopiedHtaccess(true);
      setTimeout(() => setCopiedHtaccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f131a] border border-gray-800 shadow-2xl p-6 sm:p-8 text-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                GoDaddy Linux Hosting & cPanel
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                100% Turnkey Ready
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Export & Deploy to GoDaddy cPanel
            </h2>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-xs sm:text-sm text-cyan-200">
          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">
              Why this architecture is ideal for GoDaddy Shared Hosting:
            </span>
            GoDaddy Linux shared hosting uses Apache. We pre-configured a client-side Single Page Application with an <strong>.htaccess</strong> file and direct browser-to-Firestore streaming. This means <strong>no Node daemon or cPanel Passenger setup is needed</strong> — it runs at blistering speed directly out of <code className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-300">public_html</code>!
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <h3 className="font-bold text-white">Step 1: Download or Build the Production Bundle</h3>
              <p className="text-gray-400">
                In Google AI Studio, click the <strong>Settings</strong> icon in the top right, then click <strong>Download ZIP</strong>. Or in the terminal, run <code className="bg-gray-800 px-1.5 py-0.5 rounded font-mono text-purple-300">npm run build</code> to produce the standalone <code className="bg-gray-800 px-1.5 py-0.5 rounded font-mono text-purple-300">dist/</code> folder.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <h3 className="font-bold text-white">Step 2: Upload to GoDaddy cPanel File Manager</h3>
              <p className="text-gray-400">
                Log in to GoDaddy &gt; <strong>cPanel Admin</strong> &gt; <strong>File Manager</strong>. Navigate into your <strong>public_html</strong> folder (or subdomain directory). Click <strong>Upload</strong> and drop your ZIP file.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <h3 className="font-bold text-white">Step 3: Extract ZIP into public_html</h3>
              <p className="text-gray-400">
                Right-click the ZIP in cPanel File Manager and choose <strong>Extract</strong>. Verify that <code className="text-white font-mono">index.html</code>, <code className="text-white font-mono">assets/</code>, and <code className="text-white font-mono">.htaccess</code> are inside <code className="text-white font-mono">public_html/</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Pre-packaged .htaccess Preview */}
        <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-gray-200">
                Included in your project: /public/.htaccess
              </span>
            </div>
            <button
              onClick={copyHtaccess}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors"
            >
              {copiedHtaccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy .htaccess</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-black/60 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed border border-gray-850">
            {htaccessContent}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
