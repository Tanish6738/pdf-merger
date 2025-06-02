"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Download,
  Mail,
  Link,
  QrCode,
  Cloud,
  FileText,
  Image,
  FileArchive,
  Copy,
  CheckCircle,
  ExternalLink,
  Upload,
  Timer,
  Lock,
  Globe,
  Users,
  Eye,
  Settings,
  X
} from 'lucide-react';

const ExportSharing = ({ isOpen, onClose, file, fileName, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('download');
  const [shareSettings, setShareSettings] = useState({
    expiresIn: '7days',
    password: '',
    allowDownload: true,
    allowPreview: true,
    maxDownloads: 0,
    requireEmail: false
  });
  const [shareLink, setShareLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedStates, setCopiedStates] = useState({});
  const linkInputRef = useRef(null);

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('landing');
    }
  };

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Original format, best quality',
      icon: FileText,
      extension: '.pdf',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      available: true
    },
    {
      id: 'images',
      name: 'Image Files',
      description: 'Convert pages to PNG/JPG',
      icon: Image,
      extension: '.zip',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      available: true
    },
    {
      id: 'docx',
      name: 'Word Document',
      description: 'Editable Word format (OCR)',
      icon: FileText,
      extension: '.docx',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      available: false,
      premium: true
    },
    {
      id: 'txt',
      name: 'Text File',
      description: 'Extract text content only',
      icon: FileText,
      extension: '.txt',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      available: true
    }
  ];

  const cloudProviders = [
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: '🔷',
      connected: false
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      connected: true
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '☁️',
      connected: false
    },
    {
      id: 'icloud',
      name: 'iCloud Drive',
      icon: '☁️',
      connected: false
    }
  ];

  const shareOptions = [
    {
      id: 'email',
      name: 'Email',
      description: 'Send via email',
      icon: Mail,
      color: 'text-blue-400'
    },
    {
      id: 'link',
      name: 'Share Link',
      description: 'Generate shareable link',
      icon: Link,
      color: 'text-green-400'
    },
    {
      id: 'qr',
      name: 'QR Code',
      description: 'Generate QR code for sharing',
      icon: QrCode,
      color: 'text-purple-400'
    },
    {
      id: 'social',
      name: 'Social Media',
      description: 'Share on social platforms',
      icon: Share2,
      color: 'text-pink-400'
    }
  ];

  const expirationOptions = [
    { value: '1hour', label: '1 Hour' },
    { value: '24hours', label: '24 Hours' },
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: 'never', label: 'Never' }
  ];

  const tabs = [
    { id: 'download', name: 'Download', icon: Download },
    { id: 'cloud', name: 'Cloud Save', icon: Cloud },
    { id: 'share', name: 'Share', icon: Share2 }
  ];

  const handleDownload = async (format) => {
    if (!file) return;

    try {
      let blob, filename;

      switch (format.id) {
        case 'pdf':
          blob = file;
          filename = `${fileName || 'document'}.pdf`;
          break;
        
        case 'images':
          // This would convert PDF pages to images and zip them
          // For now, simulate with original file
          blob = file;
          filename = `${fileName || 'document'}_images.zip`;
          break;
        
        case 'txt':
          // Extract text from PDF (would need OCR implementation)
          const textContent = "This is extracted text content from the PDF...";
          blob = new Blob([textContent], { type: 'text/plain' });
          filename = `${fileName || 'document'}.txt`;
          break;
        
        default:
          return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCloudSave = async (provider) => {
    // Simulate cloud save API call
    try {
      console.log(`Saving to ${provider.name}...`);
      // In real implementation, this would integrate with cloud provider APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      alert(`Successfully saved to ${provider.name}!`);
    } catch (error) {
      console.error('Cloud save failed:', error);
      alert('Failed to save to cloud. Please try again.');
    }
  };

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    
    try {
      // Simulate API call to generate secure share link
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const linkId = Math.random().toString(36).substring(2, 15);
      const generatedLink = `https://pdfmerge.pro/share/${linkId}`;
      setShareLink(generatedLink);
      
    } catch (error) {
      console.error('Failed to generate share link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateQRCode = () => {
    if (!shareLink) return '';
    
    // In real implementation, use a QR code library like qrcode.js
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;
  };
  if (!isOpen && !onNavigate) return null;

  // Full-page mode when onNavigate is provided
  if (onNavigate && !isOpen) {
    return (
      <div className="min-h-screen bg-[#1B212C] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              {onNavigate && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 px-4 py-2 bg-[#151B24] border border-[#A0AEC0]/20 rounded-lg text-[#A0AEC0] hover:text-[#00A99D] hover:border-[#00A99D]/50 transition-all duration-200"
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
              <div className="flex-1" />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-4">
                PDF <span className="text-[#00A99D]">Export & Share</span>
              </h1>
              <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
                Export your PDF documents in multiple formats or share them securely
              </p>
            </div>
          </motion.div>
          
          {/* Content */}
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-[#A0AEC0]/20">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-[#00A99D] bg-[#00A99D]/10'
                        : 'text-[#A0AEC0] hover:text-[#E1E6EB] hover:bg-[#151B24]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D]"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Download Tab */}
                  {activeTab === 'download' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Choose Format</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {exportFormats.map(format => {
                            const Icon = format.icon;
                            return (
                              <motion.button
                                key={format.id}
                                onClick={() => format.available && handleDownload(format)}
                                className={`relative p-4 rounded-xl border border-[#A0AEC0]/20 text-left transition-all group ${
                                  format.available
                                    ? 'hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 cursor-pointer'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                                whileHover={format.available ? { scale: 1.02 } : {}}
                                whileTap={format.available ? { scale: 0.98 } : {}}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${format.bgColor}`}>
                                    <Icon className={`w-5 h-5 ${format.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-[#E1E6EB]">{format.name}</h4>
                                      {format.premium && (
                                        <span className="px-2 py-1 bg-[#00A99D]/20 text-[#00A99D] text-xs rounded-full">
                                          Pro
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[#A0AEC0] text-sm mt-1">{format.description}</p>
                                    <span className="text-[#A0AEC0] text-xs">{format.extension}</span>
                                  </div>
                                  <Download className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#00A99D] transition-colors" />
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cloud Save Tab */}
                  {activeTab === 'cloud' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Save to Cloud</h3>
                        <div className="space-y-3">
                          {cloudProviders.map(provider => (
                            <motion.button
                              key={provider.id}
                              onClick={() => provider.connected && handleCloudSave(provider)}
                              className={`w-full p-4 rounded-xl border border-[#A0AEC0]/20 text-left transition-all flex items-center justify-between ${
                                provider.connected
                                  ? 'hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 cursor-pointer'
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              whileHover={provider.connected ? { scale: 1.01 } : {}}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{provider.icon}</span>
                                <div>
                                  <h4 className="font-semibold text-[#E1E6EB]">{provider.name}</h4>
                                  <p className="text-[#A0AEC0] text-sm">
                                    {provider.connected ? 'Connected' : 'Not connected'}
                                  </p>
                                </div>
                              </div>
                              {provider.connected ? (
                                <Upload className="w-5 h-5 text-[#00A99D]" />
                              ) : (
                                <button className="px-3 py-1 bg-[#00A99D] text-white rounded-lg text-sm hover:bg-[#00A99D]/90 transition-colors">
                                  Connect
                                </button>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Share Tab */}
                  {activeTab === 'share' && (
                    <div className="space-y-6">
                      {/* Share Options */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Share Options</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {shareOptions.map(option => {
                            const Icon = option.icon;
                            return (
                              <motion.button
                                key={option.id}
                                onClick={() => option.id === 'link' && generateShareLink()}
                                className="p-4 rounded-xl border border-[#A0AEC0]/20 hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 transition-all text-left"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Icon className={`w-6 h-6 ${option.color} mb-2`} />
                                <h4 className="font-semibold text-[#E1E6EB] text-sm">{option.name}</h4>
                                <p className="text-[#A0AEC0] text-xs">{option.description}</p>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Share Settings */}
                      <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                        <h4 className="font-semibold text-[#E1E6EB] mb-4 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Share Settings
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Expiration */}
                          <div>
                            <label className="block text-[#A0AEC0] text-sm mb-2">
                              <Timer className="w-4 h-4 inline mr-1" />
                              Expires In
                            </label>
                            <select
                              value={shareSettings.expiresIn}
                              onChange={(e) => setShareSettings(prev => ({ ...prev, expiresIn: e.target.value }))}
                              className="w-full bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm"
                            >
                              {expirationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Password Protection */}
                          <div>
                            <label className="block text-[#A0AEC0] text-sm mb-2">
                              <Lock className="w-4 h-4 inline mr-1" />
                              Password (Optional)
                            </label>
                            <input
                              type="password"
                              value={shareSettings.password}
                              onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Enter password for protection"
                              className="w-full bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm placeholder-[#A0AEC0]"
                            />
                          </div>

                          {/* Permissions */}
                          <div className="space-y-2">
                            <h5 className="text-[#A0AEC0] text-sm">
                              <Users className="w-4 h-4 inline mr-1" />
                              Permissions
                            </h5>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={shareSettings.allowPreview}
                                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowPreview: e.target.checked }))}
                                  className="rounded"
                                />
                                <Eye className="w-4 h-4 text-[#A0AEC0]" />
                                <span className="text-[#A0AEC0]">Allow Preview</span>
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={shareSettings.allowDownload}
                                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                                  className="rounded"
                                />
                                <Download className="w-4 h-4 text-[#A0AEC0]" />
                                <span className="text-[#A0AEC0]">Allow Download</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Generated Share Link */}
                      {shareLink && (
                        <motion.div
                          className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <h4 className="font-semibold text-[#E1E6EB] mb-3 flex items-center gap-2">
                            <Link className="w-4 h-4 text-green-400" />
                            Share Link Generated
                          </h4>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              ref={linkInputRef}
                              value={shareLink}
                              readOnly
                              className="flex-1 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm"
                            />
                            <button
                              onClick={() => copyToClipboard(shareLink, 'link')}
                              className="px-4 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#00A99D]/90 transition-colors text-sm flex items-center gap-2"
                            >
                              {copiedStates.link ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              {copiedStates.link ? 'Copied!' : 'Copy'}
                            </button>
                          </div>

                          {/* QR Code */}
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg">
                              <img
                                src={generateQRCode()}
                                alt="QR Code"
                                className="w-16 h-16"
                              />
                            </div>
                            <div>
                              <p className="text-[#A0AEC0] text-sm mb-1">Scan QR code to access</p>
                              <button
                                onClick={() => copyToClipboard(generateQRCode(), 'qr')}
                                className="text-[#00A99D] text-sm hover:underline"
                              >
                                Copy QR Code URL
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Generate Link Button */}
                      {!shareLink && (
                        <button
                          onClick={generateShareLink}
                          disabled={isGeneratingLink}
                          className="w-full px-4 py-3 bg-[#00A99D] text-white rounded-lg hover:bg-[#00A99D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isGeneratingLink ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Generating Link...
                            </>
                          ) : (
                            <>
                              <Link className="w-4 h-4" />
                              Generate Share Link
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Modal mode (original functionality)
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#1B212C] rounded-2xl border border-[#A0AEC0]/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#A0AEC0]/20">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-[#00A99D]" />
              <div>
                <h2 className="text-xl font-bold text-[#E1E6EB]">Export & Share</h2>
                <p className="text-[#A0AEC0] text-sm">{fileName || 'document'}.pdf</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#A0AEC0] hover:text-[#E1E6EB] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#A0AEC0]/20">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-[#00A99D] bg-[#00A99D]/10'
                      : 'text-[#A0AEC0] hover:text-[#E1E6EB] hover:bg-[#151B24]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D]"
                      layoutId="activeTab"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Download Tab */}
                {activeTab === 'download' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Choose Format</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exportFormats.map(format => {
                          const Icon = format.icon;
                          return (
                            <motion.button
                              key={format.id}
                              onClick={() => format.available && handleDownload(format)}
                              className={`relative p-4 rounded-xl border border-[#A0AEC0]/20 text-left transition-all group ${
                                format.available
                                  ? 'hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 cursor-pointer'
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              whileHover={format.available ? { scale: 1.02 } : {}}
                              whileTap={format.available ? { scale: 0.98 } : {}}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${format.bgColor}`}>
                                  <Icon className={`w-5 h-5 ${format.color}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-[#E1E6EB]">{format.name}</h4>
                                    {format.premium && (
                                      <span className="px-2 py-1 bg-[#00A99D]/20 text-[#00A99D] text-xs rounded-full">
                                        Pro
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[#A0AEC0] text-sm mt-1">{format.description}</p>
                                  <span className="text-[#A0AEC0] text-xs">{format.extension}</span>
                                </div>
                                <Download className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#00A99D] transition-colors" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cloud Save Tab */}
                {activeTab === 'cloud' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Save to Cloud</h3>
                      <div className="space-y-3">
                        {cloudProviders.map(provider => (
                          <motion.button
                            key={provider.id}
                            onClick={() => provider.connected && handleCloudSave(provider)}
                            className={`w-full p-4 rounded-xl border border-[#A0AEC0]/20 text-left transition-all flex items-center justify-between ${
                              provider.connected
                                ? 'hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 cursor-pointer'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                            whileHover={provider.connected ? { scale: 1.01 } : {}}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{provider.icon}</span>
                              <div>
                                <h4 className="font-semibold text-[#E1E6EB]">{provider.name}</h4>
                                <p className="text-[#A0AEC0] text-sm">
                                  {provider.connected ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            {provider.connected ? (
                              <Upload className="w-5 h-5 text-[#00A99D]" />
                            ) : (
                              <button className="px-3 py-1 bg-[#00A99D] text-white rounded-lg text-sm hover:bg-[#00A99D]/90 transition-colors">
                                Connect
                              </button>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Tab */}
                {activeTab === 'share' && (
                  <div className="space-y-6">
                    {/* Share Options */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Share Options</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {shareOptions.map(option => {
                          const Icon = option.icon;
                          return (
                            <motion.button
                              key={option.id}
                              onClick={() => option.id === 'link' && generateShareLink()}
                              className="p-4 rounded-xl border border-[#A0AEC0]/20 hover:border-[#00A99D]/50 hover:bg-[#00A99D]/5 transition-all text-left"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className={`w-6 h-6 ${option.color} mb-2`} />
                              <h4 className="font-semibold text-[#E1E6EB] text-sm">{option.name}</h4>
                              <p className="text-[#A0AEC0] text-xs">{option.description}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Share Settings */}
                    <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                      <h4 className="font-semibold text-[#E1E6EB] mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Share Settings
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Expiration */}
                        <div>
                          <label className="block text-[#A0AEC0] text-sm mb-2">
                            <Timer className="w-4 h-4 inline mr-1" />
                            Expires In
                          </label>
                          <select
                            value={shareSettings.expiresIn}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, expiresIn: e.target.value }))}
                            className="w-full bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm"
                          >
                            {expirationOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Password Protection */}
                        <div>
                          <label className="block text-[#A0AEC0] text-sm mb-2">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Password (Optional)
                          </label>
                          <input
                            type="password"
                            value={shareSettings.password}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password for protection"
                            className="w-full bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm placeholder-[#A0AEC0]"
                          />
                        </div>

                        {/* Permissions */}
                        <div className="space-y-2">
                          <h5 className="text-[#A0AEC0] text-sm">
                            <Users className="w-4 h-4 inline mr-1" />
                            Permissions
                          </h5>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={shareSettings.allowPreview}
                                onChange={(e) => setShareSettings(prev => ({ ...prev, allowPreview: e.target.checked }))}
                                className="rounded"
                              />
                              <Eye className="w-4 h-4 text-[#A0AEC0]" />
                              <span className="text-[#A0AEC0]">Allow Preview</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={shareSettings.allowDownload}
                                onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownload: e.target.checked }))}
                                className="rounded"
                              />
                              <Download className="w-4 h-4 text-[#A0AEC0]" />
                              <span className="text-[#A0AEC0]">Allow Download</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Generated Share Link */}
                    {shareLink && (
                      <motion.div
                        className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h4 className="font-semibold text-[#E1E6EB] mb-3 flex items-center gap-2">
                          <Link className="w-4 h-4 text-green-400" />
                          Share Link Generated
                        </h4>
                        
                        <div className="flex gap-2 mb-4">
                          <input
                            ref={linkInputRef}
                            value={shareLink}
                            readOnly
                            className="flex-1 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(shareLink, 'link')}
                            className="px-4 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#00A99D]/90 transition-colors text-sm flex items-center gap-2"
                          >
                            {copiedStates.link ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            {copiedStates.link ? 'Copied!' : 'Copy'}
                          </button>
                        </div>

                        {/* QR Code */}
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-2 rounded-lg">
                            <img
                              src={generateQRCode()}
                              alt="QR Code"
                              className="w-16 h-16"
                            />
                          </div>
                          <div>
                            <p className="text-[#A0AEC0] text-sm mb-1">Scan QR code to access</p>
                            <button
                              onClick={() => copyToClipboard(generateQRCode(), 'qr')}
                              className="text-[#00A99D] text-sm hover:underline"
                            >
                              Copy QR Code URL
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Generate Link Button */}
                    {!shareLink && (
                      <button
                        onClick={generateShareLink}
                        disabled={isGeneratingLink}
                        className="w-full px-4 py-3 bg-[#00A99D] text-white rounded-lg hover:bg-[#00A99D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isGeneratingLink ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Generating Link...
                          </>
                        ) : (
                          <>
                            <Link className="w-4 h-4" />
                            Generate Share Link
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportSharing;
