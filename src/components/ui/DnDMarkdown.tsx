import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface DnDMarkdownProps {
  content: string;
  className?: string;
}

export const DnDMarkdown: React.FC<DnDMarkdownProps> = ({ content, className }) => {
  return (
    <div className={cn("dnd-markdown-presentation space-y-3 font-body text-parchment-950", className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl lg:text-3xl font-header font-black text-dragon-darkRed uppercase tracking-wider mb-2 border-b-2 border-dragon-gold/30 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-header font-bold text-dragon-red uppercase tracking-wide mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-header font-bold text-dragon-darkRed uppercase mt-3 mb-1">
              {children}
            </h3>
          ),
          hr: () => (
            <div className="my-4 flex items-center gap-2">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-dragon-gold to-transparent opacity-70" />
            </div>
          ),
          p: ({ children }) => (
            <p className="text-sm font-medium leading-relaxed text-parchment-900 mb-2">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-sm text-parchment-900">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-sm text-parchment-900">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm font-medium leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-black text-dragon-darkRed">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-parchment-800">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-dragon-gold pl-3 py-1 my-2 italic text-parchment-800 bg-dragon-gold/5 rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {content || ''}
      </Markdown>
    </div>
  );
};
