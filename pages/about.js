import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Inter } from "next/font/google";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Target, Lightbulb, Scale, User } from 'lucide-react';

// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function About() {
  // Team members data
  const teamMembers = [
    {
        name: "Cedric Chung",
        role: "2nd Year Computer Science Student",
        bio: "Student @Taylor's University",
        image: "/team/emily.jpg"
      },
      {
        name: "Liew Qi Jian",
        role: "2nd Year Computer Science Student",
        bio: "Student @TARUMT",
        image: "/team/derek.jpg"
      },
    {
      name: "Phen Jing Yuan",
      role: "3rd Year Computer Science Student",
      bio: "Student @Taylor's University",
      image: "/team/jy.jpg"
    },
    {
      name: "Marcus Tan",
      role: "3rd Year Computer Science Student",
      bio: "Student @Taylor's University",
      image: "/team/marcus.jpg"
    }
  ];

  // Company values data
  const values = [
    {
      title: "Transparency",
      description: "We believe in open, honest reporting and making our bias detection methodology transparent to all users.",
      icon: Search
    },
    {
      title: "Accuracy",
      description: "Our commitment to factual reporting and precise bias analysis ensures reliable information for our readers.",
      icon: Target
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology to provide real-time bias detection and comprehensive news analysis.",
      icon: Lightbulb
    },
    {
      title: "Independence",
      description: "Our editorial independence ensures unbiased reporting, free from external pressures or influences.",
      icon: Scale
    }
  ];

  return (
    <>
      <Head>
        <title>About Us - Tea Time News</title>
        <meta name="description" content="Learn about Tea Time News - our mission, team, and commitment to unbiased journalism" />
      </Head>
      
      <div className={`${inter.className} min-h-screen bg-background pt-2`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          
          {/* About Header - matching NewsHeader style */}
          <div className="text-center border-b-4 border-gray-900 pb-6 mb-8 mt-12 animate-in slide-in-from-bottom duration-700">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-2">ABOUT US</h1>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 font-mono">
              <span>OUR MISSION</span>
              <span>•</span>
              <span>OUR VALUES</span>
              <span>•</span>
              <span>OUR TEAM</span>
            </div>
          </div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <Separator className="w-24 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      At Tea Time News, we believe that informed citizens are the cornerstone of a healthy democracy. 
                      Our mission is to provide transparent, unbiased news analysis powered by cutting-edge technology 
                      that helps readers identify potential bias in news reporting.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We combine traditional journalistic integrity with innovative AI-powered bias detection tools, 
                      ensuring our readers receive not just the news, but the context and analysis needed to form 
                      their own informed opinions.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          <Separator className="mb-16" />

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
                Our Values
              </h2>
              <Separator className="w-24 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <value.icon className="w-12 h-12 mb-2 text-primary" />
                      <CardTitle className="text-xl sm:text-2xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {value.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <Separator className="mb-16" />


        </div>
      </div>
    </>
  );
} 