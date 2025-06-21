import Image from "next/image";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// HeroUI components
import { Button as HeroButton, Card as HeroCard, CardBody, CardHeader as HeroCardHeader, Input as HeroInput } from "@heroui/react";
import IntroVideo from "@/components/IntroVideo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const router = useRouter();
  
  // State to control intro video display
  const [showIntro, setShowIntro] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);

  // Check if we should show intro on component mount
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;
    
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    
    console.log('Index page intro check:', { hasSeenIntro });
    
    // Show intro every time (you can change this logic if needed)
    console.log('Showing intro video on index page');
    setShowIntro(true);
    setShowMainContent(false);
    setIsLoaded(true);
  }, []);

  // Handle intro completion - redirect to news page
  const handleIntroComplete = () => {
    console.log('Intro completed - redirecting to news page');
    localStorage.setItem('hasSeenIntro', 'true'); // Optional: save completion
    setShowIntro(false);
    
    // Redirect to news page after a short delay
    setTimeout(() => {
      router.push('/news');
    }, 500);
  };

  // Show loading until we check localStorage
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show intro video first
  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <div
      className={`${inter.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)] transition-opacity duration-1000 ${showMainContent ? 'opacity-100' : 'opacity-0'}`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* HeroUI Demo Section */}
        <HeroCard className="w-full max-w-md">
          <HeroCardHeader className="pb-3">
            <h4 className="font-bold text-large">HeroUI Demo</h4>
            <p className="text-tiny uppercase font-bold">Beautiful components built with React & Tailwind CSS</p>
          </HeroCardHeader>
          <CardBody className="space-y-4">
            <HeroInput 
              type="email" 
              label="Email" 
              placeholder="Enter your email..."
              variant="bordered"
            />
            <div className="flex gap-2">
              <HeroButton color="primary">Primary Button</HeroButton>
              <HeroButton variant="bordered">Bordered Button</HeroButton>
              <HeroButton color="secondary" variant="flat">Flat Button</HeroButton>
            </div>
          </CardBody>
        </HeroCard>

        {/* shadcn/ui Demo Section */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>shadcn/ui Demo</CardTitle>
            <CardDescription>
              Beautiful components built with Radix UI and Tailwind CSS.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Enter your email..." />
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </CardContent>
        </Card>

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-inter)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              pages/index.js
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
          <li className="mb-2">
            <strong>Both HeroUI and shadcn/ui components are now available!</strong> Check out
            the demos above.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
