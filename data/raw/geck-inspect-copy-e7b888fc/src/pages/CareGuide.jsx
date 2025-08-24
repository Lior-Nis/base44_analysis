
import React, { useState, useEffect } from 'react';
import { CareGuideSection } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Home,
  Utensils,
  Hand,
  Users,
  Info
} from 'lucide-react';

const categoryIcons = {
  housing: <Home className="w-6 h-6" />,
  feeding: <Utensils className="w-6 h-6" />,
  handling: <Hand className="w-6 h-6" />,
  breeding: <Users className="w-6 h-6" />,
  health: <Heart className="w-6 h-6" />,
  general: <Info className="w-6 h-6" />,
};

export default function CareGuidePage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      try {
        const fetchedSections = await CareGuideSection.filter({ is_published: true });
        // Sort sections by category order first, then by their specific order_position
        const categoryOrder = ["general", "housing", "feeding", "handling", "health", "breeding"];
        fetchedSections.sort((a, b) => {
          const catAIndex = categoryOrder.indexOf(a.category);
          const catBIndex = categoryOrder.indexOf(b.category);
          if (catAIndex !== catBIndex) {
            return catAIndex - catBIndex;
          }
          return a.order_position - b.order_position;
        });
        setSections(fetchedSections);
        if (fetchedSections.length > 0) {
          setSelectedCategory(fetchedSections[0].category);
        }
      } catch (error) {
        console.error("Failed to load care guide sections:", error);
      }
      setIsLoading(false);
    };
    fetchSections();
  }, []);

  const groupedSections = sections.reduce((acc, section) => {
    (acc[section.category] = acc[section.category] || []).push(section);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center text-slate-400">Loading care guide...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-br from-green-600 to-teal-600 p-4 rounded-xl shadow-lg mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-100 mb-2">Crested Gecko Care Guide</h1>
          <p className="text-lg text-slate-300">Your comprehensive resource for happy and healthy geckos.</p>
        </div>

        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md py-4">
            <div className="flex flex-wrap justify-center gap-2">
                {Object.keys(groupedSections).map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        className={`capitalize transition-all duration-200 ${selectedCategory === category ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-slate-200'}`}
                    >
                        {categoryIcons[category]}
                        <span className="ml-2">{category}</span>
                    </Button>
                ))}
            </div>
        </div>

        {Object.keys(groupedSections).map(category => (
            <div key={category} className={`${selectedCategory === category ? 'block' : 'hidden'}`}>
                 <h2 className="text-3xl font-bold text-slate-200 mb-6 text-center capitalize">{category}</h2>
                 <div className="space-y-6">
                    {groupedSections[category].map(section => (
                        <Card key={section.id} className="bg-slate-900 border-slate-700 shadow-lg overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-2xl text-slate-100">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {section.image_urls && section.image_urls.length > 0 && (
                                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {section.image_urls.map((url, index) => (
                                            <img key={index} src={url} alt={`${section.title} image ${index + 1}`} className="rounded-lg object-cover w-full h-48" />
                                        ))}
                                    </div>
                                )}
                                <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: section.content }}></div>
                                {section.source_url && (
                                  <div className="mt-4 text-xs text-slate-500">
                                    Source: <a href={section.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">{section.source_url}</a>
                                  </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        ))}
      </div>
    </div>
  );
}
