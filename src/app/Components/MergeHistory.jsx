"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  FileText,
  Download,
  Trash2,
  Calendar,
  FolderOpen,
  X,
  RefreshCw,
} from "lucide-react";
import {
  getMergeHistory,
  clearMergeHistory,
  formatFileSize,
} from "../utils/pdfHelpers";

const MergeHistory = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    setLoading(true);
    try {
      const historyData = getMergeHistory();
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all merge history?")) {
      clearMergeHistory();
      setHistory([]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-theme-secondary rounded-2xl border border-theme-border w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}{" "}
          <div className="p-6 border-b border-theme-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {" "}
                <History className="w-6 h-6 text-theme-primary" />
                <h2 className="text-2xl font-bold text-theme-text">
                  Merge History
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {" "}
                <button
                  onClick={loadHistory}
                  className="p-2 text-theme-text-secondary hover:text-theme-primary transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Clear all history"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-theme-text-secondary hover:text-theme-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-12">
                {" "}
                <RefreshCw className="w-8 h-8 text-theme-primary mx-auto mb-4 animate-spin" />
                <p className="text-theme-text-secondary">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                {" "}
                <FolderOpen className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-text mb-2">
                  No merge history yet
                </h3>
                <p className="text-theme-text-secondary">
                  Your completed PDF merges will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-theme-background border border-theme-border rounded-xl p-4 hover:border-theme-primary-opaque-50 transition-colors"
                  >
                    {" "}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {" "}
                        <FileText className="w-8 h-8 text-theme-primary" />
                        <div>
                          <h4 className="text-theme-text font-semibold">
                            {item.fileName}.pdf
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {" "}
                      <div className="text-center p-3 bg-theme-secondary rounded-lg">
                        <div className="text-lg font-bold text-theme-primary">
                          {item.fileCount}
                        </div>
                        <div className="text-xs text-theme-text-secondary">
                          Files Merged
                        </div>
                      </div>
                      <div className="text-center p-3 bg-theme-secondary rounded-lg">
                        <div className="text-lg font-bold text-theme-primary">
                          {formatFileSize(item.totalSize)}
                        </div>
                        <div className="text-xs text-theme-text-secondary">
                          Total Size
                        </div>
                      </div>
                      <div className="text-center p-3 bg-theme-secondary rounded-lg">
                        <div className="text-lg font-bold text-theme-primary">
                          {item.files?.reduce(
                            (sum, file) => sum + (file.pages || 1),
                            0
                          ) || "N/A"}
                        </div>
                        <div className="text-xs text-theme-text-secondary">
                          Est. Pages
                        </div>
                      </div>
                    </div>{" "}
                    {/* File List */}
                    {item.files && item.files.length > 0 && (
                      <div className="border-t border-theme-border pt-3">
                        <h5 className="text-sm font-medium text-theme-text mb-2">
                          Source Files:
                        </h5>
                        <div className="space-y-1">
                          {item.files.map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="flex items-center justify-between text-xs text-theme-text-secondary bg-theme-secondary rounded px-2 py-1"
                            >
                              <span className="truncate flex-1">
                                {file.name}
                              </span>
                              <span className="ml-2 flex-shrink-0">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MergeHistory;
