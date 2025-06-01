import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// Enhanced streaming PDF processing endpoint
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload with streaming
      return handleFileUploadStream(request);
    } else {
      // Handle JSON operations
      return handleJSONOperation(request);
    }
    
  } catch (error) {
    console.error('Streaming processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Processing failed',
      message: error.message
    }, { status: 500 });
  }
}

async function handleFileUploadStream(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const operation = formData.get('operation');
    const options = JSON.parse(formData.get('options') || '{}');
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 });
    }
    
    // Create a readable stream for processing updates
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Start processing in background
    processFilesWithStreaming(files, operation, options, writer);
    
    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    throw error;
  }
}

async function handleJSONOperation(request) {
  try {
    const body = await request.json();
    const { operation, files, options = {} } = body;
    
    // Simple operation without streaming
    const results = await processOperation(operation, files, options);
    
    return NextResponse.json({
      success: true,
      results,
      processedAt: new Date().toISOString()
    });
    
  } catch (error) {
    throw error;
  }
}

async function processFilesWithStreaming(files, operation, options, writer) {
  try {
    const totalFiles = files.length;
    let processedFiles = 0;
    
    // Send initial message
    await sendStreamMessage(writer, {
      type: 'start',
      totalFiles,
      operation
    });
    
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Send progress update
      await sendStreamMessage(writer, {
        type: 'progress',
        currentFile: i + 1,
        totalFiles,
        fileName: file.name,
        progress: Math.round((i / totalFiles) * 100)
      });
      
      try {
        // Simulate processing with streaming updates
        const result = await processFileWithProgress(file, operation, options, async (progress) => {
          await sendStreamMessage(writer, {
            type: 'file_progress',
            fileName: file.name,
            progress,
            stage: getProcessingStage(progress)
          });
        });
        
        results.push(result);
        processedFiles++;
        
        // Send file completion
        await sendStreamMessage(writer, {
          type: 'file_complete',
          fileName: file.name,
          success: result.success,
          result
        });
        
      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          error: error.message
        });
        
        await sendStreamMessage(writer, {
          type: 'file_error',
          fileName: file.name,
          error: error.message
        });
      }
    }
    
    // Send completion message
    await sendStreamMessage(writer, {
      type: 'complete',
      processedFiles,
      totalFiles,
      results
    });
    
    await writer.close();
    
  } catch (error) {
    await sendStreamMessage(writer, {
      type: 'error',
      error: error.message
    });
    await writer.close();
  }
}

async function sendStreamMessage(writer, data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  await writer.write(new TextEncoder().encode(message));
}

