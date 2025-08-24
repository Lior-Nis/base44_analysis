
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Send, Bot, User, Wand2, Loader2, Undo2, RotateCcw } from "lucide-react";

export default function AIChat({ 
  projectId, 
  elements = [], 
  selectedElements: selectedElementIds = [], 
  onAddElement,
  onUpdateElement,
  onElementDelete,
  onElementsChange,
  onRevertChanges,
  canvasSnapshot = []
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI design assistant. I can make changes directly to your canvas. Try asking me to create shapes, modify elements, or organize your design.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [elementsHistory, setElementsHistory] = useState({}); // Store elements state before each AI action
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeAIActions = (actions, messageId) => {
    if (!actions || actions.length === 0) return;

    // Store current elements state before making changes
    setElementsHistory(prev => ({
      ...prev,
      [messageId]: [...elements]
    }));

    actions.forEach(action => {
      if (!action.tool || !action.arguments) return;

      switch (action.tool) {
        case 'createElement':
          onAddElement({
            ...action.arguments,
            x: action.arguments.x || 100,
            y: action.arguments.y || 100,
            width: action.arguments.width || 100,
            height: action.arguments.height || 100,
          });
          break;
        case 'updateElement':
          if (action.arguments.elementIds && action.arguments.updates) {
            action.arguments.elementIds.forEach(id => {
              onUpdateElement(id, action.arguments.updates);
            });
          }
          break;
        case 'deleteElement':
          if (action.arguments.elementIds) {
            onElementDelete(action.arguments.elementIds);
          }
          break;
        default:
          console.warn(`Unknown AI tool: ${action.tool}`);
      }
    });
  };

  const handleRevert = (messageId) => {
    const snapshot = elementsHistory[messageId];
    if (snapshot && onRevertChanges) {
      onRevertChanges(messageId, snapshot);
      
      // Update the message to show it's been reverted
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isReverted: true }
            : msg
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const selectedElementsData = selectedElementIds.map(id => elements.find(el => el.id === id)).filter(Boolean);

      const prompt = `You are an expert AI design assistant integrated into a web-based design tool similar to Figma. Your goal is to help users by directly performing actions on the canvas based on their requests. You have access to the internet, so you can fetch real-world data, find images, or get inspiration if asked.

**IMPORTANT GUIDELINES:**
- ALWAYS perform the requested actions immediately - don't just suggest what to do
- If the user asks to create something, CREATE it with specific properties
- If they ask to modify selected elements, MODIFY them
- If they ask to delete something, DELETE it
- Be creative with positioning, colors, and sizes when details aren't specified
- Make elements visible and well-positioned on the canvas

**CURRENT CANVAS STATE:**
- Total elements: ${elements.length}
- Selected elements: ${selectedElementsData.length > 0 ? selectedElementsData.length : 'none'}
- Selected element details: ${JSON.stringify(selectedElementsData, null, 2)}

**USER'S REQUEST:**
"${userMessage.content}"

**RESPONSE FORMAT:**
Generate a JSON object with:
1. "response": A brief confirmation of what you're doing
2. "actions": Array of actions to execute immediately

**AVAILABLE ACTIONS:**

1. createElement - Creates new elements
   Arguments: { type, x, y, width, height, fill, stroke, text, name, etc. }

2. updateElement - Modifies existing elements  
   Arguments: { elementIds: [array of IDs], updates: {property: value} }

3. deleteElement - Removes elements
   Arguments: { elementIds: [array of IDs] }

**ELEMENT TYPES:** rectangle, circle, text, frame, line, pen
**POSITIONING:** Spread elements nicely, avoid overlapping
**COLORS:** Use vibrant, professional colors unless specified`;
      
      const responseSchema = {
        type: "object",
        properties: {
          response: {
            type: "string",
            description: "A brief confirmation of what you're doing."
          },
          actions: {
            type: "array",
            description: "Actions to perform immediately.",
            items: {
              type: "object",
              properties: {
                tool: {
                  type: "string",
                  enum: ["createElement", "updateElement", "deleteElement"]
                },
                arguments: {
                  type: "object",
                  description: "Tool arguments"
                }
              },
              required: ["tool", "arguments"]
            }
          }
        },
        required: ["response", "actions"]
      };

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: responseSchema
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.response,
        timestamp: new Date(),
        actions: aiResponse.actions,
        isReverted: false
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (aiResponse.actions && aiResponse.actions.length > 0) {
        executeAIActions(aiResponse.actions, aiMessage.id);
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "Sorry, I encountered an error while processing your request. Please try rephrasing your request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-[#161b22]">
      {/* Header */}
      <div className="p-3 border-b border-[#30363d] flex items-center gap-2">
        <Bot className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-white">AI Assistant</h3>
        <Wand2 className="w-3 h-3 text-purple-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
              <div
                className={`p-2 rounded-lg text-xs ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : `bg-[#21262d] text-gray-300 ${message.isReverted ? 'opacity-60' : ''}`
                }`}
              >
                <p>{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                   <div className="mt-2 border-t border-white/20 pt-2">
                     <div className="flex items-center justify-between">
                       <p className="text-xs font-semibold">{message.actions.length} action(s) performed</p>
                       {!message.isReverted && elementsHistory[message.id] && (
                         <Button
                           size="sm"
                           variant="ghost"
                           onClick={() => handleRevert(message.id)}
                           className="h-5 px-1 text-xs text-orange-400 hover:text-orange-300"
                         >
                           <RotateCcw className="w-3 h-3 mr-1" />
                           Revert
                         </Button>
                       )}
                     </div>
                     {message.isReverted && (
                       <p className="text-xs text-orange-400 mt-1">Changes reverted</p>
                     )}
                   </div>
                )}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="bg-[#21262d] text-gray-300 p-2 rounded-lg text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Working on it...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#30363d]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Create a blue button, make it bigger, delete selected..."
            className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-xs h-8"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-8"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </Button>
        </form>
        
        <div className="mt-1 text-xs text-gray-500">
          Try: "Add 3 colored circles", "Make selected elements red", "Create a login form"
        </div>
      </div>
    </div>
  );
}
