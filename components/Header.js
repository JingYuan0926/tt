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

    // Handle tab navigation click - navigate to respective pages
    const handleNavClick = (key) => {
        console.log('Tab clicked:', key); // Debug log

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
            {/* Static header container - stays at top of content, scrolls naturally */}
            <div className="relative top-0 w-full bg-white border-b border-gray-100">
                {/* Navigation tabs container */}
                <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 10 }}>
                    <div className="w-full max-w-screen-xl mx-auto px-6 flex justify-center">
                        {/* Navigation tabs */}
                        <div className="pointer-events-auto pt-4 ml-8">
                            <Tabs
                                aria-label="Navigation"
                                radius="full"
                                selectedKey={selectedNav}
                                onSelectionChange={handleNavClick}
                                classNames={{
                                    base: "bg-transparent mt-2",
                                    tabList: "gap-6 bg-transparent",
                                    tab: "px-5 py-2 text-gray-600 data-[hover=true]:text-black data-[selected=true]:font-bold transition-colors",
                                    cursor: "bg-white shadow-sm border border-gray-200",
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

                {/* Main navbar */}
                <Navbar
                    position="relative"
                    maxWidth="full"
                    height="5rem"
                    className="py-4 px-6 bg-transparent"
                    style={{
                        width: "100%",
                        backgroundColor: "transparent"
                    }}
                    isBordered={false}
                >
                    {/* Left side - Tea Time logo */}
                    <NavbarBrand className="w-[200px]">
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

                    {/* Middle - Invisible placeholder for navigation */}
                    <NavbarContent className="flex justify-center invisible" justify="center">
                        <div style={{ width: "470px", height: "40px" }}></div>
                    </NavbarContent>

                    {/* Right side - Empty */}
                    <NavbarContent justify="end" className="w-[130px]">
                    </NavbarContent>
                </Navbar>
            </div>
        </>
    );
} 