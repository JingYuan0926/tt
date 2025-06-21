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
    const [selectedNav, setSelectedNav] = useState("News");
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const router = useRouter();
    const isManualScrolling = useRef(false);

    // Determine if header should be shrunk (when scrolled OR not on home section)
    const shouldShrink = isScrolled;

    // Set selected nav based on current route
    useEffect(() => {
        const currentPath = router.pathname;
        console.log('Current path:', currentPath); // Debug log

        if (currentPath === '/news' || currentPath === '/details') {
            setSelectedNav('News');
        } else if (currentPath === '/verify') {
            setSelectedNav('Verify');
        } else if (currentPath === '/challenge') {
            setSelectedNav('Challenge');
        } else if (currentPath === '/profile') {
            setSelectedNav('Profile');
        } else {
            setSelectedNav('News'); // Default to News for any other route
        }

        console.log('Selected nav set to:', currentPath === '/news' || currentPath === '/details' ? 'News' :
            currentPath === '/verify' ? 'Verify' :
                currentPath === '/challenge' ? 'Challenge' :
                    currentPath === '/profile' ? 'Profile' : 'News'); // Debug log
    }, [router.pathname]);

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
        };

        // Add scroll event listener
        window.addEventListener("scroll", handleScroll);

        // Clean up
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Calculate dynamic width based on scroll progress and current section
    const getNavbarWidth = () => {
        // Shrink when scrolled down OR when not on home section
        if (shouldShrink) return "var(--navbar-width-md)";

        // Otherwise stay at full width (only at top AND on home section)
        return "100%";
    };

    // Handle tab navigation click - navigate to respective pages
    const handleNavClick = (key) => {
        console.log('Tab clicked:', key); // Debug log

        // Don't prevent if it's the same tab - allow re-navigation
        // Update state immediately for better UX
        setSelectedNav(key);

        // Navigate to the respective page
        const routeMapping = {
            "News": "/news",
            "Verify": "/verify",
            "Challenge": "/challenge",
            "Profile": "/profile"
        };

        const targetRoute = routeMapping[key];
        if (targetRoute) {
            console.log('Navigating to:', targetRoute); // Debug log
            router.push(targetRoute);
        }
    };

    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
                {/* Container with fixed position and width for the navigation tabs */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 51 }}>
                    <div className="w-full max-w-screen-xl mx-auto px-6 flex justify-center">
                        {/* Fixed position navigation tabs - always in same position */}
                        <div
                            className={`pointer-events-auto pt-4 ml-8 transition-transform duration-420 ease-in-out ${shouldShrink ? "transform translate-y-[5px]" : ""
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
                                    tab: "px-5 py-2 text-gray-600 data-[hover=true]:text-black data-[selected=true]:font-bold transition-colors",
                                    cursor: "bg-transparent shadow-sm border border-gray-200",
                                    panel: "bg-transparent"
                                }}
                                variant="light"
                                disableAnimation={false}
                            >
                                <Tab key="News" title="News" />
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
                    className={`py-4 px-6 transition-all duration-420 ease-in-out bg-transparent ${shouldShrink ? "mx-auto rounded-lg shadow-md mt-2 transform scale-98" : "w-full"
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
                        <Link href="/news" className="flex items-center">
                            {/* Logo Text with UnifrakturCook Font - positioned to be most left when shrunk */}
                            <span
                                className={`text-5xl font-bold text-black ${shouldShrink ? "transform -translate-x-[120px]" : ""
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