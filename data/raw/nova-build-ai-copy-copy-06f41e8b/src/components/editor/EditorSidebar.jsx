import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brush, ImageIcon, PlusSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ContentManager from "./ContentManager";
import StyleEditor from "./StyleEditor";
import ImageGenerator from "./ImageGenerator";
import PageManager from "./PageManager";

export default function EditorSidebar({ 
  isOpen, 
  onClose, 
  project, 
  updateProject, 
  activeTab, 
  setActiveTab 
}) {
  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
          lg:translate-x-0 lg:block
          ${isOpen ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Website Editor</h2>
            <p className="text-sm text-gray-500">Customize your website</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 m-4 mb-2">
                <TabsTrigger value="content" className="p-2">
                  <FileText className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="style" className="p-2">
                  <Brush className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="images" className="p-2">
                  <ImageIcon className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="pages" className="p-2">
                  <PlusSquare className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              <div className="px-4 pb-4">
                <TabsContent value="content" className="mt-0">
                  <ContentManager project={project} updateProject={updateProject} />
                </TabsContent>
                <TabsContent value="style" className="mt-0">
                  <StyleEditor project={project} updateProject={updateProject} />
                </TabsContent>
                <TabsContent value="images" className="mt-0">
                  <ImageGenerator project={project} updateProject={updateProject} />
                </TabsContent>
                <TabsContent value="pages" className="mt-0">
                  <PageManager project={project} updateProject={updateProject} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}