import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw, Copy, Check } from "lucide-react";

export default function CodeEditor({ 
  initialCode = "", 
  language = "python",
  expectedOutput = "",
  onCodeChange 
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput(expectedOutput || "Code executed successfully!");
      setIsRunning(false);
      onCodeChange?.(code);
    }, 1500);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            Code Editor
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="hover:bg-gray-100"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-32 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            placeholder={`Write your ${language} code here...`}
          />
          <Button
            onClick={handleRunCode}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card className="border-0 shadow-lg bg-gray-900 text-green-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}