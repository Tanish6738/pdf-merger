// Image processing and PDF generation utilities

// Validate image files
export const validateImageFile = (file) => {
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/svg+xml'
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const errors = [];
  
  if (!validTypes.includes(file.type)) {
    errors.push('File must be an image (JPG, PNG, WebP, SVG)');
  }
  
  if (file.size > maxSize) {
    errors.push('Image size must be less than 10MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get image dimensions
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

// Resize image while maintaining aspect ratio
export const resizeImage = (imageElement, maxWidth, maxHeight, quality = 0.9) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate new dimensions
    let { width, height } = imageElement;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw and resize
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
};

// Convert image to data URL
export const imageToDataURL = (file, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = async () => {
      try {
        const resizedBlob = await resizeImage(img, maxWidth, maxHeight);
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(resizedBlob);
        
        URL.revokeObjectURL(url);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

// Grid layout utilities
export const GRID_LAYOUTS = {
  single: { rows: 1, cols: 1, name: 'Single' },
  twoVertical: { rows: 2, cols: 1, name: '2 Vertical' },
  twoHorizontal: { rows: 1, cols: 2, name: '2 Horizontal' },
  fourGrid: { rows: 2, cols: 2, name: '4 Grid' },
  sixGrid: { rows: 3, cols: 2, name: '6 Grid' },
  custom: { rows: 1, cols: 1, name: 'Custom' }
};

// Generate grid cells for a layout
export const generateGridCells = (layout, customGrid = { rows: 1, cols: 1 }, containerSize = { width: 800, height: 600 }) => {
  const config = layout === 'custom' ? customGrid : GRID_LAYOUTS[layout];
  if (!config) return [];
  
  const cells = [];
  const cellWidth = containerSize.width / config.cols;
  const cellHeight = containerSize.height / config.rows;
  
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      cells.push({
        id: `cell_${row}_${col}`,
        row,
        col,
        x: col * cellWidth,
        y: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
        images: []
      });
    }
  }
  
  return cells;
};

// Calculate fit mode for image in container
export const calculateImageFit = (imageSize, containerSize, fitMode = 'contain') => {
  const { width: imgW, height: imgH } = imageSize;
  const { width: containerW, height: containerH } = containerSize;
  
  switch (fitMode) {
    case 'contain': {
      const ratio = Math.min(containerW / imgW, containerH / imgH);
      return {
        width: imgW * ratio,
        height: imgH * ratio,
        x: (containerW - imgW * ratio) / 2,
        y: (containerH - imgH * ratio) / 2
      };
    }
    
    case 'cover': {
      const ratio = Math.max(containerW / imgW, containerH / imgH);
      const newWidth = imgW * ratio;
      const newHeight = imgH * ratio;
      return {
        width: newWidth,
        height: newHeight,
        x: (containerW - newWidth) / 2,
        y: (containerH - newHeight) / 2
      };
    }
    
    case 'fill':
      return {
        width: containerW,
        height: containerH,
        x: 0,
        y: 0
      };
    
    case 'stretch':
      return {
        width: containerW,
        height: containerH,
        x: 0,
        y: 0
      };
    
    default:
      return {
        width: imgW,
        height: imgH,
        x: (containerW - imgW) / 2,
        y: (containerH - imgH) / 2
      };
  }
};

// Validate image bounds within container
export const validateImageBounds = (position, size, containerSize) => {
  const maxX = containerSize.width - size.width;
  const maxY = containerSize.height - size.height;
  
  return {
    x: Math.max(0, Math.min(maxX, position.x)),
    y: Math.max(0, Math.min(maxY, position.y))
  };
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Canvas to PDF utilities
export const canvasToDataURL = (canvas, quality = 0.95) => {
  return canvas.toDataURL('image/jpeg', quality);
};

// Dynamic import helper for pdf-lib
let pdfLibCache = null;
export const importPDFLib = async () => {
  if (pdfLibCache) return pdfLibCache;
  
  try {
    const pdfLib = await import('pdf-lib');
    pdfLibCache = pdfLib;
    return pdfLib;
  } catch (error) {
    throw new Error('Failed to load PDF library: ' + error.message);
  }
};

// Create PDF from pages
export const createPDFFromPages = async (pages, images, options = {}) => {
  const { PDFDocument, rgb } = await importPDFLib();
  
  const pdfDoc = await PDFDocument.create();
  const pageSize = options.pageSize || { width: 595, height: 842 }; // A4 in points
  
  for (const page of pages) {
    if (!page.layout) continue;
    
    const pdfPage = pdfDoc.addPage([pageSize.width, pageSize.height]);
    
    // Set background
    if (page.background && page.background !== '#ffffff') {
      const bgColor = hexToRgb(page.background);
      pdfPage.drawRectangle({
        x: 0,
        y: 0,
        width: pageSize.width,
        height: pageSize.height,
        color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255)
      });
    }
    
    // Generate grid and place images
    const gridCells = generateGridCells(page.layout, page.customGrid, pageSize);
    
    for (const [cellId, cellImages] of Object.entries(page.cellImages || {})) {
      const cell = gridCells.find(c => c.id === cellId);
      if (!cell || !cellImages.length) continue;
      
      for (const imageData of cellImages) {
        const imageInfo = images.find(img => img.id === imageData.imageId);
        if (!imageInfo) continue;
        
        try {
          // Convert image to PDF format
          const imageBytes = await fetch(imageInfo.preview).then(res => res.arrayBuffer());
          let embeddedImage;
          
          if (imageInfo.type.includes('png')) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else if (imageInfo.type.includes('jpg') || imageInfo.type.includes('jpeg')) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            continue; // Skip unsupported formats
          }
          
          // Calculate position and size
          const scaleX = pageSize.width / 800; // Assuming canvas width of 800
          const scaleY = pageSize.height / 600; // Assuming canvas height of 600
          
          const x = (cell.x + imageData.x) * scaleX;
          const y = pageSize.height - ((cell.y + imageData.y + imageData.height) * scaleY);
          const width = imageData.width * scaleX;
          const height = imageData.height * scaleY;
          
          pdfPage.drawImage(embeddedImage, {
            x,
            y,
            width,
            height,
            opacity: imageData.opacity || 1,
            rotate: imageData.rotation ? { angle: imageData.rotation } : undefined
          });
        } catch (error) {
          console.error('Error embedding image:', error);
        }
      }
    }
  }
  
  return await pdfDoc.save();
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

// Download PDF blob
export const downloadPDF = (pdfBytes, filename = 'document.pdf') => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
};

// Error handling utilities
export const ERROR_TYPES = {
  INVALID_IMAGE: 'INVALID_IMAGE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  PDF_GENERATION_FAILED: 'PDF_GENERATION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const createError = (type, message, details = null) => ({
  type,
  message,
  details,
  timestamp: new Date().toISOString()
});

// Performance optimization utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image compression for performance
export const compressImage = async (file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Lazy loading utility for images
export const createLazyImageLoader = () => {
  const imageCache = new Map();
  const pendingLoads = new Map();
  
  return {
    loadImage: async (src) => {
      if (imageCache.has(src)) {
        return imageCache.get(src);
      }
      
      if (pendingLoads.has(src)) {
        return pendingLoads.get(src);
      }
      
      const loadPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(src, img);
          pendingLoads.delete(src);
          resolve(img);
        };
        img.onerror = () => {
          pendingLoads.delete(src);
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
      });
      
      pendingLoads.set(src, loadPromise);
      return loadPromise;
    },
    
    clearCache: () => {
      imageCache.clear();
    },
    
    getCacheSize: () => imageCache.size
  };
};
