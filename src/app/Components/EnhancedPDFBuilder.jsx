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
} from "lucide-react";

import LoadingSpinner from "./LoadingSpinner";

const EnhancePDFBuilder = () => {
  // Core state
  const [images, setImages] = useState([]);
  const [pages, setPages] = useState([{ id: 1, images: [] }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Image upload functionality
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      addedAt: new Date().toISOString(),
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
  );
  // Export to PDF
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
      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      setProgress(40);

      for (let i = 0; i < pagesWithImages.length; i++) {
        const pageData = pagesWithImages[i];

        // Add a new page
        const page = pdfDoc.addPage();
        const { width: pageWidth, height: pageHeight } = page.getSize();

        setProgress(40 + (i / pagesWithImages.length) * 40);

        // Calculate layout for images
        const margin = 50;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
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
          }

          // Calculate image dimensions maintaining aspect ratio
          const { width: imgWidth, height: imgHeight } = embeddedImage.scale(1);
          const aspectRatio = imgWidth / imgHeight;

          let drawWidth = availableWidth;
          let drawHeight = drawWidth / aspectRatio;

          if (drawHeight > imageHeight - 20) {
            drawHeight = imageHeight - 20;
            drawWidth = drawHeight * aspectRatio;
          }

          const x = margin + (availableWidth - drawWidth) / 2;
          const y =
            pageHeight -
            margin -
            (j + 1) * imageHeight +
            (imageHeight - drawHeight) / 2;

          // Draw the image
          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
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
    <div className="min-h-screen bg-[#151B24] text-white">
      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#00A99D]">
              Simple PDF Builder
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Export Button */}
            <button
              onClick={exportToPDF}
              disabled={
                isProcessing || pages.every((p) => p.images.length === 0)
              }
              className="px-4 py-2 bg-[#00A99D] hover:bg-[#008a7d] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Image Upload */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1f2e] rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Image Library
              </h2>

              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-[#00A99D] bg-[#00A99D]/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-gray-300">
                  {isDragActive
                    ? "Drop images here..."
                    : "Drag & drop images or click to browse"}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PNG, JPG, JPEG, GIF, BMP, WebP
                </p>
              </div>

              {/* Image List */}
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(image.size)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => addImageToPage(image.id)}
                        className="p-1 text-[#00A99D] hover:bg-[#00A99D]/20 rounded"
                        title="Add to current page"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 text-red-400 hover:bg-red-400/20 rounded"
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
            <div className="space-y-6">
              {/* Page Tabs */}
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} />
                    Pages
                  </h2>
                  <button
                    onClick={addPage}
                    className="px-3 py-1 bg-[#00A99D] hover:bg-[#008a7d] text-white rounded flex items-center gap-1"
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
                            ? "bg-[#00A99D] text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
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
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center z-10"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>{" "}
              {/* Current Page Content */}
              <div className="bg-[#1a1f2e] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Page {pages.findIndex((p) => p.id === currentPage) + 1}{" "}
                    Content
                  </h3>
                  <span className="text-sm text-gray-400">
                    {getCurrentPage().images.length} images
                  </span>
                </div>

                {getCurrentPage().images.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No images on this page</p>
                    <p className="text-sm mt-2">
                      Add images from the library on the left
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {getCurrentPage().images.map((image, index) => (
                      <div
                        key={`${image.id}-${index}`}
                        className="relative group bg-gray-800 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeImageFromPage(image.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                            title="Remove from page"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
                          <p className="text-xs text-white truncate">
                            {image.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* PDF Preview Section */}
              <div className="bg-[#1a1f2e] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={20} />
                    PDF Preview
                  </h3>
                  <span className="text-sm text-gray-400">
                    How it will look in PDF
                  </span>
                </div>

                {getCurrentPage().images.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No preview available</p>
                    <p className="text-sm mt-2">
                      Add images to see PDF layout preview
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 shadow-inner">
                    {/* PDF Page Preview */}
                    <div
                      className="bg-white border border-gray-300 rounded mx-auto"
                      style={{
                        width: "300px",
                        height: "400px",
                        aspectRatio: "210/297",
                      }}
                    >
                      <div className="h-full p-4 flex flex-col justify-start gap-2">
                        {getCurrentPage().images.map((image, index) => {
                          const imageHeight =
                            (400 - 32) / getCurrentPage().images.length; // Total height minus padding, divided by number of images
                          return (
                            <div
                              key={`preview-${image.id}-${index}`}
                              className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center relative overflow-hidden"
                              style={{ height: `${imageHeight - 8}px` }}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="max-w-full max-h-full object-contain"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                                {image.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-center mt-3 text-gray-600 text-sm">
                      Page {pages.findIndex((p) => p.id === currentPage) + 1}{" "}
                      Preview
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
          >
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <h3 className="text-lg font-semibold mb-2">Exporting PDF...</h3>
                <div className="w-64 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#00A99D] h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
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
