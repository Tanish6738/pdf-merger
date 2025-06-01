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
  ArrowUp,
  ArrowDown,
  GripVertical,
  AlertTriangle,
  CheckCircle,
  FileX,
  Eye
} from 'lucide-react';
import { formatFileSize } from '../utils/pdfHelpers';

const SortableFileItem = ({ file, index, total, onRemove, onMoveUp, onMoveDown, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getFileIcon = () => {
    if (!file.isValid) {
      return <FileX className="w-8 h-8 text-red-400" />;
    }
    return <FileText className="w-8 h-8 text-[#00A99D]" />;
  };

  const getStatusIcon = () => {
    if (!file.isValid) {
      return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-[#1B212C] border rounded-xl p-4 transition-all duration-200 ${
        isDragging 
          ? 'border-[#00A99D] shadow-lg z-10 rotate-1' 
          : file.isValid 
            ? 'border-[#A0AEC0]/20 hover:border-[#00A99D]/50' 
            : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#A0AEC0] hover:text-[#00A99D] transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* File Icon */}
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-[#E1E6EB] font-medium truncate">
              {file.name}
            </h4>
            {getStatusIcon()}
          </div>          <div className="flex items-center gap-4 text-sm text-[#A0AEC0]">
            <span>{formatFileSize(file.size)}</span>
            <span>Page {index + 1} of {total}</span>
            {file.pages > 0 && <span>{file.pages} pages</span>}
            {file.pages === 0 && <span className="text-yellow-400">Analyzing...</span>}
            {file.isValid && file.pages > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(file);
                }}
                className="flex items-center gap-1 text-[#00A99D] hover:text-[#00A99D]/80 transition-colors"
                title="Preview pages"
              >
                <Eye className="w-3 h-3" />
                <span className="text-xs">Preview</span>
              </button>
            )}
          </div>

          {/* Error Messages */}
          {!file.isValid && file.errors && file.errors.length > 0 && (
            <div className="mt-2">
              {file.errors.map((error, idx) => (
                <div key={idx} className="text-red-400 text-xs">
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Controls */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Position Indicator */}
          <div className="bg-[#00A99D]/20 text-[#00A99D] px-2 py-1 rounded text-sm font-medium">
            #{index + 1}
          </div>

          {/* Move Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className={`p-1 rounded transition-colors ${
                index === 0
                  ? 'text-[#A0AEC0]/30 cursor-not-allowed'
                  : 'text-[#A0AEC0] hover:text-[#00A99D]'
              }`}
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className={`p-1 rounded transition-colors ${
                index === total - 1
                  ? 'text-[#A0AEC0]/30 cursor-not-allowed'
                  : 'text-[#A0AEC0] hover:text-[#00A99D]'
              }`}
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(file.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#00A99D]/10 border-2 border-[#00A99D] rounded-xl pointer-events-none" />
      )}
    </motion.div>
  );
};

export default SortableFileItem;
