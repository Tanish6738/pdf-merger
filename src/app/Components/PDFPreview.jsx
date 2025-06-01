"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
  Loader,
  ZoomIn,
  Download,
  FileText
} from 'lucide-react';
import { generateAllThumbnails } from '../utils/pdfHelpers';

const PDFPreview = ({ 
  file, 
  fileId, 
  onClose, 
  onPagesUpdate,
  initialSelectedPages = [] 
}) => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPages, setSelectedPages] = useState(new Set(initialSelectedPages));
  const [previewPage, setPreviewPage] = useState(null);

  useEffect(() => {
    loadPages();
  }, [file]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const thumbnails = await generateAllThumbnails(file, 0.25);
      const pagesWithFileId = thumbnails.map(page => ({
        ...page,
        fileId,
        isSelected: selectedPages.has(page.pageNumber)
      }));
      setPages(pagesWithFileId);
    } catch (error) {
      console.error('Error loading PDF pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePageSelection = (pageNumber) => {
    const newSelectedPages = new Set(selectedPages);
    if (newSelectedPages.has(pageNumber)) {
      newSelectedPages.delete(pageNumber);
    } else {
      newSelectedPages.add(pageNumber);
    }
    setSelectedPages(newSelectedPages);
    
    // Update the pages array
    const updatedPages = pages.map(page => ({
      ...page,
      isSelected: newSelectedPages.has(page.pageNumber)
    }));
    setPages(updatedPages);
    
    // Notify parent component
    onPagesUpdate(fileId, Array.from(newSelectedPages));
  };

  const selectAllPages = () => {
    const allPageNumbers = pages.map(page => page.pageNumber);
    const newSelectedPages = new Set(allPageNumbers);
    setSelectedPages(newSelectedPages);
    
    const updatedPages = pages.map(page => ({
      ...page,
      isSelected: true
    }));
    setPages(updatedPages);
    onPagesUpdate(fileId, allPageNumbers);
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
    const updatedPages = pages.map(page => ({
      ...page,
      isSelected: false
    }));
    setPages(updatedPages);
    onPagesUpdate(fileId, []);
  };

  const selectedCount = selectedPages.size;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#A0AEC0]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#00A99D]" />
              <div>
                <h3 className="text-xl font-semibold text-[#E1E6EB]">
                  {file.name}
                </h3>
                <p className="text-[#A0AEC0] text-sm">
                  {selectedCount} of {pages.length} pages selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllPages}
                className="px-3 py-1.5 bg-[#00A99D]/20 text-[#00A99D] rounded-lg hover:bg-[#00A99D]/30 transition-colors text-sm"
              >
                Select All
              </button>
              <button
                onClick={deselectAllPages}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                Deselect All
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#A0AEC0] hover:text-[#E1E6EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 text-[#00A99D] animate-spin mx-auto mb-3" />
                <p className="text-[#A0AEC0]">Loading PDF pages...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((page) => (
                <motion.div
                  key={page.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    page.isSelected
                      ? 'border-[#00A99D] bg-[#00A99D]/10'
                      : 'border-[#A0AEC0]/20 hover:border-[#00A99D]/50'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: page.pageNumber * 0.05 }}
                  onClick={() => togglePageSelection(page.pageNumber)}
                >
                  {/* Page Thumbnail */}
                  <div className="aspect-[3/4] bg-[#1B212C] flex items-center justify-center">
                    {page.thumbnail ? (
                      <img
                        src={page.thumbnail}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-[#A0AEC0]">
                        <FileText className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Page {page.pageNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* Selection Overlay */}
                  <div className={`absolute inset-0 transition-opacity ${
                    page.isSelected ? 'bg-[#00A99D]/20' : 'bg-transparent'
                  }`} />

                  {/* Selection Indicator */}
                  <div className="absolute top-2 left-2">
                    {page.isSelected ? (
                      <CheckCircle className="w-5 h-5 text-[#00A99D]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#A0AEC0] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Page Number */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {page.pageNumber}
                  </div>

                  {/* Preview Button */}
                  <button
                    className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPage(page);
                    }}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Full Page Preview Modal */}
      <AnimatePresence>
        {previewPage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewPage(null)}
          >
            <motion.div
              className="max-w-4xl max-h-full overflow-auto bg-white rounded-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {previewPage.thumbnail && (
                <img
                  src={previewPage.thumbnail}
                  alt={`Page ${previewPage.pageNumber}`}
                  className="w-full h-auto"
                />
              )}
            </motion.div>
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              onClick={() => setPreviewPage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PDFPreview;
