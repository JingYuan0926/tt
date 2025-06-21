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
import { ErrorModal } from "@/components/ui/modal";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Hardcoded sample comments for testing
const SAMPLE_COMMENTS = [
  "This is a really interesting article! I learned a lot about the topic and appreciate the thorough research.",
  "I disagree with the main points here. The author seems to have missed some key facts that would change the conclusion.",
  "Great piece of journalism. Finally someone is covering this important issue that affects so many people.",
  "The data presented doesn't seem accurate. I've seen conflicting numbers from other reliable sources.",
  "This article is biased and one-sided. Where are the opposing viewpoints?",
  "Thank you for bringing attention to this matter. It's about time someone spoke up about these problems.",
  "I'm not sure I understand the implications of this. Could someone explain how this affects the average person?",
  "Excellent analysis! The author clearly knows what they're talking about and presents the information well.",
  "This is just fear-mongering. The situation isn't as bad as the article makes it seem.",
  "I hope this leads to some positive changes. We really need action on this issue, not just more talk."
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

  // Get tendency color based on sentiment
  const getTendencyColor = (tendency) => {
    switch (tendency?.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'mixed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
              
              <CardContent>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg border font-semibold text-lg ${getTendencyColor(analysis.tendency)}`}>
                  {analysis.tendency}
                </div>
                
                {analysis.tendencyExplanation && (
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
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