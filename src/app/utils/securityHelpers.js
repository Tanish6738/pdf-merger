// Security utilities for PDF operations
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Generate a secure password with specified options
 */
export const generateSecurePassword = (options = {}) => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true
  } = options;

  let chars = '';
  
  if (includeUppercase) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (includeLowercase) chars += 'abcdefghjkmnpqrstuvwxyz';
  if (includeNumbers) chars += '23456789';
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Exclude similar looking characters if requested
  if (excludeSimilar) {
    chars = chars.replace(/[il1Lo0O]/g, '');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?]/.test(password),
    noSpaces: !/\s/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'Very Weak';
  if (score >= 6) strength = 'Very Strong';
  else if (score >= 5) strength = 'Strong';
  else if (score >= 4) strength = 'Medium';
  else if (score >= 3) strength = 'Weak';

  return {
    score,
    strength,
    checks,
    isValid: score >= 4
  };
};

/**
 * Encrypt PDF with password protection
 */
export const encryptPDF = async (pdfBuffer, userPassword, ownerPassword = null, permissions = {}) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const defaultPermissions = {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false
    };

    const finalPermissions = { ...defaultPermissions, ...permissions };

    await pdfDoc.encrypt({
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: finalPermissions
    });

    return await pdfDoc.save();
  } catch (error) {
    throw new Error(`PDF encryption failed: ${error.message}`);
  }
};

/**
 * Apply access permissions to PDF
 */
export const applyPDFPermissions = async (pdfBuffer, permissions, passwords = {}) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    const pdfPermissions = {
      printing: permissions.allowPrinting ? 'highResolution' : 'disabled',
      modifying: permissions.allowModifying,
      copying: permissions.allowCopying,
      annotating: permissions.allowAnnotating,
      fillingForms: permissions.allowFormFilling,
      contentAccessibility: permissions.allowAccessibility,
      documentAssembly: permissions.allowModifying
    };

    // Apply encryption if passwords provided or if any permissions are restricted
    const hasRestrictions = Object.values(permissions).some(p => !p);
    if (passwords.user || passwords.owner || hasRestrictions) {
      await pdfDoc.encrypt({
        userPassword: passwords.user || '',
        ownerPassword: passwords.owner || 'owner_' + Date.now(),
        permissions: pdfPermissions
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    throw new Error(`Failed to apply permissions: ${error.message}`);
  }
};

/**
 * Add watermark to PDF
 */
export const addWatermarkToPDF = async (pdfBuffer, watermarkOptions = {}) => {
  try {
    const {
      text = 'CONFIDENTIAL',
      opacity = 0.3,
      fontSize = 48,
      rotation = 45,
      color = 'gray',
      positions = 'center' // 'center', 'diagonal', 'grid'
    } = watermarkOptions;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Get color
    let watermarkColor;
    switch (color.toLowerCase()) {
      case 'red': watermarkColor = rgb(1, 0, 0); break;
      case 'blue': watermarkColor = rgb(0, 0, 1); break;
      case 'green': watermarkColor = rgb(0, 1, 0); break;
      case 'black': watermarkColor = rgb(0, 0, 0); break;
      default: watermarkColor = rgb(0.5, 0.5, 0.5);
    }

    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);
      
      let watermarkPositions = [];
      
      switch (positions) {
        case 'center':
          watermarkPositions = [{ x: width / 2, y: height / 2, size: fontSize }];
          break;
        case 'diagonal':
          watermarkPositions = [
            { x: width * 0.25, y: height * 0.25, size: fontSize * 0.8 },
            { x: width * 0.5, y: height * 0.5, size: fontSize },
            { x: width * 0.75, y: height * 0.75, size: fontSize * 0.8 }
          ];
          break;
        case 'grid':
          watermarkPositions = [
            { x: width * 0.2, y: height * 0.2, size: fontSize * 0.6 },
            { x: width * 0.5, y: height * 0.2, size: fontSize * 0.6 },
            { x: width * 0.8, y: height * 0.2, size: fontSize * 0.6 },
            { x: width * 0.2, y: height * 0.5, size: fontSize * 0.8 },
            { x: width * 0.5, y: height * 0.5, size: fontSize },
            { x: width * 0.8, y: height * 0.5, size: fontSize * 0.8 },
            { x: width * 0.2, y: height * 0.8, size: fontSize * 0.6 },
            { x: width * 0.5, y: height * 0.8, size: fontSize * 0.6 },
            { x: width * 0.8, y: height * 0.8, size: fontSize * 0.6 }
          ];
          break;
      }
      
      watermarkPositions.forEach(pos => {
        const currentTextWidth = font.widthOfTextAtSize(text, pos.size);
        const currentTextHeight = font.heightAtSize(pos.size);
        
        page.drawText(text, {
          x: pos.x - currentTextWidth / 2,
          y: pos.y - currentTextHeight / 2,
          size: pos.size,
          font: font,
          color: watermarkColor,
          opacity: opacity,
          rotate: {
            type: 'degrees',
            angle: rotation,
          },
        });
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    throw new Error(`Failed to add watermark: ${error.message}`);
  }
};

/**
 * Analyze PDF security features
 */
export const analyzePDFSecurity = async (pdfBuffer) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Basic analysis - in a real implementation, you would use more sophisticated methods
    const pageCount = pdfDoc.getPageCount();
    const hasEncryption = false; // pdf-lib doesn't expose this directly
    
    return {
      pageCount,
      hasEncryption,
      fileSize: pdfBuffer.byteLength,
      isProtected: hasEncryption,
      permissions: {
        // These would need to be extracted from the PDF metadata
        printing: true,
        copying: true,
        modifying: true,
        annotating: true
      },
      metadata: {
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        creator: pdfDoc.getCreator() || '',
        creationDate: pdfDoc.getCreationDate(),
        modificationDate: pdfDoc.getModificationDate()
      }
    };
  } catch (error) {
    throw new Error(`Failed to analyze PDF: ${error.message}`);
  }
};

/**
 * Create audit log entry
 */
export const createAuditEntry = (action, description, metadata = {}) => {
  return {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    action,
    description,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    metadata: {
      ...metadata,
      sessionId: typeof window !== 'undefined' ? 
        (sessionStorage.getItem('securitySessionId') || 'anonymous') : 'server'
    }
  };
};

/**
 * Send audit log to server
 */
export const logSecurityEvent = async (action, description, fileId = null, fileName = null, metadata = {}) => {
  try {
    const response = await fetch('/api/security/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': typeof window !== 'undefined' ? 
          (sessionStorage.getItem('securitySessionId') || 'anonymous') : 'server'
      },
      body: JSON.stringify({
        action,
        description,
        fileId,
        fileName,
        metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to log security event');
    }

    return await response.json();
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - audit logging shouldn't break the main functionality
    return { success: false, error: error.message };
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob, filename) => {
  if (typeof window === 'undefined') return;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
  }
  
  // Fallback method
  if (typeof document !== 'undefined') {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
  
  return false;
};
