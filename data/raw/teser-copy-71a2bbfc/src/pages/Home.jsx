import React, { useState, useEffect } from "react";
import { int442 } from '@/api/functions';
import { Bot, Mail, Upload, FileScan, Image, Terminal } from "lucide-react";
import SlackTester from "../components/SlackTester";

const integrations = [
    {
        name: "int442",
        description: "A custom integration to print a message.",
        icon: Terminal
    },
    {
        name: "Core.InvokeLLM",
        description: "Generates text responses from an AI model.",
        icon: Bot
    },
    {
        name: "Core.SendEmail",
        description: "Sends emails programmatically.",
        icon: Mail
    },
    {
        name: "Core.UploadFile",
        description: "Uploads files to the application's storage.",
        icon: Upload
    },
    {
        name: "Core.GenerateImage",
        description: "Creates images from text descriptions using AI.",
        icon: Image
    },
    {
        name: "Core.ExtractDataFromUploadedFile",
        description: "Extracts structured data from documents.",
        icon: FileScan
    }
];

export default function Home() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMessage = async () => {
            setIsLoading(true);
            try {
                const result = await int442();

                if (result.data?.message) {
                    setMessage(result.data.message);
                } else if (typeof result === 'string') {
                    setMessage(result);
                } else {
                    setMessage("Hello World"); // Fallback
                }

            } catch (error) {
                console.error("Error using integration:", error);
                setMessage("Hello World"); // Fallback message
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessage();
    }, []);

    const messageParts = message.split(' ');
    const firstWord = messageParts[0] || '';
    const restOfMessage = messageParts.slice(1).join(' ');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-8 transition-colors duration-500">
            <div className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center text-center">
                 <div className="relative mb-8">
                    {isLoading ? (
                         <div className="space-y-4">
                            <div className="h-20 bg-gray-200 rounded-md w-64 mx-auto animate-pulse"></div>
                            <div className="h-20 bg-gray-200 rounded-md w-56 mx-auto animate-pulse"></div>
                         </div>
                    ) : (
                        <>
                           <h1 className="text-6xl md:text-8xl font-thin tracking-tight text-gray-900 leading-none">
                                {firstWord}
                            </h1>
                            <h1 className="text-6xl md:text-8xl font-thin tracking-tight text-gray-900 leading-none">
                                {restOfMessage}
                            </h1>
                        </>
                    )}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gray-900"></div>
                </div>
                <p className="text-lg text-gray-500 font-light max-w-md mx-auto leading-relaxed">
                    This message was generated using the <code>int442</code> integration.
                </p>
            </div>
            
            {/* Slack Tester Section */}
            <div className="w-full max-w-4xl mt-8 flex justify-center">
                <SlackTester />
            </div>
            
            <div className="w-full max-w-4xl mt-16">
                <h2 className="text-3xl font-light text-center text-gray-800 mb-8">Available Integrations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => (
                        <div key={integration.name} className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <integration.icon className="w-6 h-6 text-gray-600" />
                                 </div>
                                 <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{integration.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}