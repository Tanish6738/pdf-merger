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
}) => {
  const canvasRef = useRef(null);
  const [draggedImage, setDraggedImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, imageData: null, cellId: null });
  const [showGrid, setShowGrid] = useState(false);

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

  // Render a single image within a cell
  const renderCellImage = (cellId, imageData, imageInfo) => {
    if (!imageInfo) return null;

    const cell = gridCells.find(c => c.id === cellId);
    if (!cell) return null;

    return (
      <motion.div
        key={`${cellId}_${imageData.id}`}
        className="absolute cursor-move group"
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
        whileHover={{ scale: editMode ? 1.02 : 1 }}
      >        <img
          src={imageInfo.preview}
          alt={imageInfo.name}
          className="w-full h-full object-cover rounded shadow-lg"
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
        />
        
        {editMode && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Resize handles */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00A99D] rounded-full cursor-se-resize transform translate-x-1 translate-y-1"></div>
            
            {/* Remove button */}
            <button
              onClick={() => onImageRemove(cellId, imageData.id)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <Trash2 size={12} />
            </button>

            {/* Fit mode indicator */}
            {imageData.fitMode && (
              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {imageData.fitMode}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`bg-[#1a1f2e] rounded-lg p-4 h-full flex flex-col ${className}`}>
      {/* Canvas Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Page {page?.id || 1} Canvas
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-[#00A99D]' : 'bg-gray-700'} hover:opacity-80`}
          >
            <Square size={16} />
          </button>
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
              >
                {/* Cell Label */}
                {editMode && showGrid && (
                  <div className="absolute top-1 left-1 text-xs text-gray-500 bg-white bg-opacity-80 px-1 rounded">
                    {cell.row + 1},{cell.col + 1}
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
              className="fixed z-50 bg-[#1a1f2e] border border-gray-600 rounded-lg shadow-xl py-2 min-w-[180px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
                transform: 'translate(-50%, -10px)'
              }}
            >
              <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-600 mb-1">
                Image Fit Mode
              </div>
              
              {[
                { mode: 'contain', label: 'Contain', desc: 'Fit within bounds' },
                { mode: 'cover', label: 'Cover', desc: 'Fill and crop' },
                { mode: 'fill', label: 'Fill', desc: 'Stretch to fit' },
                { mode: 'stretch', label: 'Stretch', desc: 'Stretch exactly' }
              ].map(({ mode, label, desc }) => (
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
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageCanvas;
