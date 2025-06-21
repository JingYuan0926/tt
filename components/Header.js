import { Button, Tabs, Tab, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";

// Configure Inter font
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

import { useRouter } from "next/router";

export default function Header() {
  const [selectedNav, setSelectedNav] = useState("Homepage");
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const router = useRouter();
  const isManualScrolling = useRef(false);
  
  // Determine if header should be shrunk (when scrolled OR not on home section)
  const shouldShrink = isScrolled;
  
  // Handle URL hash navigation on initial load
  useEffect(() => {
    if (router.pathname === '/' && router.asPath.includes('#')) {
      const hash = router.asPath.split('#')[1];
      setTimeout(() => {
        const section = document.getElementById(hash);
        if (section) {
          isManualScrolling.current = true;
          window.scrollTo({
            top: section.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Update selected nav based on the hash
          const navKey = getNavKeyFromSectionId(hash);
          if (navKey) {
            setSelectedNav(navKey);
          }
          
          // Reset the flag after animation completes
          setTimeout(() => {
            isManualScrolling.current = false;
          }, 800); // Slightly longer than typical scroll animation
        }
      }, 100); // Small delay to ensure DOM is fully loaded
    }
  }, [router.asPath, router.pathname]);
  
  // Helper function to get nav key from section ID
  const getNavKeyFromSectionId = (sectionId) => {
    const mapping = {
      "homepage": "Homepage",
      "verify": "Verify",
      "challenge": "Challenge",
      "profile": "Profile"
    };
    return mapping[sectionId] || "Homepage";
  };
  
  // Handle scroll events with smoother transition
  useEffect(() => {
    const handleScroll = () => {
      // Skip processing if manual scrolling is in progress
      if (isManualScrolling.current) return;
      
      // Check if scrolled past a threshold (e.g., 50px)
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      
      // Calculate scroll progress for smoother transition (0 to 1)
      const progress = Math.min(1, window.scrollY / 100);
      setScrollProgress(progress);
      
      // Update active tab based on scroll position
      updateActiveTabOnScroll();
    };
    
    // Function to update the active tab based on scroll position
    const updateActiveTabOnScroll = () => {
      // Only run on home page
      if (router.pathname !== '/') return;
      
      const sections = {
        "Homepage": document.getElementById("homepage"),
        "Verify": document.getElementById("verify"),
        "Challenge": document.getElementById("challenge"),
        "Profile": document.getElementById("profile")
      };
      
      // Get current scroll position
      const scrollPosition = window.scrollY + 100; // Add offset to account for header
      
      // Find which section is currently in view
      for (const [key, section] of Object.entries(sections)) {
        if (!section) continue;
        
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          if (selectedNav !== key) {
            setSelectedNav(key);
          }
          break;
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router.pathname, selectedNav]);
  
  // Calculate dynamic width based on scroll progress and current section
  const getNavbarWidth = () => {
    // Shrink when scrolled down OR when not on home section
    if (shouldShrink) return "var(--navbar-width-md)";
    
    // Otherwise stay at full width (only at top AND on home section)
    return "100%";
  };
  
  // Handle tab navigation click - improved to reduce flickering
  const handleNavClick = (key) => {
    // Prevent acting on the same tab multiple times
    if (selectedNav === key) return;
    
    // Set flag to prevent scroll listener from changing nav during animation
    isManualScrolling.current = true;
    
    // Update state first
    setSelectedNav(key);
    
    // Only scroll if on the home page
    if (router.pathname !== '/') {
      // Navigate to home page without hash
      router.push('/');
      return;
    }
    
    // Get the section id based on the tab key
    const sectionId = getSectionIdFromKey(key);
    const section = document.getElementById(sectionId);
    
    if (section) {
      // No longer updating URL hash
      
      // Use requestAnimationFrame to ensure smooth animation
      requestAnimationFrame(() => {
        window.scrollTo({
          top: section.offsetTop - 80, // Offset to account for the header
          behavior: 'smooth'
        });
        
        // Reset manual scrolling flag after animation finishes
        setTimeout(() => {
          isManualScrolling.current = false;
        }, 800); // Duration slightly longer than typical scroll animation
      });
    } else {
      // In case section not found, reset the flag
      isManualScrolling.current = false;
    }
  };
  
  // Helper function to get section ID from tab key
  const getSectionIdFromKey = (key) => {
    const mapping = {
      "Homepage": "homepage",
      "Verify": "verify",
      "Challenge": "challenge",
      "Profile": "profile"
    };
    return mapping[key] || "homepage";
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={`${inter.variable} fixed top-0 left-0 right-0 z-50 flex justify-center w-full font-[family-name:var(--font-inter)]`}>
        {/* Container with fixed position and width for the navigation tabs */}
        <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 51 }}>
          <div className="w-full max-w-screen-xl mx-auto px-6 flex justify-center">
            {/* Fixed position navigation tabs - always in same position */}
            <div 
              className={`pointer-events-auto pt-4 ml-8 transition-transform duration-420 ease-in-out ${
                shouldShrink ? "transform translate-y-[5px]" : ""
              }`}
            >
              <Tabs 
                aria-label="Navigation" 
                radius="full"
                selectedKey={selectedNav}
                onSelectionChange={handleNavClick}
                classNames={{
                  base: "bg-transparent mt-2",
                  tabList: "gap-6 bg-transparent",
                  tab: "px-5 py-2 text-gray-600 data-[hover=true]:text-black data-[selected=true]:font-bold transition-colors font-[family-name:var(--font-inter)]",
                  cursor: "bg-transparent shadow-sm border border-gray-200",
                  panel: "bg-transparent"
                }}
                variant="light"
                disableAnimation={false}
              >
                <Tab key="Homepage" title="Homepage" />
                <Tab key="Verify" title="Verify" />
                <Tab key="Challenge" title="Challenge" />
                <Tab key="Profile" title="Profile" />
              </Tabs>
            </div>
          </div>
        </div>

        <Navbar 
          position="relative" 
          maxWidth={shouldShrink ? "md" : "full"} 
          height="3rem"
          className={`py-4 px-6 transition-all duration-420 ease-in-out bg-transparent ${
            shouldShrink ? "mx-auto rounded-lg shadow-md mt-2 transform scale-98" : "w-full"
          }`}
          style={{
            width: getNavbarWidth(),
            "--navbar-width-md": "80%", // Custom property for medium width
            transitionProperty: "width, border-radius, box-shadow, margin, transform",
            transitionDuration: "420ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            backgroundColor: "transparent"
          }}
          isBordered={false}
        >
          {/* Left side - Tea Time logo with conditional positioning */}
          <NavbarBrand className={`transition-all duration-420 ${shouldShrink ? "w-[200px]" : "w-[130px]"}`}>
            <Link href="/" className="flex items-center">
              {/* Logo Text with UnifrakturCook Font - positioned to be most left when shrunk */}
              <span 
                className={`text-5xl font-bold text-black ${
                  shouldShrink ? "transform -translate-x-[120px]" : ""
                }`}
                style={{ 
                  fontFamily: 'UnifrakturCook, cursive'
                }}
              >
                Tea Time
              </span>
            </Link>
          </NavbarBrand>

          {/* Middle - Invisible placeholder for navigation */}
          <NavbarContent className="flex justify-center invisible" justify="center">
            <div style={{ width: "470px", height: "40px" }}></div>
          </NavbarContent>

          {/* Right side - Empty */}
          <NavbarContent justify="end" className="transition-all duration-420 w-[130px]">
          </NavbarContent>
        </Navbar>
      </div>
    </>
  );
} 