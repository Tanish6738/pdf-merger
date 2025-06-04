"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudDriveIcon,
  Folder,
  File,
  Upload,
  Download,
  Trash2,
  Share2,
  Lock,
  Unlock,
  Settings,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Eye,
  Edit3,
  Copy,
  ExternalLink,
} from "lucide-react";

// Mock cloud providers (in real app, these would connect to actual APIs)
const CLOUD_PROVIDERS = {
  GOOGLE_DRIVE: {
    id: "google_drive",
    name: "Google Drive",
    icon: "📁",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    connected: false,
  },
  DROPBOX: {
    id: "dropbox",
    name: "Dropbox",
    icon: "📦",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    connected: false,
  },
  ONEDRIVE: {
    id: "onedrive",
    name: "OneDrive",
    icon: "☁️",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    connected: false,
  },
  ICLOUD: {
    id: "icloud",
    name: "iCloud",
    icon: "🍎",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    connected: false,
  },
};

const CloudIntegration = ({ onNavigate }) => {
  const [connectedProviders, setConnectedProviders] = useState({});
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [cloudFiles, setCloudFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [uploadProgress, setUploadProgress] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingUploads, setPendingUploads] = useState([]);

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    }
  };

  // Mock cloud files data
  const mockCloudFiles = {
    google_drive: [
      {
        id: "gd_1",
        name: "Project Documents",
        type: "folder",
        size: null,
        modified: "2024-01-15T10:30:00Z",
        shared: false,
        owner: "me",
      },
      {
        id: "gd_2",
        name: "Annual Report 2024.pdf",
        type: "file",
        size: 2456789,
        modified: "2024-01-14T14:22:00Z",
        shared: true,
        owner: "me",
      },
      {
        id: "gd_3",
        name: "Presentation Slides.pdf",
        type: "file",
        size: 5432100,
        modified: "2024-01-13T09:15:00Z",
        shared: false,
        owner: "me",
      },
    ],
    dropbox: [
      {
        id: "db_1",
        name: "Contracts",
        type: "folder",
        size: null,
        modified: "2024-01-12T11:45:00Z",
        shared: true,
        owner: "me",
      },
      {
        id: "db_2",
        name: "Invoice_Template.pdf",
        type: "file",
        size: 876543,
        modified: "2024-01-11T16:30:00Z",
        shared: false,
        owner: "shared",
      },
    ],
    onedrive: [
      {
        id: "od_1",
        name: "Meeting Notes.pdf",
        type: "file",
        size: 1234567,
        modified: "2024-01-10T13:20:00Z",
        shared: false,
        owner: "me",
      },
    ],
  };

  // Connect to cloud provider
  const connectProvider = async (providerId) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API connection
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnectedProviders((prev) => ({
        ...prev,
        [providerId]: {
          ...CLOUD_PROVIDERS[providerId.toUpperCase()],
          connected: true,
          connectedAt: new Date().toISOString(),
        },
      }));

      // Load files for this provider
      if (mockCloudFiles[providerId]) {
        setCloudFiles(mockCloudFiles[providerId]);
        setSelectedProvider(providerId);
      }
    } catch (error) {
      setError(
        `Failed to connect to ${CLOUD_PROVIDERS[providerId.toUpperCase()]?.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect provider
  const disconnectProvider = (providerId) => {
    setConnectedProviders((prev) => {
      const updated = { ...prev };
      delete updated[providerId];
      return updated;
    });

    if (selectedProvider === providerId) {
      setSelectedProvider(null);
      setCloudFiles([]);
    }
  };

  // Load files from provider
  const loadProviderFiles = (providerId) => {
    setIsLoading(true);
    setSelectedProvider(providerId);

    setTimeout(() => {
      setCloudFiles(mockCloudFiles[providerId] || []);
      setIsLoading(false);
    }, 1000);
  };

  // Upload files to cloud
  const uploadToCloud = async (files) => {
    if (!selectedProvider) return;

    const uploads = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    }));

    setPendingUploads(uploads);
    setShowUploadModal(true);

    // Simulate upload progress
    for (const upload of uploads) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        setPendingUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
        );
      }

      // Mark as completed
      setPendingUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id ? { ...u, status: "completed" } : u
        )
      );

      // Add to cloud files
      const newFile = {
        id: `${selectedProvider}_${Date.now()}`,
        name: upload.name,
        type: "file",
        size: upload.size,
        modified: new Date().toISOString(),
        shared: false,
        owner: "me",
      };

      setCloudFiles((prev) => [...prev, newFile]);
    }

    // Clear uploads after 3 seconds
    setTimeout(() => {
      setPendingUploads([]);
      setShowUploadModal(false);
    }, 3000);
  };

  // Download file from cloud
  const downloadFromCloud = (fileId) => {
    const file = cloudFiles.find((f) => f.id === fileId);
    if (file && file.type === "file") {
      // Simulate download
      const link = document.createElement("a");
      link.href = "#";
      link.download = file.name;
      link.click();
    }
  };

  // Share file
  const shareFile = (fileId) => {
    setCloudFiles((prev) =>
      prev.map((file) =>
        file.id === fileId ? { ...file, shared: !file.shared } : file
      )
    );
  };

  // Delete file
  const deleteFile = (fileId) => {
    setCloudFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="min-h-screen bg-theme-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {" "}
              <h1 className="text-4xl lg:text-5xl font-bold text-theme-text text-center">
                Cloud <span className="text-theme-primary">Integration</span>
              </h1>
            </div>
            {onNavigate && (
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 px-4 py-2 card-theme text-theme-text-secondary hover:text-theme-primary hover:border-theme-primary transition-all duration-200"
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
            )}
          </div>
          <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto text-center">
            Connect your cloud storage accounts to access, merge, and manage
            your PDF files seamlessly
          </p>
        </motion.div>
        {/* Cloud Providers */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {Object.entries(CLOUD_PROVIDERS).map(([key, provider]) => {
            const isConnected = connectedProviders[provider.id];

            return (
              <motion.div
                key={provider.id}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  isConnected
                    ? `${provider.bgColor} border-green-500/50`
                    : "card-theme hover:border-theme-primary"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{provider.icon}</div>{" "}
                  <h3 className="text-lg font-semibold text-theme-text mb-2">
                    {provider.name}
                  </h3>
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadProviderFiles(provider.id)}
                          className="flex-1 px-3 py-2 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-lg text-sm transition-colors"
                        >
                          Browse
                        </button>
                        <button
                          onClick={() => disconnectProvider(provider.id)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => connectProvider(provider.id)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 btn-primary rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        "Connect"
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* File Browser */}
        {selectedProvider && (
          <motion.div
            className="bg-theme-secondary rounded-2xl border border-theme-border-opaque-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* File Browser Header */}
            <div className="p-6 border-b border-theme-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {CLOUD_PROVIDERS[selectedProvider.toUpperCase()]?.icon}
                  </div>
                  <div>
                    {" "}
                    <h3 className="text-xl font-semibold text-theme-text">
                      {CLOUD_PROVIDERS[selectedProvider.toUpperCase()]?.name}
                    </h3>
                    <p className="text-theme-text-secondary text-sm">
                      {currentPath}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => uploadToCloud(Array.from(e.target.files))}
                    className="hidden"
                    id="cloud-upload"
                  />
                  <label
                    htmlFor="cloud-upload"
                    className="px-4 py-2 btn-primary text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </label>
                  <button
                    onClick={() => loadProviderFiles(selectedProvider)}
                    className="px-4 py-2 bg-theme-secondary border border-theme-border hover:border-theme-primary text-theme-text-secondary rounded-lg transition-colors"
                  >
                    <Loader className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  {" "}
                  <Loader className="w-8 h-8 text-theme-primary mx-auto mb-3 animate-spin" />
                  <p className="text-theme-text-secondary">Loading files...</p>
                </div>
              ) : cloudFiles.length === 0 ? (
                <div className="text-center py-12">
                  {" "}
                  <Folder className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-theme-text mb-2">
                    No Files Found
                  </h4>
                  <p className="text-theme-text-secondary">
                    Upload some PDF files to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cloudFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-theme-background border border-theme-border-opaque-20 rounded-xl hover:border-theme-primary transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {file.type === "folder" ? (
                            <Folder className="w-8 h-8 text-blue-400" />
                          ) : (
                            <File className="w-8 h-8 text-red-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {" "}
                            <h4 className="text-theme-text font-medium truncate">
                              {file.name}
                            </h4>
                            {file.shared && (
                              <Share2 className="w-4 h-4 text-theme-primary flex-shrink-0" />
                            )}
                            {file.owner !== "me" && (
                              <span className="text-xs bg-theme-secondary text-theme-text-secondary px-2 py-1 rounded flex-shrink-0">
                                Shared
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-theme-text-secondary">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{formatDate(file.modified)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.type === "file" && (
                          <>
                            <button
                              onClick={() => downloadFromCloud(file.id)}
                              className="p-2 text-theme-text-secondary hover:text-theme-primary transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => shareFile(file.id)}
                              className={`p-2 transition-colors ${
                                file.shared
                                  ? "text-theme-primary"
                                  : "text-theme-text-secondary hover:text-theme-primary"
                              }`}
                              title={file.shared ? "Stop sharing" : "Share"}
                            >
                              {file.shared ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 text-theme-text-secondary hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* Upload Progress Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="card-theme max-w-md w-full p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {" "}
                <h3 className="text-xl font-semibold text-theme-text mb-4">
                  Uploading Files
                </h3>
                <div className="space-y-4">
                  {pendingUploads.map((upload) => (
                    <div key={upload.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        {" "}
                        <span className="text-theme-text text-sm truncate">
                          {upload.name}
                        </span>
                        {upload.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <span className="text-theme-text-secondary text-sm">
                            {upload.progress}%
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-theme-background rounded-full h-2">
                        <motion.div
                          className="bg-theme-primary h-2 rounded-full"
                          style={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CloudIntegration;
