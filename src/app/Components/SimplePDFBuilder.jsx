"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Image as ImageIcon,
  X,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import LoadingSpinner from './LoadingSpinner';

const SimplePDFBuilder = ({ onNavigate }) => {
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  // Validate and process uploaded images
  const processImages = useCallback(async (files) => {
    const processedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Please use JPG, PNG, or WebP.`);
        continue;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const preview = URL.createObjectURL(file);
        
        // Get image dimensions
        const dimensions = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = preview;
        });

        processedImages.push({
          id: `img_${Date.now()}_${i}`,
          file,
          name: file.name,
          preview,
          dimensions,
          size: file.size
        });
      } catch (error) {
        errors.push(`${file.name}: Failed to process image.`);
        URL.revokeObjectURL(preview);
      }
    }

    if (errors.length > 0) {
      alert(`Some files could not be processed:\n\n${errors.join('\n')}`);
    }

    if (processedImages.length > 0) {
      setImages(prev => [...prev, ...processedImages]);
    }
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processImages,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  });

  // Remove image
  const removeImage = useCallback((id) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up preview URLs
      const removed = prev.find(img => img.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  }, []);

  // Move image up/down
  const moveImage = useCallback((id, direction) => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  }, []);

  // Convert image to data URL for PDF
  const imageToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  // Generate PDF from images
  const generatePDF = useCallback(async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
          // Convert image to data URL
          const dataUrl = await imageToDataURL(image.file);
          
          // Embed image in PDF
          let embeddedImage;
          if (image.file.type === 'image/png') {
            embeddedImage = await pdfDoc.embedPng(dataUrl);
          } else if (image.file.type === 'image/webp') {
            // Convert WebP to JPEG for PDF compatibility
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                resolve();
              };
              img.onerror = reject;
              img.src = dataUrl;
            });
            
            const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            embeddedImage = await pdfDoc.embedJpg(jpegDataUrl);
          } else {
            embeddedImage = await pdfDoc.embedJpg(dataUrl);
          }

          // Create page with image dimensions or standard A4
          const { width: imgWidth, height: imgHeight } = embeddedImage;
          
          // Scale to fit A4 if image is too large
          const maxWidth = 595; // A4 width in points
          const maxHeight = 842; // A4 height in points
          
          let pageWidth = imgWidth;
          let pageHeight = imgHeight;
          
          if (imgWidth > maxWidth || imgHeight > maxHeight) {
            const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            pageWidth = imgWidth * scale;
            pageHeight = imgHeight * scale;
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          
          // Draw image to fill the page
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight
          });
        } catch (imageError) {
          console.error(`Error processing image ${image.name}:`, imageError);
          // Continue with other images instead of failing completely
        }
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPdfUrl(url);
      setPreviewMode(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check your images and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  // Download PDF
  const downloadPDF = useCallback(() => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `images-to-pdf-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl]);

  // Clear all images
  const clearAll = useCallback(() => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setImages([]);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPreviewMode(false);
  }, [images, pdfUrl]);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Images to PDF Converter
        </h1>
        <p className="text-gray-600">
          Upload images and convert them to a PDF document
        </p>
      </div>

      {/* Upload Area */}
      {!previewMode && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop images here...' : 'Upload Images'}
          </p>
          <p className="text-sm text-gray-500">
            Drag & drop images or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports JPG, PNG, WebP (max 10MB each)
          </p>
        </div>
      )}

      {/* Images List */}
      {images.length > 0 && !previewMode && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Uploaded Images ({images.length})
            </h3>
            <div className="flex gap-2">              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-50 rounded-lg p-4 border"
              >
                <div className="relative mb-3">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-500">
                    {image.dimensions.width} × {image.dimensions.height}
                  </p>
                    <div className="flex gap-1">
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="text-xs bg-gray-200 px-2 py-1 rounded disabled:opacity-50 hover:bg-gray-300 disabled:hover:bg-gray-200"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="text-xs bg-gray-200 px-2 py-1 rounded disabled:opacity-50 hover:bg-gray-300 disabled:hover:bg-gray-200"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <span className="text-xs text-gray-400 px-2 py-1">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Preview */}
      {previewMode && pdfUrl && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              PDF Preview
            </h3>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => setPreviewMode(false)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <Eye className="h-4 w-4" />
                Back to Edit
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Start Over
              </button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full h-96"
              title="PDF Preview"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !previewMode && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500">
            No images uploaded yet. Start by uploading some images above.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplePDFBuilder;
