import { 
    Button, 
    Tabs, 
    Tab, 
    Navbar, 
    NavbarBrand, 
    NavbarContent, 
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Link as HeroLink
} from "@heroui/react";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    // Navigation items for mobile menu
    const menuItems = [
        { key: "News", title: "News", route: "/news" },
        { key: "Profile", title: "Profile", route: "/profile" },
        { key: "Download", title: "Download", route: "/download" },
        { key: "Subscribe", title: "Subscribe", route: "/subscribe" }
    ];

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
        } else if (currentPath === '/subscribe') {
            setSelectedNav('Subscribe');
        } else {
            setSelectedNav('News'); // Default to News for any other route
        }

        console.log('Selected nav set to:', currentPath === '/news' || currentPath === '/details' ? 'News' :
            currentPath === '/profile' ? 'Profile' :
                currentPath === '/download' ? 'Download' :
                    currentPath === '/subscribe' ? 'Subscribe' : 'News'); // Debug log
    }, [router.pathname]);

    // Handle tab navigation click - navigate to respective pages
    const handleNavClick = (key) => {
        console.log('Tab clicked:', key); // Debug log

        // Update state immediately for better UX
        setSelectedNav(key);
        
        // Close mobile menu if open
        setIsMenuOpen(false);

        // Navigate to the respective page
        const routeMapping = {
            "News": "/news",
            "Profile": "/profile",
            "Download": "/download",
            "Subscribe": "/subscribe"
        };

        const targetRoute = routeMapping[key];
        if (targetRoute) {
            console.log('Navigating to:', targetRoute); // Debug log
            router.push(targetRoute);
        }
    };

    // Handle mobile menu item click
    const handleMobileMenuClick = (item) => {
        console.log('Mobile menu item clicked:', item.key); // Debug log
        
        // Explicitly close the menu first
        setIsMenuOpen(false);
        
        // Update selected nav
        setSelectedNav(item.key);
        
        // Navigate to the page
        console.log('Navigating to:', item.route); // Debug log
        router.push(item.route);
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
            <div className="relative top-0 w-full bg-white border-b border-gray-250">
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
                    isMenuOpen={isMenuOpen}
                    onMenuOpenChange={setIsMenuOpen}
                >
                    {/* Mobile menu toggle and Logo section */}
                    <NavbarContent>
                        <NavbarMenuToggle
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            className="sm:hidden"
                            style={{
                                '--hamburger-color': '#000000',
                                '--hamburger-width': '3px',
                                color: '#000000'
                            }}
                        />
                        <NavbarBrand className="flex-shrink-0">
                            <Link href="/news" className="flex items-center">
                                {/* Logo Text with UnifrakturCook Font */}
                                <span
                                    className="text-5xl font-bold text-black sm:text-5xl text-4xl"
                                    style={{
                                        fontFamily: 'UnifrakturCook, cursive'
                                    }}
                                >
                                    Tea Time
                                </span>
                            </Link>
                        </NavbarBrand>
                    </NavbarContent>

                    {/* Desktop Navigation - Hidden on small screens */}
                    <NavbarContent className="hidden sm:flex items-center ml-12" justify="center">
                        <div className="flex items-center">
                            <Tabs
                                aria-label="Navigation"
                                radius="full"
                                selectedKey={selectedNav}
                                onSelectionChange={handleNavClick}
                                classNames={{
                                    base: "bg-transparent",
                                    tabList: "gap-8 bg-transparent",
                                    tab: "px-8 py-3 text-lg font-medium text-black data-[hover=true]:text-black data-[selected=true]:font-bold data-[selected=true]:text-xl transition-all min-h-[48px]",
                                    cursor: "bg-white shadow-sm border border-gray-200",
                                    panel: "bg-transparent"
                                }}
                                variant="light"
                                disableAnimation={false}
                            >
                                <Tab key="News" title="News" />
                                <Tab key="Profile" title="Profile" />
                                <Tab key="Download" title="Download" />
                                <Tab key="Subscribe" title="Subscribe" />
                            </Tabs>
                        </div>
                    </NavbarContent>

                    {/* Right side - Empty space for balance */}
                    <NavbarContent justify="end" className="flex-shrink-0">
                    </NavbarContent>

                    {/* Mobile Menu */}
                    <NavbarMenu>
                        {menuItems.map((item, index) => (
                            <NavbarMenuItem key={`${item.key}-${index}`}>
                                <HeroLink
                                    className={`w-full text-black ${selectedNav === item.key ? 'font-bold text-xl' : 'font-medium text-lg'}`}
                                    color="foreground"
                                    href="#"
                                    size="lg"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleMobileMenuClick(item);
                                    }}
                                >
                                    {item.title}
                                </HeroLink>
                            </NavbarMenuItem>
                        ))}
                    </NavbarMenu>
                </Navbar>
            </div>
        </>
    );
} 