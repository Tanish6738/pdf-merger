import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock storage for share links - in a real app, this would be a database
const shareLinks = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      fileName, 
      fileData, 
      expiresIn = '7d', 
      password = null, 
      maxDownloads = null,
      allowAnonymous = true 
    } = body;

    // Generate unique share ID
    const shareId = crypto.randomBytes(16).toString('hex');
    
    // Calculate expiration date
    const expiration = calculateExpiration(expiresIn);
    
    // Store the share data
    const shareData = {
      id: shareId,
      fileName,
      fileData: fileData, // In real app, store file in cloud storage
      createdAt: new Date().toISOString(),
      expiresAt: expiration,
      password: password ? hashPassword(password) : null,
      maxDownloads,
      downloadCount: 0,
      allowAnonymous,
      isActive: true,
      createdBy: 'user123' // In real app, get from authentication
    };
    
    shareLinks.set(shareId, shareData);
    
    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareId}`;
    
    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt: expiration,
      qrCode: await generateQRCode(shareUrl)
    });
    
  } catch (error) {
    console.error('Share creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create share link'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');
    const password = searchParams.get('password');
    
    if (!shareId) {
      return NextResponse.json({
        success: false,
        error: 'Share ID required'
      }, { status: 400 });
    }
    
    const shareData = shareLinks.get(shareId);
    
    if (!shareData) {
      return NextResponse.json({
        success: false,
        error: 'Share link not found'
      }, { status: 404 });
    }
    
    // Check if link is still active
    if (!shareData.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Share link has been deactivated'
      }, { status: 410 });
    }
    
    // Check expiration
    if (new Date() > new Date(shareData.expiresAt)) {
      return NextResponse.json({
        success: false,
        error: 'Share link has expired'
      }, { status: 410 });
    }
    
    // Check download limit
    if (shareData.maxDownloads && shareData.downloadCount >= shareData.maxDownloads) {
      return NextResponse.json({
        success: false,
        error: 'Download limit reached'
      }, { status: 410 });
    }
    
    // Check password if required
    if (shareData.password) {
      if (!password) {
        return NextResponse.json({
          success: false,
          error: 'Password required',
          requiresPassword: true
        }, { status: 401 });
      }
      
      if (!verifyPassword(password, shareData.password)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid password'
        }, { status: 401 });
      }
    }
    
    // Increment download count
    shareData.downloadCount++;
    shareLinks.set(shareId, shareData);
    
    // Return file info for download
    return NextResponse.json({
      success: true,
      fileName: shareData.fileName,
      fileData: shareData.fileData,
      downloadCount: shareData.downloadCount,
      maxDownloads: shareData.maxDownloads,
      expiresAt: shareData.expiresAt
    });
    
  } catch (error) {
    console.error('Share access error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to access share link'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');
    
    if (!shareId) {
      return NextResponse.json({
        success: false,
        error: 'Share ID required'
      }, { status: 400 });
    }
    
    const shareData = shareLinks.get(shareId);
    
    if (!shareData) {
      return NextResponse.json({
        success: false,
        error: 'Share link not found'
      }, { status: 404 });
    }
    
    // Deactivate the share link
    shareData.isActive = false;
    shareLinks.set(shareId, shareData);
    
    return NextResponse.json({
      success: true,
      message: 'Share link deactivated'
    });
    
  } catch (error) {
    console.error('Share deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate share link'
    }, { status: 500 });
  }
}

// Helper functions
function calculateExpiration(expiresIn) {
  const now = new Date();
  
  switch (expiresIn) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'never':
      return new Date('2099-12-31').toISOString();
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

async function generateQRCode(url) {
  // Simple QR code data URL - in real app, use a proper QR code library
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="white"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8">QR CODE</text>
      <text x="50" y="65" text-anchor="middle" dy=".3em" font-family="monospace" font-size="6">${url.slice(-10)}</text>
    </svg>
  `).toString('base64')}`;
}
