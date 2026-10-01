import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Maximize2,
  Type,
  Download,
  Globe,
  Save,
  Bell,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Share2,
} from 'lucide-react';
import { AppSettings, AspectRatio, CaptionPreset } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customAppIdInput, setCustomAppIdInput] = useState<string>(settings.appId || '3554ce10-6a15-4abd-ba48-1d1ea14c8d65');
  const [isEditingAppId, setIsEditingAppId] = useState(false);

  const updateField = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleGenerateNewAppId = () => {
    // Generate standard UUID-like ID
    const randomHex = () => Math.random().toString(16).substring(2, 6);
    const newId = `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`;
    setCustomAppIdInput(newId);
    updateField('appId', newId);
    handleCopy(newId, 'appId-generated');
  };

  const handleSaveCustomAppId = () => {
    const trimmed = customAppIdInput.trim() || '3554ce10-6a15-4abd-ba48-1d1ea14c8d65';
    updateField('appId', trimmed);
    setIsEditingAppId(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <span>Application Settings</span>
          <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            100% Free Forever
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your Application ID, default video framing, viral caption presets, and workflow preferences.
        </p>
      </div>

      {/* App ID & Identity Card */}
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-950 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-cyan-400 border border-violet-500/30">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  App ID &amp; Studio Identity
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unique identifier for your PulseCut AI Studio applet instance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateNewAppId}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="Generate a brand new App ID"
            >
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              <span>Make New ID</span>
            </button>
          </div>
        </div>

        {/* Primary App ID Display with One-Click Copy */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">
              Application ID (UUID)
            </span>
            <span className="text-[11px] text-violet-400 font-mono">
              Cloud Studio Reference
            </span>
          </div>

          {isEditingAppId ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customAppIdInput}
                onChange={(e) => setCustomAppIdInput(e.target.value)}
                placeholder="Enter custom App ID..."
                className="w-full rounded-xl border border-cyan-500/50 bg-slate-900 px-3 py-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                onClick={handleSaveCustomAppId}
                className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setCustomAppIdInput(settings.appId || '3554ce10-6a15-4abd-ba48-1d1ea14c8d65');
                  setIsEditingAppId(false);
                }}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <code className="text-xs sm:text-sm font-mono font-bold text-cyan-400 break-all select-all">
                {settings.appId || '3554ce10-6a15-4abd-ba48-1d1ea14c8d65'}
              </code>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEditingAppId(true)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleCopy(
                      settings.appId || '3554ce10-6a15-4abd-ba48-1d1ea14c8d65',
                      'appId'
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-600/30 hover:brightness-110 active:scale-95"
                >
                  {copiedField === 'appId' || copiedField === 'appId-generated' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick Helper */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Use this ID when referencing your applet session or API deployments.</span>
            {copiedField === 'appId' && (
              <span className="text-emerald-400 font-semibold animate-pulse">
                App ID copied to clipboard!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Free Promise Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>The PulseCut Free Creator Guarantee</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every feature in this application is 100% accessible to every user with zero subscription fees, no locked Pro tiers, no credit limits, and absolutely no watermarks on exported videos.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        {/* Appearance & Theme */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Palette className="h-4 w-4 text-violet-400" />
            <span>Theme Preference</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Obsidian Dark' },
              { id: 'midnight', label: 'Midnight Blue' },
              { id: 'slate', label: 'Slate Gray' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => updateField('theme', th.id as any)}
                className={`rounded-2xl border p-3 text-left transition ${
                  settings.theme === th.id
                    ? 'border-violet-500 bg-violet-950/30 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{th.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Framing / Aspect Ratio */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Maximize2 className="h-4 w-4 text-cyan-400" />
            <span>Default Short Reframing</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '9:16', label: '9:16 Vertical', sub: 'Shorts, TikTok, Reels' },
              { id: '1:1', label: '1:1 Square', sub: 'Instagram Feed' },
              { id: '16:9', label: '16:9 Landscape', sub: 'Standard Wide' },
            ].map((ar) => (
              <button
                key={ar.id}
                onClick={() => updateField('defaultAspectRatio', ar.id as AspectRatio)}
                className={`rounded-2xl border p-3 text-left transition ${
                  settings.defaultAspectRatio === ar.id
                    ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{ar.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{ar.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Caption Style */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Type className="h-4 w-4 text-emerald-400" />
            <span>Default Caption Preset</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'bold', label: 'Viral Bold (Yellow/White)' },
              { id: 'clean', label: 'Clean Minimalist' },
              { id: 'neon', label: 'Cyber Neon' },
              { id: 'impact', label: 'Social Impact Red' },
              { id: 'karaoke', label: 'Karaoke Active' },
              { id: 'classic', label: 'Classic Subtitles' },
            ].map((cap) => (
              <button
                key={cap.id}
                onClick={() => updateField('defaultCaptionPreset', cap.id as CaptionPreset)}
                className={`rounded-2xl border p-3 text-left transition ${
                  settings.defaultCaptionPreset === cap.id
                    ? 'border-emerald-400 bg-emerald-950/30 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold">{cap.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Default Export Quality */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Default Export Resolution</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: '1080p', label: '1080p Full HD', desc: 'Maximum sharpness for viral Shorts' },
              { id: '720p', label: '720p HD', desc: 'Fast rendering & lightweight export' },
            ].map((res) => (
              <button
                key={res.id}
                onClick={() => updateField('defaultExportQuality', res.id as any)}
                className={`rounded-2xl border p-3.5 text-left transition ${
                  settings.defaultExportQuality === res.id
                    ? 'border-indigo-400 bg-indigo-950/30 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{res.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{res.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-save & Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-violet-400" />
              <div>
                <div className="text-xs font-bold text-white">Auto-save Projects</div>
                <div className="text-[11px] text-slate-500">Automatically persist clips and editor trims</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateField('autoSave', e.target.checked)}
              className="h-4 w-4 rounded text-violet-600 focus:ring-0"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Smart Subject Tracking by Default</div>
                <div className="text-[11px] text-slate-500">Auto-pan camera crop to follow speakers</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.subjectTrackingEnabled}
              onChange={(e) => updateField('subjectTrackingEnabled', e.target.checked)}
              className="h-4 w-4 rounded text-cyan-500 focus:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
