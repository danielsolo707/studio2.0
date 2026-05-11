"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const portalTarget = useMemo(() => (typeof document === 'undefined' ? null : document.body), []);

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
      {portalTarget &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMenu}
                className="fixed inset-0 z-[1000] bg-black md:hidden"
              >
                {/* Menu panel */}
                <motion.nav
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute inset-0 h-full w-full bg-black"
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
                    href="/gateway"
                    onClick={closeMenu}
                    className="font-headline text-xl tracking-[0.3em] text-white/80 hover:text-[#DFFF00] transition-colors py-3"
                  >
                    PROJECTS
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
              </motion.div>
            )}
          </AnimatePresence>,
          portalTarget,
        )}
    </>
  );
}