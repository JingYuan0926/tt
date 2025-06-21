import "@/styles/globals.css";
import { useEffect } from "react";
import {HeroUIProvider} from "@heroui/react";
import Header from "@/components/Header";
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
  // Initialize Stagewise toolbar when app mounts
  useEffect(() => {
    setupStagewise();
  }, []);

  return (
    <HeroUIProvider>
      <div>
        <Header />
        {/* Main content wrapper - header now scrolls naturally with content */}
        <main className="min-h-screen pt-0">
          <Component {...pageProps} />
        </main>
      </div>
    </HeroUIProvider>
  );
}
