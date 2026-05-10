"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"

interface CodeAccordionItem {
  functionName: string
  params?: string
  content: string
}

interface CodeAccordionProps {
  items: CodeAccordionItem[]
}

export function CodeAccordion({ items }: CodeAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (name: string) => {
    setOpenItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-3"
    >
      {items.map((item) => {
        const isOpen = openItems.includes(item.functionName)
        
        return (
          <div 
            key={item.functionName}
            className="bg-muted/20 border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.functionName)}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-muted/40 transition-colors text-left"
            >
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
              
              <code className="font-mono text-xs sm:text-sm truncate">
                <span className="text-[#C586C0]">function</span>
                <span className="text-[#DCDCAA]"> {item.functionName}</span>
                <span className="text-foreground">(</span>
                {item.params && <span className="text-[#9CDCFE]">{item.params}</span>}
                <span className="text-foreground"> {"{"}</span>
                {!isOpen && <span className="text-muted-foreground"> ... {"}"}</span>}
              </code>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 sm:px-4 pb-4 pl-8 sm:pl-11">
                    <div className="bg-[#0d0d0d] rounded-md p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <pre className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </pre>
                    </div>
                    <div className="mt-2 font-mono text-xs sm:text-sm text-foreground">
                      <span>{"}"}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </motion.div>
  )
}