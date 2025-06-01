// Enhanced PDF manipulation utilities with performance optimizations
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// PDF manipulation operations
export const PDF_OPERATIONS = {
  SPLIT: 'split',
  ROTATE: 'rotate',
  COMPRESS: 'compress',
  MERGE: 'merge',
  EXTRACT: 'extract',
  WATERMARK: 'watermark',
  ENCRYPT: 'encrypt',
  OCR: 'ocr',
  OPTIMIZE: 'optimize',
  REMOVE_METADATA: 'removeMetadata',
  ADD_BOOKMARKS: 'addBookmarks',
  FLATTEN_FORMS: 'flattenForms'
};

// Rotation angles
export const ROTATION_ANGLES = {
  ROTATE_90: 90,
  ROTATE_180: 180,
  ROTATE_270: 270,
  ROTATE_360: 360
};

// Compression levels with performance optimization
export const COMPRESSION_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  MAXIMUM: 'maximum'
};

// Performance optimization constants
export const PERFORMANCE_CONFIG = {
  MAX_CONCURRENT_OPERATIONS: 3,
  CHUNK_SIZE: 10, // Process pages in chunks
  MEMORY_THRESHOLD: 50 * 1024 * 1024, // 50MB threshold for memory management
  PROGRESS_UPDATE_INTERVAL: 100 // ms
};

