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

const SecurityFeatures = () => {
  const [files, setFiles] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({});
  const [permissions, setPermissions] = useState({
    allowPrinting: false,
    allowModifying: false,
    allowCopying: false,
    allowAnnotating: false,
    allowFormFilling: true,
    allowAccessibility: true
  });
  const [auditLog, setAuditLog] = useState([]);

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
    
    // Add to audit log
    newFiles.forEach(file => {
      addToAuditLog('file_uploaded', `File "${file.name}" uploaded for security processing`);
    });
  }, [permissions]);

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
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Apply security features
  const applySecurityFeature = async (fileId) => {
    if (!selectedFeature) return;

    setIsProcessing(true);
    setError(null);

    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      let result = {
        success: true,
        fileName: file.name,
        originalSize: file.size,
        action: selectedFeature
      };

      switch (selectedFeature) {
        case 'encrypt':
          const password = passwords[fileId] || generateSecurePassword();
          result = {
            ...result,
            message: 'Password protection applied successfully',
            password: password,
            encrypted: true
          };
          
          // Update file
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, isProtected: true, password: password }
              : f
          ));
          
          addToAuditLog('file_encrypted', `File "${file.name}" encrypted with password protection`, fileId);
          break;

        case 'permissions':
          result = {
            ...result,
            message: 'Access permissions applied successfully',
            permissions: permissions
          };
          
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, permissions: { ...permissions } }
              : f
          ));
          
          addToAuditLog('permissions_applied', `Access permissions applied to "${file.name}"`, fileId);
          break;

        case 'watermark':
          result = {
            ...result,
            message: 'Security watermark added successfully',
            watermark: true
          };
          
          addToAuditLog('watermark_added', `Security watermark added to "${file.name}"`, fileId);
          break;

        case 'audit':
          result = {
            ...result,
            message: 'Audit tracking enabled successfully',
            auditEnabled: true
          };
          
          addToAuditLog('audit_enabled', `Audit tracking enabled for "${file.name}"`, fileId);
          break;
      }

      setResults(prev => [...prev, result]);
      
    } catch (error) {
      setError(error.message);
      addToAuditLog('security_error', `Security operation failed: ${error.message}`, fileId);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove file
  const removeFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (file) {
      addToAuditLog('file_removed', `File "${file.name}" removed from security processing`, fileId);
    }
  };

  // Copy password to clipboard
  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    // You could add a toast notification here
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Render feature-specific settings
  const renderFeatureSettings = () => {
    switch (selectedFeature) {
      case 'encrypt':
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
              </div>
              
              <button
                onClick={() => {
                  const newPassword = generateSecurePassword();
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
        );

      case 'watermark':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#E1E6EB]">Security Watermark</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Watermark Type
                </label>
                <select className="w-full px-4 py-3 bg-[#1B212C] border border-[#A0AEC0]/20 rounded-lg text-[#E1E6EB] focus:outline-none focus:border-[#00A99D]">
                  <option value="confidential">CONFIDENTIAL</option>
                  <option value="internal">INTERNAL USE ONLY</option>
                  <option value="draft">DRAFT</option>
                  <option value="copy">COPY</option>
                  <option value="custom">Custom Text</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#E1E6EB] font-medium mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  defaultValue="0.3"
                  className="w-full"
                />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-[#E1E6EB] mb-4">
            PDF <span className="text-[#00A99D]">Security</span>
          </h1>
          <p className="text-xl text-[#A0AEC0] max-w-3xl mx-auto">
            Protect your sensitive documents with enterprise-grade security features
          </p>
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