async function processFileWithProgress(file, operation, options, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Simulate processing stages with progress
  await onProgress(10); // File loaded
  await sleep(100);
  
  await onProgress(30); // Processing started
  await sleep(200);
  
  switch (operation) {
    case 'merge':
      return await simulateMerge(file, buffer, onProgress);
    case 'split':
      return await simulateSplit(file, buffer, onProgress);
    case 'compress':
      return await simulateCompress(file, buffer, onProgress);
    case 'rotate':
      return await simulateRotate(file, buffer, onProgress);
    case 'watermark':
      return await simulateWatermark(file, buffer, options, onProgress);
    case 'extract':
      return await simulateExtract(file, buffer, options, onProgress);
    case 'ocr':
      return await simulateOCR(file, buffer, options, onProgress);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

async function simulateMerge(file, buffer, onProgress) {
  await onProgress(50);
  await sleep(300);
  await onProgress(80);
  await sleep(200);
  await onProgress(100);
  
  return {
    fileName: `merged_${file.name}`,
    originalSize: buffer.length,
    newSize: buffer.length * 0.95,
    success: true,
    data: buffer.toString('base64')
  };
}

async function simulateSplit(file, buffer, onProgress) {
  await onProgress(60);
  await sleep(400);
  await onProgress(90);
  await sleep(150);
  await onProgress(100);
  
  // Simulate splitting into multiple files
  const pages = Math.ceil(Math.random() * 5) + 2;
  const pageSize = Math.floor(buffer.length / pages);
  
  return {
    fileName: file.name,
    originalSize: buffer.length,
    pages: Array.from({ length: pages }, (_, i) => ({
      pageNumber: i + 1,
      fileName: `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`,
      size: pageSize,
      data: buffer.slice(i * pageSize, (i + 1) * pageSize).toString('base64')
    })),
    success: true
  };
}

async function simulateCompress(file, buffer, onProgress) {
  await onProgress(45);
  await sleep(250);
  await onProgress(70);
  await sleep(300);
  await onProgress(95);
  await sleep(100);
  await onProgress(100);
  
  const compressionRatio = 0.6 + Math.random() * 0.3; // 60-90% of original size
  
  return {
    fileName: `compressed_${file.name}`,
    originalSize: buffer.length,
    newSize: Math.floor(buffer.length * compressionRatio),
    compressionRatio: Math.round((1 - compressionRatio) * 100),
    success: true,
    data: buffer.toString('base64')
  };
}

async function simulateRotate(file, buffer, onProgress) {
  await onProgress(70);
  await sleep(200);
  await onProgress(100);
  
  return {
    fileName: `rotated_${file.name}`,
    originalSize: buffer.length,
    newSize: buffer.length,
    rotation: '90°',
    success: true,
    data: buffer.toString('base64')
  };
}

async function simulateWatermark(file, buffer, options, onProgress) {
  await onProgress(55);
  await sleep(350);
  await onProgress(85);
  await sleep(200);
  await onProgress(100);
  
  return {
    fileName: `watermarked_${file.name}`,
    originalSize: buffer.length,
    newSize: buffer.length * 1.02, // Slightly larger due to watermark
    watermark: options.text || 'CONFIDENTIAL',
    success: true,
    data: buffer.toString('base64')
  };
}

async function simulateExtract(file, buffer, options, onProgress) {
  await onProgress(40);
  await sleep(200);
  await onProgress(75);
  await sleep(250);
  await onProgress(100);
  
  const extractedPages = options.pageNumbers || [1, 2, 3];
  
  return {
    fileName: `extracted_${file.name}`,
    originalSize: buffer.length,
    extractedPages,
    newSize: Math.floor(buffer.length * (extractedPages.length / 10)), // Approximate
    success: true,
    data: buffer.toString('base64')
  };
}

async function simulateOCR(file, buffer, options, onProgress) {
  await onProgress(20);
  await sleep(500); // OCR takes longer
  await onProgress(40);
  await sleep(800);
  await onProgress(60);
  await sleep(600);
  await onProgress(80);
  await sleep(400);
  await onProgress(100);
  
  // Simulate OCR results
  const text = `Extracted text from ${file.name}\n\nThis is simulated OCR text. In a real implementation, this would be the actual text extracted from the PDF or image file using OCR technology.\n\nConfidence: 87%\nPages processed: ${Math.ceil(Math.random() * 10) + 1}\nTotal characters: ${Math.floor(Math.random() * 5000) + 1000}`;
  
  return {
    fileName: file.name,
    originalSize: buffer.length,
    extractedText: text,
    confidence: 87,
    pagesProcessed: Math.ceil(Math.random() * 10) + 1,
    totalCharacters: text.length,
    success: true
  };
}

function getProcessingStage(progress) {
  if (progress < 20) return 'Loading file...';
  if (progress < 40) return 'Parsing document...';
  if (progress < 60) return 'Processing pages...';
  if (progress < 80) return 'Applying changes...';
  if (progress < 95) return 'Finalizing...';
  return 'Complete';
}

async function processOperation(operation, files, options) {
  // Simple non-streaming operation processing
  const results = [];
  
  for (const file of files) {
    try {
      // Simulate processing
      await sleep(100);
      
      results.push({
        fileName: file.name || 'unknown',
        success: true,
        operation,
        message: `${operation} completed successfully`
      });
    } catch (error) {
      results.push({
        fileName: file.name || 'unknown',
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