// Split PDF into individual pages
export const splitPDF = async (file, options = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    const splitPages = [];

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      splitPages.push({
        pageNumber: i + 1,
        blob,
        fileName: `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`,
        size: blob.size
      });
    }

    return {
      success: true,
      pages: splitPages,
      totalPages: pageCount
    };
  } catch (error) {
    console.error('Error splitting PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Rotate pages in PDF
export const rotatePDF = async (file, rotations = {}) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      const rotation = rotations[index] || 0;
      if (rotation > 0) {
        page.setRotation(degrees(rotation));
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
      success: true,
      blob,
      fileName: `${file.name.replace('.pdf', '')}_rotated.pdf`,
      size: blob.size
    };
  } catch (error) {
    console.error('Error rotating PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Compress PDF
export const compressPDF = async (file, compressionLevel = COMPRESSION_LEVELS.MEDIUM) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Compression settings based on level
    const compressionSettings = {
      [COMPRESSION_LEVELS.LOW]: {
        useObjectStreams: false,
        addDefaultPage: false,
        subset: false
      },
      [COMPRESSION_LEVELS.MEDIUM]: {
        useObjectStreams: true,
        addDefaultPage: false,
        subset: true
      },
      [COMPRESSION_LEVELS.HIGH]: {
        useObjectStreams: true,
        addDefaultPage: false,
        subset: true,
        compress: true
      },
      [COMPRESSION_LEVELS.MAXIMUM]: {
        useObjectStreams: true,
        addDefaultPage: false,
        subset: true,
        compress: true,
        objectsPerTick: 50
      }
    };

    const settings = compressionSettings[compressionLevel] || compressionSettings[COMPRESSION_LEVELS.MEDIUM];
    const pdfBytes = await pdfDoc.save(settings);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const compressionRatio = ((file.size - blob.size) / file.size * 100).toFixed(1);

    return {
      success: true,
      blob,
      fileName: `${file.name.replace('.pdf', '')}_compressed.pdf`,
      originalSize: file.size,
      compressedSize: blob.size,
      compressionRatio: parseFloat(compressionRatio)
    };
  } catch (error) {
    console.error('Error compressing PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add watermark to PDF
export const addWatermark = async (file, watermarkOptions = {}) => {
  try {
    const {
      text = 'WATERMARK',
      fontSize = 50,
      opacity = 0.3,
      color = [0.5, 0.5, 0.5],
      rotation = 45,
      position = 'center'
    } = watermarkOptions;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    pdfDoc.registerFontkit(fontkit);
    
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate position
      let x, y;
      switch (position) {
        case 'top-left':
          x = 50;
          y = height - 50;
          break;
        case 'top-right':
          x = width - 200;
          y = height - 50;
          break;
        case 'bottom-left':
          x = 50;
          y = 50;
          break;
        case 'bottom-right':
          x = width - 200;
          y = 50;
          break;
        case 'center':
        default:
          x = width / 2 - (text.length * fontSize * 0.3);
          y = height / 2;
          break;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: rgb(color[0], color[1], color[2]),
        opacity,
        rotate: degrees(rotation)
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
      success: true,
      blob,
      fileName: `${file.name.replace('.pdf', '')}_watermarked.pdf`,
      size: blob.size
    };
  } catch (error) {
    console.error('Error adding watermark:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract specific pages from PDF
export const extractPages = async (file, pageNumbers = []) => {
  try {
    if (!pageNumbers.length) {
      throw new Error('No pages specified for extraction');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    
    // Convert to 0-based indices and sort
    const pageIndices = pageNumbers.map(num => num - 1).sort((a, b) => a - b);
    
    // Copy specified pages
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    return {
      success: true,
      blob,
      fileName: `${file.name.replace('.pdf', '')}_extracted.pdf`,
      extractedPages: pageNumbers,
      size: blob.size
    };
  } catch (error) {
    console.error('Error extracting pages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Encrypt PDF with password
export const encryptPDF = async (file, password, permissions = {}) => {
  try {
    const {
      userPassword = password,
      ownerPassword = password + '_owner',
      allowPrinting = false,
      allowModifying = false,
      allowCopying = false,
      allowAnnotating = false
    } = permissions;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Note: pdf-lib doesn't support encryption directly
    // This would require additional libraries or server-side processing
    // For now, we'll return a simulated response
    
    // In a real implementation, you'd use libraries like:
    // - HummusJS
    // - PDFtk server
    // - Or handle this server-side

    return {
      success: false,
      error: 'PDF encryption requires server-side processing',
      requiresServerProcessing: true
    };
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get PDF metadata and information
export const getPDFInfo = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();
    const pages = pdfDoc.getPages();
    
    // Get page dimensions
    const pageSizes = pages.map((page, index) => {
      const { width, height } = page.getSize();
      return {
        pageNumber: index + 1,
        width: Math.round(width),
        height: Math.round(height),
        orientation: width > height ? 'landscape' : 'portrait'
      };
    });

    // Get document info
    const title = pdfDoc.getTitle() || 'Untitled';
    const author = pdfDoc.getAuthor() || 'Unknown';
    const subject = pdfDoc.getSubject() || '';
    const creator = pdfDoc.getCreator() || '';
    const producer = pdfDoc.getProducer() || '';
    const creationDate = pdfDoc.getCreationDate();
    const modificationDate = pdfDoc.getModificationDate();

    return {
      success: true,
      info: {
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        title,
        author,
        subject,
        creator,
        producer,
        creationDate,
        modificationDate,
        pageSizes,
        isEncrypted: false, // pdf-lib loads decrypted documents
        version: '1.4' // Default assumption
      }
    };
  } catch (error) {
    console.error('Error getting PDF info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Batch process multiple PDFs
export const batchProcessPDFs = async (files, operation, options = {}) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      let result;
      
      switch (operation) {
        case PDF_OPERATIONS.SPLIT:
          result = await splitPDF(file, options);
          break;
        case PDF_OPERATIONS.ROTATE:
          result = await rotatePDF(file, options.rotations?.[i] || {});
          break;
        case PDF_OPERATIONS.COMPRESS:
          result = await compressPDF(file, options.compressionLevel);
          break;
        case PDF_OPERATIONS.WATERMARK:
          result = await addWatermark(file, options.watermark);
          break;
        case PDF_OPERATIONS.EXTRACT:
          result = await extractPages(file, options.pageNumbers?.[i] || []);
          break;
        default:
          result = { success: false, error: 'Unknown operation' };
      }
      
      results.push({
        file: file.name,
        operation,
        ...result
      });
    } catch (error) {
      results.push({
        file: file.name,
        operation,
        success: false,
        error: error.message
      });
    }
  }

  return results;
};

export default {
  splitPDF,
  rotatePDF,
  compressPDF,
  addWatermark,
  extractPages,
  encryptPDF,
  getPDFInfo,
  batchProcessPDFs,
  PDF_OPERATIONS,
  ROTATION_ANGLES,
  COMPRESSION_LEVELS
};
