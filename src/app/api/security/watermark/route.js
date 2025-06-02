import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const watermarkText = formData.get('watermarkText') || 'CONFIDENTIAL';
    const opacity = parseFloat(formData.get('opacity') || '0.3');
    const fontSize = parseInt(formData.get('fontSize') || '48');
    const rotation = parseInt(formData.get('rotation') || '45');
    const color = formData.get('color') || 'gray';
    
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
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Get color based on input
    let watermarkColor;
    switch (color.toLowerCase()) {
      case 'red':
        watermarkColor = rgb(1, 0, 0);
        break;
      case 'blue':
        watermarkColor = rgb(0, 0, 1);
        break;
      case 'green':
        watermarkColor = rgb(0, 1, 0);
        break;
      case 'black':
        watermarkColor = rgb(0, 0, 0);
        break;
      default:
        watermarkColor = rgb(0.5, 0.5, 0.5); // gray
    }

    // Apply watermark to all pages
    const pages = pdfDoc.getPages();
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate position for center of page
      const x = width / 2;
      const y = height / 2;
      
      // Get text dimensions for centering
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = font.heightAtSize(fontSize);
      
      // Add watermark text
      page.drawText(watermarkText, {
        x: x - textWidth / 2,
        y: y - textHeight / 2,
        size: fontSize,
        font: font,
        color: watermarkColor,
        opacity: opacity,
        rotate: {
          type: 'degrees',
          angle: rotation,
        },
      });
      
      // Add additional watermarks for better coverage
      const positions = [
        { x: width * 0.25, y: height * 0.25 },
        { x: width * 0.75, y: height * 0.25 },
        { x: width * 0.25, y: height * 0.75 },
        { x: width * 0.75, y: height * 0.75 },
      ];
      
      positions.forEach(pos => {
        page.drawText(watermarkText, {
          x: pos.x - textWidth / 2,
          y: pos.y - textHeight / 2,
          size: fontSize * 0.7,
          font: font,
          color: watermarkColor,
          opacity: opacity * 0.5,
          rotate: {
            type: 'degrees',
            angle: rotation,
          },
        });
      });
    }

    // Generate PDF bytes with watermark
    const watermarkedPdfBytes = await pdfDoc.save();
    
    // Create response
    const response = new NextResponse(watermarkedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
        'Content-Length': watermarkedPdfBytes.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('PDF watermark error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add watermark to PDF',
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
