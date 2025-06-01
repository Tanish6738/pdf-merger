"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, Search, Filter, Zap } from 'lucide-react';
import { compressImage, createLazyImageLoader } from '../utils/imageHelpers';

// Create lazy image loader instance
const lazyLoader = createLazyImageLoader();

const ImageUploadPanel = ({ 
  images, 
  onImagesAdd, 
  onImageRemove, 
  onImageSelect,
  selectedImages = [],
  usedImages = new Set()
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, used, unused
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [compressionEnabled, setCompressionEnabled] = useState(true);

  // Validate image files
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
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
  const onDrop = useCallback(async (acceptedFiles) => {
    setIsProcessingImages(true);
    
    try {
      const imageProcessingResults = await Promise.all(
        acceptedFiles.map(async (file) => {
          const validation = validateImageFile(file);
          
          if (!validation.isValid) {
            console.error('Invalid image file:', validation.errors);
            return null;
          }

          let processedFile = file;
          
          // Apply compression if enabled and file is large
          if (compressionEnabled && file.size > 1024 * 1024) { // 1MB threshold
            try {
              const compressedBlob = await compressImage(file, 0.8, 1920, 1080);
              processedFile = new File([compressedBlob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              console.log(`Image compressed: ${file.size} -> ${processedFile.size} bytes`);
            } catch (compressionError) {
              console.warn('Image compression failed, using original:', compressionError);
              processedFile = file;
            }
          }

          // Create preview URL
          const previewUrl = URL.createObjectURL(processedFile);
          
          // Get image dimensions using lazy loader
          let dimensions = { width: 0, height: 0 };
          try {
            const img = await lazyLoader.loadImage(previewUrl);
            dimensions = { width: img.width, height: img.height };
          } catch (error) {
            console.warn('Failed to load image dimensions:', error);
          }
          
          return {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2)}`,
            file: processedFile,
            name: file.name,
            size: processedFile.size,
            originalSize: file.size,
            type: processedFile.type,
            preview: previewUrl,
            dimensions,
            compressed: processedFile !== file,
            uploadedAt: new Date().toISOString()
          };
        })
      );

      const validImages = imageProcessingResults.filter(Boolean);
      onImagesAdd(validImages);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessingImages(false);
    }
  }, [onImagesAdd, compressionEnabled]);

  // Get image dimensions helper
  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
    },
    multiple: true
  });

  // Filter images based on search and filter type
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'used') {
      return matchesSearch && usedImages.has(image.id);
    } else if (filterType === 'unused') {
      return matchesSearch && !usedImages.has(image.id);
    }
    
    return matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <ImageIcon className="mr-2" size={20} />
          Image Library
        </h3>
        <div className="text-sm text-gray-400">
          {images.length} images
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A99D]"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'used', 'unused'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                filterType === type
                  ? 'bg-[#00A99D] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
          isDragActive
            ? 'border-[#00A99D] bg-[#00A99D]/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-gray-300 mb-1">
          {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
        </p>
        <p className="text-gray-500 text-sm">
          Or click to select files (JPG, PNG, WebP, SVG)
        </p>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredImages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            {images.length === 0 ? 'No images uploaded' : 'No images match your filter'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filteredImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`relative group bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 ${
                    selectedImages.includes(image.id)
                      ? 'border-[#00A99D]'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                  onClick={() => onImageSelect(image.id)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({
                      type: 'image',
                      imageId: image.id,
                      image: image
                    }));
                  }}
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-700 relative">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Usage indicator */}
                    {usedImages.has(image.id) && (
                      <div className="absolute top-2 left-2 bg-[#00A99D] text-white text-xs px-2 py-1 rounded">
                        Used
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageRemove(image.id);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="p-2">
                    <div className="text-sm text-white truncate mb-1">
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-400 flex justify-between">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.dimensions.width}×{image.dimensions.height}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadPanel;
