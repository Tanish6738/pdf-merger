const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createTestSecurityPDF() {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    
    // Get fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add title
    page.drawText('Security Test Document', {
      x: 50,
      y: 700,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    // Add content
    const content = [
      'This is a test document for security features.',
      '',
      'Features to test:',
      '• Password protection and encryption',
      '• Access control permissions',
      '• Security watermarking',
      '• Audit trail logging',
      '',
      'Confidential Information:',
      '• Company financial data',
      '• Employee personal information',
      '• Trade secrets and proprietary methods',
      '• Strategic business plans',
      '',
      'This document contains sensitive information that should be',
      'protected with appropriate security measures.',
      '',
      'Document ID: SEC-TEST-' + Date.now(),
      'Created: ' + new Date().toISOString(),
      'Classification: CONFIDENTIAL'
    ];
    
    let yPosition = 650;
    content.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: line.startsWith('•') ? helveticaFont : helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });
    
    // Add footer
    page.drawText('© 2024 PDF Security Suite - Test Document', {
      x: 50,
      y: 50,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Add another page with more content
    const page2 = pdfDoc.addPage([612, 792]);
    
    page2.drawText('Page 2 - Additional Content', {
      x: 50,
      y: 700,
      size: 20,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    
    const page2Content = [
      'Security Feature Requirements:',
      '',
      '1. Encryption:',
      '   - 256-bit AES encryption',
      '   - Secure password generation',
      '   - Password strength validation',
      '',
      '2. Access Control:',
      '   - Granular permissions',
      '   - Print restrictions',
      '   - Copy/paste limitations',
      '   - Annotation controls',
      '',
      '3. Watermarking:',
      '   - Customizable text',
      '   - Multiple positions',
      '   - Opacity settings',
      '   - Rotation options',
      '',
      '4. Audit Trail:',
      '   - Access logging',
      '   - Modification tracking',
      '   - User identification',
      '   - Timestamp records'
    ];
    
    yPosition = 650;
    page2Content.forEach(line => {
      page2.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font: line.match(/^\d\./) ? helveticaBoldFont : helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;
    });
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Write to file
    const outputPath = path.join(__dirname, 'public', 'test-security-document.pdf');
    
    // Ensure public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log('✅ Test security PDF created successfully!');
    console.log(`📄 File: ${outputPath}`);
    console.log(`📊 Size: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
    console.log(`📑 Pages: 2`);
    console.log('🔧 Ready for security testing');
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error creating test PDF:', error);
    throw error;
  }
}

// Run the function
createTestSecurityPDF()
  .then(filePath => {
    console.log('\n🎉 Test PDF ready for security feature testing!');
    console.log('💡 You can now upload this file to test:');
    console.log('   • Password protection');
    console.log('   • Access permissions');
    console.log('   • Watermarking');
    console.log('   • Audit logging');
  })
  .catch(error => {
    console.error('Failed to create test PDF:', error);
    process.exit(1);
  });
