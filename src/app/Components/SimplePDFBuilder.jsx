"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Image as ImageIcon,
  X,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import LoadingSpinner from "./LoadingSpinner";
import { useTheme } from "../Components/ThemeAccessibilitySettings";

const SimplePDFBuilder = ({ onNavigate }) => {
  const { currentTheme, themes, accessibility } = useTheme();
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
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        errors.push(
          `${file.name}: Invalid file type. Please use JPG, PNG, or WebP.`
        );
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
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = preview;
        });

        processedImages.push({
          id: `img_${Date.now()}_${i}`,
          file,
          name: file.name,
          preview,
          dimensions,
          size: file.size,
        });
      } catch (error) {
        errors.push(`${file.name}: Failed to process image.`);
        URL.revokeObjectURL(preview);
      }
    }

    if (errors.length > 0) {
      alert(`Some files could not be processed:\n\n${errors.join("\n")}`);
    }

    if (processedImages.length > 0) {
      setImages((prev) => [...prev, ...processedImages]);
    }
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processImages,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  // Remove image
  const removeImage = useCallback((id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // Clean up preview URLs
      const removed = prev.find((img) => img.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  }, []);

  // Move image up/down
  const moveImage = useCallback((id, direction) => {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [
        newImages[newIndex],
        newImages[index],
      ];
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
          if (image.file.type === "image/png") {
            embeddedImage = await pdfDoc.embedPng(dataUrl);
          } else if (image.file.type === "image/webp") {
            // Convert WebP to JPEG for PDF compatibility
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
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

            const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
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
            height: pageHeight,
          });
        } catch (imageError) {
          console.error(`Error processing image ${image.name}:`, imageError);
          // Continue with other images instead of failing completely
        }
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setPreviewMode(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please check your images and try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  // Download PDF
  const downloadPDF = useCallback(() => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `images-to-pdf-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [pdfUrl]);

  // Clear all images
  const clearAll = useCallback(() => {
    images.forEach((img) => {
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
    <div className="min-h-screen bg-theme-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 px-4 py-2 bg-theme-secondary border border-theme-border text-theme-text-secondary hover:text-theme-primary hover:border-theme-primary rounded-lg transition-all duration-200 mb-4"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        )}{" "}
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-theme-text mb-4">
            Images to <span className="text-theme-primary">PDF</span> Converter
          </h1>
          <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
            Upload images and convert them to a PDF document
          </p>
        </div>
        {/* Upload Area */}
        {!previewMode && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-theme-primary bg-theme-primary"
                : "border-theme-border hover:border-theme-primary"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-theme-text-secondary mb-4" />
            <p className="text-lg font-medium text-theme-text mb-2">
              {isDragActive ? "Drop images here..." : "Upload Images"}
            </p>
            <p className="text-sm text-theme-text-secondary">
              Drag & drop images or click to browse
            </p>
            <p className="text-xs text-theme-text-secondary mt-2">
              Supports JPG, PNG, WebP (max 10MB each)
            </p>
          </div>
        )}
        {/* Images List */}
        {images.length > 0 && !previewMode && (
          <div className="bg-theme-secondary rounded-xl border border-theme-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-theme-text">
                Uploaded Images ({images.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary-opaque-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30"
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
                  className="bg-theme-background rounded-lg p-4 border border-theme-border-opaque-20"
                >
                  <div className="relative mb-3">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-theme-text truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-theme-text-secondary">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-theme-text-secondary">
                      {image.dimensions.width} × {image.dimensions.height}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveImage(image.id, "up")}
                        disabled={index === 0}
                        className="text-xs bg-theme-secondary px-2 py-1 rounded disabled:opacity-50 hover:bg-theme-primary hover:text-white disabled:hover:bg-theme-secondary"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveImage(image.id, "down")}
                        disabled={index === images.length - 1}
                        className="text-xs bg-theme-secondary px-2 py-1 rounded disabled:opacity-50 hover:bg-theme-primary hover:text-white disabled:hover:bg-theme-secondary"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <span className="text-xs text-theme-text-secondary px-2 py-1">
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
          <div className="bg-theme-secondary rounded-xl border border-theme-border- p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-theme-text">
                PDF Preview
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="flex items-center gap-2 bg-theme-background text-theme-text-secondary px-4 py-2 rounded-lg hover:text-theme-primary border border-theme-border-opaque-20"
                >
                  <Eye className="h-4 w-4" />
                  Back to Edit
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4" />
                  Start Over
                </button>
              </div>
            </div>

            <div className="border border-theme-border rounded-lg overflow-hidden">
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
            <ImageIcon className="mx-auto h-16 w-16 text-[var(--color-textSecondary)] mb-4" />
            <p className="text-[var(--color-textSecondary)]">
              No images uploaded yet. Start by uploading some images above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePDFBuilder;
