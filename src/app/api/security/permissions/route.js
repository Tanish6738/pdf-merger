import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const permissions = JSON.parse(formData.get('permissions') || '{}');
    const userPassword = formData.get('userPassword') || '';
    const ownerPassword = formData.get('ownerPassword') || 'owner_' + Date.now();
    
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer);
    
    // Map permissions to pdf-lib format
    const pdfPermissions = {
      printing: permissions.allowPrinting ? 'highResolution' : 'disabled',
      modifying: permissions.allowModifying,
      copying: permissions.allowCopying,
      annotating: permissions.allowAnnotating,
      fillingForms: permissions.allowFormFilling,
      contentAccessibility: permissions.allowAccessibility,
      documentAssembly: permissions.allowModifying
    };

    // Apply permissions with encryption
    if (userPassword || Object.values(permissions).some(p => !p)) {
      await pdfDoc.encrypt({
        userPassword: userPassword,
        ownerPassword: ownerPassword,
        permissions: pdfPermissions
      });
    }

    // Generate PDF bytes with applied permissions
    const pdfBytes = await pdfDoc.save();
    
    // Create response
    const response = new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="protected_${file.name}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('PDF permissions error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to apply permissions to PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
