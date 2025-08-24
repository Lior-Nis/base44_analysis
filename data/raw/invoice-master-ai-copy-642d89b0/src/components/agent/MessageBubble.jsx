
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;
  
  const parsedResults = (() => {
    if (!results) return null;
    try {
      return typeof results === 'string' ? JSON.parse(results) : results;
    } catch {
      return results;
    }
  })();
  
  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );
  
  const statusConfig = {
    pending: { icon: Clock, color: 'text-glass-muted', text: 'Pending' },
    running: { icon: Loader2, color: 'text-glass-dim', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-glass-dim', text: 'Running...', spin: true },
    completed: isError ? 
      { icon: AlertCircle, color: 'text-red-400', text: 'Failed' } : 
      { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    success: { icon: CheckCircle2, color: 'text-green-400', text: 'Success' },
    failed: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-400', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-glass-dim', text: '' };
  
  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();
  
  return (
    <div className="mt-3 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all glass-darker hover:glass-hover",
          expanded && "glass-hover"
        )}
      >
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-glass-dim">{formattedName}</span>
        {statusConfig.text && (
          <span className={cn("text-glass-muted", isError && "text-red-400")}>
            • {statusConfig.text}
          </span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3 w-3 text-glass-muted transition-transform ml-auto", 
            expanded && "rotate-90")} />
        )}
      </button>
      
      {expanded && !statusConfig.spin && (
        <div className="mt-2 ml-3 pl-3 border-l-2 border-white/20 space-y-3">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-glass-muted mb-1">Parameters:</div>
              <pre className="glass-darker rounded-lg p-2 text-xs text-glass-dim whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                  } catch {
                    return toolCall.arguments_string;
                  }
                })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-xs text-glass-muted mb-1">Result:</div>
              <pre className="glass-darker rounded-lg p-2 text-xs text-glass-dim whitespace-pre-wrap max-h-48 overflow-auto">
                {typeof parsedResults === 'object' ? 
                  JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl glass-light flex items-center justify-center mt-1">
          <div className="h-2 w-2 rounded-full bg-white/60" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isUser ? "glass-darker text-glass" : "glass-light text-glass"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown 
                className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  img: ({ src, alt, ...props }) => (
                    <img
                      src={src}
                      alt={alt}
                      {...props}
                      className="rounded-lg max-w-full h-auto my-2"
                      style={{ maxHeight: '200px' }}
                    />
                  ),
                  code: ({ inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative group/code">
                        <pre className="glass-darker rounded-lg p-3 overflow-x-auto my-2">
                          <code className={className} {...props}>{children}</code>
                        </pre>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 glass-light hover:glass-hover"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                          }}
                        >
                          <Copy className="h-3 w-3 text-glass-muted" />
                        </Button>
                      </div>
                    ) : (
                      <code className="px-2 py-1 rounded glass-darker text-glass-dim text-xs">
                        {children}
                      </code>
                    );
                  },
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">
                      {children}
                    </a>
                  ),
                  p: ({ children }) => <p className="my-1 leading-relaxed text-glass">{children}</p>,
                  ul: ({ children }) => <ul className="my-2 ml-4 list-disc text-glass">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal text-glass">{children}</ol>,
                  li: ({ children }) => <li className="my-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-semibold my-2 text-glass">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold my-2 text-glass">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold my-2 text-glass">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-white/30 pl-3 my-2 text-glass-muted">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 w-full">
            {message.tool_calls.map((toolCall, idx) => (
              <FunctionDisplay key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
