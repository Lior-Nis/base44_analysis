import React, { useState, useEffect } from 'react';
import { SiteContent } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

export default function SiteContentManagement() {
  const [aboutUsContent, setAboutUsContent] = useState(null);
  const [aboutUsId, setAboutUsId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const result = await SiteContent.filter({ key: 'about_us_page' });
      if (result.length > 0) {
        setAboutUsContent(result[0].content);
        setAboutUsId(result[0].id);
      }
    } catch (error) {
      console.error("Failed to load site content:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e, field, index = null, subField = null) => {
    const { value } = e.target;
    setAboutUsContent(prev => {
      const newContent = { ...prev };
      if (index !== null) {
        const newArray = [...newContent[field]];
        if (subField) {
          newArray[index] = { ...newArray[index], [subField]: value };
        } else {
          newArray[index] = value;
        }
        newContent[field] = newArray;
      } else {
        newContent[field] = value;
      }
      return newContent;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (aboutUsId) {
        await SiteContent.update(aboutUsId, { content: aboutUsContent });
      } else {
        await SiteContent.create({ key: 'about_us_page', content: aboutUsContent });
      }
      alert('Content updated successfully!');
    } catch (error) {
      console.error("Failed to save content:", error);
      alert('Failed to save content. Please try again.');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div>Loading content...</div>;
  }
  
  if (!aboutUsContent) {
    return <div>No "About Us" content found. Please create an entry with key 'about_us_page'.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Site Content Management</h2>
          <p className="text-gray-600">Update text and content for various pages.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Us Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Badge Text</Label>
            <Input value={aboutUsContent.badgeText} onChange={(e) => handleInputChange(e, 'badgeText')} />
          </div>
          <div>
            <Label>Main Heading</Label>
            <Input value={aboutUsContent.mainHeading} onChange={(e) => handleInputChange(e, 'mainHeading')} />
          </div>
          <div>
            <Label>Sub Heading</Label>
            <Textarea value={aboutUsContent.subHeading} onChange={(e) => handleInputChange(e, 'subHeading')} />
          </div>
          <div>
            <Label>Story</Label>
            <Textarea value={aboutUsContent.story} onChange={(e) => handleInputChange(e, 'story')} rows={4} />
          </div>

          <h3 className="text-lg font-semibold pt-4">What We Do Section</h3>
          {aboutUsContent.whatWeDoFeatures.map((feature, index) => (
            <div key={index} className="p-4 border rounded-md space-y-2">
              <Label>Feature {index + 1} Title</Label>
              <Input value={feature.title} onChange={(e) => handleInputChange(e, 'whatWeDoFeatures', index, 'title')} />
              <Label>Feature {index + 1} Description</Label>
              <Input value={feature.description} onChange={(e) => handleInputChange(e, 'whatWeDoFeatures', index, 'description')} />
            </div>
          ))}

          <h3 className="text-lg font-semibold pt-4">Why We Built This Section</h3>
          <div>
            <Label>Content</Label>
            <Textarea value={aboutUsContent.whyContent} onChange={(e) => handleInputChange(e, 'whyContent')} rows={4} />
          </div>

          <h3 className="text-lg font-semibold pt-4">What Makes Us Different Section</h3>
          {aboutUsContent.differentiators.map((item, index) => (
            <div key={index} className="p-4 border rounded-md space-y-2">
              <Label>Differentiator {index + 1} Title</Label>
              <Input value={item.title} onChange={(e) => handleInputChange(e, 'differentiators', index, 'title')} />
              <Label>Differentiator {index + 1} Description</Label>
              <Input value={item.description} onChange={(e) => handleInputChange(e, 'differentiators', index, 'description')} />
            </div>
          ))}
          
          <h3 className="text-lg font-semibold pt-4">Join The Movement Section</h3>
           <div>
            <Label>Heading</Label>
            <Input value={aboutUsContent.joinHeading} onChange={(e) => handleInputChange(e, 'joinHeading')} />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea value={aboutUsContent.joinContent} onChange={(e) => handleInputChange(e, 'joinContent')} />
          </div>
           <div>
            <Label>Closing text</Label>
            <Input value={aboutUsContent.joinClosing} onChange={(e) => handleInputChange(e, 'joinClosing')} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}