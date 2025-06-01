// OCR (Optical Character Recognition) utilities for PDF processing
import { createWorker } from 'tesseract.js';

class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initializeOCR() {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng');
      this.isInitialized = true;
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  async terminateOCR() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  async extractTextFromImage(imageData, options = {}) {
    if (!this.isInitialized) {
      await this.initializeOCR();
    }

    try {
      const { data: { text, confidence } } = await this.worker.recognize(imageData, {
        logger: options.logger || ((info) => {
          if (options.onProgress) {
            options.onProgress(info);
          }
        })
      });

      return {
        text: text.trim(),
        confidence,
        success: true
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message
      };
    }
  }

  async extractTextFromPDFPage(pdfPage, options = {}) {
    try {
      // Render PDF page to canvas
      const viewport = pdfPage.getViewport({ scale: options.scale || 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await pdfPage.render(renderContext).promise;

      // Convert canvas to image data for OCR
      const imageData = canvas.toDataURL('image/png');
      
      // Extract text using OCR
      const result = await this.extractTextFromImage(imageData, options);
      
      return {
        ...result,
        pageNumber: pdfPage.pageNumber
      };
    } catch (error) {
      console.error('Failed to extract text from PDF page:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message,
        pageNumber: pdfPage.pageNumber
      };
    }
  }

  async batchProcessPDFPages(pdfPages, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 3; // Limit concurrent operations
    
    for (let i = 0; i < pdfPages.length; i += concurrency) {
      const batch = pdfPages.slice(i, i + concurrency);
      const batchPromises = batch.map(page => this.extractTextFromPDFPage(page, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            text: '',
            confidence: 0,
            success: false,
            error: result.reason.message,
            pageNumber: batch[index].pageNumber
          });
        }
      });

      // Optional progress callback
      if (options.onBatchComplete) {
        options.onBatchComplete(i + batch.length, pdfPages.length);
      }
    }

    return results;
  }

  // Advanced OCR features
  async preprocessImageForOCR(imageData, preprocessOptions = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply preprocessing filters
        if (preprocessOptions.grayscale) {
          ctx.filter = 'grayscale(100%)';
        }
        
        if (preprocessOptions.contrast) {
          ctx.filter += ` contrast(${preprocessOptions.contrast}%)`;
        }
        
        if (preprocessOptions.brightness) {
          ctx.filter += ` brightness(${preprocessOptions.brightness}%)`;
        }
        
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageData;
    });
  }

  async extractTextWithLayout(imageData, options = {}) {
    if (!this.isInitialized) {
      await this.initializeOCR();
    }

    try {
      const { data } = await this.worker.recognize(imageData, {
        logger: options.logger
      });

      // Extract layout information
      const layoutData = {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox,
          baseline: word.baseline
        })),
        lines: data.lines.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox,
          baseline: line.baseline
        })),
        paragraphs: data.paragraphs.map(para => ({
          text: para.text,
          confidence: para.confidence,
          bbox: para.bbox
        }))
      };

      return {
        ...layoutData,
        success: true
      };
    } catch (error) {
      console.error('Layout extraction failed:', error);
      return {
        text: '',
        confidence: 0,
        success: false,
        error: error.message
      };
    }
  }

  // Search for specific text patterns
  async searchTextInOCRResult(ocrResult, searchPattern, options = {}) {
    const { text, words = [] } = ocrResult;
    const results = [];
    
    if (options.regex) {
      const regex = new RegExp(searchPattern, options.flags || 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.groups || {}
        });
      }
    } else {
      // Simple text search
      const searchText = options.caseSensitive ? searchPattern : searchPattern.toLowerCase();
      const targetText = options.caseSensitive ? text : text.toLowerCase();
      
      let index = targetText.indexOf(searchText);
      while (index !== -1) {
        results.push({
          match: text.substring(index, index + searchPattern.length),
          index: index
        });
        index = targetText.indexOf(searchText, index + 1);
      }
    }

    return results;
  }

  // Extract specific data types (emails, phone numbers, dates, etc.)
  async extractStructuredData(ocrResult) {
    const { text } = ocrResult;
    
    const patterns = {
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phones: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      dates: /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g,
      numbers: /\b\d+\.?\d*\b/g,
      urls: /https?:\/\/[^\s]+/g
    };

    const results = {};
    
    for (const [type, pattern] of Object.entries(patterns)) {
      results[type] = [...text.matchAll(pattern)].map(match => ({
        value: match[0],
        index: match.index
      }));
    }

    return results;
  }
}

// Create singleton instance
const ocrProcessor = new OCRProcessor();

// Utility functions
export const initializeOCR = () => ocrProcessor.initializeOCR();
export const terminateOCR = () => ocrProcessor.terminateOCR();
export const extractTextFromImage = (imageData, options) => ocrProcessor.extractTextFromImage(imageData, options);
export const extractTextFromPDFPage = (pdfPage, options) => ocrProcessor.extractTextFromPDFPage(pdfPage, options);
export const batchProcessPDFPages = (pdfPages, options) => ocrProcessor.batchProcessPDFPages(pdfPages, options);
export const extractTextWithLayout = (imageData, options) => ocrProcessor.extractTextWithLayout(imageData, options);
export const searchTextInOCRResult = (ocrResult, searchPattern, options) => ocrProcessor.searchTextInOCRResult(ocrResult, searchPattern, options);
export const extractStructuredData = (ocrResult) => ocrProcessor.extractStructuredData(ocrResult);
export const preprocessImageForOCR = (imageData, options) => ocrProcessor.preprocessImageForOCR(imageData, options);

export default ocrProcessor;
