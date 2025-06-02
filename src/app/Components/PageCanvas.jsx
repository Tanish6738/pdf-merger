"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Move, 
  RotateCw, 
  Trash2, 
  ZoomIn, 
  ZoomOut,
  Square,
  Circle,
  Settings
} from 'lucide-react';

const PageCanvas = ({ 
  page, 
  onImageDrop, 
  onImagePosition, 
  onImageResize,
  onImageRemove,
  onCellSelect,
  onImageFitModeChange,
  selectedCell,
  images = [],
  className = "",
  scale = 1,
  editMode = true
}) => {  const canvasRef = useRef(null);
  const [draggedImage, setDraggedImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, imageData: null, cellId: null });
  const [showGrid, setShowGrid] = useState(false);
  const [currentPage, setCurrentPage] = useState(page?.id);

  // Standard page dimensions (A4 ratio)
  const PAGE_RATIO = 210 / 297; // A4 width/height ratio
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = BASE_WIDTH / PAGE_RATIO;

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        const containerWidth = container.clientWidth - 32; // Account for padding
        const containerHeight = container.clientHeight - 32;
        
        let width = Math.min(containerWidth, BASE_WIDTH);
        let height = width / PAGE_RATIO;
        
        if (height > containerHeight) {
          height = containerHeight;
          width = height * PAGE_RATIO;
        }
        
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Generate grid cells based on page layout
  const generateGridCells = () => {
    if (!page?.layout) return [];

    const layouts = {
      single: { rows: 1, cols: 1 },
      twoVertical: { rows: 2, cols: 1 },
      twoHorizontal: { rows: 1, cols: 2 },
      fourGrid: { rows: 2, cols: 2 },
      sixGrid: { rows: 3, cols: 2 },
      custom: page.customGrid || { rows: 1, cols: 1 }
    };

    const layout = layouts[page.layout] || layouts.single;
    const cells = [];
    
    const cellWidth = canvasSize.width / layout.cols;
    const cellHeight = canvasSize.height / layout.rows;

    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const cellId = `cell_${row}_${col}`;
        cells.push({
          id: cellId,
          row,
          col,
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
          images: page.cellImages?.[cellId] || []
        });
      }
    }

    return cells;
  };

  const gridCells = generateGridCells();

  // Handle drop events
  const handleDrop = (e) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'image') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find which cell this drop occurred in
        const targetCell = gridCells.find(cell => 
          x >= cell.x && x <= cell.x + cell.width &&
          y >= cell.y && y <= cell.y + cell.height
        );

        if (targetCell) {
          onImageDrop(data.imageId, targetCell.id, {
            x: x - targetCell.x,
            y: y - targetCell.y,
            width: 100,
            height: 100
          });
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle cell selection
  const handleCellClick = (cell) => {
    if (editMode) {
      onCellSelect(cell);
    }
  };
  // Get image style based on fit mode
  const getImageStyle = (imageData, imageInfo, cell) => {
    const fitMode = imageData.fitMode || 'contain';
    const containerAspect = cell.width / cell.height;
    const imageAspect = (imageInfo.dimensions?.width || imageData.width) / (imageInfo.dimensions?.height || imageData.height);

    let objectFit = 'contain';
    let objectPosition = 'center';

    switch (fitMode) {
      case 'cover':
        objectFit = 'cover';
        break;
      case 'fill':
        objectFit = 'fill';
        break;
      case 'stretch':
        objectFit = 'fill';
        break;
      case 'contain':
      default:
        objectFit = 'contain';
        break;
    }

    return {
      objectFit,
      objectPosition,
      width: '100%',
      height: '100%'
    };
  };
  // Handle resize drag
  const handleResizeDrag = (cellId, imageDataId, direction, offset) => {
    const cell = gridCells.find(c => c.id === cellId);
    if (!cell) return;

    const currentImageData = page.cellImages?.[cellId]?.find(img => img.id === imageDataId);
    if (!currentImageData) return;

    let newWidth = currentImageData.width;
    let newHeight = currentImageData.height;
    let newX = currentImageData.x;
    let newY = currentImageData.y;

    switch (direction) {
      case 'se': // Bottom-right
        newWidth = Math.max(50, Math.min(cell.width - currentImageData.x, currentImageData.width + offset.x));
        newHeight = Math.max(50, Math.min(cell.height - currentImageData.y, currentImageData.height + offset.y));
        break;
      case 'sw': // Bottom-left
        newWidth = Math.max(50, currentImageData.width - offset.x);
        newHeight = Math.max(50, Math.min(cell.height - currentImageData.y, currentImageData.height + offset.y));
        newX = Math.max(0, currentImageData.x + offset.x);
        break;
      case 'ne': // Top-right
        newWidth = Math.max(50, Math.min(cell.width - currentImageData.x, currentImageData.width + offset.x));
        newHeight = Math.max(50, currentImageData.height - offset.y);
        newY = Math.max(0, currentImageData.y + offset.y);
        break;
      case 'nw': // Top-left
        newWidth = Math.max(50, currentImageData.width - offset.x);
        newHeight = Math.max(50, currentImageData.height - offset.y);
        newX = Math.max(0, currentImageData.x + offset.x);
        newY = Math.max(0, currentImageData.y + offset.y);
        break;
    }

    // Update position using the callback
    onImagePosition(cellId, imageDataId, { x: newX, y: newY });
    // Update size using the callback
    onImageResize(cellId, imageDataId, { width: newWidth, height: newHeight });
  };

  // Render a single image within a cell
  const renderCellImage = (cellId, imageData, imageInfo) => {
    if (!imageInfo) return null;

    const cell = gridCells.find(c => c.id === cellId);
    if (!cell) return null;

    const imageStyle = getImageStyle(imageData, imageInfo, cell);

    return (
      <motion.div
        key={`${cellId}_${imageData.id}`}
        className="absolute cursor-move group border-2 border-transparent hover:border-[#00A99D] transition-colors"
        style={{
          left: cell.x + imageData.x,
          top: cell.y + imageData.y,
          width: imageData.width,
          height: imageData.height,
          zIndex: 10
        }}
        drag={editMode}
        dragMomentum={false}
        onDragEnd={(e, info) => {
          const newX = Math.max(0, Math.min(cell.width - imageData.width, imageData.x + info.offset.x));
          const newY = Math.max(0, Math.min(cell.height - imageData.height, imageData.y + info.offset.y));
          
          onImagePosition(cellId, imageData.id, { x: newX, y: newY });
        }}
        whileHover={{ scale: editMode ? 1.01 : 1 }}
      >        <img
          src={imageInfo.preview}
          alt={imageInfo.name}
          style={imageStyle}
          className="rounded shadow-lg pointer-events-none"
          draggable={false}
          onContextMenu={(e) => {
            e.preventDefault();
            if (editMode && onImageFitModeChange) {
              setContextMenu({
                show: true,
                x: e.clientX,
                y: e.clientY,
                imageData,
                cellId
              });
            }
          }}
          onDoubleClick={() => handleImageDoubleClick(cellId, imageData.id)}
        />
        
        {editMode && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Corner resize handles */}
            <motion.div
              className="absolute -top-1 -left-1 w-3 h-3 bg-[#00A99D] rounded-full cursor-nw-resize border-2 border-white"
              drag
              dragMomentum={false}
              onDrag={(e, info) => handleResizeDrag(cellId, imageData.id, 'nw', info.offset)}
              title="Resize from top-left"
            />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-[#00A99D] rounded-full cursor-ne-resize border-2 border-white"
              drag
              dragMomentum={false}
              onDrag={(e, info) => handleResizeDrag(cellId, imageData.id, 'ne', info.offset)}
              title="Resize from top-right"
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00A99D] rounded-full cursor-sw-resize border-2 border-white"
              drag
              dragMomentum={false}
              onDrag={(e, info) => handleResizeDrag(cellId, imageData.id, 'sw', info.offset)}
              title="Resize from bottom-left"
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00A99D] rounded-full cursor-se-resize border-2 border-white"
              drag
              dragMomentum={false}
              onDrag={(e, info) => handleResizeDrag(cellId, imageData.id, 'se', info.offset)}
              title="Resize from bottom-right"
            />

            {/* Quick fit buttons */}
            <div className="absolute -top-8 left-0 flex gap-1 bg-black bg-opacity-75 rounded px-2 py-1">
              <button
                onClick={() => onImageFitModeChange && onImageFitModeChange(cellId, imageData.id, 'contain')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  imageData.fitMode === 'contain' ? 'bg-[#00A99D] text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title="Fit to contain"
              >
                Fit
              </button>
              <button
                onClick={() => onImageFitModeChange && onImageFitModeChange(cellId, imageData.id, 'cover')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  imageData.fitMode === 'cover' ? 'bg-[#00A99D] text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title="Cover cell"
              >
                Cover
              </button>
              <button
                onClick={() => onImageFitModeChange && onImageFitModeChange(cellId, imageData.id, 'fill')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  imageData.fitMode === 'fill' ? 'bg-[#00A99D] text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title="Fill cell exactly"
              >
                Fill
              </button>
            </div>
            
            {/* Remove button */}
            <button
              onClick={() => onImageRemove(cellId, imageData.id)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
              title="Remove image"
            >
              <Trash2 size={12} />
            </button>

            {/* Fit mode indicator */}
            {imageData.fitMode && (
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {imageData.fitMode.toUpperCase()}
              </div>
            )}

            {/* Size display */}
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {Math.round(imageData.width)}×{Math.round(imageData.height)}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Keyboard shortcuts for image manipulation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editMode || !selectedCell) return;

      // Get images in selected cell
      const cellImages = page.cellImages?.[selectedCell.id] || [];
      if (cellImages.length === 0) return;

      const lastImage = cellImages[cellImages.length - 1]; // Work with the last added image

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          if (lastImage && onImageRemove) {
            onImageRemove(selectedCell.id, lastImage.id);
          }
          break;
        case '1':
          e.preventDefault();
          if (lastImage && onImageFitModeChange) {
            onImageFitModeChange(selectedCell.id, lastImage.id, 'contain');
          }
          break;
        case '2':
          e.preventDefault();
          if (lastImage && onImageFitModeChange) {
            onImageFitModeChange(selectedCell.id, lastImage.id, 'cover');
          }
          break;
        case '3':
          e.preventDefault();
          if (lastImage && onImageFitModeChange) {
            onImageFitModeChange(selectedCell.id, lastImage.id, 'fill');
          }
          break;
        case '4':
          e.preventDefault();
          if (lastImage && onImageFitModeChange) {
            onImageFitModeChange(selectedCell.id, lastImage.id, 'original');
          }
          break;        case 'g':
        case 'G':
          e.preventDefault();
          setShowGrid(prev => !prev);
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Center image in cell
            const cell = gridCells.find(c => c.id === selectedCell.id);
            if (cell && lastImage && onImagePosition) {
              const centerX = (cell.width - lastImage.width) / 2;
              const centerY = (cell.height - lastImage.height) / 2;
              onImagePosition(selectedCell.id, lastImage.id, { x: centerX, y: centerY });
            }
          }
          break;
      }
    };

    if (editMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editMode, selectedCell, page.cellImages, gridCells, onImageRemove, onImageFitModeChange, onImagePosition]);

  // Double-click to fit image to cell
  const handleImageDoubleClick = (cellId, imageDataId) => {
    if (onImageFitModeChange) {
      const currentImage = page.cellImages?.[cellId]?.find(img => img.id === imageDataId);
      // Cycle through fit modes on double-click
      const modes = ['contain', 'cover', 'fill', 'original'];
      const currentIndex = modes.indexOf(currentImage?.fitMode || 'contain');
      const nextMode = modes[(currentIndex + 1) % modes.length];
      onImageFitModeChange(cellId, imageDataId, nextMode);
    }
  };

  return (
    <div className={`bg-[#1a1f2e] rounded-lg p-4 h-full flex flex-col ${className}`}>      {/* Canvas Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Page {page?.id || 1} Canvas
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-[#00A99D]' : 'bg-gray-700'} hover:opacity-80`}
            title="Toggle grid (G)"
          >
            <Square size={16} />
          </button>
          {editMode && (
            <button
              className="p-2 rounded bg-gray-700 hover:opacity-80 text-gray-300"
              title="Keyboard shortcuts: 1-4 for fit modes, Delete to remove, Ctrl+C to center, Double-click to cycle fit modes"
            >
              <Settings size={16} />
            </button>
          )}
          <div className="text-sm text-gray-400">
            {Math.round(scale * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center h-full">
          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-lg"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Grid Lines */}
            {showGrid && editMode && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height="100%"
              >
                {gridCells.map((cell) => (
                  <rect
                    key={cell.id}
                    x={cell.x}
                    y={cell.y}
                    width={cell.width}
                    height={cell.height}
                    fill="none"
                    stroke="#00A99D"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.3"
                  />
                ))}
              </svg>
            )}

            {/* Grid Cells */}
            {gridCells.map((cell) => (
              <div
                key={cell.id}
                className={`absolute cursor-pointer transition-colors ${
                  selectedCell?.id === cell.id
                    ? 'bg-[#00A99D] bg-opacity-20'
                    : editMode
                    ? 'hover:bg-gray-100 hover:bg-opacity-10'
                    : ''
                }`}
                style={{
                  left: cell.x,
                  top: cell.y,
                  width: cell.width,
                  height: cell.height
                }}
                onClick={() => handleCellClick(cell)}
              >                {/* Cell Label */}
                {editMode && showGrid && (
                  <div className="absolute top-1 left-1 text-xs text-gray-500 bg-white bg-opacity-80 px-1 rounded">
                    {cell.row + 1},{cell.col + 1}
                  </div>
                )}

                {/* Selected cell keyboard shortcuts hint */}
                {editMode && selectedCell?.id === cell.id && cell.images?.length > 0 && (
                  <div className="absolute top-1 right-1 text-xs text-[#00A99D] bg-black bg-opacity-75 px-2 py-1 rounded">
                    1-4: Fit modes • Del: Remove • Ctrl+C: Center
                  </div>
                )}

                {/* Render images in this cell */}
                {page.cellImages?.[cell.id]?.map((imageData) => {
                  const imageInfo = images.find(img => img.id === imageData.imageId);
                  return renderCellImage(cell.id, imageData, imageInfo);
                })}
              </div>
            ))}

            {/* Drop Zone Indicator */}
            <AnimatePresence>
              {draggedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#00A99D] bg-opacity-20 border-2 border-dashed border-[#00A99D] rounded-lg flex items-center justify-center"
                >
                  <div className="text-[#00A99D] font-medium">
                    Drop image here
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>      {/* Canvas Info */}
      <div className="mt-4 text-sm text-gray-400 flex justify-between">
        <div>
          Layout: <span className="text-white capitalize">{page?.layout || 'None'}</span>
        </div>
        <div>
          Size: <span className="text-white">{canvasSize.width} × {canvasSize.height}</span>
        </div>
      </div>

      {/* Context Menu for Image Fit Modes */}
      <AnimatePresence>
        {contextMenu.show && (
          <>
            {/* Backdrop to close context menu */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu({ ...contextMenu, show: false })}
            />
              {/* Context Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 bg-[#1a1f2e] border border-gray-600 rounded-lg shadow-xl py-2 min-w-[200px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
                transform: 'translate(-50%, -10px)'
              }}
            >
              <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-600 mb-1">
                Image Resize Options
              </div>
              
              {[
                { mode: 'contain', label: 'Fit to Contain', desc: 'Maintain aspect ratio, fit within bounds', icon: '📦' },
                { mode: 'cover', label: 'Cover Cell', desc: 'Fill cell completely, may crop image', icon: '🔳' },
                { mode: 'fill', label: 'Fill Cell', desc: 'Stretch to fill exactly, may distort', icon: '📐' },
                { mode: 'stretch', label: 'Free Stretch', desc: 'Allow manual resizing', icon: '↗️' },
                { mode: 'original', label: 'Original Size', desc: 'Use original image dimensions', icon: '🔍' }
              ].map(({ mode, label, desc, icon }) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (onImageFitModeChange && contextMenu.imageData && contextMenu.cellId) {
                      onImageFitModeChange(contextMenu.cellId, contextMenu.imageData.id, mode);
                    }
                    setContextMenu({ ...contextMenu, show: false });
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
                    contextMenu.imageData?.fitMode === mode ? 'bg-[#00A99D] text-white' : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                    {contextMenu.imageData?.fitMode === mode && (
                      <div className="w-2 h-2 bg-[#00A99D] rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
              
              <div className="border-t border-gray-600 mt-2 pt-2">
                <button
                  onClick={() => {
                    if (contextMenu.imageData && contextMenu.cellId) {
                      // Reset to center position
                      const cell = gridCells.find(c => c.id === contextMenu.cellId);
                      if (cell && onImagePosition) {
                        const centerX = (cell.width - contextMenu.imageData.width) / 2;
                        const centerY = (cell.height - contextMenu.imageData.height) / 2;
                        onImagePosition(contextMenu.cellId, contextMenu.imageData.id, { x: centerX, y: centerY });
                      }
                    }
                    setContextMenu({ ...contextMenu, show: false });
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <div className="text-sm">Center in Cell</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    if (contextMenu.imageData && contextMenu.cellId && onImageRemove) {
                      onImageRemove(contextMenu.cellId, contextMenu.imageData.id);
                    }
                    setContextMenu({ ...contextMenu, show: false });
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-red-600 transition-colors text-red-400"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={14} />
                    <div className="text-sm">Remove Image</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageCanvas;
