"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
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
  Eye
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  splitPDF,
  rotatePDF,
  compressPDF,
  addWatermark,
  extractPages,
  getPDFInfo,
  PDF_OPERATIONS,
  ROTATION_ANGLES,
  COMPRESSION_LEVELS
} from '../utils/pdfManipulation';
import { downloadBlob, formatFileSize } from '../utils/pdfHelpers';

// Dynamically import OCRProcessor to avoid SSR issues
const OCRProcessor = dynamic(() => import('./OCRProcessor'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-[#E1E6EB]">Loading OCR...</div>
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
    split: {},
    rotate: { angle: ROTATION_ANGLES.ROTATE_90 },
    compress: { level: COMPRESSION_LEVELS.MEDIUM },
    watermark: {
      text: 'CONFIDENTIAL',
      fontSize: 50,
      opacity: 0.3,
      color: [0.5, 0.5, 0.5],
      rotation: 45,
      position: 'center'
    },
    extract: { pageNumbers: [] }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1B212C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00A99D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-[#E1E6EB]">Loading PDF tools...</div>
        </div>
      </div>
    );
  }

  // PDF Tools configuration
  const pdfTools = [
    {
      id: 'split',
      name: 'Split PDF',
      description: 'Split a PDF into individual pages',
      icon: Scissors,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'rotate',
      name: 'Rotate Pages',
      description: 'Rotate PDF pages by 90°, 180°, or 270°',
      icon: RotateCw,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      id: 'compress',
      name: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: Minimize2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'watermark',
      name: 'Add Watermark',
      description: 'Add text watermarks to protect your documents',
      icon: Droplets,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    },    {
      id: 'extract',
      name: 'Extract Pages',
      description: 'Extract specific pages from PDF documents',
      icon: FileText,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'ocr',
      name: 'OCR Text Extraction',
      description: 'Extract text from scanned PDFs and images',
      icon: Eye,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    }
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
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 10
  });

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
          case 'split':
            result = await splitPDF(file);
            break;
          case 'rotate':
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
          case 'compress':
            result = await compressPDF(file, toolSettings.compress.level);
            break;
          case 'watermark':
            result = await addWatermark(file, toolSettings.watermark);
            break;
          case 'extract':
            if (toolSettings.extract.pageNumbers.length === 0) {
              result = { success: false, error: 'No pages specified for extraction' };
            } else {
              result = await extractPages(file, toolSettings.extract.pageNumbers);
            }
            break;
          default:
            result = { success: false, error: 'Unknown tool selected' };
        }

        processResults.push({
          fileName: file.name,
          originalSize: file.size,
          ...result
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
    } else if (result.pages) {
      // For split results, download all pages as a zip would require additional library
      // For now, download first page as example
      if (result.pages.length > 0) {
        downloadBlob(result.pages[0].blob, result.pages[0].fileName);
      }
    }
  };

  // Tool-specific settings components
  const renderToolSettings = () => {
    switch (selectedTool) {
      case 'rotate':
        return (
          <div className="space-y-4">
            <label className="block text-[#E1E6EB] font-medium mb-2">
              Rotation Angle
            </label>
            <select
              value={toolSettings.rotate.angle}
              onChange={(e) => setToolSettings(prev => ({
                ...prev,
                rotate: { ...prev.rotate, angle: parseInt(e.target.value) }
              }))}
              className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
            >
              <option value={90}>90° Clockwise</option>
              <option value={180}>180° Flip</option>
              <option value={270}>270° Clockwise</option>
            </select>
          </div>
        );

      case 'compress':
        return (
          <div className="space-y-4">
            <label className="block text-[#E1E6EB] font-medium mb-2">
              Compression Level
            </label>
            <select
              value={toolSettings.compress.level}
              onChange={(e) => setToolSettings(prev => ({
                ...prev,
                compress: { ...prev.compress, level: e.target.value }
              }))}
              className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
            >
              <option value="low">Low (Faster, Larger)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Slower, Smaller)</option>
              <option value="maximum">Maximum (Slowest, Smallest)</option>
            </select>
          </div>
        );

      case 'watermark':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Watermark Text
              </label>
              <input
                type="text"
                value={toolSettings.watermark.text}
                onChange={(e) => setToolSettings(prev => ({
                  ...prev,
                  watermark: { ...prev.watermark, text: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                placeholder="Enter watermark text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={toolSettings.watermark.fontSize}
                  onChange={(e) => setToolSettings(prev => ({
                    ...prev,
                    watermark: { ...prev.watermark, fontSize: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                />
              </div>
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Opacity (0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={toolSettings.watermark.opacity}
                  onChange={(e) => setToolSettings(prev => ({
                    ...prev,
                    watermark: { ...prev.watermark, opacity: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#E1E6EB] font-medium mb-2">
                Position
              </label>
              <select
                value={toolSettings.watermark.position}
                onChange={(e) => setToolSettings(prev => ({
                  ...prev,
                  watermark: { ...prev.watermark, position: e.target.value }
                }))}
                className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
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

      case 'extract':
        return (
          <div className="space-y-4">
            <label className="block text-[#E1E6EB] font-medium mb-2">
              Page Numbers (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., 1,3,5-8,10"
              onChange={(e) => {
                const value = e.target.value;
                const pageNumbers = [];
                
                if (value.trim()) {
                  const parts = value.split(',');
                  parts.forEach(part => {
                    part = part.trim();
                    if (part.includes('-')) {
                      const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                      for (let i = start; i <= end; i++) {
                        if (i > 0) pageNumbers.push(i);
                      }
                    } else {
                      const num = parseInt(part);
                      if (num > 0) pageNumbers.push(num);
                    }
                  });
                }
                
                setToolSettings(prev => ({
                  ...prev,
                  extract: { ...prev.extract, pageNumbers: [...new Set(pageNumbers)].sort((a, b) => a - b) }
                }));
              }}
              className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
            />
            <p className="text-[#A0AEC0] text-sm">
              Selected pages: {toolSettings.extract.pageNumbers.join(', ') || 'None'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const selectedToolInfo = pdfTools.find(tool => tool.id === selectedTool);
  return (
    <>
      {showOCR ? (
        <OCRProcessor onNavigate={(view) => {
          if (view === 'advanced-tools') {
            setShowOCR(false);
          } else {
            onNavigate(view);
          }
        }} />
      ) : (
        <div className="min-h-screen bg-[#1B212C] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-4">
            Advanced PDF <span className="text-[#00A99D]">Tools</span>
          </h1>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
            Professional PDF manipulation tools for all your document processing needs
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
                    : 'bg-[#151B24] border-[#A0AEC0]/20 hover:border-[#00A99D]/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (tool.id === 'ocr') {
                    setShowOCR(true);
                  } else {
                    setSelectedTool(tool.id);
                  }
                }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 rounded-xl ${tool.bgColor} ${tool.borderColor} border`}>
                    <Icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E1E6EB]">{tool.name}</h3>
                </div>
                <p className="text-[#A0AEC0] text-sm">{tool.description}</p>
                {isSelected && (
                  <motion.div
                    className="mt-3 flex items-center gap-2 text-[#00A99D] text-sm"
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
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-4">
              Upload PDF Files for {selectedToolInfo?.name}
            </h3>
            
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
                {isDragActive ? 'Drop PDF files here' : 'Upload PDF Files'}
              </h4>
              <p className="text-[#A0AEC0]">
                Drag & drop PDF files or click to browse
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-[#E1E6EB] mb-3">
                  Uploaded Files ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#00A99D]" />
                        <div>
                          <p className="text-[#E1E6EB] font-medium">{file.name}</p>
                          <p className="text-[#A0AEC0] text-sm">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
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
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#00A99D]" />
              <h3 className="text-xl font-semibold text-[#E1E6EB]">
                {selectedToolInfo?.name} Settings
              </h3>
            </div>
            
            {renderToolSettings()}

            {/* Process Button */}
            <div className="mt-6 pt-6 border-t border-[#A0AEC0]/20">
              <button
                onClick={processFiles}
                disabled={files.length === 0 || isProcessing}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  files.length > 0 && !isProcessing
                    ? 'bg-[#00A99D] hover:bg-[#00A99D]/90 text-white'
                    : 'bg-[#A0AEC0]/20 text-[#A0AEC0] cursor-not-allowed'
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
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-6">
              Processing Results
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${
                    result.success
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="text-[#E1E6EB] font-medium">{result.fileName}</p>
                        {result.success ? (
                          <div className="text-[#A0AEC0] text-sm">
                            {result.compressionRatio && (
                              <span>Compressed: {result.compressionRatio}% reduction • </span>
                            )}
                            {result.extractedPages && (
                              <span>Extracted pages: {result.extractedPages.join(', ')} • </span>
                            )}
                            {result.pages && (
                              <span>Split into {result.pages.length} pages • </span>
                            )}
                            Size: {formatFileSize(result.size || result.originalSize)}
                          </div>
                        ) : (
                          <p className="text-red-400 text-sm">{result.error}</p>
                        )}
                      </div>
                    </div>
                    
                    {result.success && (
                      <button
                        onClick={() => downloadResult(result)}
                        className="px-4 py-2 bg-[#00A99D] hover:bg-[#00A99D]/90 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>        )}
      </div>
    </div>
      )}
    </>
  );
};

export default AdvancedPDFTools;
