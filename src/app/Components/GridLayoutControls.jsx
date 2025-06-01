"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Square, 
  Columns, 
  Rows, 
  Layers, 
  Settings, 
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';

const GridLayoutControls = ({ 
  currentPage, 
  onLayoutChange, 
  onCustomGridChange,
  onCellSubdivide,
  selectedCell,
  className = ""
}) => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customGrid, setCustomGrid] = useState({ rows: 1, cols: 1 });

  // Predefined layouts
  const layouts = {
    single: { rows: 1, cols: 1, icon: Square, label: 'Single' },
    twoVertical: { rows: 2, cols: 1, icon: Rows, label: '2 Vertical' },
    twoHorizontal: { rows: 1, cols: 2, icon: Columns, label: '2 Horizontal' },
    fourGrid: { rows: 2, cols: 2, icon: Grid, label: '4 Grid' },
    sixGrid: { rows: 3, cols: 2, icon: Layers, label: '6 Grid' },
    custom: { rows: customGrid.rows, cols: customGrid.cols, icon: Settings, label: 'Custom' }
  };

  // Update custom grid when current page changes
  useEffect(() => {
    if (currentPage?.customGrid) {
      setCustomGrid(currentPage.customGrid);
    }
  }, [currentPage]);

  const handleLayoutSelect = (layoutName) => {
    const layout = layouts[layoutName];
    if (layoutName === 'custom') {
      setShowCustomizer(true);
    } else {
      onLayoutChange(layoutName, layout);
    }
  };

  const createCustomGrid = () => {
    const layout = { ...layouts.custom, rows: customGrid.rows, cols: customGrid.cols };
    onCustomGridChange(customGrid);
    onLayoutChange('custom', layout);
    setShowCustomizer(false);
  };

  const renderLayoutButton = (layoutName, layout) => {
    const IconComponent = layout.icon;
    const isActive = currentPage?.layout === layoutName;

    return (
      <motion.button
        key={layoutName}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleLayoutSelect(layoutName)}
        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 min-w-[80px] ${
          isActive
            ? 'bg-[#00A99D] border-[#00A99D] text-white'
            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
        }`}
      >
        <IconComponent size={20} />
        <span className="text-xs font-medium">{layout.label}</span>
        {layoutName === 'custom' && currentPage?.customGrid && (
          <span className="text-xs opacity-75">
            {currentPage.customGrid.rows}×{currentPage.customGrid.cols}
          </span>
        )}
      </motion.button>
    );
  };

  const CustomGridModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 p-6 rounded-lg w-96 max-w-[90vw]"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Custom Grid Layout</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Rows (1-7)</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomGrid(prev => ({ 
                  ...prev, 
                  rows: Math.max(1, prev.rows - 1) 
                }))}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max="7"
                value={customGrid.rows}
                onChange={(e) => setCustomGrid(prev => ({ 
                  ...prev, 
                  rows: Math.min(7, Math.max(1, parseInt(e.target.value) || 1))
                }))}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-center"
              />
              <button
                onClick={() => setCustomGrid(prev => ({ 
                  ...prev, 
                  rows: Math.min(7, prev.rows + 1) 
                }))}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Columns (1-4)</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCustomGrid(prev => ({ 
                  ...prev, 
                  cols: Math.max(1, prev.cols - 1) 
                }))}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min="1"
                max="4"
                value={customGrid.cols}
                onChange={(e) => setCustomGrid(prev => ({ 
                  ...prev, 
                  cols: Math.min(4, Math.max(1, parseInt(e.target.value) || 1))
                }))}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-center"
              />
              <button
                onClick={() => setCustomGrid(prev => ({ 
                  ...prev, 
                  cols: Math.min(4, prev.cols + 1) 
                }))}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Grid Preview */}
          <div className="mt-4">
            <label className="block text-gray-300 mb-2">Preview</label>
            <div 
              className="bg-gray-700 rounded p-4 grid gap-1"
              style={{
                gridTemplateRows: `repeat(${customGrid.rows}, 1fr)`,
                gridTemplateColumns: `repeat(${customGrid.cols}, 1fr)`,
                aspectRatio: customGrid.cols / customGrid.rows,
                maxHeight: '120px'
              }}
            >
              {Array.from({ length: customGrid.rows * customGrid.cols }, (_, i) => (
                <div key={i} className="bg-gray-600 rounded aspect-square"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowCustomizer(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={createCustomGrid}
            className="px-4 py-2 bg-[#00A99D] hover:bg-[#008a7d] text-white rounded-lg"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <div className={`bg-[#1a1f2e] rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Grid className="mr-2" size={20} />
          Grid Layout
        </h3>

        {/* Layout Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {Object.entries(layouts).map(([layoutName, layout]) =>
            renderLayoutButton(layoutName, layout)
          )}
        </div>

        {/* Cell Subdivision Controls */}
        {selectedCell && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <Layers className="mr-2" size={16} />
              Subdivide Selected Cell
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCellSubdivide(selectedCell.id, { rows: 2, cols: 1 })}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                Split Vertical
              </button>
              <button
                onClick={() => onCellSubdivide(selectedCell.id, { rows: 1, cols: 2 })}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                Split Horizontal
              </button>
              <button
                onClick={() => onCellSubdivide(selectedCell.id, { rows: 2, cols: 2 })}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                2×2 Grid
              </button>
              <button
                onClick={() => onCellSubdivide(selectedCell.id, { rows: 1, cols: 1 })}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center justify-center"
              >
                <RotateCcw size={14} className="mr-1" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Current Page Info */}
        {currentPage && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              <div className="flex justify-between mb-1">
                <span>Current Layout:</span>
                <span className="text-white capitalize">
                  {currentPage.layout || 'None'}
                </span>
              </div>
              {currentPage.layout && (
                <div className="flex justify-between">
                  <span>Grid Size:</span>
                  <span className="text-white">
                    {currentPage.layout === 'custom' 
                      ? `${currentPage.customGrid?.rows || 1}×${currentPage.customGrid?.cols || 1}`
                      : `${layouts[currentPage.layout]?.rows || 1}×${layouts[currentPage.layout]?.cols || 1}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Grid Modal */}
      {showCustomizer && <CustomGridModal />}
    </>
  );
};

export default GridLayoutControls;
