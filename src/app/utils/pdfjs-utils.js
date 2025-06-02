// PDF.js initialization and utilities
let pdfjsLib = null;
let isInitialized = false;

// Initialize PDF.js
export const initializePDFJS = async () => {
  if (isInitialized && pdfjsLib) {
    return pdfjsLib;
  }

  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('PDF.js can only be used in browser environment');
    }    // Import PDF.js
    pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker for Next.js environment
    if (pdfjsLib.GlobalWorkerOptions) {
      // First try local worker file
      const localWorkerSrc = '/pdf.worker.min.mjs';
      
      try {
        // Test local worker availability
        const response = await fetch(localWorkerSrc, { method: 'HEAD' });
        if (response.ok) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerSrc;
          console.log('Using local PDF.js worker');
        } else {
          throw new Error('Local worker not found');
        }
      } catch (workerError) {
        console.warn('Local worker failed, using CDN fallback:', workerError);
        // Fallback to CDN
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        console.log('Using CDN PDF.js worker');
      }
    }
    
    isInitialized = true;
    return pdfjsLib;
  } catch (error) {
    console.error('Failed to initialize PDF.js:', error);
    throw error;
  }
};

// Get PDF document
export const getPDFDocument = async (file) => {
  try {
    console.log('Getting PDF document for file:', file.name);
    const lib = await initializePDFJS();
    console.log('PDF.js initialized successfully');
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to array buffer, size:', arrayBuffer.byteLength);
    const document = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF document loaded successfully, pages:', document.numPages);
    return document;
  } catch (error) {
    console.error('Error getting PDF document:', error);
    throw error;
  }
};

// Render page to canvas
export const renderPageToCanvas = async (page, scale = 0.3) => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;
  return canvas;
};

// Convert canvas to data URL
export const canvasToDataURL = (canvas, quality = 0.8) => {
  return canvas.toDataURL('image/jpeg', quality);
};

const pdfjsUtils = {
  initializePDFJS,
  getPDFDocument,
  renderPageToCanvas,
  canvasToDataURL,
};

export default pdfjsUtils;
