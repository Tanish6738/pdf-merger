import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, PDFEncryption } from 'pdf-lib-with-encrypt';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const password = formData.get('password');
    const ownerPassword = formData.get('ownerPassword') || password;
    
    if (!file || !password) {
      return NextResponse.json(
        { error: 'File and password are required' },
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

    // Apply encryption
    await pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: ownerPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false
      }
    });

    // Generate encrypted PDF bytes
    const encryptedPdfBytes = await pdfDoc.save();
    
    // Create response with encrypted PDF
    const response = new NextResponse(encryptedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="encrypted_${file.name}"`,
        'Content-Length': encryptedPdfBytes.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('PDF encryption error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to encrypt PDF',
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
