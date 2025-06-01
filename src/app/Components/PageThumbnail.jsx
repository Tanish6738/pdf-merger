"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import {
  FileText,
  Trash2,
  GripVertical,
  Eye,
  CheckCircle,
  Circle
} from 'lucide-react';

const PageThumbnail = ({ 
  page, 
  index, 
  total, 
  onRemove, 
  onPreview,
  onToggleSelection,
  isDragMode = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        page.isSelected
          ? 'border-[#00A99D] bg-[#00A99D]/10'
          : 'border-[#A0AEC0]/20 hover:border-[#00A99D]/50'
      } ${isDragging ? 'shadow-2xl z-10' : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Page Thumbnail */}
      <div className="aspect-[3/4] bg-[#1B212C] flex items-center justify-center">
        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt={`${page.fileName} - Page ${page.pageNumber}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-[#A0AEC0] text-center">
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">Page {page.pageNumber}</p>
          </div>
        )}
      </div>

      {/* Selection Overlay */}
      <div className={`absolute inset-0 transition-opacity ${
        page.isSelected ? 'bg-[#00A99D]/20' : 'bg-transparent'
      }`} />

      {/* Drag Handle */}
      {isDragMode && (
        <div
          className="absolute top-2 left-2 p-1 bg-black/70 text-white rounded cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Selection Indicator */}
      <button
        className="absolute top-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelection(page.id);
        }}
      >
        {page.isSelected ? (
          <CheckCircle className="w-5 h-5 text-[#00A99D]" />
        ) : (
          <Circle className="w-5 h-5 text-[#A0AEC0] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Control Buttons */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            className="p-1 bg-black/70 text-white rounded hover:bg-black/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(page);
            }}
            title="Preview page"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            className="p-1 bg-red-500/70 text-white rounded hover:bg-red-500/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(page.id);
            }}
            title="Remove page"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
        
        {/* Position Indicator */}
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          {index + 1}/{total}
        </div>
      </div>

      {/* Page Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs truncate">
          {page.fileName} - Page {page.pageNumber}
        </p>
      </div>
    </motion.div>
  );
};

export default PageThumbnail;
