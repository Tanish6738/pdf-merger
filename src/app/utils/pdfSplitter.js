// Enhanced PDF splitting utilities with multiple split modes
import { PDFDocument } from 'pdf-lib';

// Split modes for comprehensive PDF splitting
export const SPLIT_MODES = {
  ALL_PAGES: 'all_pages',
  PAGE_RANGES: 'page_ranges', 
  SPECIFIC_PAGES: 'specific_pages',
  CHUNKS: 'chunks',
  SIZE_BASED: 'size_based',
  BOOKMARKS: 'bookmarks',
  CONTENT_BASED: 'content_based',
  CUSTOM_SPLIT_POINTS: 'custom_split_points'
};

// Helper function to create file data object
const createFileData = (blob, fileName, metadata = {}) => {
  return {
    blob,
    fileName,
    size: blob.size,
    ...metadata
  };
};

// Split PDF into individual pages (each page = one PDF)
export const splitIntoIndividualPages = async (file, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from splitPages to splitFiles
    
    const { onProgress } = options;

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`,
        {
          pageNumber: i + 1,
          range: `${i + 1}`,
          pageCount: 1
        }
      ));

      // Progress callback
      if (onProgress) {
        const progress = Math.round(((i + 1) / pageCount) * 100);
        onProgress(progress);
      }
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.ALL_PAGES,
      splitFiles, // Standardized property name
      totalPages: pageCount,
      originalSize: file.size
    };
  } catch (error) {
    console.error('Error splitting PDF into individual pages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Split PDF by specific page ranges (e.g., 1-5, 6-10, 11-15)
export const splitByPageRanges = async (file, ranges, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from splitPdfs to splitFiles
    
    const { onProgress, preserveBookmarks = false } = options;

    // Validate ranges
    const validRanges = ranges.filter(range => {
      return range.start >= 1 && range.end <= pageCount && range.start <= range.end;
    });

    if (validRanges.length === 0) {
      throw new Error('No valid page ranges provided');
    }

    for (let i = 0; i < validRanges.length; i++) {
      const range = validRanges[i];
      const newPdf = await PDFDocument.create();
      
      // Copy pages in the range
      const pageIndices = [];
      for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
        pageIndices.push(pageNum - 1); // Convert to 0-based index
      }
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      // Preserve bookmarks if requested
      if (preserveBookmarks) {
        // TODO: Implement bookmark preservation
        // This would require extracting bookmarks and adjusting page references
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const rangeStr = range.start === range.end ? 
        `page_${range.start}` : 
        `pages_${range.start}-${range.end}`;
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_${rangeStr}.pdf`,
        {
          rangeIndex: i + 1,
          pageRange: range,
          range: `${range.start}-${range.end}`,
          pageCount: pageIndices.length
        }
      ));

      // Progress callback
      if (onProgress) {
        const progress = Math.round(((i + 1) / validRanges.length) * 100);
        onProgress(progress);
      }
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.PAGE_RANGES,
      splitFiles, // Standardized property name
      totalSplits: validRanges.length,
      originalSize: file.size,
      totalPages: pageCount
    };
  } catch (error) {
    console.error('Error splitting PDF by page ranges:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Split PDF by specific pages (select individual pages)
export const splitBySpecificPages = async (file, pageNumbers, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from splitPages to splitFiles
    
    const { onProgress, groupPages = false } = options;

    // Validate and filter page numbers
    const validPages = [...new Set(pageNumbers)]
      .filter(pageNum => pageNum >= 1 && pageNum <= pageCount)
      .sort((a, b) => a - b);

    if (validPages.length === 0) {
      throw new Error('No valid page numbers provided');
    }

    if (groupPages) {
      // Create one PDF with all selected pages
      const newPdf = await PDFDocument.create();
      const pageIndices = validPages.map(pageNum => pageNum - 1);
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_selected_pages.pdf`,
        {
          type: 'grouped',
          pageCount: validPages.length,
          pages: validPages,
          range: validPages.join(', ')
        }
      ));
    } else {
      // Create individual PDFs for each selected page
      for (let i = 0; i < validPages.length; i++) {
        const pageNum = validPages[i];
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        splitFiles.push(createFileData(
          blob,
          `${file.name.replace('.pdf', '')}_page_${pageNum}.pdf`,
          {
            pageNumber: pageNum,
            pageCount: 1,
            range: `${pageNum}`
          }
        ));

        // Progress callback
        if (onProgress) {
          const progress = Math.round(((i + 1) / validPages.length) * 100);
          onProgress(progress);
        }
      }
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.SPECIFIC_PAGES,
      splitFiles, // Standardized property name
      selectedPages: validPages,
      totalPages: pageCount,
      originalSize: file.size
    };
  } catch (error) {
    console.error('Error splitting PDF by specific pages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Split PDF into chunks of specified size
export const splitIntoChunks = async (file, chunkSize, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from chunks to splitFiles
    
    const { onProgress } = options;

    if (chunkSize <= 0 || chunkSize > pageCount) {
      throw new Error('Invalid chunk size');
    }

    const totalChunks = Math.ceil(pageCount / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startPage = chunkIndex * chunkSize;
      const endPage = Math.min(startPage + chunkSize - 1, pageCount - 1);
      
      const newPdf = await PDFDocument.create();
      const pageIndices = [];
      
      for (let i = startPage; i <= endPage; i++) {
        pageIndices.push(i);
      }
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_chunk_${chunkIndex + 1}.pdf`,
        {
          chunkIndex: chunkIndex + 1,
          startPage: startPage + 1,
          endPage: endPage + 1,
          pageCount: pageIndices.length,
          range: startPage + 1 === endPage + 1 ? 
            `${startPage + 1}` : 
            `${startPage + 1}-${endPage + 1}`
        }
      ));

      // Progress callback
      if (onProgress) {
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        onProgress(progress);
      }
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.CHUNKS,
      splitFiles, // Standardized property name
      chunkSize,
      totalChunks,
      totalPages: pageCount,
      originalSize: file.size
    };
  } catch (error) {
    console.error('Error splitting PDF into chunks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Split PDF at custom split points (create new PDF at specified pages)
export const splitAtCustomPoints = async (file, splitPoints, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from segments to splitFiles
    
    const { onProgress, includeRestAfterLastPoint = true } = options;

    // Validate and sort split points
    const validPoints = [...new Set(splitPoints)]
      .filter(point => point >= 1 && point <= pageCount)
      .sort((a, b) => a - b);

    if (validPoints.length === 0) {
      throw new Error('No valid split points provided');
    }

    // Create segments based on split points
    const segmentRanges = [];
    let startPage = 1;

    for (const splitPoint of validPoints) {
      if (splitPoint > startPage) {
        segmentRanges.push({
          start: startPage,
          end: splitPoint - 1
        });
      }
      startPage = splitPoint;
    }

    // Add final segment if there are remaining pages
    if (includeRestAfterLastPoint && startPage <= pageCount) {
      segmentRanges.push({
        start: startPage,
        end: pageCount
      });
    }

    // Create PDFs for each segment
    for (let i = 0; i < segmentRanges.length; i++) {
      const range = segmentRanges[i];
      const newPdf = await PDFDocument.create();
      
      const pageIndices = [];
      for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
        pageIndices.push(pageNum - 1);
      }
      
      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_segment_${i + 1}.pdf`,
        {
          segmentIndex: i + 1,
          startPage: range.start,
          endPage: range.end,
          pageCount: pageIndices.length,
          range: range.start === range.end ? 
            `${range.start}` : 
            `${range.start}-${range.end}`
        }
      ));

      // Progress callback
      if (onProgress) {
        const progress = Math.round(((i + 1) / segmentRanges.length) * 100);
        onProgress(progress);
      }
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.CUSTOM_SPLIT_POINTS,
      splitFiles, // Standardized property name
      splitPoints: validPoints,
      totalSegments: splitFiles.length,
      totalPages: pageCount,
      originalSize: file.size
    };
  } catch (error) {
    console.error('Error splitting PDF at custom points:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get PDF information for split planning
export const getPDFSplitInfo = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const info = {
      pageCount: pdfDoc.getPageCount(),
      fileName: file.name,
      fileSize: file.size,
      title: pdfDoc.getTitle() || '',
      author: pdfDoc.getAuthor() || '',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null
    };

    return {
      success: true,
      info
    };
  } catch (error) {
    console.error('Error getting PDF split info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Utility function to parse page ranges (e.g., "1-5, 7, 9-12")
export const parsePageRanges = (rangeString, maxPages) => {
  const ranges = [];
  const parts = rangeString.split(',').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim()));
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
        ranges.push({ start, end });
      }
    } else {
      const pageNum = parseInt(part);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        ranges.push({ start: pageNum, end: pageNum });
      }
    }
  }
  
  return ranges;
};

// Utility function to parse page numbers (e.g., "1, 3, 5, 7-9")
export const parsePageNumbers = (pageString, maxPages) => {
  const pageNumbers = [];
  const parts = pageString.split(',').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim()));
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
        for (let i = start; i <= end; i++) {
          pageNumbers.push(i);
        }
      }
    } else {
      const pageNum = parseInt(part);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pageNumbers.push(pageNum);
      }
    }
  }
  
  return [...new Set(pageNumbers)].sort((a, b) => a - b);
};

// Format file size helper
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Download blob as file
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Split PDF by file size (create PDFs under specified size limit)
export const splitBySize = async (file, maxSizeBytes, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitFiles = []; // Changed from sizePdfs to splitFiles
    
    const { onProgress, preserveMetadata = true } = options;

    let currentPdf = await PDFDocument.create();
    let currentSize = 0;
    let currentPages = 0;
    let pdfIndex = 1;
    let startPage = 1;

    // Copy metadata if requested
    if (preserveMetadata) {
      if (pdfDoc.getTitle()) currentPdf.setTitle(pdfDoc.getTitle());
      if (pdfDoc.getAuthor()) currentPdf.setAuthor(pdfDoc.getAuthor());
      if (pdfDoc.getSubject()) currentPdf.setSubject(pdfDoc.getSubject());
    }

    for (let i = 0; i < pageCount; i++) {
      // Create a temporary PDF with the current page to estimate size
      const tempPdf = await PDFDocument.create();
      const [tempPage] = await tempPdf.copyPages(pdfDoc, [i]);
      tempPdf.addPage(tempPage);
      const tempBytes = await tempPdf.save();
      const pageSize = tempBytes.length;

      // Check if adding this page would exceed the size limit
      if (currentSize + pageSize > maxSizeBytes && currentPages > 0) {
        // Save current PDF
        const pdfBytes = await currentPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        splitFiles.push(createFileData(
          blob,
          `${file.name.replace('.pdf', '')}_part_${pdfIndex}.pdf`,
          {
            pdfIndex,
            startPage,
            endPage: i,
            pageCount: currentPages,
            range: startPage === i ? `${startPage}` : `${startPage}-${i}`
          }
        ));

        // Start new PDF
        currentPdf = await PDFDocument.create();
        if (preserveMetadata) {
          if (pdfDoc.getTitle()) currentPdf.setTitle(pdfDoc.getTitle());
          if (pdfDoc.getAuthor()) currentPdf.setAuthor(pdfDoc.getAuthor());
          if (pdfDoc.getSubject()) currentPdf.setSubject(pdfDoc.getSubject());
        }
        currentSize = 0;
        currentPages = 0;
        pdfIndex++;
        startPage = i + 1;
      }

      // Add page to current PDF
      const [copiedPage] = await currentPdf.copyPages(pdfDoc, [i]);
      currentPdf.addPage(copiedPage);
      currentSize += pageSize;
      currentPages++;

      // Progress callback
      if (onProgress) {
        const progress = Math.round(((i + 1) / pageCount) * 100);
        onProgress(progress);
      }
    }

    // Save the final PDF if it has pages
    if (currentPages > 0) {
      const pdfBytes = await currentPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitFiles.push(createFileData(
        blob,
        `${file.name.replace('.pdf', '')}_part_${pdfIndex}.pdf`,
        {
          pdfIndex,
          startPage,
          endPage: pageCount,
          pageCount: currentPages,
          range: startPage === pageCount ? `${startPage}` : `${startPage}-${pageCount}`
        }
      ));
    }

    return {
      success: true,
      splitMode: SPLIT_MODES.SIZE_BASED,
      splitFiles, // Standardized property name
      maxSize: maxSizeBytes,
      totalParts: splitFiles.length,
      totalPages: pageCount,
      originalSize: file.size
    };
  } catch (error) {
    console.error('Error splitting PDF by size:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Split PDF by bookmarks/outline (experimental)
export const splitByBookmarks = async (file, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const { onProgress, preserveMetadata = true, minPagesPerSection = 1 } = options;

    // Note: pdf-lib doesn't have full bookmark support yet
    // This is a placeholder implementation that would need additional libraries
    // For now, we'll return an error with a helpful message
    
    return {
      success: false,
      splitMode: SPLIT_MODES.BOOKMARKS,
      splitFiles: [],
      error: 'Bookmark-based splitting is not yet fully supported. This feature requires additional PDF parsing libraries. Please use other split modes.'
    };

    // TODO: Implement with a library that supports outline parsing
    // Potential libraries: pdf2pic, pdf-parse, or custom PDF parsing
    
  } catch (error) {
    console.error('Error splitting PDF by bookmarks:', error);
    return {
      success: false,
      splitMode: SPLIT_MODES.BOOKMARKS,
      splitFiles: [],
      error: error.message
    };
  }
};

// Split PDF by content patterns (experimental)
export const splitByContent = async (file, pattern, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const { onProgress, preserveMetadata = true, splitType = 'header' } = options;

    // Note: pdf-lib doesn't have text extraction capabilities
    // This is a placeholder implementation that would need additional libraries
    
    return {
      success: false,
      splitMode: SPLIT_MODES.CONTENT_BASED,
      splitFiles: [],
      error: 'Content-based splitting is not yet fully supported. This feature requires OCR or text extraction libraries. Please use other split modes.'
    };

    // TODO: Implement with libraries like:
    // - pdf-parse for text extraction
    // - Tesseract.js for OCR
    // - Custom text pattern matching

  } catch (error) {
    console.error('Error splitting PDF by content:', error);
    return {
      success: false,
      splitMode: SPLIT_MODES.CONTENT_BASED,
      splitFiles: [],
      error: error.message
    };
  }
};

// Enhanced split with preview validation
export const previewSplit = async (file, splitConfig) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    const preview = {
      originalPages: pageCount,
      originalSize: file.size,
      splitMode: splitConfig.mode,
      estimatedFiles: 0,
      estimatedTotalSize: 0,
      filePreview: []
    };

    switch (splitConfig.mode) {
      case SPLIT_MODES.ALL_PAGES:
        preview.estimatedFiles = pageCount;
        preview.estimatedTotalSize = file.size * 1.1; // Slight overhead
        for (let i = 1; i <= pageCount; i++) {
          preview.filePreview.push({
            fileName: `${file.name.replace('.pdf', '')}_page_${i}.pdf`,
            pageRange: `${i}`,
            estimatedSize: Math.round(file.size / pageCount)
          });
        }
        break;

      case SPLIT_MODES.PAGE_RANGES:
        const ranges = parsePageRanges(splitConfig.ranges, pageCount);
        preview.estimatedFiles = ranges.length;
        preview.estimatedTotalSize = file.size * 1.05;
        ranges.forEach((range, index) => {
          const rangeStr = range.start === range.end ? 
            `page_${range.start}` : 
            `pages_${range.start}-${range.end}`;
          preview.filePreview.push({
            fileName: `${file.name.replace('.pdf', '')}_${rangeStr}.pdf`,
            pageRange: `${range.start}-${range.end}`,
            estimatedSize: Math.round((file.size / pageCount) * (range.end - range.start + 1))
          });
        });
        break;

      case SPLIT_MODES.CHUNKS:
        const chunkCount = Math.ceil(pageCount / splitConfig.chunkSize);
        preview.estimatedFiles = chunkCount;
        preview.estimatedTotalSize = file.size * 1.05;
        for (let i = 0; i < chunkCount; i++) {
          const startPage = i * splitConfig.chunkSize + 1;
          const endPage = Math.min(startPage + splitConfig.chunkSize - 1, pageCount);
          preview.filePreview.push({
            fileName: `${file.name.replace('.pdf', '')}_chunk_${i + 1}.pdf`,
            pageRange: startPage === endPage ? `${startPage}` : `${startPage}-${endPage}`,
            estimatedSize: Math.round((file.size / pageCount) * (endPage - startPage + 1))
          });
        }
        break;

      case SPLIT_MODES.SIZE_BASED:
        // Estimate based on average page size
        const avgPageSize = file.size / pageCount;
        const pagesPerFile = Math.floor(splitConfig.maxSize / avgPageSize);
        const estimatedFiles = Math.ceil(pageCount / pagesPerFile);
        preview.estimatedFiles = estimatedFiles;
        preview.estimatedTotalSize = file.size * 1.1;
        
        for (let i = 0; i < estimatedFiles; i++) {
          const startPage = i * pagesPerFile + 1;
          const endPage = Math.min(startPage + pagesPerFile - 1, pageCount);
          preview.filePreview.push({
            fileName: `${file.name.replace('.pdf', '')}_part_${i + 1}.pdf`,
            pageRange: startPage === endPage ? `${startPage}` : `${startPage}-${endPage}`,
            estimatedSize: Math.min(splitConfig.maxSize, Math.round((file.size / pageCount) * (endPage - startPage + 1)))
          });
        }
        break;

      default:
        throw new Error('Unsupported split mode for preview');
    }

    return {
      success: true,
      preview
    };
  } catch (error) {
    console.error('Error generating split preview:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Batch split multiple PDFs
export const batchSplit = async (files, splitConfig, options = {}) => {
  const results = [];
  const { onProgress, onFileProgress } = options;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      let result;
      const fileOptions = {
        onProgress: onFileProgress,
        ...splitConfig.options
      };

      switch (splitConfig.mode) {
        case SPLIT_MODES.ALL_PAGES:
          result = await splitIntoIndividualPages(file, fileOptions);
          break;
        case SPLIT_MODES.PAGE_RANGES:
          result = await splitByPageRanges(file, splitConfig.ranges, fileOptions);
          break;
        case SPLIT_MODES.CHUNKS:
          result = await splitIntoChunks(file, splitConfig.chunkSize, fileOptions);
          break;
        case SPLIT_MODES.SIZE_BASED:
          result = await splitBySize(file, splitConfig.maxSize, fileOptions);
          break;
        default:
          throw new Error(`Batch splitting not supported for mode: ${splitConfig.mode}`);
      }

      results.push({
        file: file.name,
        success: result.success,
        result: result.success ? result : null,
        error: result.success ? null : result.error
      });

    } catch (error) {
      results.push({
        file: file.name,
        success: false,
        result: null,
        error: error.message
      });
    }

    // Overall progress
    if (onProgress) {
      const progress = Math.round(((i + 1) / files.length) * 100);
      onProgress(progress);
    }
  }

  return {
    success: true,
    results,
    totalFiles: files.length,
    successCount: results.filter(r => r.success).length,
    errorCount: results.filter(r => !r.success).length
  };
};

// Enhanced output options
export const generateZipArchive = async (files, zipName = 'split_pdfs.zip') => {
  // Note: This would require a zip library like JSZip
  // For now, return an error indicating this feature needs additional setup
  return {
    success: false,
    error: 'ZIP archive creation requires additional libraries. Files will be downloaded individually.'
  };
  
  // TODO: Implement with JSZip
  // const JSZip = require('jszip');
  // const zip = new JSZip();
  // files.forEach(file => zip.file(file.fileName, file.blob));
  // const zipBlob = await zip.generateAsync({type: 'blob'});
  // return { success: true, blob: zipBlob, fileName: zipName };
};

// Format file size with more precision
export const formatFileSizeDetailed = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${sizes[i]}`;
};

// Parse file size string to bytes
export const parseFileSize = (sizeString) => {
  const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(bytes?|kb|mb|gb|tb)$/i);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    'bytes': 1,
    'byte': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024,
    'tb': 1024 * 1024 * 1024 * 1024
  };
    return Math.round(value * (multipliers[unit] || 1));
};

// Alias functions for backward compatibility with AdvancedPDFTools.jsx
export const splitByPageChunks = splitIntoChunks;
export const splitByFileSize = splitBySize;
export const splitByContentPattern = splitByContent;
export const splitByCustomPoints = splitAtCustomPoints;

export default {
  SPLIT_MODES,
  splitIntoIndividualPages,
  splitByPageRanges,
  splitBySpecificPages,
  splitIntoChunks,
  splitAtCustomPoints,
  getPDFSplitInfo,
  parsePageRanges,
  parsePageNumbers,
  formatFileSize,
  downloadBlob,
  splitBySize,
  splitByBookmarks,
  splitByContent,
  previewSplit,
  batchSplit,
  generateZipArchive,
  formatFileSizeDetailed,
  parseFileSize,
  // Alias functions
  splitByPageChunks,
  splitByFileSize,
  splitByContentPattern,
  splitByCustomPoints
};
