// Performance optimization utilities for PDF operations
import { PDFDocument } from 'pdf-lib';

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = typeof window !== 'undefined' && window.performance;
  }

  start(operationName) {
    if (!this.isEnabled) return null;
    
    const startTime = performance.now();
    const memoryBefore = this.getMemoryUsage();
    
    const metric = {
      operation: operationName,
      startTime,
      memoryBefore,
      endTime: null,
      memoryAfter: null,
      duration: null,
      memoryDelta: null
    };
    
    const id = `${operationName}_${Date.now()}_${Math.random()}`;
    this.metrics.set(id, metric);
    
    return id;
  }

  end(id) {
    if (!this.isEnabled || !id || !this.metrics.has(id)) return null;
    
    const metric = this.metrics.get(id);
    metric.endTime = performance.now();
    metric.memoryAfter = this.getMemoryUsage();
    metric.duration = metric.endTime - metric.startTime;
    metric.memoryDelta = metric.memoryAfter - metric.memoryBefore;
    
    this.metrics.set(id, metric);
    
    // Log performance data
    this.logMetric(metric);
    
    return metric;
  }

  getMemoryUsage() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
      return 0;
    }
    return window.performance.memory.usedJSHeapSize / 1024 / 1024; // MB
  }

  logMetric(metric) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${metric.operation}`, {
        duration: `${metric.duration.toFixed(2)}ms`,
        memory: `${metric.memoryDelta > 0 ? '+' : ''}${metric.memoryDelta.toFixed(2)}MB`,
        total: `${metric.memoryAfter.toFixed(2)}MB`
      });
    }
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Memory management utilities
export class MemoryManager {
  constructor() {
    this.objectUrls = new Set();
    this.intervalId = null;
    this.isCleanupEnabled = true;
  }

  // Track object URLs for cleanup
  trackObjectUrl(url) {
    this.objectUrls.add(url);
    
    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      this.revokeObjectUrl(url);
    }, 10 * 60 * 1000);
  }

  // Revoke a specific object URL
  revokeObjectUrl(url) {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }

  // Clean up all tracked URLs
  cleanup() {
    this.objectUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.objectUrls.clear();
  }

  // Start periodic cleanup
  startPeriodicCleanup(intervalMs = 5 * 60 * 1000) { // 5 minutes
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      if (this.isCleanupEnabled) {
        this.forceGarbageCollection();
      }
    }, intervalMs);
  }

  // Stop periodic cleanup
  stopPeriodicCleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Force garbage collection (if available)
  forceGarbageCollection() {
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
    }
  }

  // Get current memory status
  getMemoryStatus() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
      return null;
    }

    const memory = window.performance.memory;
    return {
      used: memory.usedJSHeapSize / 1024 / 1024, // MB
      total: memory.totalJSHeapSize / 1024 / 1024, // MB
      limit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 // percentage
    };
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();

// Optimized PDF processing utilities
export class PDFProcessor {
  constructor() {
    this.maxConcurrentOps = 3; // Limit concurrent operations
    this.activeOperations = 0;
    this.queue = [];
  }

  // Process PDF with performance monitoring
  async processWithMonitoring(operation, ...args) {
    const metricId = performanceMonitor.start(`pdf_${operation}`);
    
    try {
      const result = await this[operation](...args);
      return result;
    } finally {
      performanceMonitor.end(metricId);
    }
  }

  // Queue-based processing for large batches
  async queueOperation(operation, ...args) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        operation,
        args,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeOperations >= this.maxConcurrentOps || this.queue.length === 0) {
      return;
    }

    this.activeOperations++;
    const task = this.queue.shift();

    try {
      const result = await this.processWithMonitoring(task.operation, ...task.args);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.activeOperations--;
      // Process next item in queue
      setTimeout(() => this.processQueue(), 0);
    }
  }

  // Optimized PDF loading with streaming
  async loadPDFOptimized(file, options = {}) {
    const { useStreaming = true, maxMemory = 100 } = options; // 100MB limit
    
    // Check file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxMemory) {
      throw new Error(`File too large: ${fileSizeMB.toFixed(1)}MB (max: ${maxMemory}MB)`);
    }

    // Use streaming for large files
    if (useStreaming && fileSizeMB > 10) {
      return this.loadPDFStreaming(file);
    }

    // Standard loading for smaller files
    const arrayBuffer = await file.arrayBuffer();
    return PDFDocument.load(arrayBuffer);
  }

  // Stream-based PDF loading (simulated - would need actual streaming implementation)
  async loadPDFStreaming(file) {
    // This is a simplified version - real streaming would require
    // chunked reading and progressive PDF parsing
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = [];
    
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = file.slice(offset, offset + chunkSize);
      const arrayBuffer = await chunk.arrayBuffer();
      chunks.push(new Uint8Array(arrayBuffer));
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let position = 0;
    
    for (const chunk of chunks) {
      combined.set(chunk, position);
      position += chunk.length;
    }

    return PDFDocument.load(combined.buffer);
  }

  // Optimized thumbnail generation with caching
  async generateThumbnailOptimized(pdfDoc, pageIndex, options = {}) {
    const {
      scale = 0.5,
      useCache = true,
      cacheKey = null
    } = options;

    // Check cache first
    if (useCache && cacheKey) {
      const cached = this.getThumbnailFromCache(cacheKey);
      if (cached) return cached;
    }

    // Generate thumbnail with memory optimization
    const page = pdfDoc.getPage(pageIndex);
    const viewport = page.getViewport({ scale });
    
    // Use OffscreenCanvas if available for better performance
    const canvas = typeof OffscreenCanvas !== 'undefined' 
      ? new OffscreenCanvas(viewport.width, viewport.height)
      : document.createElement('canvas');
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Convert to blob for memory efficiency
    let thumbnail;
    if (canvas.convertToBlob) {
      thumbnail = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    } else {
      thumbnail = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
    }

    // Cache if enabled
    if (useCache && cacheKey) {
      this.cacheThumbnail(cacheKey, thumbnail);
    }

    return thumbnail;
  }

  // Simple thumbnail cache
  thumbnailCache = new Map();
  maxCacheSize = 50; // Maximum thumbnails to cache

  cacheThumbnail(key, thumbnail) {
    // Remove oldest if cache is full
    if (this.thumbnailCache.size >= this.maxCacheSize) {
      const firstKey = this.thumbnailCache.keys().next().value;
      this.thumbnailCache.delete(firstKey);
    }
    
    this.thumbnailCache.set(key, thumbnail);
  }

  getThumbnailFromCache(key) {
    return this.thumbnailCache.get(key);
  }

  clearThumbnailCache() {
    this.thumbnailCache.clear();
  }

  // Batch processing with progress callbacks
  async processBatch(files, operation, options = {}) {
    const {
      batchSize = 5,
      onProgress = null,
      onError = null
    } = options;

    const results = [];
    const total = files.length;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file, index) => {
        try {
          const result = await this.queueOperation(operation, file);
          const globalIndex = i + index;
          
          if (onProgress) {
            onProgress({
              completed: globalIndex + 1,
              total,
              percentage: ((globalIndex + 1) / total) * 100,
              currentFile: file.name
            });
          }
          
          return { success: true, result, file: file.name };
        } catch (error) {
          if (onError) {
            onError(error, file.name);
          }
          
          return { success: false, error: error.message, file: file.name };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Brief pause between batches to prevent overwhelming
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

// Global PDF processor instance
export const pdfProcessor = new PDFProcessor();

// Performance optimization hooks
export const usePerformanceOptimization = () => {
  const [memoryStatus, setMemoryStatus] = useState(null);
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    // Start performance monitoring
    memoryManager.startPeriodicCleanup();
    
    // Monitor memory usage
    const updateMemoryStatus = () => {
      const status = memoryManager.getMemoryStatus();
      setMemoryStatus(status);
      
      // Enable optimizations if memory usage is high
      setIsOptimized(status && status.usage > 70);
    };

    const interval = setInterval(updateMemoryStatus, 5000);
    updateMemoryStatus();

    return () => {
      clearInterval(interval);
      memoryManager.stopPeriodicCleanup();
    };
  }, []);

  const optimizeForLowMemory = () => {
    // Clear caches
    pdfProcessor.clearThumbnailCache();
    memoryManager.cleanup();
    memoryManager.forceGarbageCollection();
  };

  const getPerformanceMetrics = () => {
    return performanceMonitor.getMetrics();
  };

  return {
    memoryStatus,
    isOptimized,
    optimizeForLowMemory,
    getPerformanceMetrics
  };
};

// Export utilities
export default {
  PerformanceMonitor,
  MemoryManager,
  PDFProcessor,
  performanceMonitor,
  memoryManager,
  pdfProcessor,
  usePerformanceOptimization
};
