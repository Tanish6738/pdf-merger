import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('PDF merge request received');
    
    const formData = await request.formData();
    const files = formData.getAll('files');
    const customFileName = formData.get('fileName') || 'merged';
    const pageSelections = formData.get('pageSelections');

    if (!files || files.length < 1) {
      return NextResponse.json(
        { error: 'At least 1 PDF file is required for merging' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} files for merge`);
    
    // Parse page selections if provided
    let selections = null;
    if (pageSelections) {
      try {
        selections = JSON.parse(pageSelections);
      } catch (error) {
        console.warn('Failed to parse page selections:', error);
      }
    }

    // Validate file types and sizes
    const maxFileSize = 50 * 1024 * 1024; // 50MB per file
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File ${file.name} is not a PDF` },
          { status: 400 }
        );
      }
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 50MB` },
          { status: 400 }
        );
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each file and merge
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i + 1}: ${file.name}`);
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        // Determine which pages to copy
        let pagesToCopy = [];
        if (selections && selections[i]) {
          // Use selected pages (1-based to 0-based conversion)
          pagesToCopy = selections[i].map(pageNum => pageNum - 1);
        } else {
          // Copy all pages if no selection specified
          pagesToCopy = Array.from({ length: pageCount }, (_, idx) => idx);
        }
          // Copy selected pages from current PDF to merged PDF
        for (const pageIndex of pagesToCopy) {
          if (pageIndex >= 0 && pageIndex < pageCount) {
            const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);
            mergedPdf.addPage(copiedPage);
          }
        }
        
        console.log(`Copied ${pagesToCopy.length} pages from ${file.name}`);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return NextResponse.json(
          { error: `Failed to process file: ${file.name}. Please ensure it's a valid PDF.` },
          { status: 400 }
        );
      }
    }

    // Generate the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const totalPages = mergedPdf.getPageCount();
    
    console.log(`Successfully created merged PDF with ${totalPages} pages`);

    // Create response with appropriate headers
    const response = new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${customFileName}.pdf"`,
        'Content-Length': mergedPdfBytes.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('PDF merge error:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDFs. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
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
