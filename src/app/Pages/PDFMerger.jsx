"use client";
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  RotateCcw,
  Menu,
} from "lucide-react";

import SortableFileItem from "../Components/SortableFileItem";
import LoadingSpinner from "../Components/LoadingSpinner";
import MergeHistory from "../Components/MergeHistory";
import PDFPreview from "../Components/PDFPreview";
import PageThumbnail from "../Components/PageThumbnail";
import {
  validatePDFFile,
  formatFileSize,
  generateFileId,
  downloadBlob,
  getActualPageCount,
  extractPDFPages,
  generateAllThumbnails,
  generatePageId,
  MERGE_STATUS,
  DEFAULT_SETTINGS,
  saveMergeHistory,
} from "../utils/pdfHelpers";

const PDFMerger = ({ onNavigate }) => {
  const [files, setFiles] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Map());
  const [viewMode, setViewMode] = useState("files"); // 'files' or 'pages'
  const [previewFile, setPreviewFile] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(MERGE_STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [customFileName, setCustomFileName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle file drops and uploads
  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    setIsProcessingFiles(true);

    try {
      const fileProcessingResults = await Promise.all(
        acceptedFiles.map(async (file) => {
          const validation = validatePDFFile(file);
          let pageCount = 0;
          let filePages = [];
          const fileId = generateFileId(); // Generate fileId once per file

          // Get actual page count and extract pages for valid PDFs
          if (validation.isValid) {
            try {
              pageCount = await getActualPageCount(file);
              const pages = await extractPDFPages(file);
              filePages = pages.map((page) => ({
                ...page,
                fileId, // Use the same fileId for all pages from this file
              }));
            } catch (error) {
              console.warn(`Failed to process ${file.name}:`, error);

              // Check if it's a ChunkLoadError
              if (error.message && error.message.includes("ChunkLoadError")) {
                console.error(
                  "ChunkLoadError detected, falling back to simple estimation"
                );
              }

              // Fallback to estimation
              const avgPageSize = 100 * 1024; // 100KB per page estimate
              pageCount = Math.max(1, Math.floor(file.size / avgPageSize));

              // Create basic page structure without thumbnails
              for (let i = 0; i < pageCount; i++) {
                filePages.push({
                  id: generatePageId(),
                  pageNumber: i + 1,
                  fileId, // Use the same fileId for all pages
                  fileName: file.name,
                  isSelected: true,
                  thumbnail: null,
                });
              }
            }
          }

          const fileItem = {
            id: fileId,
            file,
            name: file.name,
            size: file.size,
            isValid: validation.isValid,
            errors: validation.errors,
            preview: null,
            pages: pageCount,
            extractedPages: filePages,
          };

          return { fileItem, fileId, filePages };
        })
      );

      // Extract file items and batch update selected pages
      const newFiles = fileProcessingResults.map((result) => result.fileItem);

      // Batch update selected pages to avoid race conditions
      setSelectedPages((prev) => {
        const newMap = new Map(prev);
        fileProcessingResults.forEach(({ fileId, filePages }) => {
          newMap.set(
            fileId,
            filePages.map((page) => page.pageNumber)
          );
        });
        return newMap;
      });

      setFiles((prev) => [...prev, ...newFiles]);

      // Update all pages array
      const newPages = newFiles.flatMap((file) => file.extractedPages);
      setAllPages((prev) => [...prev, ...newPages]);

      setIsProcessingFiles(false);

      // Generate thumbnails in background
      if (newFiles.some((file) => file.isValid)) {
        setIsGeneratingThumbnails(true);
        try {
          const updatedFiles = await Promise.all(
            newFiles.map(async (fileItem) => {
              if (!fileItem.isValid) return fileItem;

              try {
                const thumbnails = await generateAllThumbnails(
                  fileItem.file,
                  0.25
                );
                const updatedPages = fileItem.extractedPages.map(
                  (page, index) => ({
                    ...page,
                    thumbnail: thumbnails[index]?.thumbnail || null,
                  })
                );

                return {
                  ...fileItem,
                  extractedPages: updatedPages,
                };
              } catch (thumbnailError) {
                console.warn(
                  `Failed to generate thumbnails for ${fileItem.name}:`,
                  thumbnailError
                );
                return fileItem;
              }
            })
          );

          // Update files with thumbnails
          setFiles((prev) => {
            const updated = [...prev];
            updatedFiles.forEach((updatedFile) => {
              const index = updated.findIndex((f) => f.id === updatedFile.id);
              if (index !== -1) {
                updated[index] = updatedFile;
              }
            });
            return updated;
          });

          // Update all pages with thumbnails
          const updatedAllPages = updatedFiles.flatMap(
            (file) => file.extractedPages
          );
          setAllPages((prev) => {
            const updated = [...prev];
            updatedAllPages.forEach((updatedPage) => {
              const index = updated.findIndex((p) => p.id === updatedPage.id);
              if (index !== -1) {
                updated[index] = updatedPage;
              }
            });
            return updated;
          });
        } catch (error) {
          console.warn("Error generating thumbnails:", error);
        } finally {
          setIsGeneratingThumbnails(false);
        }
      }
    } catch (error) {
      console.error("Error processing files:", error);
      setError("Failed to process files. Please try again.");
      setIsProcessingFiles(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxFiles: settings.maxFiles,
    maxSize: settings.maxFileSize,
  });

  // Handle drag end for reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  // Remove file
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    setAllPages((prev) => prev.filter((page) => page.fileId !== fileId));
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }; // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setAllPages([]);
    setSelectedPages(new Map());
    setPreviewFile(null);
    setError(null);
    setProgress(0);
    setIsProcessingFiles(false);
    setIsGeneratingThumbnails(false);
    setMergeStatus(MERGE_STATUS.IDLE);
    setViewMode("files");
  };

  // Move file up/down
  const moveFile = (fileId, direction) => {
    setFiles((prev) => {
      const index = prev.findIndex((file) => file.id === fileId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      return arrayMove(prev, index, newIndex);
    });
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle manual file selection
  const handleFileInputChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    onDrop(selectedFiles);
    event.target.value = "";
  };
  // Merge PDFs
  const mergePDFs = async () => {
    const validFiles = files.filter((file) => file.isValid);

    // Check if we have valid files or selected pages
    const hasSelectedPages = Array.from(selectedPages.values()).some(
      (pages) => pages.length > 0
    );

    if (validFiles.length === 0) {
      setError("Please select at least 1 valid PDF file");
      return;
    }

    if (!hasSelectedPages) {
      setError("Please select at least 1 page to merge");
      return;
    }

    setMergeStatus(MERGE_STATUS.PROCESSING);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();

      // Add files in the correct order
      validFiles.forEach((fileItem) => {
        formData.append("files", fileItem.file);
      });

      // Add page selections
      const pageSelections = validFiles.map(
        (file) => selectedPages.get(file.id) || []
      );
      formData.append("pageSelections", JSON.stringify(pageSelections));

      // Add custom filename
      const fileName =
        customFileName.trim() || DEFAULT_SETTINGS.defaultFileName;
      formData.append("fileName", fileName);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to merge PDFs");
      }

      // Get the merged PDF as blob
      const blob = await response.blob();
      setProgress(100);

      // Download the merged PDF
      downloadBlob(blob, `${fileName}.pdf`);

      // Save to history
      saveMergeHistory({
        fileCount: validFiles.length,
        totalSize: validFiles.reduce((sum, file) => sum + file.size, 0),
        fileName: fileName,
        files: validFiles.map((f) => ({ name: f.name, size: f.size })),
      });

      setMergeStatus(MERGE_STATUS.COMPLETED);

      // Reset after success
      setTimeout(() => {
        setMergeStatus(MERGE_STATUS.IDLE);
        setProgress(0);
      }, 3000);
    } catch (error) {
      console.error("Merge error:", error);
      setError(error.message);
      setMergeStatus(MERGE_STATUS.ERROR);
      setProgress(0);
    }
  };

  // Handle page selection updates from preview
  const handlePageSelectionUpdate = (fileId, selectedPageNumbers) => {
    setSelectedPages((prev) => {
      const newMap = new Map(prev);
      newMap.set(fileId, selectedPageNumbers);
      return newMap;
    });
  };

  // Handle file preview
  const handleFilePreview = (file) => {
    setPreviewFile(file);
  };

  // Toggle view mode between files and pages
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "files" ? "pages" : "files"));
  };

  // Get all selected pages for merging
  const getAllSelectedPages = () => {
    const selectedPagesList = [];
    files.forEach((file) => {
      const fileSelectedPages = selectedPages.get(file.id) || [];
      const filePages = file.extractedPages.filter((page) =>
        fileSelectedPages.includes(page.pageNumber)
      );
      selectedPagesList.push(...filePages);
    });
    return selectedPagesList;
  };

  // Handle page removal from pages view
  const handlePageRemoval = (pageId) => {
    setAllPages((prev) => prev.filter((page) => page.id !== pageId));

    // Update selected pages
    const pageToRemove = allPages.find((page) => page.id === pageId);
    if (pageToRemove) {
      setSelectedPages((prev) => {
        const newMap = new Map(prev);
        const fileSelectedPages = newMap.get(pageToRemove.fileId) || [];
        const updatedSelectedPages = fileSelectedPages.filter(
          (pageNum) => pageNum !== pageToRemove.pageNumber
        );
        newMap.set(pageToRemove.fileId, updatedSelectedPages);
        return newMap;
      });
    }
  };

  // Handle page reordering in pages view
  const handlePageDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setAllPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    }
  };

  // Get valid files count
  const validFilesCount = files.filter((file) => file.isValid).length;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return (
    <div className="min-h-screen bg-theme-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}{" "}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {" "}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center gap-4 flex-1">
              {" "}
              <h1 className="text-4xl lg:text-5xl font-bold text-theme-text">
                PDF <span className="text-theme-primary">Merger</span>
              </h1>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-theme-text-secondary hover:text-theme-primary transition-colors"
                title="View merge history"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            {onNavigate && (
              <button
                onClick={handleBackClick}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            )}
          </div>{" "}
          <p className="text-xl text-theme-text-secondary max-w-2xl mx-auto">
            Upload multiple PDF files, preview and select specific pages,
            reorder them as needed, and merge into a single document
          </p>
        </motion.div>{" "}
        {/* Upload Section */}
        <motion.div
          className="bg-theme-secondary rounded-2xl border border-theme-border  p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? "border-theme-primary bg-theme-primary-opaque-10"
                : "border-theme-border  hover:border-theme-primary-opaque-50"
            }`}
          >
            <input {...getInputProps()} />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />{" "}
            <div className="mb-4">
              {" "}
              {isProcessingFiles ? (
                <>
                  <Loader className="w-12 h-12 text-theme-primary mx-auto mb-3 animate-spin" />
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    Analyzing PDF Files...
                  </h3>
                  <p className="text-theme-text-secondary">
                    Reading page counts and validating files
                  </p>
                </>
              ) : isGeneratingThumbnails ? (
                <>
                  <Loader className="w-12 h-12 text-theme-primary mx-auto mb-3 animate-spin" />
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    Generating Page Previews...
                  </h3>{" "}
                  <p className="text-theme-text-secondary">
                    Creating thumbnails for page preview
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-theme-primary mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-theme-text mb-2">
                    {isDragActive ? "Drop your PDFs here" : "Upload PDF Files"}
                  </h3>
                  <p className="text-theme-text-secondary">
                    Drag & drop your PDF files here, or{" "}
                    <button
                      onClick={handleFileInputClick}
                      className="text-theme-primary hover:underline"
                    >
                      browse files
                    </button>
                  </p>
                </>
              )}
            </div>{" "}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-theme-text-secondary">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure processing</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Fast merging</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>Max 50MB per file</span>
              </div>
            </div>
          </div>{" "}
        </motion.div>{" "}
        {/* View Mode Toggle */}
        {files.length > 0 && (
          <motion.div
            className="mb-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {" "}
            <div className="bg-theme-secondary rounded-xl border border-theme-border  p-1 flex">
              {" "}
              <button
                onClick={() => setViewMode("files")}
                disabled={isProcessingFiles || isGeneratingThumbnails}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "files"
                    ? "bg-theme-primary text-white"
                    : "text-theme-text-secondary hover:text-theme-text"
                } ${isProcessingFiles || isGeneratingThumbnails ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                File View
              </button>
              <button
                onClick={() => setViewMode("pages")}
                disabled={isProcessingFiles || isGeneratingThumbnails}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "pages"
                    ? "bg-theme-primary text-white"
                    : "text-theme-text-secondary hover:text-theme-text"
                } ${isProcessingFiles || isGeneratingThumbnails ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Page View
              </button>
            </div>{" "}
            {isGeneratingThumbnails && (
              <div className="ml-4 flex items-center text-theme-text-secondary text-sm">
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Generating previews...
              </div>
            )}
          </motion.div>
        )}{" "}
        {/* File List */}
        {files.length > 0 && viewMode === "files" && (
          <motion.div
            className="bg-theme-secondary rounded-2xl border border-theme-border  p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-theme-text">
                Files to Merge ({validFilesCount} valid)
              </h3>
              <button
                onClick={clearAllFiles}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={files}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <SortableFileItem
                      key={file.id}
                      file={file}
                      index={index}
                      total={files.length}
                      onRemove={removeFile}
                      onMoveUp={() => moveFile(file.id, "up")}
                      onMoveDown={() => moveFile(file.id, "down")}
                      onPreview={handleFilePreview}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>{" "}
            {/* File Summary */}
            <div className="mt-6 pt-6 border-t border-theme-border ">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {validFilesCount}
                  </div>
                  <div className="text-theme-text-secondary text-sm">
                    Valid Files
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {formatFileSize(totalSize)}
                  </div>
                  <div className="text-theme-text-secondary text-sm">
                    Total Size
                  </div>
                </div>{" "}
                <div>
                  <div className="text-2xl font-bold text-theme-primary">
                    {files.reduce((sum, file) => sum + (file.pages || 0), 0)}
                  </div>
                  <div className="text-theme-text-secondary text-sm">
                    Total Pages
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}{" "}
        {/* Pages View */}{" "}
        {files.length > 0 && viewMode === "pages" && (
          <motion.div
            className="bg-theme-secondary rounded-2xl border border-theme-border  p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {" "}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-theme-text">
                Page Preview ({getAllSelectedPages().length} selected)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Select all pages
                    const newSelectedPages = new Map();
                    files.forEach((file) => {
                      if (file.isValid) {
                        newSelectedPages.set(
                          file.id,
                          file.extractedPages.map((p) => p.pageNumber)
                        );
                      }
                    });
                    setSelectedPages(newSelectedPages);
                  }}
                  className="px-3 py-1 text-sm bg-theme-primary text-white rounded hover:bg-theme-primary-opaque-90 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    // Deselect all pages
                    setSelectedPages(new Map());
                  }}
                  className="px-3 py-1 text-sm bg-theme-text-secondary-  text-theme-text-secondary rounded hover:bg-theme-text-secondary-  transition-colors"
                >
                  Deselect All
                </button>
                <button
                  onClick={clearAllFiles}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>{" "}
            {/* Instructions */}{" "}
            <div className="mb-4 p-3 bg-theme-primary-opaque-10 border border-theme-primary-  rounded-lg">
              <p className="text-theme-text text-sm">
                💡 <strong>Tip:</strong> Click on pages to select/deselect them.
                Drag pages to reorder them in your final merged PDF.
              </p>
            </div>
            {allPages.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePageDragEnd}
              >
                {" "}
                <SortableContext
                  items={allPages}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-fr">
                    {allPages.map((page, index) => {
                      const isSelected =
                        selectedPages
                          .get(page.fileId)
                          ?.includes(page.pageNumber) || false;
                      const sourceFile = files.find(
                        (f) => f.id === page.fileId
                      );
                      return (
                        <PageThumbnail
                          key={page.id}
                          page={{
                            ...page,
                            isSelected,
                            fileName: sourceFile?.name || "Unknown",
                          }}
                          index={index}
                          total={allPages.length}
                          onRemove={handlePageRemoval}
                          onPreview={(page) => {
                            // Preview individual page - could open a modal
                            console.log("Preview page:", page);
                          }}
                          onToggleSelection={(pageId) => {
                            const page = allPages.find((p) => p.id === pageId);
                            if (page) {
                              setSelectedPages((prev) => {
                                const newMap = new Map(prev);
                                const fileSelectedPages =
                                  newMap.get(page.fileId) || [];
                                const isCurrentlySelected =
                                  fileSelectedPages.includes(page.pageNumber);

                                if (isCurrentlySelected) {
                                  // Remove from selection
                                  newMap.set(
                                    page.fileId,
                                    fileSelectedPages.filter(
                                      (p) => p !== page.pageNumber
                                    )
                                  );
                                } else {
                                  // Add to selection
                                  newMap.set(page.fileId, [
                                    ...fileSelectedPages,
                                    page.pageNumber,
                                  ]);
                                }
                                return newMap;
                              });
                            }
                          }}
                          isDragMode={true}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-theme-text mb-2">
                  No Pages Available
                </h3>
                <p className="text-theme-text-secondary">
                  Upload valid PDF files to see page previews
                </p>
              </div>
            )}{" "}
            {/* Pages Summary */}
            {allPages.length > 0 && (
              <div className="mt-6 pt-6 border-t border-theme-border ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-theme-primary">
                      {allPages.length}
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      Total Pages
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-theme-primary">
                      {getAllSelectedPages().length}
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      Selected Pages
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-theme-primary">
                      {validFilesCount}
                    </div>
                    <div className="text-theme-text-secondary text-sm">
                      Source Files
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}{" "}
        {/* Merge Settings */}
        <motion.div
          className="bg-theme-secondary rounded-2xl border border-theme-border  p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-theme-text">
              Merge Settings
            </h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-theme-text-secondary hover:text-theme-primary transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>{" "}
          <div className="space-y-4">
            {" "}
            <div>
              <label className="block text-theme-text font-medium mb-2">
                Output Filename
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="merged-document"
                className="input-theme w-full"
              />
            </div>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-theme-border "
                >
                  {" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {" "}
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Max Files
                      </label>{" "}
                      <input
                        type="number"
                        min="2"
                        max="50"
                        value={settings.maxFiles}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxFiles: parseInt(e.target.value),
                          }))
                        }
                        className="input-theme w-full"
                      />
                    </div>{" "}
                    <div>
                      <label className="block text-theme-text font-medium mb-2">
                        Max File Size (MB)
                      </label>{" "}
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxFileSize / (1024 * 1024)}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            maxFileSize: parseInt(e.target.value) * 1024 * 1024,
                          }))
                        }
                        className="input-theme w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8"
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
        {/* Progress Bar */}
        <AnimatePresence>
          {mergeStatus === MERGE_STATUS.PROCESSING && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-theme-secondary rounded-2xl border border-theme-border  p-6 mb-8"
            >
              <div className="text-center mb-4">
                <Loader className="w-8 h-8 text-theme-primary mx-auto mb-2 animate-spin" />
                <h3 className="text-lg font-semibold text-theme-text">
                  Merging PDFs...
                </h3>
                <p className="text-theme-text-secondary">
                  Please wait while we combine your files
                </p>
              </div>
              <div className="w-full bg-theme-background rounded-full h-3">
                <motion.div
                  className="bg-theme-primary h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-center mt-2 text-theme-text-secondary">
                {progress}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Success Message */}
        <AnimatePresence>
          {mergeStatus === MERGE_STATUS.COMPLETED && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">
                  PDFs merged successfully! Download started automatically.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>{" "}
        {/* Merge Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={mergePDFs}
            disabled={
              (viewMode === "files" && validFilesCount < 2) ||
              (viewMode === "pages" && getAllSelectedPages().length === 0) ||
              mergeStatus === MERGE_STATUS.PROCESSING
            }
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
              ((viewMode === "files" && validFilesCount >= 2) ||
                (viewMode === "pages" && getAllSelectedPages().length > 0)) &&
              mergeStatus !== MERGE_STATUS.PROCESSING
                ? "bg-theme-primary hover:bg-theme-primary-opaque-90 text-white shadow-lg hover:shadow-xl"
                : "bg-theme-text-secondary-  text-theme-text-secondary cursor-not-allowed"
            }`}
          >
            {mergeStatus === MERGE_STATUS.PROCESSING ? (
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Merging...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>
                  {viewMode === "files"
                    ? `Merge PDFs (${validFilesCount} files)`
                    : `Merge Pages (${getAllSelectedPages().length} pages)`}
                </span>
              </div>
            )}
          </button>
          {viewMode === "files" && validFilesCount < 2 && (
            <p className="text-theme-text-secondary text-sm mt-2">
              Select at least 2 valid PDF files to enable merging
            </p>
          )}
          {viewMode === "pages" && getAllSelectedPages().length === 0 && (
            <p className="text-theme-text-secondary text-sm mt-2">
              Select at least 1 page to enable merging
            </p>
          )}
        </motion.div>
      </div>{" "}
      {/* Merge History Modal */}
      <MergeHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <PDFPreview
            file={previewFile.file}
            fileId={previewFile.id}
            onClose={() => setPreviewFile(null)}
            onPagesUpdate={(fileId, selectedPageNumbers) => {
              handlePageSelectionUpdate(fileId, selectedPageNumbers);
            }}
            initialSelectedPages={selectedPages.get(previewFile.id) || []}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFMerger;
