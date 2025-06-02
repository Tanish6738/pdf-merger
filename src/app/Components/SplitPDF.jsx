"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Download,
  Scissors,
  Settings,
  ChevronRight,
  ChevronDown,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Info,
  Archive,
  Grid3X3,
  List,
  Hash,
  Target
} from 'lucide-react';

import {
  SPLIT_MODES,
  splitIntoIndividualPages,
  splitByPageRanges,
  splitBySpecificPages,
  splitIntoChunks,
  splitBySize,
  splitAtCustomPoints,
  previewSplit,
  batchSplit,
  getPDFSplitInfo,
  parsePageRanges,
  parsePageNumbers,
  parseFileSize,
  formatFileSize,
  formatFileSizeDetailed
} from '../utils/pdfSplitter';

import {
  downloadBlob,
  downloadSplitFile,
  downloadAllSplitFiles,
  queueDownload,
  downloadWithProgress,
  downloadMultipleFiles
} from '../utils/downloadHelpers';

const SplitPDF = ({ onNavigate }) => {
  // Core state
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [splitMode, setSplitMode] = useState(SPLIT_MODES.ALL_PAGES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  // Split configuration state
  const [pageRanges, setPageRanges] = useState('');
  const [specificPages, setSpecificPages] = useState('');
  const [chunkSize, setChunkSize] = useState(5);
  const [splitPoints, setSplitPoints] = useState('');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [fileSizeUnit, setFileSizeUnit] = useState('MB');
  const [groupPages, setGroupPages] = useState(false);
  const [preserveBookmarks, setPreserveBookmarks] = useState(false);
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [includeRestAfterLastPoint, setIncludeRestAfterLastPoint] = useState(true);
  const [customNamingPattern, setCustomNamingPattern] = useState('');
  const [enablePreview, setEnablePreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // UI state
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Split mode configurations
  const splitModes = [
    {
      id: SPLIT_MODES.ALL_PAGES,
      name: 'All Pages',
      description: 'Split PDF into individual pages (one page per file)',
      icon: List,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: SPLIT_MODES.PAGE_RANGES,
      name: 'Page Ranges',
      description: 'Split by specific page ranges (e.g., 1-5, 6-10)',
      icon: Grid3X3,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: SPLIT_MODES.SPECIFIC_PAGES,
      name: 'Specific Pages',
      description: 'Select individual pages to extract',
      icon: Hash,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: SPLIT_MODES.CHUNKS,
      name: 'Fixed Chunks',
      description: 'Split into chunks of specified size',
      icon: Archive,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: SPLIT_MODES.SIZE_BASED,
      name: 'Size-Based',
      description: 'Split into files under specified size limit',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },
    {
      id: SPLIT_MODES.CUSTOM_SPLIT_POINTS,
      name: 'Split Points',
      description: 'Split at custom points in the document',
      icon: Scissors,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    }
  ];

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
      setResults(null);
      setProgress(0);

      // Get PDF information
      const info = await getPDFSplitInfo(uploadedFile);
      if (info.success) {
        setPdfInfo(info.info);
      } else {
        setError(`Failed to read PDF: ${info.error}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxFiles: 1
  });
  // Reset function
  const resetSplit = useCallback(() => {
    setFile(null);
    setPdfInfo(null);
    setResults(null);
    setError(null);
    setProgress(0);
    setPageRanges('');
    setSpecificPages('');
    setSplitPoints('');
    setChunkSize(5);
    setMaxFileSize('10');
    setFileSizeUnit('MB');
    setGroupPages(false);
    setPreserveBookmarks(false);
    setPreserveMetadata(true);
    setIncludeRestAfterLastPoint(true);
    setCustomNamingPattern('');
    setEnablePreview(false);
    setPreviewData(null);
  }, []);
  // Split processing
  const processSplit = async () => {
    if (!file || !pdfInfo) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      let result;
      const options = {
        onProgress: (progressValue) => setProgress(progressValue),
        preserveBookmarks,
        preserveMetadata,
        groupPages,
        includeRestAfterLastPoint,
        customNaming: customNamingPattern
      };

      switch (splitMode) {
        case SPLIT_MODES.ALL_PAGES:
          result = await splitIntoIndividualPages(file, options);
          break;
        
        case SPLIT_MODES.PAGE_RANGES:
          const ranges = parsePageRanges(pageRanges, pdfInfo.pageCount);
          if (ranges.length === 0) {
            throw new Error('Please enter valid page ranges (e.g., 1-5, 6-10)');
          }
          result = await splitByPageRanges(file, ranges, options);
          break;
        
        case SPLIT_MODES.SPECIFIC_PAGES:
          const pages = parsePageNumbers(specificPages, pdfInfo.pageCount);
          if (pages.length === 0) {
            throw new Error('Please enter valid page numbers (e.g., 1, 3, 5-8)');
          }
          result = await splitBySpecificPages(file, pages, options);
          break;
        
        case SPLIT_MODES.CHUNKS:
          if (chunkSize <= 0 || chunkSize > pdfInfo.pageCount) {
            throw new Error(`Chunk size must be between 1 and ${pdfInfo.pageCount}`);
          }
          result = await splitIntoChunks(file, chunkSize, options);
          break;
        
        case SPLIT_MODES.SIZE_BASED:
          const maxSizeBytes = parseFileSize(`${maxFileSize} ${fileSizeUnit}`);
          if (!maxSizeBytes || maxSizeBytes <= 0) {
            throw new Error('Please enter a valid file size');
          }
          result = await splitBySize(file, maxSizeBytes, options);
          break;
        
        case SPLIT_MODES.CUSTOM_SPLIT_POINTS:
          const points = parsePageNumbers(splitPoints, pdfInfo.pageCount);
          if (points.length === 0) {
            throw new Error('Please enter valid split points (e.g., 5, 10, 15)');
          }
          result = await splitAtCustomPoints(file, points, options);
          break;
        
        default:
          throw new Error('Invalid split mode selected');
      }

      if (result.success) {
        setResults(result);
        setProgress(100);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Preview split function
  const generatePreview = async () => {
    if (!file || !pdfInfo) return;

    try {
      let splitConfig = { mode: splitMode };
      
      switch (splitMode) {
        case SPLIT_MODES.PAGE_RANGES:
          splitConfig.ranges = pageRanges;
          break;
        case SPLIT_MODES.CHUNKS:
          splitConfig.chunkSize = chunkSize;
          break;
        case SPLIT_MODES.SIZE_BASED:
          const maxSizeBytes = parseFileSize(`${maxFileSize} ${fileSizeUnit}`);
          if (!maxSizeBytes) {
            setError('Please enter a valid file size');
            return;
          }
          splitConfig.maxSize = maxSizeBytes;
          break;
        default:
          break;
      }

      const result = await previewSplit(file, splitConfig);
      if (result.success) {
        setPreviewData(result.preview);
        setEnablePreview(true);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  // Download functions
  const downloadSingleFile = async (fileData) => {
    try {
      await downloadSplitFile(fileData);
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Failed to download ${fileData.fileName}: ${error.message}`);
    }
  };

  // Enhanced download all files function
  const downloadAllFiles = async () => {
    if (!results) return;

    const files = results.splitFiles || results.pages || results.pdfs || results.chunks || results.segments || [];
    
    if (files.length === 0) {
      setError('No files available for download');
      return;
    }

    try {
      await downloadAllSplitFiles(files, {
        onProgress: (progress) => {
          console.log(`Download progress: ${progress}%`);
        },
        onError: (error, fileName) => {
          console.error(`Failed to download ${fileName}:`, error);
        }
      });
    } catch (error) {
      console.error('Batch download failed:', error);
      setError(`Failed to download files: ${error.message}`);
    }
  };
  // Render split mode settings
  const renderSplitSettings = () => {
    switch (splitMode) {
      case SPLIT_MODES.PAGE_RANGES:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Page Ranges <span className="text-[#A0AEC0] text-sm">(e.g., 1-5, 6-10, 15)</span>
              </label>
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="1-5, 6-10, 15-20"
                className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00A99D]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveBookmarks"
                  checked={preserveBookmarks}
                  onChange={(e) => setPreserveBookmarks(e.target.checked)}
                  className="rounded text-[#00A99D]"
                />
                <label htmlFor="preserveBookmarks" className="text-[#E1E6EB] text-sm">
                  Preserve bookmarks (experimental)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveMetadata"
                  checked={preserveMetadata}
                  onChange={(e) => setPreserveMetadata(e.target.checked)}
                  className="rounded text-[#00A99D]"
                />
                <label htmlFor="preserveMetadata" className="text-[#E1E6EB] text-sm">
                  Preserve metadata
                </label>
              </div>
            </div>
          </div>
        );

      case SPLIT_MODES.SPECIFIC_PAGES:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Page Numbers <span className="text-[#A0AEC0] text-sm">(e.g., 1, 3, 5-8, 12)</span>
              </label>
              <input
                type="text"
                value={specificPages}
                onChange={(e) => setSpecificPages(e.target.value)}
                placeholder="1, 3, 5-8, 12"
                className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00A99D]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="groupPages"
                checked={groupPages}
                onChange={(e) => setGroupPages(e.target.checked)}
                className="rounded text-[#00A99D]"
              />
              <label htmlFor="groupPages" className="text-[#E1E6EB] text-sm">
                Group all selected pages into one PDF
              </label>
            </div>
          </div>
        );

      case SPLIT_MODES.CHUNKS:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Pages per Chunk
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max={pdfInfo ? Math.min(pdfInfo.pageCount, 50) : 10}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-[#1B212C] rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[#00A99D] font-medium w-12">{chunkSize}</span>
              </div>
              {pdfInfo && (
                <p className="text-[#A0AEC0] text-sm mt-2">
                  Will create {Math.ceil(pdfInfo.pageCount / chunkSize)} files
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preserveMetadata"
                checked={preserveMetadata}
                onChange={(e) => setPreserveMetadata(e.target.checked)}
                className="rounded text-[#00A99D]"
              />
              <label htmlFor="preserveMetadata" className="text-[#E1E6EB] text-sm">
                Preserve metadata
              </label>
            </div>
          </div>
        );

      case SPLIT_MODES.SIZE_BASED:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Maximum File Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  min="1"
                  max="1000"
                  className="flex-1 px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00A99D]"
                />
                <select
                  value={fileSizeUnit}
                  onChange={(e) => setFileSizeUnit(e.target.value)}
                  className="px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
              {pdfInfo && (
                <p className="text-[#A0AEC0] text-sm mt-2">
                  Original file size: {formatFileSize(pdfInfo.fileSize)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preserveMetadata"
                checked={preserveMetadata}
                onChange={(e) => setPreserveMetadata(e.target.checked)}
                className="rounded text-[#00A99D]"
              />
              <label htmlFor="preserveMetadata" className="text-[#E1E6EB] text-sm">
                Preserve metadata
              </label>
            </div>
          </div>
        );

      case SPLIT_MODES.CUSTOM_SPLIT_POINTS:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Split Points <span className="text-[#A0AEC0] text-sm">(page numbers where to split)</span>
              </label>
              <input
                type="text"
                value={splitPoints}
                onChange={(e) => setSplitPoints(e.target.value)}
                placeholder="5, 10, 15"
                className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00A99D]"
              />
              <p className="text-[#A0AEC0] text-sm mt-1">
                Creates segments: 1 to (first point-1), then from each point to the next
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeRest"
                  checked={includeRestAfterLastPoint}
                  onChange={(e) => setIncludeRestAfterLastPoint(e.target.checked)}
                  className="rounded text-[#00A99D]"
                />
                <label htmlFor="includeRest" className="text-[#E1E6EB] text-sm">
                  Include remaining pages after last split point
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preserveMetadata"
                  checked={preserveMetadata}
                  onChange={(e) => setPreserveMetadata(e.target.checked)}
                  className="rounded text-[#00A99D]"
                />
                <label htmlFor="preserveMetadata" className="text-[#E1E6EB] text-sm">
                  Preserve metadata
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-[#A0AEC0]">
                No additional settings required for this split mode
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="preserveMetadata"
                checked={preserveMetadata}
                onChange={(e) => setPreserveMetadata(e.target.checked)}
                className="rounded text-[#00A99D]"
              />
              <label htmlFor="preserveMetadata" className="text-[#E1E6EB] text-sm">
                Preserve metadata
              </label>
            </div>
          </div>
        );
    }
  };
  // Render results
  const renderResults = () => {
    if (!results) return null;

    const files = results.splitFiles || results.pages || results.pdfs || results.chunks || results.segments || [];
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    return (
      <motion.div
        className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-[#E1E6EB]">
            Split Results
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[#A0AEC0] text-sm">
              {files.length} file{files.length !== 1 ? 's' : ''} created
            </span>
            <button
              onClick={downloadAllFiles}
              className="px-4 py-2 bg-[#00A99D] hover:bg-[#00A99D]/90 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1B212C] rounded-lg p-4">
            <div className="text-[#A0AEC0] text-sm">Original Size</div>
            <div className="text-[#E1E6EB] font-medium">{formatFileSize(file.size)}</div>
          </div>
          <div className="bg-[#1B212C] rounded-lg p-4">
            <div className="text-[#A0AEC0] text-sm">Files Created</div>
            <div className="text-[#E1E6EB] font-medium">{files.length}</div>
          </div>
          <div className="bg-[#1B212C] rounded-lg p-4">
            <div className="text-[#A0AEC0] text-sm">Total Split Size</div>
            <div className="text-[#E1E6EB] font-medium">{formatFileSize(totalSize)}</div>
          </div>
          <div className="bg-[#1B212C] rounded-lg p-4">
            <div className="text-[#A0AEC0] text-sm">Size Difference</div>
            <div className="text-[#E1E6EB] font-medium">
              {totalSize > file.size ? '+' : ''}{(((totalSize - file.size) / file.size) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* File List with Individual Downloads */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#E1E6EB] font-medium">Individual Files</h4>
            <div className="text-[#A0AEC0] text-sm">
              Click on any file to download individually
            </div>
          </div>
          
          {files.map((fileData, index) => (
            <div
              key={index}
              className="group flex items-center justify-between p-4 bg-[#1B212C] rounded-lg border border-[#A0AEC0]/20 hover:border-[#00A99D]/30 hover:bg-[#1B212C]/80 transition-all duration-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-[#00A99D] flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[#E1E6EB] font-medium truncate" title={fileData.fileName}>
                    {fileData.fileName}
                  </p>
                  <div className="flex items-center gap-4 text-[#A0AEC0] text-sm">
                    {fileData.range && <span>Pages: {fileData.range}</span>}
                    <span>Size: {formatFileSize(fileData.size)}</span>
                    {fileData.pageCount && <span>{fileData.pageCount} page{fileData.pageCount !== 1 ? 's' : ''}</span>}
                    {fileData.pdfIndex && <span>Part {fileData.pdfIndex}</span>}
                    {fileData.chunkIndex && <span>Chunk {fileData.chunkIndex}</span>}
                    {fileData.segmentIndex && <span>Segment {fileData.segmentIndex}</span>}
                  </div>
                </div>
              </div>              <button
                onClick={() => downloadSplitFile(fileData)}
                className="px-3 py-2 bg-[#00A99D]/20 text-[#00A99D] rounded-lg hover:bg-[#00A99D]/30 transition-colors flex items-center gap-2 opacity-80 group-hover:opacity-100"
                title={`Download ${fileData.fileName}`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 pt-6 border-t border-[#A0AEC0]/20">
          <div className="flex items-center justify-between">
            <div className="text-[#A0AEC0] text-sm">
              Split Mode: {splitModes.find(mode => mode.id === results.splitMode)?.name || 'Unknown'}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-[#A0AEC0]/20 text-[#A0AEC0] rounded-lg hover:bg-[#A0AEC0]/30 transition-colors"
              >
                Clear Results
              </button>
              <button
                onClick={downloadAllFiles}
                className="px-4 py-2 bg-[#00A99D] hover:bg-[#00A99D]/90 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All ({files.length})
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1B212C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00A99D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#E1E6EB]">Loading Split PDF...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B212C] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB]">
              Split <span className="text-[#00A99D]">PDF</span>
            </h1>
            <Scissors className="w-10 h-10 text-[#00A99D]" />
          </div>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
            Split your PDF documents with precision using multiple splitting modes and advanced options
          </p>
        </motion.div>

        {/* File Upload */}
        {!file && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-[#00A99D] bg-[#00A99D]/5'
                  : 'border-[#A0AEC0]/30 hover:border-[#00A99D]/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-[#00A99D] mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-[#E1E6EB] mb-2">
                {isDragActive ? 'Drop your PDF here' : 'Upload PDF to Split'}
              </h4>
              <p className="text-[#A0AEC0]">
                Drag & drop a PDF file or click to browse
              </p>
            </div>
          </motion.div>
        )}

        {/* PDF Info */}
        {file && pdfInfo && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#E1E6EB]">PDF Information</h3>
              <button
                onClick={resetSplit}
                className="text-[#A0AEC0] hover:text-[#E1E6EB] transition-colors"
                title="Upload different file"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">File Name</div>
                <div className="text-[#E1E6EB] font-medium truncate">{pdfInfo.fileName}</div>
              </div>
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">Pages</div>
                <div className="text-[#E1E6EB] font-medium">{pdfInfo.pageCount}</div>
              </div>
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">File Size</div>
                <div className="text-[#E1E6EB] font-medium">{formatFileSize(pdfInfo.fileSize)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Split Mode Selection */}
        {file && pdfInfo && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-6">Choose Split Mode</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {splitModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = splitMode === mode.id;
                
                return (
                  <motion.div
                    key={mode.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `${mode.bgColor} ${mode.borderColor} border-2`
                        : 'bg-[#1B212C] border-[#A0AEC0]/20 hover:border-[#00A99D]/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSplitMode(mode.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${mode.color}`} />
                      <h4 className="text-[#E1E6EB] font-medium">{mode.name}</h4>
                    </div>
                    <p className="text-[#A0AEC0] text-sm">{mode.description}</p>
                    {isSelected && (
                      <motion.div
                        className="mt-2 flex items-center gap-2 text-[#00A99D] text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Selected</span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>            {/* Split Settings */}
            <div className="border-t border-[#A0AEC0]/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#00A99D]" />
                  <h4 className="text-lg font-medium text-[#E1E6EB]">Split Settings</h4>
                </div>
                {[SPLIT_MODES.PAGE_RANGES, SPLIT_MODES.CHUNKS, SPLIT_MODES.SIZE_BASED].includes(splitMode) && (
                  <button
                    onClick={generatePreview}
                    className="px-4 py-2 bg-[#00A99D]/20 text-[#00A99D] rounded-lg hover:bg-[#00A99D]/30 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Split
                  </button>
                )}
              </div>
              {renderSplitSettings()}
            </div>

            {/* Custom Naming */}
            <div className="border-t border-[#A0AEC0]/20 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#00A99D]" />
                <h4 className="text-lg font-medium text-[#E1E6EB]">Output Options</h4>
              </div>
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Custom Naming Pattern <span className="text-[#A0AEC0] text-sm">(optional)</span>
                </label>
                <input
                  type="text"
                  value={customNamingPattern}
                  onChange={(e) => setCustomNamingPattern(e.target.value)}
                  placeholder="e.g., document_{index}, part_{page_range}"
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00A99D]"
                />
                <p className="text-[#A0AEC0] text-sm mt-1">
                  Use placeholders: {'{index}'}, {'{page_range}'}, {'{start_page}'}, {'{end_page}'}
                </p>
              </div>
            </div>

            {/* Process Button */}
            <div className="border-t border-[#A0AEC0]/20 pt-6 mt-6">
              <button
                onClick={processSplit}
                disabled={isProcessing}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  !isProcessing
                    ? 'bg-[#00A99D] hover:bg-[#00A99D]/90 text-white'
                    : 'bg-[#A0AEC0]/20 text-[#A0AEC0] cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Splitting PDF... {progress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Scissors className="w-5 h-5" />
                    <span>Split PDF</span>
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Preview Button */}
        {file && pdfInfo && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-[#00A99D]" />
              <h4 className="text-lg font-medium text-[#E1E6EB]">Preview Split</h4>
            </div>
            <p className="text-[#A0AEC0] text-sm mb-4">
              Generate a preview of the split results without downloading
            </p>
            <button
              onClick={generatePreview}
              disabled={isProcessing}
              className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                !isProcessing
                  ? 'bg-[#00A99D] hover:bg-[#00A99D]/90 text-white'
                  : 'bg-[#A0AEC0]/20 text-[#A0AEC0] cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Generating Preview... {progress}%</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>Preview Split</span>
                </div>
              )}
            </button>

            {/* Preview Results */}
            {enablePreview && previewData && (
              <div className="mt-4">
                <h5 className="text-[#E1E6EB] font-medium mb-2">Preview Results</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previewData.map((fileData, index) => (
                    <div
                      key={index}
                      className="bg-[#1B212C] rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-[#00A99D]" />
                        <div>
                          <p className="text-[#E1E6EB] font-medium">{fileData.fileName}</p>
                          <p className="text-[#A0AEC0] text-sm">
                            {fileData.range && `Pages: ${fileData.range} • `}
                            Size: {formatFileSize(fileData.size)}
                            {fileData.pageCount && ` • ${fileData.pageCount} page${fileData.pageCount !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>                      <button
                        onClick={() => downloadSplitFile(fileData)}
                        className="w-full px-3 py-2 bg-[#00A99D]/20 text-[#00A99D] rounded-lg hover:bg-[#00A99D]/30 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Preview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Progress */}
        {isProcessing && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-4">Processing</h3>
            <div className="w-full bg-[#1B212C] rounded-full h-3 mb-2">
              <motion.div
                className="bg-[#00A99D] h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[#A0AEC0] text-sm">{progress}% complete</p>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {renderResults()}

        {/* Preview Section */}
        {enablePreview && previewData && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#E1E6EB]">Split Preview</h3>
              <button
                onClick={() => setEnablePreview(false)}
                className="text-[#A0AEC0] hover:text-[#E1E6EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">Estimated Files</div>
                <div className="text-[#E1E6EB] font-medium">{previewData.estimatedFiles}</div>
              </div>
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">Total Size</div>
                <div className="text-[#E1E6EB] font-medium">{formatFileSize(previewData.estimatedTotalSize)}</div>
              </div>
              <div className="bg-[#1B212C] rounded-lg p-4">
                <div className="text-[#A0AEC0] text-sm">Original Pages</div>
                <div className="text-[#E1E6EB] font-medium">{previewData.originalPages}</div>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              <h4 className="text-lg font-medium text-[#E1E6EB] mb-4">Files to be created:</h4>
              {previewData.filePreview.map((filePreview, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#1B212C] rounded-lg border border-[#A0AEC0]/10"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#00A99D]" />
                    <div>
                      <p className="text-[#E1E6EB] font-medium text-sm">{filePreview.fileName}</p>
                      <p className="text-[#A0AEC0] text-xs">
                        Pages: {filePreview.pageRange} • Size: {formatFileSize(filePreview.estimatedSize)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back to Home */}
        {onNavigate && (
          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('landing')}
              className="px-6 py-3 bg-[#A0AEC0]/20 text-[#A0AEC0] rounded-lg hover:bg-[#A0AEC0]/30 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPDF;
