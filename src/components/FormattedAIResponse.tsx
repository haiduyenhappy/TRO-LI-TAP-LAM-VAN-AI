import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './UI';

interface FormattedAIResponseProps {
  content: string;
  className?: string;
}

export const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content, className }) => {
  if (!content) return null;

  // Pre-process content to handle common plain text patterns that might not be perfect markdown
  const processedContent = content
    .replace(/\r\n/g, '\n')
    // Ensure bullet points have a space after them if they don't
    .replace(/^([•\-*])(?!\s)/gm, '$1 ')
    // Convert custom bullet '•' to '-' for better markdown support
    .replace(/^•/gm, '-')
    // Ensure headings (lines ending with :) are treated as bold or distinct if they aren't already
    .replace(/^([^#\n\-*•].+:)$/gm, '**$1**');

  return (
    <div className={cn("prose prose-slate max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 text-lg font-display font-bold leading-7 text-slate-700 whitespace-pre-wrap break-words">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-4 mt-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-lg font-display font-bold leading-7 text-slate-700 pl-1">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-black text-slate-900">
              {children}
            </strong>
          ),
          h1: ({ children }) => <h1 className="text-2xl font-black text-slate-800 mb-4 mt-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-black text-slate-800 mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-black text-slate-800 mb-2 mt-4">{children}</h3>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
