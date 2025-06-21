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
    const router = useRouter();

    // Set selected nav based on current route
    useEffect(() => {
        const currentPath = router.pathname;
        console.log('Current path:', currentPath); // Debug log

        if (currentPath === '/news' || currentPath === '/details') {
            setSelectedNav('News');
        } else if (currentPath === '/profile') {
            setSelectedNav('Profile');
        } else if (currentPath === '/download') {
            setSelectedNav('Download');
        } else {
            setSelectedNav('News'); // Default to News for any other route
        }

        console.log('Selected nav set to:', currentPath === '/news' || currentPath === '/details' ? 'News' :
            currentPath === '/profile' ? 'Profile' :
                currentPath === '/download' ? 'Download' : 'News'); // Debug log
    }, [router.pathname]);

    // Handle tab navigation click - navigate to respective pages
    const handleNavClick = (key) => {
        console.log('Tab clicked:', key); // Debug log

        // Update state immediately for better UX
        setSelectedNav(key);

        // Navigate to the respective page
        const routeMapping = {
            "News": "/news",
            "Profile": "/profile",
            "Download": "/download"
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
            {/* Static header container - stays at top of content, scrolls naturally */}
            <div className="relative top-0 w-full bg-white border-b border-gray-100">
                {/* Main navbar with aligned logo and navigation */}
                <Navbar
                    position="relative"
                    maxWidth="full"
                    className="py-1 px-6 bg-transparent"
                    style={{
                        width: "100%",
                        backgroundColor: "transparent"
                    }}
                    isBordered={false}
                >
                    {/* Left side - Tea Time logo */}
                    <NavbarBrand className="flex-shrink-0">
                        <Link href="/news" className="flex items-center">
                            {/* Logo Text with UnifrakturCook Font */}
                            <span
                                className="text-5xl font-bold text-black"
                                style={{
                                    fontFamily: 'UnifrakturCook, cursive'
                                }}
                            >
                                Tea Time
                            </span>
                        </Link>
                    </NavbarBrand>

                    {/* Center/Right side - Navigation tabs aligned with logo */}
                    <NavbarContent className="flex items-center ml-12" justify="center">
                        <div className="flex items-center">
                            <Tabs
                                aria-label="Navigation"
                                radius="full"
                                selectedKey={selectedNav}
                                onSelectionChange={handleNavClick}
                                classNames={{
                                    base: "bg-transparent",
                                    tabList: "gap-8 bg-transparent",
                                    tab: "px-8 py-3 text-lg font-medium text-gray-600 data-[hover=true]:text-black data-[selected=true]:font-bold transition-colors min-h-[48px]",
                                    cursor: "bg-white shadow-sm border border-gray-200",
                                    panel: "bg-transparent"
                                }}
                                variant="light"
                                disableAnimation={false}
                            >
                                <Tab key="News" title="News" />
                                <Tab key="Profile" title="Profile" />
                                <Tab key="Download" title="Download" />
                            </Tabs>
                        </div>
                    </NavbarContent>

                    {/* Right side - Empty space for balance */}
                    <NavbarContent justify="end" className="flex-shrink-0">
                    </NavbarContent>
                </Navbar>
            </div>
        </>
    );
} 