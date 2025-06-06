"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/ocr-responsive.css";
import { useToast } from "./Toast";
import ThemeInitializer from "./ThemeInitializer";
import {
  initializeOCR,
  terminateOCR,
  extractTextFromImage,
  extractTextFromPDFPage,
  batchProcessPDFPages,
  extractTextWithLayout,
  searchTextInOCRResult,
  extractStructuredData,
  preprocessImageForOCR,
  detectFileType,
} from "../utils/ocrHelpers";

const OCRProcessor = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileTypes, setFileTypes] = useState([]); // Store file type detection results
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [expandedResults, setExpandedResults] = useState([]); // Track which results are expanded
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [processingOptions, setProcessingOptions] = useState({
    extractLayout: false,
    extractStructuredData: false,
    preprocessImage: false,
    contrast: 150,
    brightness: 120,
  });
  const fileInputRef = useRef();
  const { showToast, ToastContainer } = useToast();
  useEffect(() => {
    setMounted(true); // Load pdfjs only on client side
    const loadPDFJS = async () => {
      try {
        // Use the robust worker setup utility
        const { setupPDFWorker } = await import("../utils/pdfWorkerSetup");
        const pdfjsLib = await setupPDFWorker();

        setPdfjs(pdfjsLib);
        console.log("PDF.js loaded successfully with robust worker setup");
      } catch (error) {
        console.error("Failed to load PDF.js:", error);
      }
    };

    loadPDFJS();
  }, []);
  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);

    // Detect file types and generate suggestions
    const detectedTypes = uploadedFiles.map((file) => ({
      file,
      ...detectFileType(file),
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
    setFileTypes((prev) => [...prev, ...detectedTypes]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileTypes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleResultDetails = useCallback((index) => {
    setExpandedResults((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }, []);
  if (!mounted || !pdfjs) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
        <ThemeInitializer />
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-theme-text text-lg sm:text-xl font-medium mb-2">
            Loading OCR processor...
          </div>
          <div className="text-theme-text-secondary text-sm">
            Please wait while we initialize the text extraction engine
          </div>
        </div>
      </div>
    );
  }

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    }
  };

  const processOCR = async () => {
    if (files.length === 0) return; // Check for unsupported file types
    const unsupportedFiles = fileTypes.filter(
      (ft) => ft.type === "unsupported"
    );
    if (unsupportedFiles.length > 0) {
      showToast(
        `Unsupported file types detected: ${unsupportedFiles.map((f) => f.file.name).join(", ")}. Please upload PDF or image files only.`,
        "error",
        5000
      );
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      // Initialize OCR with better error handling
      try {
        await initializeOCR();
        console.log("OCR initialized successfully");
      } catch (ocrError) {
        console.error("OCR initialization failed:", ocrError);
        throw new Error(`OCR initialization failed: ${ocrError.message}`);
      }

      const allResults = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileResult = {
          fileName: file.name,
          pages: [],
          searchableText: "",
          extractedData: null,
        };

        if (file.type === "application/pdf") {
          // Process PDF file with better error handling
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const totalPages = pdf.numPages;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
              const page = await pdf.getPage(pageNum);

              // Update progress manually instead of passing callback
              const overallProgress =
                ((fileIndex + (pageNum - 1) / totalPages) / files.length) * 100;
              setProgress(Math.round(overallProgress));

              const pageResult = await extractTextFromPDFPage(page, {
                scale: 2.0,
                // Removed onProgress callback to avoid DataCloneError
              });

              fileResult.pages.push({
                pageNumber: pageNum,
                text: pageResult.text,
                confidence: pageResult.confidence,
                success: pageResult.success,
              });

              fileResult.searchableText += pageResult.text + "\n";
            }
          } catch (pdfError) {
            console.error(`Failed to process PDF ${file.name}:`, pdfError);
            fileResult.pages.push({
              pageNumber: 1,
              text: `Error processing PDF: ${pdfError.message}`,
              confidence: 0,
              success: false,
            });
          }
        } else if (file.type.startsWith("image/")) {
          // Process image file
          try {
            const imageUrl = URL.createObjectURL(file);

            let processedImageUrl = imageUrl;
            if (processingOptions.preprocessImage) {
              processedImageUrl = await preprocessImageForOCR(imageUrl, {
                grayscale: true,
                contrast: processingOptions.contrast,
                brightness: processingOptions.brightness,
              });
            }

            // Update progress manually instead of passing callback
            const overallProgress = ((fileIndex + 1) / files.length) * 100;
            setProgress(Math.round(overallProgress));

            const extractFunction = processingOptions.extractLayout
              ? extractTextWithLayout
              : extractTextFromImage;

            const result = await extractFunction(processedImageUrl, {
              // Removed onProgress callback to avoid DataCloneError
            });

            fileResult.pages.push({
              pageNumber: 1,
              text: result.text,
              confidence: result.confidence,
              success: result.success,
              layout: result.words || null,
            });

            fileResult.searchableText = result.text;
            URL.revokeObjectURL(imageUrl);
          } catch (imageError) {
            console.error(`Failed to process image ${file.name}:`, imageError);
            fileResult.pages.push({
              pageNumber: 1,
              text: `Error processing image: ${imageError.message}`,
              confidence: 0,
              success: false,
            });
          }
        }

        // Extract structured data if requested
        if (
          processingOptions.extractStructuredData &&
          fileResult.searchableText
        ) {
          try {
            fileResult.extractedData = await extractStructuredData({
              text: fileResult.searchableText,
            });
          } catch (structuredError) {
            console.error(
              "Failed to extract structured data:",
              structuredError
            );
          }
        }

        allResults.push(fileResult);
      }
      setResults(allResults);
      showToast(
        `Successfully processed ${allResults.length} file(s)!`,
        "success"
      );
    } catch (error) {
      console.error("OCR processing failed:", error);
      showToast(`OCR processing failed: ${error.message}`, "error", 5000);
    } finally {
      setIsProcessing(false);
      setProgress(100);
      try {
        await terminateOCR();
      } catch (terminateError) {
        console.warn("Failed to terminate OCR:", terminateError);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || results.length === 0) return;

    const searchResults = [];

    for (const fileResult of results) {
      for (const page of fileResult.pages) {
        if (page.text.toLowerCase().includes(searchTerm.toLowerCase())) {
          const matches = await searchTextInOCRResult(
            { text: page.text },
            searchTerm,
            { caseSensitive: false }
          );

          if (matches.length > 0) {
            searchResults.push({
              fileName: fileResult.fileName,
              pageNumber: page.pageNumber,
              matches: matches,
              context: page.text.substring(0, 200) + "...",
            });
          }
        }
      }
    }

    setSearchResults(searchResults);
  };

  const exportResults = (format) => {
    if (results.length === 0) return;

    let content = "";
    let mimeType = "";
    let fileName = "";

    switch (format) {
      case "txt":
        content = results
          .map((file) => `=== ${file.fileName} ===\n${file.searchableText}\n\n`)
          .join("");
        mimeType = "text/plain";
        fileName = "ocr-results.txt";
        break;

      case "json":
        content = JSON.stringify(results, null, 2);
        mimeType = "application/json";
        fileName = "ocr-results.json";
        break;

      case "csv":
        const csvRows = ["File,Page,Text,Confidence"];
        results.forEach((file) => {
          file.pages.forEach((page) => {
            const escapedText = page.text
              .replace(/"/g, '""')
              .replace(/\n/g, " ");
            csvRows.push(
              `"${file.fileName}",${page.pageNumber},"${escapedText}",${page.confidence}`
            );
          });
        });
        content = csvRows.join("\n");
        mimeType = "text/csv";
        fileName = "ocr-results.csv";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-theme-bg text-white">
      <ThemeInitializer />
      <ToastContainer />
      {/* Header */}
      <div className="bg-theme-bg border-b border-theme-border sticky top-0 z-40">
        {" "}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                OCR Text Extraction
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Mobile progress indicator */}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-sm">
                  {" "}
                  <div className="w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline text-theme-text-secondary">
                    {progress}%
                  </span>
                  <span className="sm:hidden text-theme-text-secondary">
                    {progress}%
                  </span>
                </div>
              )}
              {/* Back to Home Button */}
              <button
                onClick={handleBackClick}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:cursor-pointer hover:opacity-90 transition-opacity"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {" "}
          {/* Upload and Processing Panel */}
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {" "}
            {/* File Upload */}
            <motion.div
              className="bg-theme-surface rounded-xl p-6 border border-theme-border-opaque-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
              <div className="border-2 border-dashed border-theme-primary/30 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-4">
                  {" "}
                  <div className="mx-auto w-16 h-16 bg-theme-primary/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-theme-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      Drop files here or click to upload
                    </p>
                    <p className="text-sm text-theme-text-secondary">
                      Supports PDF and image files (PNG, JPG, etc.)
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-theme-primary hover:bg-theme-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Choose Files
                  </button>
                </div>{" "}
              </div>{" "}
              {/* File Type Summary */}
              {files.length > 0 && (
                <div className="mt-6 p-3 sm:p-4 bg-theme-surface rounded-lg">
                  <h3 className="font-medium mb-3 text-sm sm:text-base">
                    File Analysis Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-theme-primary rounded-full"></div>
                        <span>PDF files</span>
                      </div>
                      <span className="font-medium">
                        {fileTypes.filter((ft) => ft.type === "pdf").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Image files</span>
                      </div>
                      <span className="font-medium">
                        {fileTypes.filter((ft) => ft.type === "image").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Unsupported files</span>
                      </div>
                      <span className="font-medium">
                        {
                          fileTypes.filter((ft) => ft.type === "unsupported")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                  {fileTypes.some((ft) => ft.type === "unsupported") && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
                      ⚠️ Remove unsupported files before processing
                    </div>
                  )}
                </div>
              )}
              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-medium">Selected Files:</h3>
                  {files.map((file, index) => {
                    const fileTypeInfo =
                      fileTypes[index] || detectFileType(file);
                    const isUnsupported = fileTypeInfo.type === "unsupported";

                    return (
                      <div
                        key={index}
                        className="bg-theme-bg p-3 rounded-lg border border-theme-border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {" "}
                            <div
                              className={`w-8 h-8 rounded flex items-center justify-center ${
                                isUnsupported
                                  ? "bg-red-500/20"
                                  : "bg-theme-primary/20"
                              }`}
                            >
                              <svg
                                className={`w-4 h-4 ${
                                  isUnsupported
                                    ? "text-red-400"
                                    : "text-theme-primary"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-theme-text-secondary">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        {/* File Type Suggestion */}{" "}
                        <div
                          className={`p-2 rounded text-sm ${
                            isUnsupported
                              ? "bg-red-500/10 text-red-300 border border-red-500/20"
                              : "bg-theme-primary/10 text-theme-primary border border-theme-primary/20"
                          }`}
                        >
                          <p className="font-medium mb-1">
                            {isUnsupported
                              ? "⚠️ Unsupported File"
                              : `✓ ${fileTypeInfo.type.toUpperCase()} detected`}
                          </p>
                          <p>{fileTypeInfo.suggestion}</p>
                          {fileTypeInfo.supportedFeatures.length > 0 && (
                            <div className="mt-1">
                              <span className="font-medium">Features: </span>
                              {fileTypeInfo.supportedFeatures.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>{" "}
            {/* Processing Controls */}
            <motion.div
              className="bg-theme-surface rounded-xl p-6 border border-theme-border-opaque-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4">Processing Options</h2>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {" "}
                <label className="flex items-start space-x-3 p-2 hover:bg-theme-bg/50 rounded">
                  <input
                    type="checkbox"
                    checked={processingOptions.extractLayout}
                    onChange={(e) =>
                      setProcessingOptions((prev) => ({
                        ...prev,
                        extractLayout: e.target.checked,
                      }))
                    }
                    className="rounded border-theme-border-opaque-20 bg-theme-bg text-theme-primary focus:ring-theme-primary focus:ring-offset-0 mt-0.5"
                  />
                  <span className="text-sm">Extract Layout Information</span>
                </label>
                <label className="flex items-start space-x-3 p-2 hover:bg-theme-bg/50 rounded">
                  <input
                    type="checkbox"
                    checked={processingOptions.extractStructuredData}
                    onChange={(e) =>
                      setProcessingOptions((prev) => ({
                        ...prev,
                        extractStructuredData: e.target.checked,
                      }))
                    }
                    className="rounded border-theme-border-opaque-20 bg-theme-bg text-theme-primary focus:ring-theme-primary focus:ring-offset-0 mt-0.5"
                  />
                  <span className="text-sm">Extract Structured Data</span>
                </label>
                <label className="flex items-start space-x-3 p-2 hover:bg-theme-bg/50 rounded">
                  <input
                    type="checkbox"
                    checked={processingOptions.preprocessImage}
                    onChange={(e) =>
                      setProcessingOptions((prev) => ({
                        ...prev,
                        preprocessImage: e.target.checked,
                      }))
                    }
                    className="rounded border-theme-border-opaque-20 bg-theme-bg text-theme-primary focus:ring-theme-primary focus:ring-offset-0 mt-0.5"
                  />
                  <span className="text-sm">Preprocess Images</span>
                </label>
              </div>
              {processingOptions.preprocessImage && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {" "}
                    <div className="bg-theme-bg p-3 rounded-lg">
                      <label className="block text-sm font-medium mb-3">
                        Contrast:{" "}
                        <span className="text-theme-primary">
                          {processingOptions.contrast}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={processingOptions.contrast}
                        onChange={(e) =>
                          setProcessingOptions((prev) => ({
                            ...prev,
                            contrast: parseInt(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-theme-surface rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-theme-text-secondary mt-1">
                        <span>50%</span>
                        <span>200%</span>
                      </div>
                    </div>
                    <div className="bg-theme-bg p-3 rounded-lg">
                      <label className="block text-sm font-medium mb-3">
                        Brightness:{" "}
                        <span className="text-theme-primary">
                          {processingOptions.brightness}%
                        </span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        value={processingOptions.brightness}
                        onChange={(e) =>
                          setProcessingOptions((prev) => ({
                            ...prev,
                            brightness: parseInt(e.target.value),
                          }))
                        }
                        className="w-full h-2 bg-theme-surface rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-theme-text-secondary mt-1">
                        <span>50%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={processOCR}
                  disabled={files.length === 0 || isProcessing}
                  className="bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-text-secondary/20 disabled:cursor-not-allowed text-white px-6 py-3 sm:py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Start OCR Processing</span>
                    </>
                  )}
                </button>

                {results.length > 0 && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => exportResults("txt")}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={() => exportResults("json")}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportResults("csv")}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Export CSV
                    </button>
                  </div>
                )}
              </div>
              {/* Progress Bar */}
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing files...</span>
                    <span>{progress}%</span>
                  </div>{" "}
                  <div className="w-full bg-theme-bg rounded-full h-2">
                    <div
                      className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>{" "}
          {/* Results and Search Panel */}
          <div className="space-y-4 lg:space-y-6">
            {/* Search */}
            {results.length > 0 && (
              <motion.div
                className="bg-theme-surface rounded-xl p-6 border border-theme-border-opaque-20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-lg font-semibold mb-4">Search Text</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Search extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-theme-bg border border-theme-border-opaque-20 rounded-lg px-3 py-3 sm:py-2 text-white placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent text-sm sm:text-base"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-theme-primary hover:bg-theme-primary/90 text-white px-6 py-3 sm:py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base"
                  >
                    Search
                  </button>
                </div>{" "}
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-theme-bg p-3 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 space-y-1 sm:space-y-0">
                          <span className="font-medium text-sm break-words">
                            {result.fileName}
                          </span>
                          <span className="text-xs text-theme-text-secondary whitespace-nowrap">
                            Page {result.pageNumber}
                          </span>
                        </div>
                        <p className="text-sm text-theme-text-secondary break-words">
                          {result.context}
                        </p>
                        <div className="mt-2 text-xs text-theme-primary">
                          {result.matches.length} match(es) found
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}{" "}
            {/* Results Summary */}
            {results.length > 0 && (
              <motion.div
                className="bg-theme-surface rounded-xl p-6 border border-theme-border-opaque-20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold mb-4">
                  Processing Results
                </h2>{" "}
                <div className="space-y-3 sm:space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="bg-theme-bg p-3 sm:p-4 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                        <h3 className="font-medium text-sm sm:text-base break-words pr-0 sm:pr-4">
                          {result.fileName}
                        </h3>
                        <span className="text-sm text-theme-text-secondary whitespace-nowrap">
                          {result.pages.length} page(s)
                        </span>
                      </div>
                      <div className="text-sm text-theme-text-secondary mb-2">
                        Total characters: {result.searchableText.length}
                      </div>
                      {result.extractedData && (
                        <div className="text-sm mb-3">
                          <p className="text-theme-primary font-medium mb-2">
                            Extracted Data:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span>Emails:</span>
                              <span className="font-medium">
                                {result.extractedData.emails?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <span className="font-medium">
                                {result.extractedData.phones?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dates:</span>
                              <span className="font-medium">
                                {result.extractedData.dates?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>URLs:</span>
                              <span className="font-medium">
                                {result.extractedData.urls?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          onClick={() => toggleResultDetails(index)}
                          className="w-full sm:w-auto text-sm text-theme-primary hover:text-theme-primary/80 transition-colors py-2 sm:py-0 text-center sm:text-left"
                        >
                          {expandedResults.includes(index)
                            ? "▼ Hide Details"
                            : "▶ View Details"}
                        </button>
                      </div>
                      {/* Expanded Details */}{" "}
                      <AnimatePresence>
                        {expandedResults.includes(index) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 border-t border-theme-border-opaque-20 pt-4 overflow-hidden"
                          >
                            {/* Page-by-page results */}
                            <div className="mb-4 sm:mb-6">
                              <h4 className="text-sm sm:text-base font-medium text-theme-primary mb-3">
                                Page Details
                              </h4>
                              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                                {result.pages.map((page, pageIndex) => (
                                  <div
                                    key={pageIndex}
                                    className="bg-theme-surface p-3 sm:p-4 rounded-lg"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
                                      <span className="font-medium text-sm sm:text-base">
                                        Page {page.pageNumber}
                                      </span>
                                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                                        <span
                                          className={`px-2 py-1 rounded text-xs text-center ${
                                            page.success
                                              ? "bg-green-500/20 text-green-300"
                                              : "bg-red-500/20 text-red-300"
                                          }`}
                                        >
                                          {page.success
                                            ? "✓ Success"
                                            : "✗ Failed"}
                                        </span>
                                        {page.confidence && (
                                          <span className="text-theme-text-secondary text-xs text-center sm:text-left">
                                            {Math.round(page.confidence)}%
                                            confidence
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-theme-text bg-theme-bg p-3 rounded text-xs sm:text-sm max-h-24 sm:max-h-32 overflow-y-auto">
                                      <pre className="whitespace-pre-wrap break-words">
                                        {page.text || "No text extracted"}
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Full extracted text */}
                            <div className="mb-4 sm:mb-6">
                              <h4 className="text-sm sm:text-base font-medium text-theme-primary mb-3">
                                Full Extracted Text
                              </h4>
                              <div className="bg-theme-surface p-3 sm:p-4 rounded-lg">
                                <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-theme-text text-xs sm:text-sm break-words">
                                    {result.searchableText ||
                                      "No text extracted"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                            {/* Detailed extracted data */}
                            {result.extractedData && (
                              <div className="mb-4 sm:mb-6">
                                <h4 className="text-sm sm:text-base font-medium text-theme-primary mb-3">
                                  Structured Data
                                </h4>
                                <div className="bg-theme-surface p-3 sm:p-4 rounded-lg space-y-3">
                                  {result.extractedData.emails?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-theme-text text-sm block mb-1">
                                        Emails:
                                      </span>
                                      <div className="text-theme-text-secondary text-xs sm:text-sm break-all">
                                        {result.extractedData.emails.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                  {result.extractedData.phones?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-theme-text text-sm block mb-1">
                                        Phone Numbers:
                                      </span>
                                      <div className="text-theme-text-secondary text-xs sm:text-sm break-all">
                                        {result.extractedData.phones.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                  {result.extractedData.dates?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-theme-text text-sm block mb-1">
                                        Dates:
                                      </span>
                                      <div className="text-theme-text-secondary text-xs sm:text-sm break-all">
                                        {result.extractedData.dates.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                  {result.extractedData.urls?.length > 0 && (
                                    <div>
                                      <span className="font-medium text-theme-text text-sm block mb-1">
                                        URLs:
                                      </span>
                                      <div className="text-theme-text-secondary text-xs sm:text-sm break-all">
                                        {result.extractedData.urls.join(", ")}
                                      </div>
                                    </div>
                                  )}{" "}
                                </div>
                              </div>
                            )}{" "}
                            {/* Action buttons for individual file */}
                            <div className="mt-4 pt-4 border-t border-theme-border-opaque-20">
                              <h4 className="text-sm font-medium text-theme-text mb-3">
                                Actions
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                {" "}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      result.searchableText
                                    );
                                    showToast(
                                      "Text copied to clipboard!",
                                      "success"
                                    );
                                  }}
                                  className="bg-theme-secondary/20 hover:bg-theme-secondary/30 text-theme-secondary px-4 py-3 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                                >
                                  <span>📋</span>
                                  <span>Copy Text</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const content = `File: ${result.fileName}\n\n${result.searchableText}`;
                                    const blob = new Blob([content], {
                                      type: "text/plain",
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `${result.fileName}-text.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    showToast(
                                      "Text file saved successfully!",
                                      "success"
                                    );
                                  }}
                                  className="bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent px-4 py-3 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                                >
                                  <span>💾</span>
                                  <span>Save Text</span>
                                </button>
                                {result.extractedData && (
                                  <button
                                    onClick={() => {
                                      const content = JSON.stringify(
                                        result.extractedData,
                                        null,
                                        2
                                      );
                                      const blob = new Blob([content], {
                                        type: "application/json",
                                      });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement("a");
                                      a.href = url;
                                      a.download = `${result.fileName}-data.json`;
                                      a.click();
                                      URL.revokeObjectURL(url);
                                      showToast(
                                        "Data file saved successfully!",
                                        "success"
                                      );
                                    }}
                                    className="bg-theme-tertiary/20 hover:bg-theme-tertiary/30 text-theme-tertiary px-4 py-3 sm:py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                                  >
                                    <span>📊</span>
                                    <span>Save Data</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRProcessor;
