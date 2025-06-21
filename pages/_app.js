import "@/styles/globals.css";
import { useEffect, useState } from "react";
import {HeroUIProvider} from "@heroui/react";
import Header from "@/components/Header";
import IntroVideo from "@/components/IntroVideo";
import { useRouter } from "next/router";


// Stagewise toolbar integration
function setupStagewise() {
  // Only load in development mode
  if (process.env.NODE_ENV === "development") {
    // Dynamic import to avoid bundling in production
    import("@stagewise/toolbar")
      .then(({ initToolbar }) => {
        // Define toolbar configuration
        const stagewiseConfig = {
          plugins: [
            {
              name: "example-plugin",
              description: "Adds additional context for your components",
              shortInfoForPrompt: () => {
                return "Context information about the selected element";
              },
              mcp: null,
              actions: [
                {
                  name: "Example Action",
                  description: "Demonstrates a custom action",
                  execute: () => {
                    window.alert("This is a custom action!");
                  },
                },
              ],
            },
          ],
        };

        // Initialize the toolbar
        initToolbar(stagewiseConfig);
      })
      .catch((error) => {
        console.warn("Failed to load Stagewise toolbar:", error);
      });
  }
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // State to control intro video display
  const [showIntro, setShowIntro] = useState(false);
  const [isIntroLoaded, setIsIntroLoaded] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  // Check if we should show intro (only for index page and first time)
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    const isIndexPage = router.pathname === '/';
    
    console.log('Intro check:', { hasSeenIntro, isIndexPage, pathname: router.pathname });
    
    // Show intro every time on index page
    if (isIndexPage) {
      console.log('Showing intro video - every visit to index');
      setShowIntro(true);
      setShowMainContent(false); // Hide main content while intro plays
    } else {
      console.log('Not showing intro - not index page');
      setShowIntro(false);
      setShowMainContent(true); // Show main content immediately
    }
    setIsIntroLoaded(true);
  }, [router.pathname, router.isReady]);

  // Initialize Stagewise toolbar when app mounts
  useEffect(() => {
    setupStagewise();
  }, []);

  // Handle intro completion
  const handleIntroComplete = () => {
    console.log('Intro completed');
    // No longer saving to localStorage - intro plays every time
    setShowIntro(false);
    
    // Small delay before showing main content for smooth transition
    setTimeout(() => {
      setShowMainContent(true);
    }, 100);
  };

  // Don't render anything until we check localStorage and router is ready
  if (!isIntroLoaded || !router.isReady) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show intro video only for index page on first visit
  if (showIntro && router.pathname === '/') {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <HeroUIProvider>
      <div className={`transition-opacity duration-1000 ${showMainContent ? 'opacity-100' : 'opacity-0'}`}>
        <Header />
        {/* Main content wrapper - header now scrolls naturally with content */}
        <main className="min-h-screen pt-0">
          <Component {...pageProps} />
        </main>
      </div>
    </HeroUIProvider>
  );
}
