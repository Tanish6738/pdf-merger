const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createTestPDF() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Get the Helvetica font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Create multiple pages with different content
    for (let i = 1; i <= 5; i++) {
      const page = pdfDoc.addPage([600, 800]);
      
      // Add title
      page.drawText(`Test PDF - Page ${i}`, {
        x: 50,
        y: 750,
        size: 30,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Add some content
      page.drawText(`This is page ${i} of the test PDF.`, {
        x: 50,
        y: 700,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`You can use this to test the PDF merger functionality.`, {
        x: 50,
        y: 670,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Add page number in different positions
      page.drawText(`${i}`, {
        x: 280,
        y: 400,
        size: 100,
        font,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Add some sample text
      const sampleText = `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
      nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
      culpa qui officia deserunt mollit anim id est laborum.
      
      Page ${i} specific content for testing page selection and reordering.
      `;
      
      const lines = sampleText.split('\n');
      lines.forEach((line, index) => {
        page.drawText(line.trim(), {
          x: 50,
          y: 600 - (index * 20),
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
      });
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-document.pdf', pdfBytes);
    console.log('✅ Test PDF created: test-document.pdf');
    
    // Create a second test PDF
    const pdfDoc2 = await PDFDocument.create();
    for (let i = 1; i <= 3; i++) {
      const page = pdfDoc2.addPage([600, 800]);
      
      page.drawText(`Second PDF - Page ${i}`, {
        x: 50,
        y: 750,
        size: 30,
        font,
        color: rgb(0.8, 0, 0),
      });
      
      page.drawText(`This is page ${i} of the second test PDF.`, {
        x: 50,
        y: 700,
        size: 16,
        font,
        color: rgb(0.8, 0, 0),
      });
      
      page.drawText(`${i}`, {
        x: 280,
        y: 400,
        size: 100,
        font,
        color: rgb(0.9, 0.7, 0.7),
      });
    }
    
    const pdfBytes2 = await pdfDoc2.save();
    fs.writeFileSync('test-document-2.pdf', pdfBytes2);
    console.log('✅ Second test PDF created: test-document-2.pdf');
    
  } catch (error) {
    console.error('Error creating test PDF:', error);
  }
}

createTestPDF();
