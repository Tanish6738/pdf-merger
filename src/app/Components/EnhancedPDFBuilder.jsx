"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  AlertTriangle,
  FileText,
  RotateCw,
  Monitor,
  Smartphone,
  Settings,
  Maximize,
  Minimize,
  Square,
  Type,
  Droplets,
} from "lucide-react";

import LoadingSpinner from "./LoadingSpinner";

const EnhancePDFBuilder = () => {  // Core state
  const [images, setImages] = useState([]);
  const [pages, setPages] = useState([{ id: 1, images: [] }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // PDF settings
  const [pdfOrientation, setPdfOrientation] = useState('portrait'); // 'portrait' or 'landscape'
  const [pdfSettings, setPdfSettings] = useState({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    padding: { top: 10, bottom: 10, left: 10, right: 10 },
    imageFitMode: 'fit', // 'fit', 'cover', 'stretch'
    watermark: {
      enabled: false,
      text: '',
      opacity: 0.3,
      fontSize: 24,
      color: '#cccccc',
      position: 'center' // 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  // Image upload functionality
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      addedAt: new Date().toISOString(),
      rotation: 0, // Add rotation property (0, 90, 180, 270 degrees)
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: true,
  });

  // Image management
  const removeImage = useCallback((imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    // Remove from all pages
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        images: page.images.filter((img) => img.id !== imageId),
      }))
    );
  }, []);
  const addImageToPage = useCallback(
    (imageId) => {
      const image = images.find((img) => img.id === imageId);
      if (!image) return;

      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPage
            ? { ...page, images: [...page.images, { id: imageId, ...image }] }
            : page
        )
      );
    },
    [images, currentPage]
  );

  const removeImageFromPage = useCallback(
    (imageId) => {
      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPage
            ? {
                ...page,
                images: page.images.filter((img) => img.id !== imageId),
              }
            : page
        )
      );
    },
    [currentPage]
  );
  // Image rotation functionality
  const rotateImage = useCallback((imageId, rotationDelta = 90) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, rotation: (img.rotation + rotationDelta) % 360 }
          : img
      )
    );

    // Update the rotation in all pages that contain this image
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        images: page.images.map((img) =>
          img.id === imageId
            ? { ...img, rotation: (img.rotation + rotationDelta) % 360 }
            : img
        ),
      }))
    );
  }, []);

  // PDF Settings functionality
  const updatePdfSettings = useCallback((newSettings) => {
    setPdfSettings((prev) => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const updateMargins = useCallback((margins) => {
    setPdfSettings((prev) => ({
      ...prev,
      margins: { ...prev.margins, ...margins }
    }));
  }, []);

  const updatePadding = useCallback((padding) => {
    setPdfSettings((prev) => ({
      ...prev,
      padding: { ...prev.padding, ...padding }
    }));
  }, []);

  const updateWatermark = useCallback((watermark) => {
    setPdfSettings((prev) => ({
      ...prev,
      watermark: { ...prev.watermark, ...watermark }
    }));
  }, []);

  // Page management
  const addPage = useCallback(() => {
    const newPage = {
      id: Date.now(),
      images: [],
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPage(newPage.id);
  }, []);

  const deletePage = useCallback(
    (pageId) => {
      if (pages.length <= 1) return;

      const newPages = pages.filter((p) => p.id !== pageId);
      setPages(newPages);

      if (currentPage === pageId) {
        setCurrentPage(newPages[0].id);
      }
    },
    [pages, currentPage]
  );  // Export to PDF
  const exportToPDF = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Check if there are any pages with images
      const pagesWithImages = pages.filter((page) => page.images.length > 0);
      if (pagesWithImages.length === 0) {
        throw new Error("Please add at least one image to export");
      }

      setProgress(20);

      // Create PDF using pdf-lib
      const { PDFDocument, rgb, degrees } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      setProgress(40);

      for (let i = 0; i < pagesWithImages.length; i++) {
        const pageData = pagesWithImages[i];

        // Add a new page with orientation
        const page = pdfOrientation === 'landscape' 
          ? pdfDoc.addPage([842, 595]) // A4 landscape
          : pdfDoc.addPage([595, 842]); // A4 portrait
        
        const { width: pageWidth, height: pageHeight } = page.getSize();

        setProgress(40 + (i / pagesWithImages.length) * 40);        // Apply settings from state
        const { margins, padding, imageFitMode, watermark } = pdfSettings;
        
        // Calculate layout for images
        const availableWidth = pageWidth - margins.left - margins.right;
        const availableHeight = pageHeight - margins.top - margins.bottom;
        const imageHeight = availableHeight / pageData.images.length;

        // Add images to page
        for (let j = 0; j < pageData.images.length; j++) {
          const image = pageData.images[j];

          // Convert image to bytes
          const imageBytes = await fetch(image.url).then((res) =>
            res.arrayBuffer()
          );

          // Determine image type and embed accordingly
          let embeddedImage;
          const imageType = image.file.type.toLowerCase();

          if (imageType.includes("png")) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else if (imageType.includes("jpg") || imageType.includes("jpeg")) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            // Convert other formats to PNG using canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            const pngBytes = await new Promise((resolve) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(async (blob) => {
                  const arrayBuffer = await blob.arrayBuffer();
                  resolve(arrayBuffer);
                }, "image/png");
              };
              img.src = image.url;
            });

            embeddedImage = await pdfDoc.embedPng(pngBytes);
          }          // Calculate image dimensions based on fit mode
          let { width: imgWidth, height: imgHeight } = embeddedImage.scale(1);
          
          // Adjust dimensions for rotation (90 or 270 degrees swap width/height)
          if (image.rotation === 90 || image.rotation === 270) {
            [imgWidth, imgHeight] = [imgHeight, imgWidth];
          }
          
          const aspectRatio = imgWidth / imgHeight;
          const containerWidth = availableWidth - padding.left - padding.right;
          const containerHeight = imageHeight - padding.top - padding.bottom;

          let drawWidth, drawHeight;

          switch (imageFitMode) {
            case 'stretch':
              drawWidth = containerWidth;
              drawHeight = containerHeight;
              break;
            case 'cover':
              const scale = Math.max(
                containerWidth / imgWidth,
                containerHeight / imgHeight
              );
              drawWidth = imgWidth * scale;
              drawHeight = imgHeight * scale;
              // Crop if necessary
              if (drawWidth > containerWidth) drawWidth = containerWidth;
              if (drawHeight > containerHeight) drawHeight = containerHeight;
              break;
            case 'fit':
            default:
              drawWidth = containerWidth;
              drawHeight = drawWidth / aspectRatio;
              
              if (drawHeight > containerHeight) {
                drawHeight = containerHeight;
                drawWidth = drawHeight * aspectRatio;
              }
              break;
          }

          const x = margins.left + padding.left + (containerWidth - drawWidth) / 2;
          const y = pageHeight - margins.top - (j + 1) * imageHeight + 
                   padding.bottom + (containerHeight - drawHeight) / 2;// Draw the image with rotation
          if (image.rotation && image.rotation !== 0) {
            // Calculate center point for rotation
            const centerX = x + drawWidth / 2;
            const centerY = y + drawHeight / 2;
            
            // Apply rotation around center
            page.drawImage(embeddedImage, {
              x: centerX - drawWidth / 2,
              y: centerY - drawHeight / 2,
              width: drawWidth,
              height: drawHeight,
              rotate: degrees(image.rotation),
            });
          } else {
            // Draw the image normally
            page.drawImage(embeddedImage, {
              x,
              y,
              width: drawWidth,
              height: drawHeight,            });
          }
        }

        // Add watermark if enabled
        if (watermark.enabled && watermark.text) {
          const helvetica = await pdfDoc.embedFont('Helvetica');
          const textColor = rgb(
            parseInt(watermark.color.slice(1, 3), 16) / 255,
            parseInt(watermark.color.slice(3, 5), 16) / 255,
            parseInt(watermark.color.slice(5, 7), 16) / 255
          );

          let textX, textY;
          const textWidth = helvetica.widthOfTextAtSize(watermark.text, watermark.fontSize);
          const textHeight = watermark.fontSize;

          switch (watermark.position) {
            case 'top-left':
              textX = margins.left;
              textY = pageHeight - margins.top - textHeight;
              break;
            case 'top-right':
              textX = pageWidth - margins.right - textWidth;
              textY = pageHeight - margins.top - textHeight;
              break;
            case 'bottom-left':
              textX = margins.left;
              textY = margins.bottom;
              break;
            case 'bottom-right':
              textX = pageWidth - margins.right - textWidth;
              textY = margins.bottom;
              break;
            case 'center':
            default:
              textX = (pageWidth - textWidth) / 2;
              textY = (pageHeight - textHeight) / 2;
              break;
          }

          page.drawText(watermark.text, {
            x: textX,
            y: textY,
            size: watermark.fontSize,
            font: helvetica,
            color: textColor,
            opacity: watermark.opacity,
          });
        }
      }

      setProgress(90);

      // Generate PDF bytes and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `pdf-builder-${timestamp}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Export Error:", error);
      setError("Failed to export PDF: " + error.message);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getCurrentPage = () =>
    pages.find((p) => p.id === currentPage) || pages[0];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  return (
    <div className="min-h-screen bg-theme-background text-theme-text">
      {/* Header */}
      <header className="bg-theme-secondary border-b border-theme-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-theme-primary">
              Simple PDF Builder
            </h1>
          </div>          <div className="flex items-center gap-3">
            {/* PDF Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded transition-colors ${
                showSettings
                  ? 'bg-theme-primary text-white'
                  : 'text-theme-text hover:bg-theme-primary-opaque-20'
              }`}
              title="PDF Settings"
            >
              <Settings size={16} />
            </button>
            
            {/* PDF Orientation Controls */}
            <div className="flex items-center gap-2 bg-theme-background rounded-lg p-2 border border-theme-border">
              <span className="text-sm text-theme-text-secondary">PDF:</span>
              <button
                onClick={() => setPdfOrientation('portrait')}
                className={`p-2 rounded transition-colors ${
                  pdfOrientation === 'portrait'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text hover:bg-theme-primary-opaque-20'
                }`}
                title="Portrait"
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setPdfOrientation('landscape')}
                className={`p-2 rounded transition-colors ${
                  pdfOrientation === 'landscape'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text hover:bg-theme-primary-opaque-20'
                }`}
                title="Landscape"
              >
                <Monitor size={16} />
              </button>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportToPDF}
              disabled={
                isProcessing || pages.every((p) => p.images.length === 0)
              }
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download size={16} />
              )}
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* PDF Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-theme-secondary border-b border-theme-border overflow-hidden"
          >
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Margins */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text flex items-center gap-2">
                    <Square size={16} />
                    Margins
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-theme-text-secondary">Top</label>
                      <input
                        type="number"
                        value={pdfSettings.margins.top}
                        onChange={(e) => updateMargins({ top: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Bottom</label>
                      <input
                        type="number"
                        value={pdfSettings.margins.bottom}
                        onChange={(e) => updateMargins({ bottom: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Left</label>
                      <input
                        type="number"
                        value={pdfSettings.margins.left}
                        onChange={(e) => updateMargins({ left: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Right</label>
                      <input
                        type="number"
                        value={pdfSettings.margins.right}
                        onChange={(e) => updateMargins({ right: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="200"
                      />
                    </div>
                  </div>
                </div>

                {/* Padding */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text flex items-center gap-2">
                    <Minimize size={16} />
                    Padding
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-theme-text-secondary">Top</label>
                      <input
                        type="number"
                        value={pdfSettings.padding.top}
                        onChange={(e) => updatePadding({ top: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Bottom</label>
                      <input
                        type="number"
                        value={pdfSettings.padding.bottom}
                        onChange={(e) => updatePadding({ bottom: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Left</label>
                      <input
                        type="number"
                        value={pdfSettings.padding.left}
                        onChange={(e) => updatePadding({ left: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-theme-text-secondary">Right</label>
                      <input
                        type="number"
                        value={pdfSettings.padding.right}
                        onChange={(e) => updatePadding({ right: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Fit Mode */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text flex items-center gap-2">
                    <Maximize size={16} />
                    Image Fit
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'fit', label: 'Fit', icon: Minimize },
                      { value: 'cover', label: 'Cover', icon: Maximize },
                      { value: 'stretch', label: 'Stretch', icon: Square }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updatePdfSettings({ imageFitMode: value })}
                        className={`w-full p-2 rounded text-sm transition-colors flex items-center gap-2 ${
                          pdfSettings.imageFitMode === value
                            ? 'bg-theme-primary text-white'
                            : 'bg-theme-background hover:bg-theme-primary-opaque-20 text-theme-text border border-theme-border'
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Watermark */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-theme-text flex items-center gap-2">
                    <Droplets size={16} />
                    Watermark
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pdfSettings.watermark.enabled}
                        onChange={(e) => updateWatermark({ enabled: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-theme-text">Enable Watermark</span>
                    </label>
                    
                    {pdfSettings.watermark.enabled && (
                      <>
                        <div>
                          <label className="text-xs text-theme-text-secondary">Text</label>
                          <input
                            type="text"
                            value={pdfSettings.watermark.text}
                            onChange={(e) => updateWatermark({ text: e.target.value })}
                            placeholder="Watermark text"
                            className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-theme-text-secondary">Opacity</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={pdfSettings.watermark.opacity}
                            onChange={(e) => updateWatermark({ opacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-theme-text-secondary">{(pdfSettings.watermark.opacity * 100).toFixed(0)}%</span>
                        </div>
                        
                        <div>
                          <label className="text-xs text-theme-text-secondary">Position</label>
                          <select
                            value={pdfSettings.watermark.position}
                            onChange={(e) => updateWatermark({ position: e.target.value })}
                            className="w-full px-2 py-1 bg-theme-background border border-theme-border rounded text-sm"
                          >
                            <option value="center">Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">          {/* Left Section - Image Upload */}
          <div className="lg:col-span-1">
            <div className="card-theme p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Image Library
              </h2>
              
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-theme-primary bg-theme-primary-opaque-10"
                    : "border-theme-border hover:border-theme-primary"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-4 text-theme-text-secondary" size={32} />
                <p className="text-theme-text">
                  {isDragActive
                    ? "Drop images here..."
                    : "Drag & drop images or click to browse"}
                </p>
                <p className="text-sm text-theme-text-secondary mt-2">
                  Supports PNG, JPG, JPEG, GIF, BMP, WebP
                </p>
              </div>              {/* Image List */}
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 p-3 bg-theme-secondary rounded-lg border border-theme-border"
                  >
                    <div className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-12 h-12 object-cover rounded"
                        style={{
                          transform: `rotate(${image.rotation || 0}deg)`,
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      {(image.rotation || 0) !== 0 && (
                        <div className="absolute -top-1 -right-1 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {image.rotation}°
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-theme-text">
                        {image.name}
                      </p>
                      <p className="text-xs text-theme-text-secondary">
                        {formatFileSize(image.size)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => rotateImage(image.id)}
                        className="p-1 text-blue-400 hover:bg-blue-400/20 rounded transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button
                        onClick={() => addImageToPage(image.id)}
                        className="p-1 text-theme-primary hover:bg-theme-primary-opaque-20 rounded transition-colors"
                        title="Add to current page"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Pages and Current Page */}
          <div className="lg:col-span-2">
            <div className="space-y-6">              {/* Page Tabs */}
              <div className="card-theme p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} />
                    Pages
                  </h2>
                  <button
                    onClick={addPage}
                    className="btn-primary px-3 py-1 rounded flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Page
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {pages.map((page, index) => (
                    <div key={page.id} className="relative">
                      <button
                        onClick={() => setCurrentPage(page.id)}
                        className={`relative px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page.id
                            ? "bg-theme-primary text-white"
                            : "bg-theme-secondary hover:bg-theme-primary-opaque-20 text-theme-text border border-theme-border"
                        }`}
                      >
                        Page {index + 1}
                        {page.images.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {page.images.length}
                          </span>
                        )}
                      </button>
                      {pages.length > 1 && (
                        <button
                          onClick={() => deletePage(page.id)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center z-10 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>{" "}              {/* Current Page Content */}
              <div className="card-theme p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-theme-text">
                    Page {pages.findIndex((p) => p.id === currentPage) + 1}{" "}
                    Content
                  </h3>
                  <span className="text-sm text-theme-text-secondary">
                    {getCurrentPage().images.length} images
                  </span>
                </div>

                {getCurrentPage().images.length === 0 ? (
                  <div className="text-center py-12 text-theme-text-secondary">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No images on this page</p>
                    <p className="text-sm mt-2">
                      Add images from the library on the left
                    </p>
                  </div>
                ) : (                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {getCurrentPage().images.map((image, index) => (
                      <div
                        key={`${image.id}-${index}`}
                        className="relative group bg-theme-secondary rounded-lg overflow-hidden border border-theme-border"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover transition-transform duration-300"
                          style={{
                            transform: `rotate(${image.rotation || 0}deg)`
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => rotateImage(image.id)}
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                            title="Rotate 90°"
                          >
                            <RotateCw size={16} />
                          </button>
                          <button
                            onClick={() => removeImageFromPage(image.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="Remove from page"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
                          <p className="text-xs text-white truncate">
                            {image.name}
                          </p>
                          {(image.rotation || 0) !== 0 && (
                            <p className="text-xs text-blue-300">
                              {image.rotation}° rotated
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>              {/* PDF Preview Section */}
              <div className="card-theme p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-theme-text">
                    <FileText size={20} />
                    PDF Preview
                  </h3>
                  <span className="text-sm text-theme-text-secondary">
                    How it will look in PDF
                  </span>
                </div>                {getCurrentPage().images.length === 0 ? (
                  <div className="text-center py-12 text-theme-text-secondary">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No preview available</p>
                    <p className="text-sm mt-2">
                      Add images to see PDF layout preview
                    </p>
                  </div>
                ) : (                  <div className="bg-theme-secondary rounded-lg p-4 shadow-inner">
                    {/* PDF Page Preview */}
                    <div
                      className="bg-theme-secondary border border-theme-border rounded mx-auto"
                      style={{
                        width: pdfOrientation === 'landscape' ? "400px" : "300px",
                        height: pdfOrientation === 'landscape' ? "300px" : "400px",
                        aspectRatio: pdfOrientation === 'landscape' ? "297/210" : "210/297",
                      }}
                    >
                      <div className="h-full p-4 flex flex-col justify-start gap-2">
                        {getCurrentPage().images.map((image, index) => {
                          const containerHeight = pdfOrientation === 'landscape' ? 300 : 400;
                          const imageHeight = (containerHeight - 32) / getCurrentPage().images.length;
                          return (
                            <div
                              key={`preview-${image.id}-${index}`}
                              className="bg-theme-background border border-theme-border rounded flex items-center justify-center relative overflow-hidden"
                              style={{ height: `${imageHeight - 8}px` }}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="max-w-full max-h-full object-contain transition-transform duration-300"
                                style={{
                                  transform: `rotate(${image.rotation || 0}deg)`
                                }}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                                {image.name}
                                {(image.rotation || 0) !== 0 && (
                                  <span className="text-blue-300 ml-1">({image.rotation}°)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>                    <div className="text-center mt-3 text-theme-text-secondary text-sm">
                      Page {pages.findIndex((p) => p.id === currentPage) + 1}{" "}
                      Preview ({pdfOrientation === 'landscape' ? 'Landscape' : 'Portrait'})
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Error</div>
                <div className="text-sm">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-2 hover:bg-red-700 rounded p-1 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Modal */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >            <div className="bg-theme-secondary p-6 rounded-lg">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-theme-text">Exporting PDF...</h3>
                <div className="w-64 bg-theme-border rounded-full h-2">
                  <div
                    className="bg-theme-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-theme-text-secondary mt-2">
                  {progress}% complete
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancePDFBuilder;
