// PDF validation utilities
import { getPDFDocument, renderPageToCanvas, canvasToDataURL } from './pdfjs-utils';

// Dynamic import helper for pdf-lib with retry mechanism
let pdfLibCache = null;
const importPDFLib = async (retries = 3) => {
  if (pdfLibCache) {
    return pdfLibCache;
  }

  for (let i = 0; i < retries; i++) {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('pdf-lib can only be used in browser environment');
      }

      const pdfLib = await import('pdf-lib');
      pdfLibCache = pdfLib;
      return pdfLib;
    } catch (error) {
      console.error(`Failed to load pdf-lib (attempt ${i + 1}/${retries}):`, error);
      
      if (i === retries - 1) {
        throw new Error('PDF processing library failed to load after multiple attempts');
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const validatePDFFile = (file) => {
  const errors = [];
  
  // Check file type
  if (file.type !== 'application/pdf') {
    errors.push('File must be a PDF');
  }
  
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size must be less than 50MB');
  }
  
  // Check file name
  if (file.name.length > 255) {
    errors.push('File name is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique ID for files
export const generateFileId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Extract actual pages count from PDF (client-side)
export const getActualPageCount = async (file) => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('getActualPageCount called in server environment');
      // Fallback to estimation
      const avgPageSize = 100 * 1024; // 100KB per page estimate
      return Math.max(1, Math.floor(file.size / avgPageSize));
    }

    const { PDFDocument } = await importPDFLib();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Error getting actual page count:', error);
    
    // Try using PDF.js as fallback
    try {
      const pdf = await getPDFDocument(file);
      return pdf.numPages;
    } catch (fallbackError) {
      console.error('Fallback with PDF.js also failed:', fallbackError);
      // Final fallback to estimation
      const avgPageSize = 100 * 1024; // 100KB per page estimate
      return Math.max(1, Math.floor(file.size / avgPageSize));
    }
  }
};

// Extract pages count from PDF (client-side estimation) - keeping for backward compatibility
export const estimatePageCount = async (file) => {
  try {
    // This is a simple estimation based on file size
    // For accurate page count, we'd need to load the PDF which is expensive
    const avgPageSize = 100 * 1024; // 100KB per page estimate
    return Math.max(1, Math.floor(file.size / avgPageSize));
  } catch (error) {
    console.error('Error estimating page count:', error);
    return 1;
  }
};

// Create download link for blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Merge status constants
export const MERGE_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Error types
export const ERROR_TYPES = {
  INVALID_FILE_TYPE: 'invalid_file_type',
  FILE_TOO_LARGE: 'file_too_large',
  NETWORK_ERROR: 'network_error',
  PROCESSING_ERROR: 'processing_error',
  INSUFFICIENT_FILES: 'insufficient_files'
};

// Default settings
export const DEFAULT_SETTINGS = {
  maxFiles: 20,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['application/pdf'],
  defaultFileName: 'merged-document'
};

// Local storage helpers for saving merge history
export const saveMergeHistory = (mergeData) => {
  try {
    const history = getMergeHistory();
    const newEntry = {
      id: generateFileId(),
      timestamp: new Date().toISOString(),
      fileCount: mergeData.fileCount,
      totalSize: mergeData.totalSize,
      fileName: mergeData.fileName,
      ...mergeData
    };
    
    history.unshift(newEntry);
    // Keep only last 10 merges
    const limitedHistory = history.slice(0, 10);
    
    localStorage.setItem('pdf_merge_history', JSON.stringify(limitedHistory));
    return newEntry;
  } catch (error) {
    console.error('Error saving merge history:', error);
    return null;
  }
};

export const getMergeHistory = () => {
  try {
    const history = localStorage.getItem('pdf_merge_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting merge history:', error);
    return [];
  }
};

export const clearMergeHistory = () => {
  try {
    localStorage.removeItem('pdf_merge_history');
    return true;
  } catch (error) {
    console.error('Error clearing merge history:', error);
    return false;
  }
};

// Generate page ID for individual pages
export const generatePageId = () => {
  return 'page_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Extract individual pages from PDF for preview and selection
export const extractPDFPages = async (file) => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('extractPDFPages called in server environment');
      return [];
    }

    const { PDFDocument } = await importPDFLib();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const pages = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        id: generatePageId(),
        pageNumber: i + 1,
        fileId: null, // Will be set by the caller
        fileName: file.name,
        isSelected: true, // Default to selected
        thumbnail: null // Will be generated separately
      });
    }
    
    return pages;
  } catch (error) {
    console.error('Error extracting PDF pages with pdf-lib:', error);
    
    // Try using PDF.js as fallback
    try {
      const pdf = await getPDFDocument(file);
      const pageCount = pdf.numPages;
      
      const pages = [];
      for (let i = 0; i < pageCount; i++) {
        pages.push({
          id: generatePageId(),
          pageNumber: i + 1,
          fileId: null, // Will be set by the caller
          fileName: file.name,
          isSelected: true, // Default to selected
          thumbnail: null // Will be generated separately
        });
      }
      
      return pages;
    } catch (fallbackError) {
      console.error('Fallback with PDF.js also failed:', fallbackError);
      return [];
    }
  }
};

// Generate thumbnail for a specific PDF page
export const generatePageThumbnail = async (file, pageNumber, scale = 0.5) => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('generatePageThumbnail called in server environment');
      return null;
    }

    const pdf = await getPDFDocument(file);
    const page = await pdf.getPage(pageNumber);
    const canvas = await renderPageToCanvas(page, scale);
    
    // Use higher quality for better preview
    return canvasToDataURL(canvas, 0.9);
  } catch (error) {
    console.error(`Error generating thumbnail for page ${pageNumber}:`, error);
    return null;
  }
};

// Generate thumbnails for all pages in a PDF
export const generateAllThumbnails = async (file, scale = 0.3) => {
  try {
    const pages = await extractPDFPages(file);
    const thumbnails = await Promise.all(
      pages.map(async (page) => {
        const thumbnail = await generatePageThumbnail(file, page.pageNumber, scale);
        return {
          ...page,
          thumbnail
        };
      })
    );
    
    return thumbnails;
  } catch (error) {
    console.error('Error generating all thumbnails:', error);
    return [];
  }
};
