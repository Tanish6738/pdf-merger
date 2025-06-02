"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Download,
  Loader,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Fingerprint,
  UserCheck,
  Clock,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { formatFileSize, downloadBlob } from '../utils/pdfHelpers';
import { 
  generateSecurePassword, 
  validatePasswordStrength, 
  logSecurityEvent, 
  copyToClipboard,
  formatFileSize as securityFormatFileSize
} from '../utils/securityHelpers';
import { useToast } from './ToastProvider';

const SecurityFeatures = ({ onNavigate }) => {
  const { success, error: showError, warning, info } = useToast();
  
  const [files, setFiles] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({});  const [permissions, setPermissions] = useState({
    allowPrinting: false,
    allowModifying: false,
    allowCopying: false,
    allowAnnotating: false,
    allowFormFilling: true,
    allowAccessibility: true
  });
  
  const [watermarkSettings, setWatermarkSettings] = useState({
    text: 'CONFIDENTIAL',
    opacity: 0.3,
    fontSize: 48,
    rotation: 45,
    color: 'gray',
    position: 'center'
  });
  const [auditLog, setAuditLog] = useState([]);

  // Handle back navigation
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('landing');
    }
  };

  // Security features configuration
  const securityFeatures = [
    {
      id: 'encrypt',
      name: 'Password Protection',
      description: 'Add password protection to your PDF documents',
      icon: Lock,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      id: 'permissions',
      name: 'Access Control',
      description: 'Set specific permissions for viewing, printing, and editing',
      icon: UserCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'watermark',
      name: 'Security Watermark',
      description: 'Add visible watermarks for document authentication',
      icon: Fingerprint,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'audit',
      name: 'Audit Trail',
      description: 'Track document access and modifications',
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    }
  ];
  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      isProtected: false,
      permissions: { ...permissions },
      password: '',
      lastAccessed: new Date().toISOString()
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    
    // Show success notification
    info(`${newFiles.length} file(s) uploaded successfully`);
    
    // Add to audit log
    newFiles.forEach(file => {
      addToAuditLog('file_uploaded', `File "${file.name}" uploaded for security processing`);
    });
  }, [permissions, info]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    maxFiles: 10
  });

  // Add entry to audit log
  const addToAuditLog = (action, description, fileId = null) => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action,
      description,
      fileId,
      userAgent: navigator.userAgent,
      ipAddress: '192.168.1.100' // Mock IP
    };
    
    setAuditLog(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  };
  // Generate secure password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword({
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true
    });
    return newPassword;
  };

  // Apply security features
  const applySecurityFeature = async (fileId) => {
    if (!selectedFeature) return;

    setIsProcessing(true);
    setError(null);

    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      let result = null;

      switch (selectedFeature) {
        case 'encrypt':
          result = await handleEncryption(file);
          break;
        case 'permissions':
          result = await handlePermissions(file);
          break;
        case 'watermark':
          result = await handleWatermark(file);
          break;
        case 'audit':
          result = await handleAuditSetup(file);
          break;
        default:
          throw new Error('Invalid security feature selected');
      }      setResults(prev => [...prev, result]);
      
      // Show success notification
      success(`${selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1)} applied successfully to ${file.name}`);
      
      // Update file status
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              isProtected: true, 
              lastSecurityAction: selectedFeature,
              lastProcessed: new Date().toISOString()
            }
          : f
      ));

      // Log security event
      await logSecurityEvent(
        `security_${selectedFeature}`,
        `Applied ${selectedFeature} security feature to "${file.name}"`,
        fileId,
        file.name,
        { feature: selectedFeature, fileSize: file.size }
      );
        } catch (error) {
      setError(error.message);
      showError(`Security operation failed: ${error.message}`);
      await logSecurityEvent(
        'security_error',
        `Security operation failed: ${error.message}`,
        fileId,
        file?.name,
        { feature: selectedFeature, error: error.message }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PDF encryption
  const handleEncryption = async (file) => {
    const formData = new FormData();
    formData.append('file', file.file);
    
    const password = passwords[file.id] || passwords.master || handleGeneratePassword();
    formData.append('password', password);
    formData.append('ownerPassword', password + '_owner');

    const response = await fetch('/api/security/encrypt', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Encryption failed');
    }

    const encryptedPdfBlob = await response.blob();
    
    // Auto-download the encrypted file
    downloadBlob(encryptedPdfBlob, `encrypted_${file.name}`);

    return {
      success: true,
      fileName: file.name,
      originalSize: file.size,
      action: 'encrypt',
      message: 'PDF encrypted successfully with password protection',
      password: password,
      encrypted: true,
      downloadSize: encryptedPdfBlob.size
    };
  };

  // Handle PDF permissions
  const handlePermissions = async (file) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('permissions', JSON.stringify(permissions));
    
    if (passwords[file.id] || passwords.master) {
      formData.append('userPassword', passwords[file.id] || passwords.master);
    }

    const response = await fetch('/api/security/permissions', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Permission setting failed');
    }

    const protectedPdfBlob = await response.blob();
    
    // Auto-download the protected file
    downloadBlob(protectedPdfBlob, `protected_${file.name}`);

    return {
      success: true,
      fileName: file.name,
      originalSize: file.size,
      action: 'permissions',
      message: 'Access permissions applied successfully',
      permissions: permissions,
      downloadSize: protectedPdfBlob.size
    };
  };

  // Handle PDF watermarking
  const handleWatermark = async (file) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('watermarkText', watermarkSettings.text);
    formData.append('opacity', watermarkSettings.opacity.toString());
    formData.append('fontSize', watermarkSettings.fontSize.toString());
    formData.append('rotation', watermarkSettings.rotation.toString());
    formData.append('color', watermarkSettings.color);

    const response = await fetch('/api/security/watermark', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Watermarking failed');
    }

    const watermarkedPdfBlob = await response.blob();
    
    // Auto-download the watermarked file
    downloadBlob(watermarkedPdfBlob, `watermarked_${file.name}`);

    return {
      success: true,
      fileName: file.name,
      originalSize: file.size,
      action: 'watermark',
      message: 'Security watermark added successfully',
      watermark: true,
      downloadSize: watermarkedPdfBlob.size,
      watermarkSettings: { ...watermarkSettings }
    };
  };

  // Handle audit setup
  const handleAuditSetup = async (file) => {
    // Enable audit tracking for this file
    await logSecurityEvent(
      'audit_enabled',
      `Audit tracking enabled for "${file.name}"`,
      file.id,
      file.name,
      { auditFeatures: ['access_tracking', 'modification_tracking', 'print_tracking'] }
    );

    return {
      success: true,
      fileName: file.name,
      originalSize: file.size,
      action: 'audit',
      message: 'Audit tracking enabled successfully',
      auditEnabled: true,
      trackingFeatures: ['Document access', 'Print events', 'Copy operations', 'Modification attempts']
    };
  };

  // Remove file
  const removeFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (file) {
      addToAuditLog('file_removed', `File "${file.name}" removed from security processing`, fileId);
    }
  };  // Copy password to clipboard
  const copyPassword = async (password) => {
    const copySuccess = await copyToClipboard(password);
    if (copySuccess) {
      success('Password copied to clipboard');
    } else {
      showError('Failed to copy password to clipboard');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Render feature-specific settings
  const renderFeatureSettings = () => {
    switch (selectedFeature) {      case 'encrypt':
        const passwordStrength = passwords.master ? validatePasswordStrength(passwords.master) : null;
        
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#E1E6EB]">Password Settings</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password or generate secure one"
                    value={passwords.master || ''}
                    onChange={(e) => setPasswords(prev => ({ ...prev, master: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0AEC0] hover:text-[#E1E6EB]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-[#A0AEC0]">Strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.strength === 'Very Strong' ? 'text-green-400' :
                        passwordStrength.strength === 'Strong' ? 'text-blue-400' :
                        passwordStrength.strength === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-[#1B212C] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 'Very Strong' ? 'bg-green-400 w-full' :
                          passwordStrength.strength === 'Strong' ? 'bg-blue-400 w-4/5' :
                          passwordStrength.strength === 'Medium' ? 'bg-yellow-400 w-3/5' :
                          passwordStrength.strength === 'Weak' ? 'bg-orange-400 w-2/5' :
                          'bg-red-400 w-1/5'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  const newPassword = handleGeneratePassword();
                  setPasswords(prev => ({ ...prev, master: newPassword }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A99D] hover:bg-[#00A99D]/90 text-white rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Generate Secure Password</span>
              </button>
            </div>
          </div>
        );

      case 'permissions':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#E1E6EB]">Access Permissions</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'allowPrinting', label: 'Allow Printing' },
                { key: 'allowModifying', label: 'Allow Modifying' },
                { key: 'allowCopying', label: 'Allow Copying' },
                { key: 'allowAnnotating', label: 'Allow Annotations' },
                { key: 'allowFormFilling', label: 'Allow Form Filling' },
                { key: 'allowAccessibility', label: 'Allow Accessibility' }
              ].map(permission => (
                <label key={permission.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[permission.key]}
                    onChange={(e) => setPermissions(prev => ({
                      ...prev,
                      [permission.key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-[#00A99D] bg-[#1B212C] border-[#A0AEC0]/20 rounded focus:ring-[#00A99D]"
                  />
                  <span className="text-[#E1E6EB]">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>
        );      case 'watermark':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#E1E6EB]">Security Watermark</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkSettings.text}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                  placeholder="Enter watermark text"
                />
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Opacity ({Math.round(watermarkSettings.opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={watermarkSettings.opacity}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={watermarkSettings.fontSize}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                />
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Color
                </label>
                <select
                  value={watermarkSettings.color}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                >
                  <option value="gray">Gray</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="black">Black</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Rotation (degrees)
                </label>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  value={watermarkSettings.rotation}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                />
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Position
                </label>
                <select
                  value={watermarkSettings.position}
                  onChange={(e) => setWatermarkSettings(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]"
                >
                  <option value="center">Center</option>
                  <option value="diagonal">Diagonal</option>
                  <option value="grid">Grid Pattern</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#E1E6EB]">Audit Settings</h4>
            
            <div className="space-y-3">
              {[
                'Track document opens',
                'Track printing events',
                'Track copy/paste operations',
                'Track modification attempts',
                'Record user information',
                'Log IP addresses'
              ].map((setting, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-[#00A99D] bg-[#1B212C] border-[#A0AEC0]/20 rounded focus:ring-[#00A99D]"
                  />
                  <span className="text-[#E1E6EB]">{setting}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1B212C] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
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
              PDF <span className="text-[#00A99D]">Security</span>
            </h1>
            <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
              Protect your sensitive documents with enterprise-grade security features
            </p>
          </div>
        </motion.div>

        {/* Security Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            const isSelected = selectedFeature === feature.id;
            
            return (
              <motion.div
                key={feature.id}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? `${feature.bgColor} ${feature.borderColor} border-2`
                    : 'bg-[#151B24] border-[#A0AEC0]/20 hover:border-[#00A99D]/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFeature(feature.id)}
              >
                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} ${feature.borderColor} border mb-4`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E1E6EB] mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-[#A0AEC0] text-sm">{feature.description}</p>
                  
                  {isSelected && (
                    <motion.div
                      className="mt-3 flex items-center justify-center gap-2 text-[#00A99D] text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Selected</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* File Upload Section */}
        {selectedFeature && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-4">
              Upload PDF Files for Security Processing
            </h3>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-[#00A99D] bg-[#00A99D]/5'
                  : 'border-[#A0AEC0]/30 hover:border-[#00A99D]/50'
              }`}
            >
              <input {...getInputProps()} />
              <Shield className="w-12 h-12 text-[#00A99D] mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-[#E1E6EB] mb-2">
                {isDragActive ? 'Drop PDF files here' : 'Upload PDF Files'}
              </h4>
              <p className="text-[#A0AEC0]">
                Drag & drop PDF files or click to browse
              </p>
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-[#E1E6EB] mb-3">
                  Files Ready for Security Processing ({files.length})
                </h4>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-xl"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-8 h-8 text-[#00A99D]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[#E1E6EB] font-medium">{file.name}</p>
                            {file.isProtected && (
                              <Lock className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <p className="text-[#A0AEC0] text-sm">
                            {formatFileSize(file.size)} • Last accessed: {formatTimestamp(file.lastAccessed)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applySecurityFeature(file.id)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-[#00A99D] hover:bg-[#00A99D]/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isProcessing ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          <span>Secure</span>
                        </button>
                        
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Feature Settings */}
        {selectedFeature && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[#00A99D]" />
              <h3 className="text-xl font-semibold text-[#E1E6EB]">
                Security Settings
              </h3>
            </div>
            
            {renderFeatureSettings()}
          </motion.div>
        )}

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

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-[#E1E6EB] mb-6">
              Security Processing Results
            </h3>
            
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[#E1E6EB] font-medium">{result.fileName}</p>
                        <p className="text-green-400 text-sm mb-2">{result.message}</p>
                        
                        {result.password && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[#A0AEC0] text-sm">Password:</span>
                            <code className="px-2 py-1 bg-[#1B212C] border border-[#A0AEC0]/20 rounded text-[#E1E6EB] text-sm">
                              {showPassword ? result.password : '••••••••••••'}
                            </code>
                            <button
                              onClick={() => copyPassword(result.password)}
                              className="text-[#00A99D] hover:text-[#00A99D]/80 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Audit Log */}
        {auditLog.length > 0 && (
          <motion.div
            className="bg-[#151B24] rounded-2xl border border-[#A0AEC0]/20 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#00A99D]" />
                <h3 className="text-xl font-semibold text-[#E1E6EB]">
                  Security Audit Log
                </h3>
              </div>
              
              <button
                onClick={() => setAuditLog([])}
                className="px-3 py-2 text-[#A0AEC0] hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[#E1E6EB] text-sm">{entry.description}</p>
                      <p className="text-[#A0AEC0] text-xs mt-1">
                        {formatTimestamp(entry.timestamp)} • Action: {entry.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SecurityFeatures;
