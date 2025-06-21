import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ErrorModal } from "@/components/ui/modal";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Hardcoded sample comments for testing
const SAMPLE_COMMENTS = [
    "This is a really well-written article. The author explained everything clearly and concisely.",
    "Finally, some journalism that actually does the research. Kudos to the team!",
    "Great job highlighting this issue. More people need to be aware of it.",
    "I really appreciate the balanced tone of this article. It's informative without being sensational.",
    "Excellent reporting! This gives me hope that the media can still get things right.",
    "This piece gave me a new perspective on the topic. Very enlightening.",
    "I shared this with my friends—it’s that good. Thank you for writing it!",
    "What a refreshing read. It's nice to see facts presented without drama or spin.",
    "I'm not sure I agree with the conclusion, but at least the article lays out the reasoning clearly.", // Neutral-leaning negative
    "Some parts feel a bit biased, especially in how opposing views were framed." // Mildly critical
  ];
  
  

export default function CommentAnalysisTest() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Error modal state
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null
  });

  // Helper function for error modal
  const showErrorModal = (title, message, details = null) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details
    });
  };

  const closeErrorModal = () => {
    setErrorModal(prev => ({ ...prev, isOpen: false }));
  };

  // Page load animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle comment analysis
  const analyzeComments = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const response = await fetch('/api/analyzeComments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: SAMPLE_COMMENTS
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze comments');
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      
      showErrorModal(
        'Analysis Failed',
        error.message || 'Unable to analyze comments. Please try again.',
        [
          'Check your internet connection',
          'Ensure OpenAI API key is configured in .env.local',
          'Try again in a few moments'
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get tendency color and label based on score
  const getTendencyInfo = (score) => {
    if (score >= 81) {
      return {
        label: 'Very Positive',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        sliderColor: 'bg-green-500'
      };
    } else if (score >= 61) {
      return {
        label: 'Positive',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        sliderColor: 'bg-green-400'
      };
    } else if (score >= 41) {
      return {
        label: 'Neutral/Mixed',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        sliderColor: 'bg-yellow-400'
      };
    } else if (score >= 21) {
      return {
        label: 'Negative',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        sliderColor: 'bg-red-400'
      };
    } else {
      return {
        label: 'Very Negative',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        sliderColor: 'bg-red-500'
      };
    }
  };

  return (
    <div className={`${inter.variable} min-h-screen bg-gray-50 p-4 pt-24 font-[family-name:var(--font-inter)]`}>
      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <Card 
          className={`transform transition-all duration-700 ease-out ${
            isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Comment Analysis Test</CardTitle>
            <CardDescription className="text-lg">
              Test AI-powered sentiment analysis and highlights generation for news article comments
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <Button 
              onClick={analyzeComments}
              disabled={isAnalyzing}
              className="px-8 py-3 text-lg"
            >
              {isAnalyzing ? 'Analyzing Comments...' : 'Analyze Comments'}
            </Button>
            
            {isAnalyzing && (
              <p className="mt-2 text-sm text-muted-foreground">
                Processing {SAMPLE_COMMENTS.length} comments with AI...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sample Comments Display */}
        <Card 
          className={`transform transition-all duration-700 ease-out delay-100 ${
            isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          <CardHeader>
            <CardTitle className="text-xl">Sample Comments ({SAMPLE_COMMENTS.length})</CardTitle>
            <CardDescription>
              These are the hardcoded comments that will be analyzed
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {SAMPLE_COMMENTS.map((comment, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gray-50 rounded-lg border text-sm"
                >
                  <span className="font-medium text-gray-600">Comment {index + 1}:</span>
                  <p className="mt-1">{comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Overall Tendency */}
            <Card className="transform transition-all duration-700 ease-out">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  📊 Overall Tendency
                </CardTitle>
                <CardDescription>
                  General sentiment of the discussion
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {analysis.tendencyScore}%
                  </div>
                  {(() => {
                    const tendencyInfo = getTendencyInfo(analysis.tendencyScore);
                    return (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full border font-medium ${tendencyInfo.color} ${tendencyInfo.bgColor} ${tendencyInfo.borderColor}`}>
                        {tendencyInfo.label}
                      </div>
                    );
                  })()}
                </div>

                {/* Sentiment Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Negative</span>
                    <span>Neutral</span>
                    <span>Very Positive</span>
                  </div>
                  
                  {/* Custom Progress Bar */}
                  <div className="relative w-full h-2 bg-gray-200 rounded-full">
                    {/* Progress Fill */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${analysis.tendencyScore}%` }}
                    />
                    {/* Thumb/Indicator */}
                    <div 
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow-md transition-all duration-500"
                      style={{ left: `${analysis.tendencyScore}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {analysis.tendencyExplanation && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.tendencyExplanation}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Highlights Summary */}
            <Card className="transform transition-all duration-700 ease-out delay-75">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  ✨ Key Highlights
                </CardTitle>
                <CardDescription>
                  Main themes and representative opinions
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {analysis.highlights && analysis.highlights.length > 0 ? (
                    analysis.highlights.map((highlight, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm text-blue-900 leading-relaxed">
                          {highlight}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No highlights available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!analysis && !isAnalyzing && (
          <Card 
            className={`transform transition-all duration-700 ease-out delay-200 ${
              isPageLoaded ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg">🔧 Setup Instructions</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800">Required Configuration:</p>
                <p className="text-yellow-700 mt-1">
                  Add your OpenAI API key to <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
                </p>
                <code className="block mt-2 p-2 bg-yellow-100 rounded text-yellow-800">
                  OPENAI_API_KEY=your_openai_api_key_here
                </code>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium">Features:</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Sentiment analysis (Positive/Negative/Mixed/Neutral)</li>
                    <li>Key highlights extraction</li>
                    <li>Representative opinion summaries</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">AI Model:</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>OpenAI GPT-4o-mini</li>
                    <li>Optimized for comment analysis</li>
                    <li>Structured JSON responses</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
    </div>
  );
} 