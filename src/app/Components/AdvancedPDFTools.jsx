"use client";
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import ThemeInitializer from "./ThemeInitializer";
import {
  Scissors,
  RotateCw,
  Minimize2,
  Lock,
  Droplets,
  FileText,
  Download,
  Upload,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Zap,
  Shield,
  Eye,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
  splitPDF,
  rotatePDF,
  compressPDF,
  addWatermark,
  extractPages,
  getPDFInfo,
  PDF_OPERATIONS,
  ROTATION_ANGLES,
  COMPRESSION_LEVELS,
} from "../utils/pdfManipulation";
import { downloadBlob, formatFileSize } from "../utils/pdfHelpers";
import {
  SPLIT_MODES,
  splitIntoIndividualPages,
  splitByPageRanges,
  splitByPageChunks,
  splitByFileSize,
  splitByBookmarks,
  splitByContentPattern,
  splitByCustomPoints,
  parsePageRanges,
  parsePageNumbers,
} from "../utils/pdfSplitter";

// Dynamically import OCRProcessor to avoid SSR issues
const OCRProcessor = dynamic(() => import("./OCRProcessor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-center text-theme-text">Loading OCR...</div>
  ),
});

const AdvancedPDFTools = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showOCR, setShowOCR] = useState(false);

  const [toolSettings, setToolSettings] = useState({
    split: {
      mode: SPLIT_MODES.ALL_PAGES,
      pageRanges: "",
      specificPages: "",
      chunkSize: 10,
      maxFileSize: 5,
      contentPattern: "",
      customSplitPoints: "",
      preserveBookmarks: true,
      outputNaming: "sequential",
      customPrefix: "",
    },
    rotate: { angle: ROTATION_ANGLES.ROTATE_90 },
    compress: { level: COMPRESSION_LEVELS.MEDIUM },
    watermark: {
      text: "CONFIDENTIAL",
      fontSize: 50,
      opacity: 0.3,
      color: [0.5, 0.5, 0.5],
      rotation: 45,
      position: "center",
    },
    extract: { pageNumbers: [] },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // PDF Tools configuration
  const pdfTools = [
    {
      id: "split",
      name: "Split PDF",
      description: "Advanced PDF splitting with multiple options",
      icon: Scissors,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      id: "rotate",
      name: "Rotate Pages",
      description: "Rotate PDF pages by 90°, 180°, or 270°",
      icon: RotateCw,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      id: "compress",
      name: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: Minimize2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      id: "watermark",
      name: "Add Watermark",
      description: "Add text watermarks to protect your documents",
      icon: Droplets,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      id: "extract",
      name: "Extract Pages",
      description: "Extract specific pages from PDF documents",
      icon: FileText,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      id: "ocr",
      name: "OCR Text Extraction",
      description: "Extract text from scanned PDFs and images",
      icon: Eye,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
  ];

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    setError(null);
    setResults([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxFiles: 10,
  });
  if (!mounted) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-theme-text">Loading PDF tools...</div>
        </div>
      </div>
    );
  }

  // Process files with selected tool
  const processFiles = async () => {
    if (!selectedTool || files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const processResults = [];

      for (const file of files) {
        let result;

        switch (selectedTool) {
          case "split":
            // Use the enhanced split functionality based on selected mode
            const splitSettings = toolSettings.split;

            switch (splitSettings.mode) {
              case SPLIT_MODES.ALL_PAGES:
                result = await splitIntoIndividualPages(file, {
                  onProgress: (progress) => {
                    // Could add progress tracking here
                  },
                });
                break;
              case SPLIT_MODES.PAGE_RANGES:
                if (!splitSettings.pageRanges.trim()) {
                  result = {
                    success: false,
                    error: "Please specify page ranges (e.g., 1-3,5-7)",
                  };
                } else {
                  // Get PDF info to get total page count for validation
                  const pdfInfo = await getPDFInfo(file);
                  if (!pdfInfo.success) {
                    result = {
                      success: false,
                      error: "Failed to read PDF information",
                    };
                  } else {
                    const ranges = parsePageRanges(
                      splitSettings.pageRanges,
                      pdfInfo.info.pageCount
                    );
                    if (ranges.length === 0) {
                      result = {
                        success: false,
                        error:
                          "No valid page ranges found. Please check your input.",
                      };
                    } else {
                      result = await splitByPageRanges(file, ranges, {
                        preserveBookmarks: splitSettings.preserveBookmarks,
                      });
                    }
                  }
                }
                break;

              case SPLIT_MODES.SPECIFIC_PAGES:
                if (!splitSettings.specificPages.trim()) {
                  result = {
                    success: false,
                    error: "Please specify page numbers (e.g., 1,3,5)",
                  };
                } else {
                  // Get PDF info to get total page count for validation
                  const pdfInfo = await getPDFInfo(file);
                  if (!pdfInfo.success) {
                    result = {
                      success: false,
                      error: "Failed to read PDF information",
                    };
                  } else {
                    const ranges = parsePageRanges(
                      splitSettings.specificPages,
                      pdfInfo.info.pageCount
                    );
                    if (ranges.length === 0) {
                      result = {
                        success: false,
                        error:
                          "No valid page numbers found. Please check your input.",
                      };
                    } else {
                      result = await splitByPageRanges(file, ranges, {
                        preserveBookmarks: splitSettings.preserveBookmarks,
                      });
                    }
                  }
                }
                break;

              case SPLIT_MODES.CHUNKS:
                result = await splitByPageChunks(
                  file,
                  splitSettings.chunkSize,
                  {
                    preserveBookmarks: splitSettings.preserveBookmarks,
                  }
                );
                break;

              case SPLIT_MODES.SIZE_BASED:
                result = await splitByFileSize(
                  file,
                  splitSettings.maxFileSize,
                  {
                    preserveBookmarks: splitSettings.preserveBookmarks,
                  }
                );
                break;

              case SPLIT_MODES.BOOKMARKS:
                result = await splitByBookmarks(file, {
                  preserveBookmarks: splitSettings.preserveBookmarks,
                });
                break;

              case SPLIT_MODES.CONTENT_BASED:
                if (!splitSettings.contentPattern.trim()) {
                  result = {
                    success: false,
                    error: "Please specify a content pattern to search for",
                  };
                } else {
                  result = await splitByContentPattern(
                    file,
                    splitSettings.contentPattern,
                    {
                      preserveBookmarks: splitSettings.preserveBookmarks,
                    }
                  );
                }
                break;

              case SPLIT_MODES.CUSTOM_SPLIT_POINTS:
                if (!splitSettings.customSplitPoints.trim()) {
                  result = {
                    success: false,
                    error: "Please specify custom split points (e.g., 3,7,12)",
                  };
                } else {
                  result = await splitByCustomPoints(
                    file,
                    splitSettings.customSplitPoints,
                    {
                      preserveBookmarks: splitSettings.preserveBookmarks,
                    }
                  );
                }
                break;

              default:
                result = await splitIntoIndividualPages(file);
            }
            break;

          case "rotate":
            const rotations = {};
            // Apply rotation to all pages
            const info = await getPDFInfo(file);
            if (info.success) {
              for (let i = 0; i < info.info.pageCount; i++) {
                rotations[i] = toolSettings.rotate.angle;
              }
            }
            result = await rotatePDF(file, rotations);
            break;

          case "compress":
            result = await compressPDF(file, toolSettings.compress.level);
            break;

          case "watermark":
            result = await addWatermark(file, toolSettings.watermark);
            break;

          case "extract":
            if (toolSettings.extract.pageNumbers.length === 0) {
              result = {
                success: false,
                error: "No pages specified for extraction",
              };
            } else {
              result = await extractPages(
                file,
                toolSettings.extract.pageNumbers
              );
            }
            break;

          default:
            result = { success: false, error: "Unknown tool selected" };
        }

        processResults.push({
          fileName: file.name,
          originalSize: file.size,
          ...result,
        });
      }

      setResults(processResults);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed file
  const downloadResult = (result) => {
    if (result.blob) {
      downloadBlob(result.blob, result.fileName);
    } else if (result.splitFiles && result.splitFiles.length > 0) {
      // Download all split files sequentially
      result.splitFiles.forEach((file, index) => {
        setTimeout(() => {
          downloadBlob(file.blob, file.fileName);
        }, index * 500);
      });
    } else if (result.pages) {
      // Legacy fallback for old split format
      result.pages.forEach((page, index) => {
        setTimeout(() => {
          downloadBlob(page.blob, page.fileName);
        }, index * 500);
      });
    }
  };
  // Download split file to handle all formats
  const downloadSplitFile = (file) => {
    try {
      downloadBlob(file.blob, file.fileName);
    } catch (error) {
      console.error("Download failed:", error);
      setError(`Failed to download ${file.fileName}: ${error.message}`);
    }
  };

  // Download all split files sequentially
  const downloadAllSplitFiles = (splitFiles) => {
    try {
      splitFiles.forEach((file, index) => {
        setTimeout(() => {
          downloadSplitFile(file);
        }, index * 500);
      });
    } catch (error) {
      console.error("Download all failed:", error);
      setError(`Failed to download files: ${error.message}`);
    }
  };

  // Tool-specific settings components
  const renderToolSettings = () => {
    switch (selectedTool) {
      case "split":
        return (
          <div className="space-y-6">
            {/* Split Mode Selection */}
            <div>
              {" "}
              <label className="block text-theme-text font-medium mb-3">
                Split Method
              </label>
              <select
                value={toolSettings.split.mode}
                onChange={(e) =>
                  setToolSettings((prev) => ({
                    ...prev,
                    split: { ...prev.split, mode: e.target.value },
                  }))
                }
                className="input-theme w-full"
              >
                <option value={SPLIT_MODES.ALL_PAGES}>
                  Split into Individual Pages
                </option>
                <option value={SPLIT_MODES.PAGE_RANGES}>
                  Split by Page Ranges
                </option>
                <option value={SPLIT_MODES.SPECIFIC_PAGES}>
                  Split Specific Pages
                </option>
                <option value={SPLIT_MODES.CHUNKS}>Split by Page Chunks</option>
                <option value={SPLIT_MODES.SIZE_BASED}>
                  Split by File Size
                </option>
                <option value={SPLIT_MODES.BOOKMARKS}>
                  Split by Bookmarks
                </option>
                <option value={SPLIT_MODES.CONTENT_BASED}>
                  Split by Content Pattern
                </option>
                <option value={SPLIT_MODES.CUSTOM_SPLIT_POINTS}>
                  Custom Split Points
                </option>
              </select>
            </div>
            {/* Conditional Settings Based on Split Mode */}
            {toolSettings.split.mode === SPLIT_MODES.PAGE_RANGES && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Page Ranges
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1-3,5-7,10-12"
                  value={toolSettings.split.pageRanges}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: { ...prev.split, pageRanges: e.target.value },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Specify ranges separated by commas (e.g., 1-3,5-7)
                </p>
              </div>
            )}
            {toolSettings.split.mode === SPLIT_MODES.SPECIFIC_PAGES && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Specific Pages
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1,3,5,8,10"
                  value={toolSettings.split.specificPages}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: { ...prev.split, specificPages: e.target.value },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Specify page numbers separated by commas
                </p>
              </div>
            )}
            {toolSettings.split.mode === SPLIT_MODES.CHUNKS && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Pages per Chunk
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={toolSettings.split.chunkSize}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: {
                        ...prev.split,
                        chunkSize: parseInt(e.target.value) || 1,
                      },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Number of pages to include in each chunk
                </p>
              </div>
            )}
            {toolSettings.split.mode === SPLIT_MODES.SIZE_BASED && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={toolSettings.split.maxFileSize}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: {
                        ...prev.split,
                        maxFileSize: parseFloat(e.target.value) || 1,
                      },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Split when file size exceeds this limit
                </p>
              </div>
            )}
            {toolSettings.split.mode === SPLIT_MODES.CONTENT_BASED && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Content Pattern
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chapter, Section, Part"
                  value={toolSettings.split.contentPattern}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: { ...prev.split, contentPattern: e.target.value },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Text pattern to search for split points
                </p>
              </div>
            )}
            {toolSettings.split.mode === SPLIT_MODES.CUSTOM_SPLIT_POINTS && (
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Custom Split Points
                </label>
                <input
                  type="text"
                  placeholder="e.g., 3,7,12,18"
                  value={toolSettings.split.customSplitPoints}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      split: {
                        ...prev.split,
                        customSplitPoints: e.target.value,
                      },
                    }))
                  }
                  className="input-theme w-full"
                />
                <p className="text-theme-text-secondary text-sm mt-1">
                  Page numbers where splits should occur
                </p>
              </div>
            )}
            {/* Output Options */}{" "}
            <div className="border-t border-theme-border pt-4">
              <h4 className="text-theme-text font-medium mb-3">
                Output Options
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {" "}
                  <label className="block text-theme-text font-medium mb-2">
                    File Naming
                  </label>
                  <select
                    value={toolSettings.split.outputNaming}
                    onChange={(e) =>
                      setToolSettings((prev) => ({
                        ...prev,
                        split: { ...prev.split, outputNaming: e.target.value },
                      }))
                    }
                    className="input-theme w-full"
                  >
                    <option value="sequential">Sequential (1, 2, 3...)</option>
                    <option value="range">Range (1-3, 4-6...)</option>
                    <option value="custom">Custom Prefix</option>
                  </select>
                </div>

                {toolSettings.split.outputNaming === "custom" && (
                  <div>
                    {" "}
                    <label className="block text-theme-text font-medium mb-2">
                      Custom Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Chapter, Part"
                      value={toolSettings.split.customPrefix}
                      onChange={(e) =>
                        setToolSettings((prev) => ({
                          ...prev,
                          split: {
                            ...prev.split,
                            customPrefix: e.target.value,
                          },
                        }))
                      }
                      className="input-theme w-full"
                    />
                  </div>
                )}
              </div>

              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={toolSettings.split.preserveBookmarks}
                    onChange={(e) =>
                      setToolSettings((prev) => ({
                        ...prev,
                        split: {
                          ...prev.split,
                          preserveBookmarks: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-theme-primary bg-theme-background border-theme-border rounded focus:ring-theme-primary focus:ring-2"
                  />
                  <span className="text-theme-text">
                    Preserve bookmarks in split files
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case "rotate":
        return (
          <div className="space-y-4">
            {" "}
            <label className="block text-theme-text font-medium mb-2">
              Rotation Angle
            </label>
            <select
              value={toolSettings.rotate.angle}
              onChange={(e) =>
                setToolSettings((prev) => ({
                  ...prev,
                  rotate: { ...prev.rotate, angle: parseInt(e.target.value) },
                }))
              }
              className="input-theme w-full"
            >
              <option value={90}>90° Clockwise</option>
              <option value={180}>180° Flip</option>
              <option value={270}>270° Clockwise</option>
            </select>
          </div>
        );

      case "compress":
        return (
          <div className="space-y-4">
            {" "}
            <label className="block text-theme-text font-medium mb-2">
              Compression Level
            </label>
            <select
              value={toolSettings.compress.level}
              onChange={(e) =>
                setToolSettings((prev) => ({
                  ...prev,
                  compress: { ...prev.compress, level: e.target.value },
                }))
              }
              className="input-theme w-full"
            >
              <option value="low">Low (Faster, Larger)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Slower, Smaller)</option>
              <option value="maximum">Maximum (Slowest, Smallest)</option>
            </select>
          </div>
        );

      case "watermark":
        return (
          <div className="space-y-4">
            <div>
              {" "}
              <label className="block text-theme-text font-medium mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={toolSettings.watermark.text}
                onChange={(e) =>
                  setToolSettings((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, text: e.target.value },
                  }))
                }
                className="input-theme w-full"
                placeholder="Enter watermark text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={toolSettings.watermark.fontSize}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      watermark: {
                        ...prev.watermark,
                        fontSize: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="input-theme w-full"
                />
              </div>
              <div>
                {" "}
                <label className="block text-theme-text font-medium mb-2">
                  Opacity (0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={toolSettings.watermark.opacity}
                  onChange={(e) =>
                    setToolSettings((prev) => ({
                      ...prev,
                      watermark: {
                        ...prev.watermark,
                        opacity: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="input-theme w-full"
                />
              </div>
            </div>
            <div>
              {" "}
              <label className="block text-theme-text font-medium mb-2">
                Position
              </label>
              <select
                value={toolSettings.watermark.position}
                onChange={(e) =>
                  setToolSettings((prev) => ({
                    ...prev,
                    watermark: { ...prev.watermark, position: e.target.value },
                  }))
                }
                className="input-theme w-full"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          </div>
        );

      case "extract":
        return (
          <div className="space-y-4">
            {" "}
            <label className="block text-theme-text font-medium mb-2">
              Page Numbers (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., 1,3,5-8,10"
              onChange={(e) => {
                const value = e.target.value;
                const pageNumbers = [];

                if (value.trim()) {
                  const parts = value.split(",");
                  parts.forEach((part) => {
                    part = part.trim();
                    if (part.includes("-")) {
                      const [start, end] = part
                        .split("-")
                        .map((n) => parseInt(n.trim()));
                      for (let i = start; i <= end; i++) {
                        if (i > 0) pageNumbers.push(i);
                      }
                    } else {
                      const num = parseInt(part);
                      if (num > 0) pageNumbers.push(num);
                    }
                  });
                }

                setToolSettings((prev) => ({
                  ...prev,
                  extract: {
                    ...prev.extract,
                    pageNumbers: [...new Set(pageNumbers)].sort(
                      (a, b) => a - b
                    ),
                  },
                }));
              }}
              className="input-theme w-full"
            />
            <p className="text-theme-text-secondary text-sm">
              Selected pages:{" "}
              {toolSettings.extract.pageNumbers.join(", ") || "None"}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedToolInfo = pdfTools.find((tool) => tool.id === selectedTool);

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    }
  };
  return (
    <>
      <ThemeInitializer />
      {showOCR ? (
        <OCRProcessor
          onNavigate={(view) => {
            if (view === "advanced-tools") {
              setShowOCR(false);
            } else {
              onNavigate(view);
            }
          }}
        />
      ) : (
        <div className="min-h-screen bg-theme-background py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  {" "}
                  <h1 className="text-4xl lg:text-5xl font-bold text-theme-text text-center">
                    Advanced PDF{" "}
                    <span className="text-theme-primary">Tools</span>
                  </h1>
                </div>
                {onNavigate && (
                  <button
                    onClick={handleBackClick}
                    className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-opaque-80 transition-colors"
                  >
                    Back to Home
                  </button>
                )}
              </div>{" "}
              <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto text-center">
                Professional PDF manipulation tools for all your document
                processing needs
              </p>
            </motion.div>

            {/* Tool Selection */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {pdfTools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;

                return (
                  <motion.div
                    key={tool.id}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `${tool.bgColor} ${tool.borderColor} border-2`
                        : "card-theme hover:border-theme-primary-opaque-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (tool.id === "ocr") {
                        setShowOCR(true);
                      } else {
                        setSelectedTool(tool.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className={`p-3 rounded-xl ${tool.bgColor} ${tool.borderColor} border`}
                      >
                        <Icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-text">
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-theme-text-secondary text-sm">
                      {tool.description}
                    </p>
                    {isSelected && (
                      <motion.div
                        className="mt-3 flex items-center gap-2 text-theme-primary text-sm"
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
            </motion.div>

            {/* File Upload Section */}
            {selectedTool && (
              <motion.div
                className="card-theme p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {" "}
                <h3 className="text-xl font-semibold text-theme-text mb-4">
                  Upload PDF Files for {selectedToolInfo?.name}
                </h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive
                      ? "border-theme-primary bg-theme-primary-opaque-10"
                      : "border-theme-border hover:border-theme-primary-opaque-50"
                  }`}
                >
                  <input {...getInputProps()} />{" "}
                  <Upload className="w-12 h-12 text-theme-primary mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-theme-text mb-2">
                    {isDragActive ? "Drop PDF files here" : "Upload PDF Files"}
                  </h4>
                  <p className="text-theme-text-secondary">
                    Drag & drop PDF files or click to browse
                  </p>
                </div>
                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="mt-6">
                    {" "}
                    <h4 className="text-lg font-semibold text-theme-text mb-3">
                      Uploaded Files ({files.length})
                    </h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-theme-background border border-theme-border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {" "}
                            <FileText className="w-5 h-5 text-theme-primary" />
                            <div>
                              <p className="text-theme-text font-medium">
                                {file.name}
                              </p>
                              <p className="text-theme-text-secondary text-sm">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tool Settings */}
            {selectedTool && (
              <motion.div
                className="card-theme p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  {" "}
                  <Settings className="w-6 h-6 text-theme-primary" />
                  <h3 className="text-xl font-semibold text-theme-text">
                    {selectedToolInfo?.name} Settings
                  </h3>
                </div>
                {renderToolSettings()}
                {/* Process Button */}{" "}
                <div className="mt-6 pt-6 border-t border-theme-border">
                  <button
                    onClick={processFiles}
                    disabled={files.length === 0 || isProcessing}
                    className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      files.length > 0 && !isProcessing
                        ? "bg-theme-primary hover:bg-theme-primary-opaque-90 text-white"
                        : "bg-theme-border-opaque-20 text-theme-text-secondary cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span>Process Files ({files.length})</span>
                      </div>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            {results.length > 0 && (
              <motion.div
                className="card-theme p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-xl font-semibold text-theme-text mb-6">
                  Processing Results
                </h3>

                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        result.success
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            {" "}
                            <p className="text-theme-text font-medium">
                              {result.fileName}
                            </p>
                            {result.success ? (
                              <div className="text-theme-text-secondary text-sm">
                                {result.compressionRatio && (
                                  <span>
                                    Compressed: {result.compressionRatio}%
                                    reduction •{" "}
                                  </span>
                                )}
                                {result.extractedPages && (
                                  <span>
                                    Extracted pages:{" "}
                                    {result.extractedPages.join(", ")} •{" "}
                                  </span>
                                )}
                                {result.splitFiles && (
                                  <span>
                                    Split into {result.splitFiles.length} files
                                    •{" "}
                                  </span>
                                )}
                                {result.pages && (
                                  <span>
                                    Split into {result.pages.length} pages •{" "}
                                  </span>
                                )}
                                {result.splitMode && (
                                  <span>
                                    Mode: {result.splitMode.replace("_", " ")} •{" "}
                                  </span>
                                )}
                                Original size:{" "}
                                {formatFileSize(result.originalSize)}
                              </div>
                            ) : (
                              <p className="text-red-400 text-sm">
                                {result.error}
                              </p>
                            )}
                          </div>
                        </div>

                        {result.success && (
                          <button
                            onClick={() => downloadResult(result)}
                            className="px-4 py-2 bg-theme-primary hover:bg-theme-primary-opaque-90 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download All</span>
                          </button>
                        )}
                      </div>

                      {/* Show individual split files for split operations */}
                      {result.success &&
                        result.splitFiles &&
                        result.splitFiles.length > 0 && (
                          <div className="mt-3 border-t border-theme-border pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-theme-text text-sm font-medium">
                                Split Files ({result.splitFiles.length})
                              </h4>
                              <button
                                onClick={() =>
                                  downloadAllSplitFiles(result.splitFiles)
                                }
                                className="px-2 py-1 bg-theme-primary-opaque-20 hover:bg-theme-primary-opaque-30 text-theme-primary rounded text-xs transition-colors"
                              >
                                Download All
                              </button>
                            </div>
                            <div className="grid gap-2 max-h-40 overflow-y-auto">
                              {result.splitFiles.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between p-2 bg-theme-background rounded-lg hover:bg-theme-secondary-opaque-80 transition-colors"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {" "}
                                    <FileText className="w-4 h-4 text-theme-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="text-theme-text text-sm truncate"
                                        title={file.fileName}
                                      >
                                        {file.fileName}
                                      </p>
                                      <div className="flex items-center gap-2 text-theme-text-secondary text-xs">
                                        {file.range && (
                                          <span>Pages: {file.range}</span>
                                        )}
                                        <span>•</span>
                                        <span>{formatFileSize(file.size)}</span>
                                        {file.pageCount && (
                                          <>
                                            <span>•</span>
                                            <span>
                                              {file.pageCount} page
                                              {file.pageCount !== 1 ? "s" : ""}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => downloadSplitFile(file)}
                                    className="px-2 py-1 bg-theme-primary-opaque-20 hover:bg-theme-primary-opaque-30 text-theme-primary rounded text-xs transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                                    title={`Download ${file.fileName}`}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span className="hidden sm:inline">
                                      Download
                                    </span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedPDFTools;
