import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, description, fileId, fileName, metadata } = await request.json();
    
    // Create audit log entry
    const auditEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      action: action || 'unknown',
      description: description || 'No description provided',
      fileId: fileId || null,
      fileName: fileName || null,
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: getClientIP(request),
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      metadata: metadata || {}
    };

    // In a real application, you would store this in a database
    // For now, we'll return the audit entry to be stored client-side
    // You could also store it in a file, Redis, or database here
    
    return NextResponse.json({
      success: true,
      auditEntry: auditEntry,
      message: 'Audit entry recorded successfully'
    });

  } catch (error) {
    console.error('Audit logging error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record audit entry',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // In a real application, you would fetch from a database
    // For now, return a mock structure that the client can populate
    
    return NextResponse.json({
      success: true,
      message: 'Audit log endpoint ready',
      filters: { fileId, action, limit },
      // In production, return actual audit logs from database
      logs: []
    });

  } catch (error) {
    console.error('Audit retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve audit logs',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to get client IP
function getClientIP(request) {
  // Check various headers for the real IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a placeholder in development
  return '127.0.0.1';
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
    },
  });
}
