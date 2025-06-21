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

  // Social media links with SVG icons
  const socialLinks = [
    { 
      name: 'Twitter', 
      href: 'https://twitter.com', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      href: 'https://facebook.com', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C8.396 0 7.989.013 7.041.048 6.094.083 5.48.199 4.942.374c-.54.181-1.017.424-1.479.886-.462.462-.705.939-.886 1.479-.175.538-.291 1.152-.326 2.099C2.013 5.787 2 6.194 2 9.814v4.372c0 3.62.013 4.027.048 4.975.035.947.151 1.561.326 2.099.181.54.424 1.017.886 1.479.462.462.939.705 1.479.886.538.175 1.152.291 2.099.326.948.035 1.355.048 4.975.048h4.372c3.62 0 4.027-.013 4.975-.048.947-.035 1.561-.151 2.099-.326.54-.181 1.017-.424 1.479-.886.462-.462.705-.939.886-1.479.175-.538.291-1.152.326-2.099.035-.948.048-1.355.048-4.975V9.814c0-3.62-.013-4.027-.048-4.975-.035-.947-.151-1.561-.326-2.099-.181-.54-.424-1.017-.886-1.479-.462-.462-.939-.705-1.479-.886-.538-.175-1.152-.291-2.099-.326C16.027.013 15.62 0 12.017 0zM12.017 2.162c3.549 0 3.97.013 5.375.048.795.035 1.227.166 1.515.276.381.148.653.326.939.612.286.286.464.558.612.939.11.288.241.72.276 1.515.035 1.405.048 1.826.048 5.375s-.013 3.97-.048 5.375c-.035.795-.166 1.227-.276 1.515-.148.381-.326.653-.612.939-.286.286-.558.464-.939.612-.288.11-.72.241-1.515.276-1.405.035-1.826.048-5.375.048s-3.97-.013-5.375-.048c-.795-.035-1.227-.166-1.515-.276-.381-.148-.653-.326-.939-.612-.286-.286-.464-.558-.612-.939-.11-.288-.241-.72-.276-1.515-.035-1.405-.048-1.826-.048-5.375s.013-3.97.048-5.375c.035-.795.166-1.227.276-1.515.148-.381.326-.653.612-.939.286-.286.558-.464.939-.612.288-.11.72-.241 1.515-.276 1.405-.035 1.826-.048 5.375-.048zm0 3.676c-3.202 0-5.798 2.596-5.798 5.798s2.596 5.798 5.798 5.798 5.798-2.596 5.798-5.798-2.596-5.798-5.798-5.798zm0 9.558c-2.072 0-3.76-1.688-3.76-3.76s1.688-3.76 3.76-3.76 3.76 1.688 3.76 3.76-1.688 3.76-3.76 3.76zm7.375-9.82c0 .748-.607 1.355-1.355 1.355-.748 0-1.355-.607-1.355-1.355 0-.748.607-1.355 1.355-1.355.748 0 1.355.607 1.355 1.355z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-250 mt-16">
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
            Join thousands of readers who trust our services.
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
                className="flex items-center justify-center hover:text-primary transition-colors"
              >
                {social.icon}
              </a>
            </Button>
          ))}
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.8 }}
          className="pt-8 border-t border-gray-250"
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