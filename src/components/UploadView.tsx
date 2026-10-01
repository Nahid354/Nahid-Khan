import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileVideo,
  X,
  Play,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Film,
  Zap,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  Link as LinkIcon,
  Youtube,
  Clipboard,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { AspectRatio, CaptionPreset, Project } from '../types';
import { formatFileSize, formatTime } from '../utils/formatters';

interface UploadViewProps {
  onAnalysisComplete: (newProject: Project) => void;
  onSelectSample: (sampleId: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onAnalysisComplete,
  onSelectSample,
}) => {
  const [importMode, setImportMode] = useState<'youtube' | 'upload'>('youtube');

  // YouTube Link State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [ytVideoInfo, setYtVideoInfo] = useState<{
    title?: string;
    author?: string;
    thumbnail?: string;
    videoId?: string | null;
  } | null>(null);
  const [isFetchingYtInfo, setIsFetchingYtInfo] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analysis options
  const [clipCount, setClipCount] = useState<number>(3);
  const [targetAspectRatio, setTargetAspectRatio] = useState<AspectRatio>('9:16');
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>('bold');
  const [topicFocus, setTopicFocus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to extract YouTube ID
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/i;
    const match = url.trim().match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Inspect YouTube URL when typed/pasted
  useEffect(() => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      setIsFetchingYtInfo(true);
      const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setYtVideoInfo({
        videoId,
        thumbnail: thumb,
        title: 'YouTube Video Detected',
        author: 'YouTube Creator',
      });

      // Fetch oEmbed details
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setYtVideoInfo({
              videoId,
              thumbnail: data.thumbnail_url || thumb,
              title: data.title,
              author: data.author_name,
            });
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingYtInfo(false));
    } else {
      setYtVideoInfo(null);
    }
  }, [youtubeUrl]);

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setYoutubeUrl(text.trim());
      }
    } catch {
      setErrorMsg('Could not read clipboard. Please paste your link manually.');
    }
  };

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['mp4', 'mov', 'webm', 'avi', 'mkv'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      setErrorMsg('Invalid file format. Please upload MP4, MOV, WebM, or AVI videos.');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 500MB limit. Please upload a smaller video.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedFile(null);
    setVideoPreviewUrl(null);
    setVideoDuration(0);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setErrorMsg(null);
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadProgress(0);
    setAnalysisStep('');
  };

  // Analyze YouTube Link
  const handleAnalyzeYouTube = async () => {
    if (!youtubeUrl.trim()) {
      setErrorMsg('Please enter or paste a valid YouTube video link.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    abortControllerRef.current = new AbortController();

    try {
      setAnalysisStep('Connecting to YouTube video stream...');
      setUploadProgress(20);
      await new Promise((r) => setTimeout(r, 400));

      setAnalysisStep('Analyzing audio & visual dialogue with Gemini AI...');
      setUploadProgress(45);
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Detecting high-retention viral moments & hooks...');
      setUploadProgress(70);

      const response = await fetch('/api/import-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl.trim(),
          segmentCount: clipCount,
          targetAspectRatio,
          captionPreset,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to process YouTube link.');
      }

      setAnalysisStep('Generating smart vertical reframing and animated subtitles...');
      setUploadProgress(90);
      await new Promise((r) => setTimeout(r, 500));

      const data = await response.json();
      if (!data.project || !data.project.clips || data.project.clips.length === 0) {
        throw new Error('No clips could be identified for this video link.');
      }

      setUploadProgress(100);
      setAnalysisStep('Nahid JR Shorts Project Ready!');
      await new Promise((r) => setTimeout(r, 300));

      setIsAnalyzing(false);
      onAnalysisComplete(data.project);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMsg('Analysis was cancelled.');
      } else {
        setErrorMsg(err.message || 'An error occurred while importing the YouTube link.');
      }
      setIsAnalyzing(false);
    }
  };

  // Analyze Local Video File
  const handleAnalyzeVideo = async () => {
    if (!selectedFile && !videoPreviewUrl) {
      setErrorMsg('Please select a video first.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setIsAnalyzing(true);
    abortControllerRef.current = new AbortController();

    try {
      setAnalysisStep('Uploading video to processing engine...');
      for (let p = 10; p <= 90; p += 20) {
        setUploadProgress(p);
        await new Promise((r) => setTimeout(r, 120));
      }
      setUploadProgress(100);
      setIsUploading(false);

      setAnalysisStep('Analyzing audio & visual dialogue with Gemini AI...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Detecting high-retention viral moments & hooks...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Generating smart 9:16 vertical reframing and captions...');

      const dur = videoDuration > 0 ? videoDuration : 60;
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Custom Video',
          duration: dur,
          topic: topicFocus || 'Engaging moments, questions, and insights',
          segmentCount: clipCount,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Analysis request failed. Please try again.');
      }

      const data = await response.json();
      if (!data.clips || data.clips.length === 0) {
        throw new Error('No clips could be identified for this video.');
      }

      setAnalysisStep('Finalizing viral shorts project...');
      await new Promise((r) => setTimeout(r, 400));

      const formattedClips = data.clips.map((c: any) => ({
        ...c,
        aspectRatio: targetAspectRatio,
        captionPreset: captionPreset,
        customCropX: 0.5,
        playbackSpeed: 1,
      }));

      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Viral Shorts Project',
        videoUrl: videoPreviewUrl || '',
        videoDuration: dur,
        fileSize: selectedFile?.size,
        createdAt: new Date().toISOString(),
        clips: formattedClips,
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      };

      setIsAnalyzing(false);
      onAnalysisComplete(newProject);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMsg('Upload was cancelled.');
      } else {
        setErrorMsg(err.message || 'An error occurred during video analysis.');
      }
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Nahid JR • AI YouTube to Viral Shorts Generator • 100% Free</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Create Viral Shorts From YouTube or File
        </h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          ইউটিউব লিঙ্ক কপি করে পেস্ট করুন অথবা ভিডিও ফাইল আপলোড করুন। AI নিজে থেকেই সবচেয়ে আকর্ষণীয় মুহূর্তগুলো বের করে ৯:১৬ ভার্টিক্যাল শর্ট ভিডিও বানিয়ে দিবে!
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 gap-1.5 shadow-xl">
          <button
            onClick={() => setImportMode('youtube')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              importMode === 'youtube'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Youtube className="h-4 w-4" />
            <span>Paste YouTube Link</span>
          </button>

          <button
            onClick={() => setImportMode('upload')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              importMode === 'upload'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Video File</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <div className="flex-1">{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* MODE 1: YOUTUBE LINK IMPORT */}
      {importMode === 'youtube' && (
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" />
                <span>Paste YouTube Video URL</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Paste from Clipboard</span>
              </button>
            </div>

            {/* Input Box with quick paste */}
            <div className="relative flex items-center">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isAnalyzing}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 pr-24 text-sm font-semibold text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-inner"
              />
              {youtubeUrl && (
                <button
                  type="button"
                  onClick={() => setYoutubeUrl('')}
                  className="absolute right-3 rounded-lg p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* YouTube Video Live Preview Card */}
          {ytVideoInfo && (
            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
              <div className="relative aspect-video w-full sm:w-48 overflow-hidden rounded-xl bg-black shrink-0 border border-slate-800">
                <img
                  src={ytVideoInfo.thumbnail}
                  alt={ytVideoInfo.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Youtube className="h-8 w-8 text-red-500 fill-white" />
                </div>
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                  <CheckCircle className="h-3 w-3" />
                  <span>Valid YouTube Video</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-2">
                  {ytVideoInfo.title || 'YouTube Video'}
                </h4>
                {ytVideoInfo.author && (
                  <p className="text-xs text-slate-400">Channel: {ytVideoInfo.author}</p>
                )}
              </div>
            </div>
          )}

          {/* 1-Click Popular YouTube Link Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or Click To Test Popular YouTube Links:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  label: 'Steve Jobs 2005 Stanford Speech',
                  url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
                  tag: 'Inspirational',
                },
                {
                  label: 'MrBeast: Surviving 50 Hours',
                  url: 'https://www.youtube.com/watch?v=7h1s9v1-v68',
                  tag: 'Viral High Retention',
                },
              ].map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => setYoutubeUrl(sample.url)}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-left text-xs hover:border-red-500/40 hover:bg-slate-950 transition cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-200">{sample.label}</span>
                  </div>
                  <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20 shrink-0">
                    {sample.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Processing Status */}
          {isAnalyzing && (
            <div className="space-y-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-red-300">
                  <RefreshCw className="h-4 w-4 animate-spin text-red-400" />
                  <span>{analysisStep || 'Processing YouTube video...'}</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {uploadProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-violet-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCancelUpload}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Cancel Processing
                </button>
              </div>
            </div>
          )}

          {/* AI Settings Tuning */}
          {!isAnalyzing && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-violet-400" />
                    Target Clips
                  </label>
                  <select
                    value={clipCount}
                    onChange={(e) => setClipCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-red-400 focus:outline-none"
                  >
                    <option value={2}>2 Viral Shorts</option>
                    <option value={3}>3 Viral Shorts (Recommended)</option>
                    <option value={4}>4 Viral Shorts</option>
                    <option value={5}>5 Viral Shorts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                    Vertical Reframing
                  </label>
                  <select
                    value={targetAspectRatio}
                    onChange={(e) => setTargetAspectRatio(e.target.value as AspectRatio)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-red-400 focus:outline-none"
                  >
                    <option value="9:16">9:16 Vertical (Shorts, TikTok, Reels)</option>
                    <option value="1:1">1:1 Square (Instagram Feed)</option>
                    <option value="16:9">16:9 Original Landscape</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-emerald-400" />
                    Caption Preset
                  </label>
                  <select
                    value={captionPreset}
                    onChange={(e) => setCaptionPreset(e.target.value as CaptionPreset)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-red-400 focus:outline-none"
                  >
                    <option value="bold">Viral Bold (Hormozi Yellow)</option>
                    <option value="clean">Clean Minimalist</option>
                    <option value="neon">Neon Cyber Glow</option>
                    <option value="impact">Social Impact Red</option>
                    <option value="karaoke">Karaoke Active Glow</option>
                    <option value="classic">Classic Subtitle Box</option>
                  </select>
                </div>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleAnalyzeYouTube}
                disabled={!youtubeUrl.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-violet-600 to-indigo-600 py-4 text-sm font-black text-white shadow-xl shadow-red-600/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Shorts from YouTube Link (100% Free)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: LOCAL VIDEO FILE UPLOAD */}
      {importMode === 'upload' && (
        <div className="space-y-6">
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/40 hover:border-violet-500/50 hover:bg-slate-900/70'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                accept=".mp4,.mov,.webm,.avi,.mkv,video/*"
                className="hidden"
              />

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 border border-slate-700/60 mb-5 shadow-inner">
                <UploadCloud className="h-10 w-10 text-cyan-400" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Drag &amp; Drop your video file here
              </h3>
              <p className="text-xs text-slate-400 mb-6 max-w-sm">
                Supports MP4, MOV, WebM, AVI. Max 500MB file size.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <FileVideo className="h-4 w-4" />
                <span>Browse Files</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <FileVideo className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-md">
                      {selectedFile.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>Size: {formatFileSize(selectedFile.size)}</span>
                      {videoDuration > 0 && <span>Duration: {formatTime(videoDuration)}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRemoveVideo}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {videoPreviewUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-slate-800">
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    controls
                    className="h-full w-full object-contain"
                    onLoadedMetadata={(e) => {
                      setVideoDuration(e.currentTarget.duration);
                    }}
                  />
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-3 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-violet-300">
                      <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                      <span>{analysisStep || 'Processing video...'}</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-bold">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleCancelUpload}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      Cancel Processing
                    </button>
                  </div>
                </div>
              )}

              {!isAnalyzing && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Target Clips</label>
                      <select
                        value={clipCount}
                        onChange={(e) => setClipCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <option value={2}>2 Clips</option>
                        <option value={3}>3 Clips (Recommended)</option>
                        <option value={4}>4 Clips</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Vertical Reframing</label>
                      <select
                        value={targetAspectRatio}
                        onChange={(e) => setTargetAspectRatio(e.target.value as AspectRatio)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <option value="9:16">9:16 Vertical</option>
                        <option value="1:1">1:1 Square</option>
                        <option value="16:9">16:9 Landscape</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Caption Style</label>
                      <select
                        value={captionPreset}
                        onChange={(e) => setCaptionPreset(e.target.value as CaptionPreset)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
                      >
                        <option value="bold">Viral Bold</option>
                        <option value="clean">Clean Minimalist</option>
                        <option value="neon">Neon Cyber Glow</option>
                        <option value="impact">Social Impact Red</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyzeVideo}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze Video &amp; Generate Clips</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1-Click Demo Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Or Try Pre-Loaded 1-Click Samples
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Instant test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'sample-podcast', label: 'Viral Founder Podcast', time: '15s', badge: 'Score: 96' },
            { id: 'sample-tech', label: 'Tech Keynote & Spatial AI', time: '15s', badge: 'Score: 94' },
            { id: 'sample-mindset', label: 'Mindset & Habits Story', time: '15s', badge: 'Score: 91' },
          ].map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-left text-xs font-medium text-slate-300 hover:border-violet-500 hover:text-white transition cursor-pointer"
            >
              <div>
                <div className="font-semibold text-white">{sample.label}</div>
                <div className="text-[10px] text-slate-500">{sample.time} footage</div>
              </div>
              <span className="rounded bg-violet-600/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                {sample.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
