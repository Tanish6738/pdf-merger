"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  Users,
  Download,
  Calendar,
  Filter,
  ExternalLink,
  PieChart,
  Activity,
  Zap
} from 'lucide-react';

const Analytics = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulated analytics data
  const generateAnalytics = () => {
    const ranges = {
      day: { multiplier: 1, period: 'Today' },
      week: { multiplier: 7, period: 'This Week' },
      month: { multiplier: 30, period: 'This Month' },
      year: { multiplier: 365, period: 'This Year' }
    };

    const range = ranges[timeRange];
    
    return {
      overview: {
        totalMerges: Math.floor(Math.random() * 100 * range.multiplier),
        totalFiles: Math.floor(Math.random() * 500 * range.multiplier),
        totalSize: Math.floor(Math.random() * 50000 * range.multiplier), // MB
        avgProcessingTime: 2.3 + Math.random() * 2,
        successRate: 98.5 + Math.random() * 1.5
      },
      usage: [
        { date: '2024-01-01', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-02', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-03', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-04', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-05', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-06', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) },
        { date: '2024-01-07', merges: Math.floor(Math.random() * 50), files: Math.floor(Math.random() * 200) }
      ],
      tools: [
        { name: 'PDF Merge', usage: Math.floor(Math.random() * 60 + 40), color: '#00A99D' },
        { name: 'Split PDF', usage: Math.floor(Math.random() * 30 + 20), color: '#3B82F6' },
        { name: 'Rotate Pages', usage: Math.floor(Math.random() * 25 + 15), color: '#10B981' },
        { name: 'Compress PDF', usage: Math.floor(Math.random() * 35 + 25), color: '#8B5CF6' },
        { name: 'Add Watermark', usage: Math.floor(Math.random() * 20 + 10), color: '#06B6D4' },
        { name: 'Extract Pages', usage: Math.floor(Math.random() * 25 + 15), color: '#F59E0B' }
      ],
      performance: {
        avgFileSize: 2.5 + Math.random() * 5, // MB
        avgMergeTime: 1.8 + Math.random() * 2, // seconds
        peakHours: ['09:00', '11:00', '14:00', '16:00'],
        errorRate: Math.random() * 2 // percentage
      }
    };
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAnalytics(generateAnalytics());
        setLoading(false);
      }, 800);
    }
  }, [isOpen, timeRange]);

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'usage', name: 'Usage', icon: TrendingUp },
    { id: 'tools', name: 'Tools', icon: FileText },
    { id: 'performance', name: 'Performance', icon: Zap }
  ];

  const timeRanges = [
    { id: 'day', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#1B212C] rounded-2xl border border-[#A0AEC0]/20 w-full max-w-6xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#A0AEC0]/20">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#00A99D]" />
              <h2 className="text-2xl font-bold text-[#E1E6EB]">Analytics Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#A0AEC0]" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-[#151B24] border border-[#A0AEC0]/20 rounded-lg px-3 py-2 text-[#E1E6EB] text-sm"
                >
                  {timeRanges.map(range => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#A0AEC0] hover:text-[#E1E6EB] transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#A0AEC0]/20">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-[#00A99D] bg-[#00A99D]/10'
                      : 'text-[#A0AEC0] hover:text-[#E1E6EB] hover:bg-[#151B24]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D]"
                      layoutId="activeTab"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-[#00A99D] mx-auto mb-3 animate-pulse" />
                  <p className="text-[#A0AEC0]">Loading analytics data...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'overview' && analytics && (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-[#00A99D]" />
                            <span className="text-[#A0AEC0] text-sm">Total Merges</span>
                          </div>
                          <div className="text-2xl font-bold text-[#E1E6EB]">
                            {formatNumber(analytics.overview.totalMerges)}
                          </div>
                        </div>
                        
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-[#A0AEC0] text-sm">Files Processed</span>
                          </div>
                          <div className="text-2xl font-bold text-[#E1E6EB]">
                            {formatNumber(analytics.overview.totalFiles)}
                          </div>
                        </div>
                        
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Download className="w-4 h-4 text-green-400" />
                            <span className="text-[#A0AEC0] text-sm">Data Processed</span>
                          </div>
                          <div className="text-2xl font-bold text-[#E1E6EB]">
                            {formatFileSize(analytics.overview.totalSize)}
                          </div>
                        </div>
                        
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="text-[#A0AEC0] text-sm">Avg Time</span>
                          </div>
                          <div className="text-2xl font-bold text-[#E1E6EB]">
                            {analytics.overview.avgProcessingTime.toFixed(1)}s
                          </div>
                        </div>
                        
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-yellow-400" />
                            <span className="text-[#A0AEC0] text-sm">Success Rate</span>
                          </div>
                          <div className="text-2xl font-bold text-[#E1E6EB]">
                            {analytics.overview.successRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Quick Insights */}
                      <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-6">
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Quick Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-[#1B212C] rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-[#A0AEC0]">System performance is optimal</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-[#1B212C] rounded-lg">
                            <div className="w-2 h-2 bg-[#00A99D] rounded-full"></div>
                            <span className="text-[#A0AEC0]">PDF merge is most popular tool</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-[#1B212C] rounded-lg">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-[#A0AEC0]">Peak usage at 2:00 PM</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-[#1B212C] rounded-lg">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-[#A0AEC0]">Average file size: 2.5 MB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'usage' && analytics && (
                    <div className="space-y-6">
                      <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-6">
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Daily Usage Trends</h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                          {analytics.usage.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                              <div className="relative w-full">
                                <div
                                  className="bg-[#00A99D] rounded-t-lg w-full transition-all duration-500"
                                  style={{ height: `${(day.merges / 50) * 200}px` }}
                                ></div>
                                <div
                                  className="bg-blue-400/50 rounded-t-lg w-full transition-all duration-500"
                                  style={{ height: `${(day.files / 200) * 200}px`, marginTop: '2px' }}
                                ></div>
                              </div>
                              <span className="text-xs text-[#A0AEC0]">
                                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00A99D] rounded"></div>
                            <span className="text-sm text-[#A0AEC0]">Merges</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-400/50 rounded"></div>
                            <span className="text-sm text-[#A0AEC0]">Files</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tools' && analytics && (
                    <div className="space-y-6">
                      <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-6">
                        <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Tool Usage Distribution</h3>
                        <div className="space-y-4">
                          {analytics.tools.map((tool, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[#E1E6EB] font-medium">{tool.name}</span>
                                <span className="text-[#A0AEC0]">{tool.usage}%</span>
                              </div>
                              <div className="w-full bg-[#1B212C] rounded-full h-2">
                                <motion.div
                                  className="h-2 rounded-full"
                                  style={{ backgroundColor: tool.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tool.usage}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'performance' && analytics && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-6">
                          <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Performance Metrics</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-[#1B212C] rounded-lg">
                              <span className="text-[#A0AEC0]">Average File Size</span>
                              <span className="text-[#E1E6EB] font-medium">
                                {analytics.performance.avgFileSize.toFixed(1)} MB
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-[#1B212C] rounded-lg">
                              <span className="text-[#A0AEC0]">Average Merge Time</span>
                              <span className="text-[#E1E6EB] font-medium">
                                {analytics.performance.avgMergeTime.toFixed(1)}s
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-[#1B212C] rounded-lg">
                              <span className="text-[#A0AEC0]">Error Rate</span>
                              <span className="text-[#E1E6EB] font-medium">
                                {analytics.performance.errorRate.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#151B24] rounded-xl border border-[#A0AEC0]/20 p-6">
                          <h3 className="text-lg font-semibold text-[#E1E6EB] mb-4">Peak Usage Hours</h3>
                          <div className="space-y-3">
                            {analytics.performance.peakHours.map((hour, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-[#1B212C] rounded-lg">
                                <Clock className="w-4 h-4 text-[#00A99D]" />
                                <span className="text-[#E1E6EB] font-medium">{hour}</span>
                                <div className="flex-1 bg-[#A0AEC0]/20 rounded-full h-2">
                                  <motion.div
                                    className="bg-[#00A99D] h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${80 + Math.random() * 20}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#A0AEC0]/20 p-4 flex justify-between items-center">
            <p className="text-[#A0AEC0] text-sm">
              Data refreshed every 5 minutes
            </p>
            <button
              onClick={() => window.open('/api/analytics/export', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-[#00A99D] text-white rounded-lg hover:bg-[#00A99D]/90 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Analytics;
