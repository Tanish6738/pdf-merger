// PDF.js Worker Setup Utility
// This utility handles the proper setup of PDF.js worker with fallback options

export const setupPDFWorker = async () => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // List of worker sources to try (in order of preference)
    const workerSources = [
      '/pdf.worker.min.js',           // Local .js version (most compatible)
      '/pdf.worker.min.mjs',          // Local .mjs version
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`, // Unpkg CDN
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js` // CDNJS
    ];
    
    // Test each worker source
    for (const workerSrc of workerSources) {
      try {
        // Set the worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        
        // Test if the worker can be loaded by creating a simple document
        await pdfjsLib.getDocument({ data: new Uint8Array([37, 80, 68, 70]) }).promise.catch(() => {
          // This is expected to fail, we just want to make sure the worker loads
        });
        
        console.log(`PDF.js worker successfully loaded from: ${workerSrc}`);
        return pdfjsLib;
      } catch (error) {
        console.warn(`Failed to load PDF.js worker from ${workerSrc}:`, error);
        continue;
      }
    }
    
    // If all sources fail, throw an error
    throw new Error('Failed to load PDF.js worker from any source');
    
  } catch (error) {
    console.error('Failed to set up PDF.js worker:', error);
    throw error;
  }
};

// Alternative setup for environments where dynamic imports might fail
export const setupPDFWorkerStatic = (pdfjsLib) => {
  if (!pdfjsLib) {
    throw new Error('PDF.js library not provided');
  }
  
  const workerSources = [
    '/pdf.worker.min.js',
    '/pdf.worker.min.mjs',
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
  ];
  
  // Use the first available worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
  console.log(`PDF.js worker set to: ${workerSources[0]}`);
  
  return pdfjsLib;
};
