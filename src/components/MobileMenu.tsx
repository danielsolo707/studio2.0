"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#DFFF00]/50"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - fully opaque */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black z-[60] md:hidden"
            />

            {/* Menu panel */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-[#030305] border-l border-white/10 z-[70] md:hidden"
              aria-label="Main navigation"
            >
              <div className="flex flex-col h-full p-6 pt-20">
                {/* Close button */}
                <button
                  onClick={closeMenu}
                  className="self-end p-2 rounded-lg hover:bg-white/10 transition-colors mb-8"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Navigation links */}
                <div className="flex flex-col space-y-6 flex-1">
                  <a
                    href="#about"
                    onClick={closeMenu}
                    className="font-headline text-xl tracking-[0.3em] text-white/80 hover:text-[#DFFF00] transition-colors py-3"
                  >
                    ABOUT
                  </a>
                  <a
                    href="#works"
                    onClick={closeMenu}
                    className="font-headline text-xl tracking-[0.3em] text-white/80 hover:text-[#DFFF00] transition-colors py-3"
                  >
                    WORKS
                  </a>
                  <a
                    href="/works/motion"
                    onClick={closeMenu}
                    className="font-headline text-lg tracking-[0.3em] text-white/50 hover:text-[#DFFF00] transition-colors py-3 pl-4 border-l border-white/10"
                  >
                    MOTION
                  </a>
                  <a
                    href="/works/code"
                    onClick={closeMenu}
                    className="font-headline text-lg tracking-[0.3em] text-white/50 hover:text-[#DFFF00] transition-colors py-3 pl-4 border-l border-white/10"
                  >
                    CODE
                  </a>
                  <a
                    href="#contact"
                    onClick={closeMenu}
                    className="font-headline text-xl tracking-[0.3em] text-white/80 hover:text-[#DFFF00] transition-colors py-3"
                  >
                    CONTACT
                  </a>
                  
                  {/* Divider */}
                  <div className="border-t border-white/10 pt-6 mt-auto">
                    <span className="font-headline text-sm tracking-[0.3em] text-[#DFFF00] opacity-80">
                      &copy;2026
                    </span>
                  </div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}