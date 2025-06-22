import React from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@heroui/react";
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function BiasAnalysis({ article }) {
  const [biasAnalysis, setBiasAnalysis] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [hasAnalyzed, setHasAnalyzed] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Extract bias score from analysis text
  const extractBiasScore = (analysisText) => {
    if (!analysisText) return null;
    const match = analysisText.match(/BIAS SCORE:\s*(\d+)\/10/i);
    return match ? parseInt(match[1]) : null;
  };

  // Extract bias direction from analysis text
  const extractBiasDirection = (analysisText) => {
    if (!analysisText) return null;
    const lowerText = analysisText.toLowerCase();
    
    if (lowerText.includes('biased towards') && lowerText.includes('government')) {
      return 'Government Perspective';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('opposition')) {
      return 'Opposition Perspective';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('left')) {
      return 'Left-leaning';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('right')) {
      return 'Right-leaning';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('conservative')) {
      return 'Conservative';
    }
    if (lowerText.includes('biased towards') && lowerText.includes('liberal')) {
      return 'Liberal';
    }
    return 'Detected Bias';
  };

  // Remove bias score line from analysis text for display
  const getDisplayAnalysis = (analysisText) => {
    if (!analysisText) return '';
    // Remove the bias score line (e.g., "**BIAS SCORE: 6/10** - ")
    return analysisText.replace(/\*\*BIAS SCORE:\s*\d+\/10\*\*\s*-\s*/i, '').trim();
  };

  // Separate bias analysis from structured content
  const separateContent = (analysisText) => {
    if (!analysisText) return { biasText: '', structuredContent: '' };
    
    const cleanText = getDisplayAnalysis(analysisText);
    
    // Find where structured content starts (looking for **MULTIPLE PERSPECTIVES:** or similar)
    const structuredMatch = cleanText.match(/(\*\*MULTIPLE PERSPECTIVES:\*\*.*)/s);
    
    if (structuredMatch) {
      const biasText = cleanText.substring(0, structuredMatch.index).trim();
      const structuredContent = structuredMatch[1];
      return { biasText, structuredContent };
    }
    
    return { biasText: cleanText, structuredContent: '' };
  };

  // Bias Meter Component
  const BiasMeter = ({ score, biasDirection }) => {
    if (score === null) return null;

    const getScoreColor = (score) => {
      if (score <= 3) return 'text-green-600';
      if (score <= 6) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getMeterColor = (position, score) => {
      if (position <= score) {
        if (score <= 3) return 'bg-green-500';
        if (score <= 6) return 'bg-yellow-500';
        return 'bg-red-500';
      }
      return 'bg-gray-200';
    };

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>Bias Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}/10</span>
        </h3>
        
        {/* Bias Meter */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-green-600 font-medium">Not Biased</span>
            <span className="text-sm text-red-600 font-medium">Biased</span>
          </div>
          
          {/* Meter Bar */}
          <div className="flex gap-1 mb-2">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className={`h-6 flex-1 rounded-sm ${getMeterColor(index + 1, score)}`}
              />
            ))}
          </div>
          
          {/* Scale Numbers */}
          <div className="flex justify-between text-xs text-gray-500">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Low Bias (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Moderate Bias (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">High Bias (7-10)</span>
          </div>
        </div>
      </div>
    );
  };

  const handleBiasAnalysis = async () => {
    if (hasAnalyzed && biasAnalysis) {
      onOpen();
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsId: article.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBiasAnalysis(data.analysis);
        setHasAnalyzed(true);
      } else {
        setBiasAnalysis(`Error: ${data.error || 'Failed to analyze article'}`);
      }
    } catch (error) {
      setBiasAnalysis(`Error: Failed to connect to analysis service`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-start analysis when component mounts
  React.useEffect(() => {
    if (article && article.id && !hasAnalyzed && !isAnalyzing) {
      handleBiasAnalysis();
    }
  }, [article]);

  const openModal = () => {
    onOpen();
    // If analysis isn't done yet and modal is opened, show the loading state
  };

  const reAnalyze = () => {
    setBiasAnalysis(null);
    setHasAnalyzed(false);
    handleBiasAnalysis();
  };

  return (
    <>
      {/* Bias Analysis Button - Fixed Position */}
      <motion.div 
        className="fixed left-4 bottom-20 sm:right-12 sm:left-auto sm:top-[40%] sm:bottom-auto z-30"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        <Button
          color="secondary"
          variant="shadow"
          size="lg"
          onClick={openModal}
          className="rounded-full px-4 py-2 flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 relative"
        >
          <ShieldCheckIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Bias Check</span>
          {isAnalyzing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          )}
          {hasAnalyzed && !isAnalyzing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
        </Button>
      </motion.div>

      {/* Bias Analysis Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
        className="max-h-[80vh]"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Bias Analysis Report</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              AI-powered analysis of "{article.title}"
            </p>
          </ModalHeader>
          <ModalBody>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spinner size="lg" color="primary" className="mb-4" />
                <p className="text-gray-600">Analyzing article for bias and perspective...</p>
                <p className="text-sm text-gray-500 mt-2">This analysis started when you loaded the page</p>
              </div>
            ) : biasAnalysis ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> This analysis is generated by AI and should be used as a starting point for critical thinking, not as absolute truth.
                  </p>
                </div>
                <BiasMeter 
                  score={extractBiasScore(biasAnalysis)} 
                  biasDirection={extractBiasDirection(biasAnalysis)} 
                />
                {(() => {
                  const { biasText, structuredContent } = separateContent(biasAnalysis);
                  return (
                    <>
                      {biasText && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Summary</h4>
                          <p className="text-gray-800 leading-relaxed">
                            {biasText}
                          </p>
                        </div>
                      )}
                      {structuredContent && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mb-3">{children}</h1>,
                                h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium text-gray-900 mb-2">{children}</h3>,
                                p: ({children}) => <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>,
                                ul: ({children}) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                li: ({children}) => <li className="text-gray-700">{children}</li>,
                                strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>
                              }}
                            >
                              {structuredContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Starting analysis...</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            {biasAnalysis && !isAnalyzing && (
              <Button 
                color="primary" 
                onPress={reAnalyze}
              >
                Re-analyze
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
} 