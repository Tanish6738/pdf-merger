'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  initializeOCR, 
  terminateOCR, 
  extractTextFromPDFPage, 
  batchProcessPDFPages,
  extractTextWithLayout,
  searchTextInOCRResult,
  extractStructuredData,
  preprocessImageForOCR 
} from '../utils/ocrHelpers';

const OCRProcessor = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [processingOptions, setProcessingOptions] = useState({
    extractLayout: false,
    extractStructuredData: false,
    preprocessImage: false,
    contrast: 150,
    brightness: 120
  });
  const fileInputRef = useRef();

  useEffect(() => {
    setMounted(true);
    
    // Load pdfjs only on client side
    const loadPDFJS = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        setPdfjs(pdfjsLib);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
      }
    };

    loadPDFJS();
  }, []);

  if (!mounted || !pdfjs) {
    return (
      <div className="min-h-screen bg-[#1B212C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00A99D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#E1E6EB]">Loading OCR processor...</div>
        </div>
      </div>
    );
  }

  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processOCR = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      await initializeOCR();
      const allResults = [];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const fileResult = {
          fileName: file.name,
          pages: [],
          searchableText: '',
          extractedData: null
        };

        if (file.type === 'application/pdf') {
          // Process PDF file
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          const totalPages = pdf.numPages;

          for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            
            const pageResult = await extractTextFromPDFPage(page, {
              scale: 2.0,
              onProgress: (info) => {
                const overallProgress = 
                  ((fileIndex + (pageNum - 1) / totalPages) / files.length) * 100;
                setProgress(Math.round(overallProgress));
              }
            });

            fileResult.pages.push({
              pageNumber: pageNum,
              text: pageResult.text,
              confidence: pageResult.confidence,
              success: pageResult.success
            });

            fileResult.searchableText += pageResult.text + '\n';
          }
        } else if (file.type.startsWith('image/')) {
          // Process image file
          const imageUrl = URL.createObjectURL(file);
          
          let processedImageUrl = imageUrl;
          if (processingOptions.preprocessImage) {
            processedImageUrl = await preprocessImageForOCR(imageUrl, {
              grayscale: true,
              contrast: processingOptions.contrast,
              brightness: processingOptions.brightness
            });
          }

          const extractFunction = processingOptions.extractLayout 
            ? extractTextWithLayout 
            : (img) => extractTextFromImage(img);

          const result = await extractFunction(processedImageUrl, {
            onProgress: (info) => {
              const overallProgress = ((fileIndex + 1) / files.length) * 100;
              setProgress(Math.round(overallProgress));
            }
          });

          fileResult.pages.push({
            pageNumber: 1,
            text: result.text,
            confidence: result.confidence,
            success: result.success,
            layout: result.words || null
          });

          fileResult.searchableText = result.text;
          URL.revokeObjectURL(imageUrl);
        }

        // Extract structured data if requested
        if (processingOptions.extractStructuredData && fileResult.searchableText) {
          fileResult.extractedData = await extractStructuredData({
            text: fileResult.searchableText
          });
        }

        allResults.push(fileResult);
      }

      setResults(allResults);
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('OCR processing failed: ' + error.message);
    } finally {
      setIsProcessing(false);
      setProgress(100);
      await terminateOCR();
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
              context: page.text.substring(0, 200) + '...'
            });
          }
        }
      }
    }

    setSearchResults(searchResults);
  };

  const exportResults = (format) => {
    if (results.length === 0) return;

    let content = '';
    let mimeType = '';
    let fileName = '';

    switch (format) {
      case 'txt':
        content = results.map(file => 
          `=== ${file.fileName} ===\n${file.searchableText}\n\n`
        ).join('');
        mimeType = 'text/plain';
        fileName = 'ocr-results.txt';
        break;
      
      case 'json':
        content = JSON.stringify(results, null, 2);
        mimeType = 'application/json';
        fileName = 'ocr-results.json';
        break;
      
      case 'csv':
        const csvRows = ['File,Page,Text,Confidence'];
        results.forEach(file => {
          file.pages.forEach(page => {
            const escapedText = page.text.replace(/"/g, '""').replace(/\n/g, ' ');
            csvRows.push(`"${file.fileName}",${page.pageNumber},"${escapedText}",${page.confidence}`);
          });
        });
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        fileName = 'ocr-results.csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#1B212C] text-white">
      {/* Header */}
      <div className="bg-[#1B212C] border-b border-[#A0AEC0]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('landing')}
                className="text-[#00A99D] hover:text-[#00A99D]/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">OCR Text Extraction</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload and Processing Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <motion.div
              className="bg-[#2A3441] rounded-xl p-6 border border-[#A0AEC0]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
              
              <div className="border-2 border-dashed border-[#00A99D]/30 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-[#00A99D]/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#00A99D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drop files here or click to upload</p>
                    <p className="text-sm text-[#A0AEC0]">Supports PDF and image files (PNG, JPG, etc.)</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-medium">Selected Files:</h3>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#1B212C] p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#00A99D]/20 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#00A99D]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-[#A0AEC0]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Processing Controls */}
            <motion.div
              className="bg-[#2A3441] rounded-xl p-6 border border-[#A0AEC0]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold mb-4">Processing Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.extractLayout}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      extractLayout: e.target.checked
                    }))}
                    className="rounded border-[#A0AEC0]/20 bg-[#1B212C] text-[#00A99D] focus:ring-[#00A99D] focus:ring-offset-0"
                  />
                  <span>Extract Layout Information</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.extractStructuredData}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      extractStructuredData: e.target.checked
                    }))}
                    className="rounded border-[#A0AEC0]/20 bg-[#1B212C] text-[#00A99D] focus:ring-[#00A99D] focus:ring-offset-0"
                  />
                  <span>Extract Structured Data</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={processingOptions.preprocessImage}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      preprocessImage: e.target.checked
                    }))}
                    className="rounded border-[#A0AEC0]/20 bg-[#1B212C] text-[#00A99D] focus:ring-[#00A99D] focus:ring-offset-0"
                  />
                  <span>Preprocess Images</span>
                </label>
              </div>

              {processingOptions.preprocessImage && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contrast: {processingOptions.contrast}%</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={processingOptions.contrast}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        contrast: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brightness: {processingOptions.brightness}%</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={processingOptions.brightness}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        brightness: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={processOCR}
                  disabled={files.length === 0 || isProcessing}
                  className="bg-[#00A99D] hover:bg-[#00A99D]/90 disabled:bg-[#A0AEC0]/20 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Start OCR Processing</span>
                    </>
                  )}
                </button>

                {results.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportResults('txt')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Export TXT
                    </button>
                    <button
                      onClick={() => exportResults('json')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportResults('csv')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                  </div>
                  <div className="w-full bg-[#1B212C] rounded-full h-2">
                    <div
                      className="bg-[#00A99D] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Results and Search Panel */}
          <div className="space-y-6">
            {/* Search */}
            {results.length > 0 && (
              <motion.div
                className="bg-[#2A3441] rounded-xl p-6 border border-[#A0AEC0]/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-lg font-semibold mb-4">Search Text</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search extracted text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-white placeholder-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#00A99D] focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-[#00A99D] hover:bg-[#00A99D]/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div key={index} className="bg-[#1B212C] p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{result.fileName}</span>
                          <span className="text-xs text-[#A0AEC0]">Page {result.pageNumber}</span>
                        </div>
                        <p className="text-sm text-[#A0AEC0]">{result.context}</p>
                        <div className="mt-2 text-xs text-[#00A99D]">
                          {result.matches.length} match(es) found
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Results Summary */}
            {results.length > 0 && (
              <motion.div
                className="bg-[#2A3441] rounded-xl p-6 border border-[#A0AEC0]/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold mb-4">Processing Results</h2>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="bg-[#1B212C] p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{result.fileName}</h3>
                        <span className="text-sm text-[#A0AEC0]">
                          {result.pages.length} page(s)
                        </span>
                      </div>
                      
                      <div className="text-sm text-[#A0AEC0] mb-2">
                        Total characters: {result.searchableText.length}
                      </div>

                      {result.extractedData && (
                        <div className="text-sm">
                          <p className="text-[#00A99D] font-medium">Extracted Data:</p>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                            <div>Emails: {result.extractedData.emails?.length || 0}</div>
                            <div>Phone: {result.extractedData.phones?.length || 0}</div>
                            <div>Dates: {result.extractedData.dates?.length || 0}</div>
                            <div>URLs: {result.extractedData.urls?.length || 0}</div>
                          </div>
                        </div>
                      )}

                      <div className="mt-2">
                        <button className="text-xs text-[#00A99D] hover:text-[#00A99D]/80 transition-colors">
                          View Details →
                        </button>
                      </div>
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
