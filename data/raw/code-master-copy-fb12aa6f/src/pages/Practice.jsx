import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Code, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CodeEditor from "../components/lessons/CodeEditor";

const sampleCodes = {
  python: `# Welcome to Python!
# Let's start with a simple "Hello World" program

print("Hello, World!")
print("Welcome to CodeMaster!")

# Try modifying this code:
name = "Your Name"
print(f"Hello, {name}!")`,

  java: `// Welcome to Java!
// Let's start with a simple "Hello World" program

public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to CodeMaster!");
        
        // Try modifying this code:
        String name = "Your Name";
        System.out.println("Hello, " + name + "!");
    }
}`,

  c: `// Welcome to C Programming!
// Let's start with a simple "Hello World" program

#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to CodeMaster!\\n");
    
    // Try modifying this code:
    char name[] = "Your Name";
    printf("Hello, %s!\\n", name);
    
    return 0;
}`
};

const expectedOutputs = {
  python: `Hello, World!
Welcome to CodeMaster!
Hello, Your Name!`,
  
  java: `Hello, World!
Welcome to CodeMaster!
Hello, Your Name!`,
  
  c: `Hello, World!
Welcome to CodeMaster!
Hello, Your Name!`
};

export default function Practice() {
  const [activeTab, setActiveTab] = useState("python");

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Practice Lab</h1>
            </div>
            <p className="text-gray-600">
              Experiment with code in a safe environment. Try different languages and see results instantly.
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Start Experimenting!</h2>
                <p className="text-blue-100">
                  Choose a programming language below and start writing code. 
                  The editor will help you learn through hands-on practice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger 
                value="python" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium"
              >
                🐍 Python
              </TabsTrigger>
              <TabsTrigger 
                value="java"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-medium"
              >
                ☕ Java
              </TabsTrigger>
              <TabsTrigger 
                value="c"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
              >
                ⚡ C
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Python Tab */}
          <TabsContent value="python" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">🐍</span>
                  Python Playground
                </CardTitle>
                <p className="text-gray-600">
                  Python is perfect for beginners! It's readable, versatile, and great for data science, web development, and automation.
                </p>
              </CardHeader>
            </Card>
            
            <CodeEditor
              initialCode={sampleCodes.python}
              language="python"
              expectedOutput={expectedOutputs.python}
            />
          </TabsContent>

          {/* Java Tab */}
          <TabsContent value="java" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">☕</span>
                  Java Playground
                </CardTitle>
                <p className="text-gray-600">
                  Java is a powerful, object-oriented language used for enterprise applications, Android development, and large-scale systems.
                </p>
              </CardHeader>
            </Card>
            
            <CodeEditor
              initialCode={sampleCodes.java}
              language="java"
              expectedOutput={expectedOutputs.java}
            />
          </TabsContent>

          {/* C Tab */}
          <TabsContent value="c" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  C Programming Playground
                </CardTitle>
                <p className="text-gray-600">
                  C is the foundation of modern programming. Learn memory management, pointers, and system-level programming concepts.
                </p>
              </CardHeader>
            </Card>
            
            <CodeEditor
              initialCode={sampleCodes.c}
              language="c"
              expectedOutput={expectedOutputs.c}
            />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Experiment Freely</h3>
                <p className="text-sm text-gray-600">
                  Don't be afraid to modify the code. Experimentation is the best way to learn!
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Start Small</h3>
                <p className="text-sm text-gray-600">
                  Begin with simple programs and gradually work your way up to more complex projects.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Practice Daily</h3>
                <p className="text-sm text-gray-600">
                  Consistent practice is key to mastering programming. Even 15 minutes a day helps!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}