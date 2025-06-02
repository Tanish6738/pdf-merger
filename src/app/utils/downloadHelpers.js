// Enhanced download functionality with progress tracking and queue management

export const downloadWithProgress = async (blob, fileName, onProgress) => {
  try {
    if (onProgress) onProgress(0);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    
    if (onProgress) onProgress(50);
    
    link.click();
    
    if (onProgress) onProgress(100);
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    return { success: false, error: error.message };
  }
};

export const downloadMultipleFiles = async (files, options = {}) => {
  const { 
    onProgress, 
    onFileProgress, 
    delay = 300,
    maxConcurrent = 3 
  } = options;
  
  const results = [];
  let completed = 0;
  
  for (let i = 0; i < files.length; i += maxConcurrent) {
    const batch = files.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (file, batchIndex) => {
      const globalIndex = i + batchIndex;
      
      try {
        if (onFileProgress) {
          onFileProgress(globalIndex, file.fileName, 'starting');
        }
        
        const result = await downloadWithProgress(
          file.blob, 
          file.fileName,
          (progress) => {
            if (onFileProgress) {
              onFileProgress(globalIndex, file.fileName, 'downloading', progress);
            }
          }
        );
        
        if (onFileProgress) {
          onFileProgress(globalIndex, file.fileName, 'completed');
        }
        
        completed++;
        if (onProgress) {
          onProgress(Math.round((completed / files.length) * 100));
        }
        
        results.push({ file: file.fileName, ...result });
        
        // Add delay between downloads
        if (globalIndex < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return result;
      } catch (error) {
        const errorResult = { success: false, error: error.message };
        results.push({ file: file.fileName, ...errorResult });
        
        if (onFileProgress) {
          onFileProgress(globalIndex, file.fileName, 'error', 0, error.message);
        }
        
        return errorResult;
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  return {
    success: true,
    results,
    totalFiles: files.length,
    successCount: results.filter(r => r.success).length,
    errorCount: results.filter(r => !r.success).length
  };
};

export const createDownloadQueue = () => {
  const queue = [];
  let isProcessing = false;
  
  const addToQueue = (file, priority = 0) => {
    queue.push({ file, priority, id: Date.now() + Math.random() });
    queue.sort((a, b) => b.priority - a.priority);
    processQueue();
  };
  
  const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    
    while (queue.length > 0) {
      const { file } = queue.shift();
      
      try {
        await downloadWithProgress(file.blob, file.fileName);
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Queue download failed:', error);
      }
    }
    
    isProcessing = false;
  };
  
  return { addToQueue, getQueueSize: () => queue.length };
};

// Enhanced batch download with better error handling
export const downloadAllFilesEnhanced = async (files, options = {}) => {
  const { showProgress = false, onProgress, onComplete } = options;
  
  if (!files || files.length === 0) {
    throw new Error('No files available for download');
  }

  try {
    if (showProgress && onProgress) {
      return await downloadMultipleFiles(files, {
        onProgress,
        onFileProgress: (index, fileName, status, progress, error) => {
          console.log(`File ${index + 1}: ${fileName} - ${status}${progress ? ` (${progress}%)` : ''}${error ? ` - Error: ${error}` : ''}`);
        }
      });
    } else {
      // Simple sequential download with delays
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await downloadWithProgress(file.blob, file.fileName);
        
        // Add delay between downloads to prevent browser blocking
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (onComplete) {
        onComplete({ success: true, downloadedCount: files.length });
      }
      
      return { success: true, downloadedCount: files.length };
    }
  } catch (error) {
    console.error('Batch download failed:', error);
    if (onComplete) {
      onComplete({ success: false, error: error.message });
    }
    throw error;
  }
};

// Specific functions for split file downloads
export const downloadSplitFile = async (fileData, options = {}) => {
  try {
    const { onProgress } = options;
    
    if (!fileData || !fileData.blob || !fileData.fileName) {
      throw new Error('Invalid file data provided');
    }
    
    return await downloadWithProgress(fileData.blob, fileData.fileName, onProgress);
  } catch (error) {
    console.error('Split file download failed:', error);
    throw error;
  }
};

export const downloadAllSplitFiles = async (splitFiles, options = {}) => {
  const { onProgress, onError, showProgress = true } = options;
  
  if (!splitFiles || splitFiles.length === 0) {
    throw new Error('No split files available for download');
  }
  
  try {
    return await downloadMultipleFiles(splitFiles, {
      onProgress,
      onFileProgress: (index, fileName, status, progress, error) => {
        if (status === 'error' && onError) {
          onError(error, fileName);
        }
      },
      delay: 300,
      maxConcurrent: 3
    });
  } catch (error) {
    console.error('Batch split file download failed:', error);
    if (onError) {
      onError(error, 'batch download');
    }
    throw error;
  }
};

export const queueDownload = (fileData, priority = 0) => {
  const queue = createDownloadQueue();
  queue.addToQueue(fileData, priority);
  return queue;
};
