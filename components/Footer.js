import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Newsletter subscription logic would go here
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Footer link sections
  const footerSections = [
    {
      title: 'About',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Editorial Standards', href: '/editorial' },
        { name: 'Our Team', href: '/team' },
        { name: 'Careers', href: '/careers' }
      ]
    },
    {
      title: 'News',
      links: [
        { name: 'Latest Headlines', href: '/news' },
        { name: 'Politics', href: '/politics' },
        { name: 'Technology', href: '/technology' },
        { name: 'Business', href: '/business' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Help Center', href: '/help' },
        { name: 'Press Releases', href: '/press' },
        { name: 'Advertise', href: '/advertise' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' }
      ]
    }
  ];

  // Social media links
  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com', icon: '𝕏' },
    { name: 'Facebook', href: 'https://facebook.com', icon: '📘' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: '💼' },
    { name: 'RSS', href: '/rss', icon: '📡' }
  ];

  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="mb-12 text-center"
        >
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            Stay Informed
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the latest news and analysis delivered directly to your inbox. 
            Join thousands of readers who trust our reporting.
          </p>
          <form 
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button type="submit" className="whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
        >
          {footerSections.map((section, index) => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Button
                      variant="link"
                      asChild
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <a href={link.href}>{link.name}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.6 }}
          className="flex justify-center items-center gap-4 mb-8"
        >
          <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
          {socialLinks.map((social) => (
            <Button
              key={social.name}
              variant="ghost"
              size="sm"
              asChild
              className="h-10 w-10 p-0"
            >
              <a 
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex items-center justify-center"
              >
                <span className="text-lg">{social.icon}</span>
              </a>
            </Button>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.8 }}
          className="pt-8 border-t border-border"
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              <p>© {currentYear} Tea Time. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="link"
                asChild
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <a href="/sitemap">Sitemap</a>
              </Button>
              <Button
                variant="link"
                asChild
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <a href="/ethics">Ethics Policy</a>
              </Button>
              <Button
                variant="link"
                asChild
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <a href="/corrections">Corrections</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 