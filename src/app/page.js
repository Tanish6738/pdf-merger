"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Landing from './Pages/Landing'

// Dynamically import components that use pdfjs-dist with SSR disabled
const PDFMerger = dynamic(() => import('./Pages/PDFMerger'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading PDF Merger...</div></div>
})

const EnhancedPDFBuilder = dynamic(() => import('./Components/EnhancedPDFBuilder'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading PDF Builder...</div></div>
})

const SimplePDFBuilder = dynamic(() => import('./Components/SimplePDFBuilder'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading Simple PDF Builder...</div></div>
})

const AdvancedPDFTools = dynamic(() => import('./Components/AdvancedPDFTools'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading PDF Tools...</div></div>
})

const CloudIntegration = dynamic(() => import('./Components/CloudIntegration'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Cloud Integration...</div></div>
})

const SecurityFeatures = dynamic(() => import('./Components/SecurityFeatures'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Security Features...</div></div>
})

const Analytics = dynamic(() => import('./Components/Analytics'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Analytics...</div></div>
})

const ExportSharing = dynamic(() => import('./Components/ExportSharing'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Export & Sharing...</div></div>
})

const ThemeAccessibilitySettings = dynamic(() => import('./Components/ThemeAccessibilitySettings'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Settings...</div></div>
})

const OCRProcessor = dynamic(() => import('./Components/OCRProcessor'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading OCR Processor...</div></div>
})

const SplitPDF = dynamic(() => import('./Components/SplitPDF'), { 
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1B212C] flex items-center justify-center"><div className="text-[#E1E6EB]">Loading Split PDF...</div></div>
})

const page = () => {
  const [currentView, setCurrentView] = useState('landing') // Enhanced navigation states

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing onNavigate={setCurrentView} />
      case 'merger':
        return <PDFMerger onNavigate={setCurrentView} />
      case 'builder':
        return <EnhancedPDFBuilder onNavigate={setCurrentView} />
      case 'simple-builder':
        return <SimplePDFBuilder onNavigate={setCurrentView} />
      case 'advanced-tools':
        return <AdvancedPDFTools onNavigate={setCurrentView} />
      case 'cloud':
        return <CloudIntegration onNavigate={setCurrentView} />
      case 'security':
        return <SecurityFeatures onNavigate={setCurrentView} />
      case 'analytics':
        return <Analytics onNavigate={setCurrentView} />
      case 'export':
        return <ExportSharing onNavigate={setCurrentView} />
      case 'settings':
        return <ThemeAccessibilitySettings onNavigate={setCurrentView} />
      case 'ocr':
        return <OCRProcessor onNavigate={setCurrentView} />
      case 'split-pdf':
        return <SplitPDF onNavigate={setCurrentView} />
      default:
        return <Landing onNavigate={setCurrentView} />
    }
  }

  return (
    <>
      {renderCurrentView()}
    </>
  )
}

export default page