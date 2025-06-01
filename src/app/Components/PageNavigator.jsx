"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  Edit3, 
  MoreVertical,
  FileImage,
  Grid,
  Move
} from 'lucide-react';

const PageNavigator = ({ 
  pages, 
  currentPage, 
  onPageSelect, 
  onPageAdd, 
  onPageDuplicate, 
  onPageDelete,
  onPageReorder,
  className = ""
}) => {
  const [draggedPage, setDraggedPage] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [showPageMenu, setShowPageMenu] = useState(null);
  
  const menuRef = useRef(null);

  // Handle page drag start
  const handleDragStart = (e, page, index) => {
    setDraggedPage({ page, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  // Handle drop
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedPage && draggedPage.index !== targetIndex) {
      onPageReorder(draggedPage.index, targetIndex);
    }
    
    setDraggedPage(null);
    setDropTargetIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedPage(null);
    setDropTargetIndex(null);
  };

  // Get layout icon based on page layout
  const getLayoutIcon = (page) => {
    const layouts = {
      single: '◻',
      twoVertical: '⬜',
      twoHorizontal: '▬',
      fourGrid: '⊞',
      sixGrid: '⊠',
      custom: '⚏'
    };
    
    return layouts[page.layout] || '◻';
  };

  // Get layout description
  const getLayoutDescription = (page) => {
    if (!page.layout) return 'No layout';
    
    const layouts = {
      single: '1×1',
      twoVertical: '2×1',
      twoHorizontal: '1×2',
      fourGrid: '2×2',
      sixGrid: '3×2',
      custom: `${page.customGrid?.rows || 1}×${page.customGrid?.cols || 1}`
    };
    
    return layouts[page.layout] || '1×1';
  };

  // Count images in page
  const getImageCount = (page) => {
    if (!page.cellImages) return 0;
    
    return Object.values(page.cellImages).reduce((total, cellImages) => 
      total + cellImages.length, 0
    );
  };

  // Page context menu
  const PageMenu = ({ page, index, onClose }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-[160px]"
      ref={menuRef}
    >
      <div className="py-1">
        <button
          onClick={() => {
            onPageDuplicate(page.id);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
        >
          <Copy size={14} />
          Duplicate
        </button>
        
        <button
          onClick={() => {
            const newPageId = Date.now();
            onPageAdd(index + 1, {
              id: newPageId,
              layout: null,
              customGrid: { rows: 1, cols: 1 },
              cellImages: {},
              createdAt: new Date().toISOString()
            });
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
        >
          <Plus size={14} />
          Insert After
        </button>
        
        <div className="border-t border-gray-600 my-1"></div>
        
        <button
          onClick={() => {
            if (pages.length > 1) {
              onPageDelete(page.id);
            }
            onClose();
          }}
          disabled={pages.length <= 1}
          className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
            pages.length <= 1 
              ? 'text-gray-500 cursor-not-allowed' 
              : 'text-red-400 hover:bg-gray-700'
          }`}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`bg-[#1a1f2e] rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FileImage className="mr-2" size={20} />
          Pages
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => onPageAdd()}
            className="p-2 bg-[#00A99D] hover:bg-[#008a7d] text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        <AnimatePresence>
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`relative group cursor-pointer transition-all ${
                dropTargetIndex === index ? 'transform translate-y-1' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, page, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drop indicator */}
              {dropTargetIndex === index && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-[#00A99D] rounded"></div>
              )}
              
              <div
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentPage === page.id
                    ? 'bg-[#00A99D] bg-opacity-20 border-[#00A99D]'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => onPageSelect(page.id)}
              >
                {/* Page Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Move className="text-gray-400 cursor-grab" size={14} />
                    <span className="text-white font-medium">Page {page.id}</span>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPageMenu(showPageMenu === page.id ? null : page.id);
                      }}
                      className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical size={14} />
                    </button>
                    
                    {showPageMenu === page.id && (
                      <PageMenu
                        page={page}
                        index={index}
                        onClose={() => setShowPageMenu(null)}
                      />
                    )}
                  </div>
                </div>

                {/* Page Preview */}
                <div className="bg-white rounded mb-2 aspect-[3/4] relative overflow-hidden">
                  {/* Miniature grid representation */}
                  {page.layout && (
                    <div className="absolute inset-1">
                      <div 
                        className="w-full h-full grid gap-0.5"
                        style={{
                          gridTemplateRows: page.layout === 'custom' 
                            ? `repeat(${page.customGrid?.rows || 1}, 1fr)` 
                            : getGridTemplate(page.layout).rows,
                          gridTemplateColumns: page.layout === 'custom'
                            ? `repeat(${page.customGrid?.cols || 1}, 1fr)`
                            : getGridTemplate(page.layout).cols
                        }}
                      >
                        {Array.from({ 
                          length: page.layout === 'custom' 
                            ? (page.customGrid?.rows || 1) * (page.customGrid?.cols || 1)
                            : getGridCellCount(page.layout)
                        }, (_, i) => (
                          <div key={i} className="bg-gray-200 rounded-sm relative">
                            {/* Show if cell has images */}
                            {getCellHasImages(page, i) && (
                              <div className="absolute inset-0.5 bg-[#00A99D] bg-opacity-30 rounded-sm"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!page.layout && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      No Layout
                    </div>
                  )}
                </div>

                {/* Page Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Layout:</span>
                    <span className="text-white flex items-center gap-1">
                      <span>{getLayoutIcon(page)}</span>
                      {getLayoutDescription(page)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Images:</span>
                    <span className="text-white">{getImageCount(page)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Page Button */}
      <button
        onClick={() => onPageAdd()}
        className="w-full mt-4 p-3 border-2 border-dashed border-gray-600 hover:border-[#00A99D] text-gray-400 hover:text-[#00A99D] rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add New Page
      </button>
    </div>
  );
};

// Helper functions
const getGridTemplate = (layout) => {
  const templates = {
    single: { rows: 'repeat(1, 1fr)', cols: 'repeat(1, 1fr)' },
    twoVertical: { rows: 'repeat(2, 1fr)', cols: 'repeat(1, 1fr)' },
    twoHorizontal: { rows: 'repeat(1, 1fr)', cols: 'repeat(2, 1fr)' },
    fourGrid: { rows: 'repeat(2, 1fr)', cols: 'repeat(2, 1fr)' },
    sixGrid: { rows: 'repeat(3, 1fr)', cols: 'repeat(2, 1fr)' },
  };
  
  return templates[layout] || templates.single;
};

const getGridCellCount = (layout) => {
  const counts = {
    single: 1,
    twoVertical: 2,
    twoHorizontal: 2,
    fourGrid: 4,
    sixGrid: 6,
  };
  
  return counts[layout] || 1;
};

const getCellHasImages = (page, cellIndex) => {
  if (!page.cellImages) return false;
  
  const cellId = `cell_${Math.floor(cellIndex / getCellCols(page.layout))}_${cellIndex % getCellCols(page.layout)}`;
  return page.cellImages[cellId] && page.cellImages[cellId].length > 0;
};

const getCellCols = (layout) => {
  const cols = {
    single: 1,
    twoVertical: 1,
    twoHorizontal: 2,
    fourGrid: 2,
    sixGrid: 2,
  };
  
  return cols[layout] || 1;
};

export default PageNavigator;
