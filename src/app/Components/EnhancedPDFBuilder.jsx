"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Settings,
  Eye,
  Edit3,
  Image as ImageIcon,
  Layout,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  AlertTriangle
} from 'lucide-react';

import LoadingSpinner from '../Components/LoadingSpinner';
import ErrorBoundary from '../Components/ErrorBoundary';
import ImageUploadPanel from '../Components/ImageUploadPanel';
import GridLayoutControls from '../Components/GridLayoutControls';
import PageCanvas from '../Components/PageCanvas';
import PageNavigator from '../Components/PageNavigator';
import { 
  validatePDFFile, 
  formatFileSize, 
  generateFileId, 
  downloadBlob,
  MERGE_STATUS,
  DEFAULT_SETTINGS
} from '../utils/pdfHelpers';

const EnhancedPDFBuilder = () => {
  // Core state
  const [viewMode, setViewMode] = useState('build'); // 'build', 'preview'
  const [editMode, setEditMode] = useState(true);
  
  // Image management
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [usedImages, setUsedImages] = useState(new Set());
  
  // Page management
  const [pages, setPages] = useState([
    {
      id: 1,
      layout: null,
      customGrid: { rows: 1, cols: 1 },
      cellImages: {},
      background: '#ffffff',
      createdAt: new Date().toISOString()
    }
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCell, setSelectedCell] = useState(null);
    // UI state
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Auto-save functionality
  const saveProjectToLocalStorage = useCallback(() => {
    if (!autoSaveEnabled) return;
    
    try {
      const projectData = {
        pages,
        images: images.map(img => ({
          ...img,
          // Don't save large preview data, just the essential info
          preview: img.preview?.length > 1000 ? null : img.preview
        })),
        currentPage,
        settings: {
          scale,
          showGrid,
          autoSaveEnabled
        },
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('pdf-builder-autosave', JSON.stringify(projectData));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [pages, images, currentPage, scale, showGrid, autoSaveEnabled]);

  const loadProjectFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem('pdf-builder-autosave');
      if (!savedData) return false;

      const projectData = JSON.parse(savedData);
      
      // Validate the data structure
      if (projectData.pages && Array.isArray(projectData.pages)) {
        setPages(projectData.pages);
        setCurrentPage(projectData.currentPage || projectData.pages[0]?.id || 1);
        
        if (projectData.images) {
          setImages(projectData.images);
        }
        
        if (projectData.settings) {
          setScale(projectData.settings.scale || 1);
          setShowGrid(projectData.settings.showGrid !== false);
          setAutoSaveEnabled(projectData.settings.autoSaveEnabled !== false);
        }
        
        setLastSaved(new Date(projectData.timestamp));
        return true;
      }
    } catch (error) {
      console.error('Failed to load auto-save:', error);
    }
    return false;
  }, []);

  // Auto-save when data changes (debounced)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      saveProjectToLocalStorage();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [pages, images, currentPage, saveProjectToLocalStorage]);

  // Load auto-save on component mount
  useEffect(() => {
    const hasAutoSave = loadProjectFromLocalStorage();
    if (hasAutoSave) {
      console.log('Project restored from auto-save');
    }
  }, [loadProjectFromLocalStorage]);

  // Get current page object
  const getCurrentPage = () => pages.find(p => p.id === currentPage) || pages[0];

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newState = { pages: [...pages], currentPage };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
  }, [pages, currentPage, historyIndex]);

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPages(prevState.pages);
      setCurrentPage(prevState.currentPage);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setPages(nextState.pages);
      setCurrentPage(nextState.currentPage);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Image management functions
  const handleImagesAdd = useCallback((newImages) => {
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleImageRemove = useCallback((imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImages(prev => prev.filter(id => id !== imageId));
    
    // Remove image from all pages
    setPages(prev => prev.map(page => ({
      ...page,
      cellImages: Object.fromEntries(
        Object.entries(page.cellImages || {}).map(([cellId, cellImages]) => [
          cellId,
          cellImages.filter(img => img.imageId !== imageId)
        ])
      )
    })));
    
    setUsedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleImageSelect = useCallback((imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  }, []);

  // Page management functions
  const handlePageAdd = useCallback((index = pages.length, pageData = null) => {
    saveToHistory();
    
    const newPage = pageData || {
      id: Date.now(),
      layout: null,
      customGrid: { rows: 1, cols: 1 },
      cellImages: {},
      background: '#ffffff',
      createdAt: new Date().toISOString()
    };
    
    const newPages = [...pages];
    newPages.splice(index, 0, newPage);
    setPages(newPages);
    setCurrentPage(newPage.id);
  }, [pages, saveToHistory]);

  const handlePageDuplicate = useCallback((pageId) => {
    saveToHistory();
    
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return;
    
    const originalPage = pages[pageIndex];
    const duplicatedPage = {
      ...originalPage,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const newPages = [...pages];
    newPages.splice(pageIndex + 1, 0, duplicatedPage);
    setPages(newPages);
    setCurrentPage(duplicatedPage.id);
  }, [pages, saveToHistory]);

  const handlePageDelete = useCallback((pageId) => {
    if (pages.length <= 1) return;
    
    saveToHistory();
    
    const newPages = pages.filter(p => p.id !== pageId);
    setPages(newPages);
    
    if (currentPage === pageId) {
      setCurrentPage(newPages[0].id);
    }
  }, [pages, currentPage, saveToHistory]);

  const handlePageReorder = useCallback((fromIndex, toIndex) => {
    saveToHistory();
    
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    setPages(newPages);
  }, [pages, saveToHistory]);

  const handlePageSelect = useCallback((pageId) => {
    setCurrentPage(pageId);
    setSelectedCell(null);
  }, []);

  // Layout management functions
  const handleLayoutChange = useCallback((layoutName, layoutConfig) => {
    saveToHistory();
    
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? { 
            ...page, 
            layout: layoutName,
            customGrid: layoutName === 'custom' ? layoutConfig : page.customGrid
          }
        : page
    ));
  }, [currentPage, saveToHistory]);

  const handleCustomGridChange = useCallback((gridConfig) => {
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? { ...page, customGrid: gridConfig }
        : page
    ));
  }, [currentPage]);
  const handleCellSubdivide = useCallback((cellId, divisions) => {
    saveToHistory();
    
    const currentPageData = getCurrentPage();
    if (!currentPageData || !currentPageData.layout) return;

    // Generate updated grid with subdivided cells
    const { generateGridCells } = require('../utils/imageHelpers');
    const currentCells = generateGridCells(
      currentPageData.layout, 
      currentPageData.customGrid,
      { width: 800, height: 600 }
    );

    // Find the cell to subdivide
    const cellToSubdivide = currentCells.find(cell => cell.id === cellId);
    if (!cellToSubdivide) return;

    // Create new subdivided cells
    const subCellWidth = cellToSubdivide.width / divisions.cols;
    const subCellHeight = cellToSubdivide.height / divisions.rows;
    
    const newSubCells = [];
    for (let row = 0; row < divisions.rows; row++) {
      for (let col = 0; col < divisions.cols; col++) {
        newSubCells.push({
          id: `${cellId}_${row}_${col}`,
          parentId: cellId,
          row: cellToSubdivide.row,
          col: cellToSubdivide.col,
          subRow: row,
          subCol: col,
          x: cellToSubdivide.x + (col * subCellWidth),
          y: cellToSubdivide.y + (row * subCellHeight),
          width: subCellWidth,
          height: subCellHeight,
          images: [],
          isSubdivided: true
        });
      }
    }

    // Update page with subdivision information
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            subdivisions: {
              ...page.subdivisions,
              [cellId]: {
                divisions,
                subCells: newSubCells
              }
            }
          }
        : page
    ));

    console.log('Cell subdivided:', cellId, 'into', divisions);
  }, [currentPage, saveToHistory, getCurrentPage]);

  const handleCellSelect = useCallback((cell) => {
    setSelectedCell(cell);
  }, []);
  // Image placement functions with fitting modes
  const handleImageDrop = useCallback((imageId, cellId, position, fitMode = 'contain') => {
    saveToHistory();
    
    const imageInfo = images.find(img => img.id === imageId);
    if (!imageInfo) return;
    
    // Calculate fitting based on mode
    const { calculateImageFit } = require('../utils/imageHelpers');
    const fittedPosition = calculateImageFit(
      { width: imageInfo.width || 200, height: imageInfo.height || 200 },
      { width: position.width, height: position.height },
      fitMode
    );
    
    const imageData = {
      id: Date.now(),
      imageId,
      x: position.x + fittedPosition.x,
      y: position.y + fittedPosition.y,
      width: fittedPosition.width,
      height: fittedPosition.height,
      rotation: 0,
      opacity: 1,
      fitMode
    };

    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            cellImages: {
              ...page.cellImages,
              [cellId]: [...(page.cellImages?.[cellId] || []), imageData]
            }
          }
        : page
    ));
    
    setUsedImages(prev => new Set([...prev, imageId]));
  }, [currentPage, images, saveToHistory]);

  const handleImagePosition = useCallback((cellId, imageDataId, newPosition) => {
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            cellImages: {
              ...page.cellImages,
              [cellId]: page.cellImages?.[cellId]?.map(img => 
                img.id === imageDataId
                  ? { ...img, x: newPosition.x, y: newPosition.y }
                  : img
              ) || []
            }
          }
        : page
    ));
  }, [currentPage]);

  const handleImageResize = useCallback((cellId, imageDataId, newSize) => {
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            cellImages: {
              ...page.cellImages,
              [cellId]: page.cellImages?.[cellId]?.map(img => 
                img.id === imageDataId
                  ? { ...img, width: newSize.width, height: newSize.height }
                  : img
              ) || []
            }
          }
        : page
    ));
  }, [currentPage]);
  const handleImageRemoveFromPage = useCallback((cellId, imageDataId) => {
    saveToHistory();
    
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            cellImages: {
              ...page.cellImages,
              [cellId]: page.cellImages?.[cellId]?.filter(img => img.id !== imageDataId) || []
            }
          }
        : page
    ));
  }, [currentPage, saveToHistory]);

  const handleImageFitModeChange = useCallback((cellId, imageDataId, newFitMode) => {
    const currentPageData = getCurrentPage();
    const cellImages = currentPageData.cellImages?.[cellId] || [];
    const imageData = cellImages.find(img => img.id === imageDataId);
    
    if (!imageData) return;
    
    const imageInfo = images.find(img => img.id === imageData.imageId);
    if (!imageInfo) return;

    // Recalculate position and size based on new fit mode
    const { calculateImageFit } = require('../utils/imageHelpers');
    
    // Get cell dimensions (would need to be passed from the canvas component)
    const cellWidth = 200; // Default, should be dynamic
    const cellHeight = 200; // Default, should be dynamic
    
    const fittedPosition = calculateImageFit(
      { width: imageInfo.width || 200, height: imageInfo.height || 200 },
      { width: cellWidth, height: cellHeight },
      newFitMode
    );
    
    setPages(prev => prev.map(page => 
      page.id === currentPage
        ? {
            ...page,
            cellImages: {
              ...page.cellImages,
              [cellId]: page.cellImages?.[cellId]?.map(img => 
                img.id === imageDataId
                  ? { 
                      ...img, 
                      fitMode: newFitMode,
                      width: fittedPosition.width,
                      height: fittedPosition.height,
                      x: fittedPosition.x,
                      y: fittedPosition.y
                    }
                  : img
              ) || []
            }
          }
        : page
    ));
  }, [currentPage, images, getCurrentPage]);
  // Export functionality
  const handleExportPDF = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Validate that we have pages with layouts
      const validPages = pages.filter(page => page.layout);
      if (validPages.length === 0) {
        throw new Error('Please add at least one page with a layout before exporting');
      }

      setProgress(10);

      // Import PDF creation utilities
      const { createPDFFromPages, downloadPDF } = await import('../utils/imageHelpers');
      
      setProgress(30);

      // Generate PDF with options
      const pdfOptions = {
        pageSize: { width: 595, height: 842 }, // A4 in points
        quality: 0.9
      };

      setProgress(50);

      // Create PDF from pages
      const pdfBytes = await createPDFFromPages(validPages, images, pdfOptions);
      
      setProgress(80);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `pdf-builder-${timestamp}.pdf`;

      setProgress(95);

      // Download the PDF
      downloadPDF(pdfBytes, filename);
      
      setProgress(100);

      // Show success message briefly
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('PDF Export Error:', error);
      setError('Failed to export PDF: ' + error.message);
      setIsProcessing(false);
      setProgress(0);
    }
  };
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            saveProjectToLocalStorage();
            setLastSaved(new Date());
            break;
          case 'e':
            e.preventDefault();
            if (!isProcessing) {
              handleExportPDF();
            }
            break;
          case 'n':
            e.preventDefault();
            handlePageAdd();
            break;
          case 'd':
            e.preventDefault();
            if (pages.length > 1) {
              handlePageDuplicate(currentPage);
            }
            break;
          case 'Backspace':
          case 'Delete':
            e.preventDefault();
            if (pages.length > 1) {
              handlePageDelete(currentPage);
            }
            break;
          default:
            break;
        }
      } else {
        switch (e.key) {
          case 'g':
            setShowGrid(prev => !prev);
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
            e.preventDefault();
            const layoutKeys = ['single', 'twoVertical', 'twoHorizontal', 'fourGrid', 'sixGrid', 'custom'];
            const layout = layoutKeys[parseInt(e.key) - 1];
            if (layout) {
              handleLayoutChange(layout);
            }
            break;
          case '+':
          case '=':
            e.preventDefault();
            setScale(prev => Math.min(2, prev + 0.25));
            break;
          case '-':
            e.preventDefault();
            setScale(prev => Math.max(0.25, prev - 0.25));
            break;
          case '0':
            e.preventDefault();
            setScale(1);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, saveProjectToLocalStorage, isProcessing, handleExportPDF, handlePageAdd, handlePageDuplicate, handlePageDelete, currentPage, pages.length, handleLayoutChange]);
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#151B24] text-white">
        {/* Header */}
        <header className="bg-[#1a1f2e] border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[#00A99D]">PDF Builder</h1>
              
              {/* Auto-save status */}
              {autoSaveEnabled && lastSaved && (
                <div className="text-sm text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('build')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'build'
                      ? 'bg-[#00A99D] text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Edit3 className="inline mr-2" size={16} />
                  Build
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-[#00A99D] text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Eye className="inline mr-2" size={16} />
                  Preview
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-save
              </label>

              {/* Undo/Redo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo size={16} />
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-gray-700 rounded-lg">
                <button
                  onClick={() => setScale(prev => Math.max(0.25, prev - 0.25))}
                  className="p-2 hover:bg-gray-600 rounded-l-lg"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="px-3 text-sm">{Math.round(scale * 100)}%</span>
                <button
                  onClick={() => setScale(prev => Math.min(2, prev + 0.25))}
                  className="p-2 hover:bg-gray-600 rounded-r-lg"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportPDF}
                disabled={isProcessing || pages.every(p => !p.layout)}
                className="px-4 py-2 bg-[#00A99D] hover:bg-[#008a7d] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                title="Export PDF (Ctrl+E)"
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
      <div className="max-w-7xl mx-auto p-4">
        {viewMode === 'build' ? (
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
            {/* Left Sidebar - Image Library */}
            <div className="col-span-3">
              <ImageUploadPanel
                images={images}
                onImagesAdd={handleImagesAdd}
                onImageRemove={handleImageRemove}
                onImageSelect={handleImageSelect}
                selectedImages={selectedImages}
                usedImages={usedImages}
              />
            </div>            {/* Center - Canvas */}
            <div className="col-span-6">
              <PageCanvas
                page={getCurrentPage()}
                images={images}
                scale={scale}
                showGrid={showGrid}
                editMode={editMode}
                selectedCell={selectedCell}
                onImageDrop={handleImageDrop}
                onImagePosition={handleImagePosition}
                onImageResize={handleImageResize}
                onImageRemove={handleImageRemoveFromPage}
                onImageFitModeChange={handleImageFitModeChange}
                onCellSelect={handleCellSelect}
              />
            </div>

            {/* Right Sidebar - Controls */}
            <div className="col-span-3 space-y-4">
              {/* Grid Layout Controls */}
              <GridLayoutControls
                currentPage={getCurrentPage()}
                onLayoutChange={handleLayoutChange}
                onCustomGridChange={handleCustomGridChange}
                onCellSubdivide={handleCellSubdivide}
                selectedCell={selectedCell}
              />

              {/* Page Navigator */}
              <PageNavigator
                pages={pages}
                currentPage={currentPage}
                onPageSelect={handlePageSelect}
                onPageAdd={handlePageAdd}
                onPageDuplicate={handlePageDuplicate}
                onPageDelete={handlePageDelete}                onPageReorder={handlePageReorder}
              />
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="bg-[#1a1f2e] rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-6">PDF Preview</h2>
            <div className="grid gap-6">
              {pages.map((page, index) => (
                <div key={page.id} className="bg-white rounded-lg p-4">
                  <div className="text-gray-600 mb-2">Page {index + 1}</div>
                  <div className="aspect-[3/4] bg-gray-100 rounded border">
                    {/* Preview would render the actual page content here */}
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Page {index + 1} Preview
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-40">
        <details className="bg-gray-800 rounded-lg border border-gray-600">
          <summary className="p-3 cursor-pointer text-sm text-gray-300 hover:text-white">
            Keyboard Shortcuts
          </summary>
          <div className="p-4 text-xs text-gray-400 space-y-1 border-t border-gray-600">
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Z</kbd> Undo</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+Z</kbd> Redo</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+S</kbd> Manual Save</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+E</kbd> Export PDF</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+N</kbd> New Page</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+D</kbd> Duplicate Page</div>
            <div><kbd className="bg-gray-700 px-1 rounded">G</kbd> Toggle Grid</div>
            <div><kbd className="bg-gray-700 px-1 rounded">1-6</kbd> Layout Presets</div>
            <div><kbd className="bg-gray-700 px-1 rounded">+/-</kbd> Zoom</div>
            <div><kbd className="bg-gray-700 px-1 rounded">0</kbd> Reset Zoom</div>
          </div>
        </details>
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
                <p className="text-sm text-gray-400 mt-2">{progress}% complete</p>
              </div>
            </div>          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
};

export default EnhancedPDFBuilder;
