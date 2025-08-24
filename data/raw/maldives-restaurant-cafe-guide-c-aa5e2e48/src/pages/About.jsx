import React, { useState, useEffect } from 'react';
import { SiteContent } from '@/api/entities';
import { Users, Heart, Star, MapPin, ChefHat, Camera, Award, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function About() {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const result = await SiteContent.filter({ key: 'about_us_page' });
        if (result.length > 0) {
          setContent(result[0].content);
        }
      } catch (error) {
        console.error("Failed to load page content:", error);
      }
      setIsLoading(false);
    };

    loadContent();
  }, []);

  const features = [
    { icon: <MapPin className="w-6 h-6 text-[var(--primary-cta)]" /> },
    { icon: <Star className="w-6 h-6 text-[var(--primary-cta)]" /> },
    { icon: <ChefHat className="w-6 h-6 text-[var(--primary-cta)]" /> },
    { icon: <Users className="w-6 h-6 text-[var(--primary-cta)]" /> }
  ];

  const differentiators = [
    { icon: <Heart className="w-5 h-5" /> },
    { icon: <Users className="w-5 h-5" /> },
    { icon: <Camera className="w-5 h-5" /> },
    { icon: <Award className="w-5 h-5" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Could not load content. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-[var(--primary-cta)] border-[var(--primary-cta)]">
            {content.badgeText}
          </Badge>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--headings-labels)] mb-6">
            {content.mainHeading}
          </h1>
          <p className="text-xl text-[var(--text-body)] leading-relaxed max-w-3xl mx-auto">
            {content.subHeading.split('<strong>').map((part, i) =>
              i === 0 ? part : <strong key={i}>{part.split('</strong>')[0]}</strong>
            ).reduce((acc, curr, i) => i === 0 ? [curr] : [...acc, content.subHeading.split('<strong>')[i-1].split('</strong>')[1], curr], [])}
          </p>
        </div>

        {/* Story Section */}
        <Card className="soft-shadow mb-12 border-[var(--border-color)]">
          <CardContent className="p-8">
            <p className="text-lg text-[var(--text-body)] leading-relaxed mb-6">
              {content.story.split('<strong>').map((part, i) =>
                i === 0 ? part : (
                  <strong key={i} className="text-[var(--primary-cta)]">
                    {part.split('</strong>')[0]}
                  </strong>
                )
              ).reduce((acc, curr, i) => i === 0 ? [curr] : [...acc, content.story.split('<strong>')[i-1].split('</strong>')[1], curr], [])}
            </p>
          </CardContent>
        </Card>

        {/* What We Do Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[var(--headings-labels)] mb-4">
              {content.whatWeDoHeading}
            </h2>
            <p className="text-lg text-[var(--text-muted)]">
              {content.whatWeDoSubheading}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {content.whatWeDoFeatures.map((feature, index) => (
              <Card key={index} className="soft-shadow border-[var(--border-color)] h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-[var(--highlights-accents)]/10 rounded-lg">
                      {features[index].icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--headings-labels)] mb-2 leading-snug">
                        {feature.title}
                      </h3>
                      <p className="text-[var(--text-muted)] text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-lg text-[var(--text-body)]">
            {content.whatWeDoClosing}
          </p>
        </section>

        {/* Why We Built This Section */}
        <section className="mb-16 bg-gray-50/80 rounded-lg p-8 md:p-12">
          <div className="text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[var(--headings-labels)] mb-6">
              {content.whyHeading}
            </h2>
            <p className="text-lg text-[var(--text-body)] leading-relaxed max-w-3xl mx-auto">
              {content.whyContent}
            </p>
          </div>
        </section>

        {/* What Makes Us Different Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[var(--headings-labels)] mb-4">
              {content.differentHeading}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.differentiators.map((item, index) => (
              <div key={index} className="text-center p-4">
                <div className="w-12 h-12 bg-white border-2 border-[var(--primary-cta)]/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--primary-cta)]">
                  {differentiators[index].icon}
                </div>
                <h3 className="font-semibold text-[var(--headings-labels)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Join the Movement */}
        <section>
          <Card className="soft-shadow border-2 border-[var(--primary-cta)]/20 bg-gradient-to-r from-[var(--primary-cta)]/5 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="font-playfair text-3xl font-bold text-[var(--headings-labels)]">
                {content.joinHeading}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-[var(--text-body)] leading-relaxed mb-6">
                {content.joinContent}
              </p>
              <p className="text-xl font-bold text-[var(--primary-cta)] mb-8">
                {content.joinClosing}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild className="cta-button">
                  <Link to={createPageUrl('RestaurantPortal')}>
                    <ChefHat className="w-4 h-4 mr-2" />
                    Restaurant Owners
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={createPageUrl('AllRestaurants')}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Explore Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-[var(--text-muted)]">
            Explore the flavors, share your story.
          </p>
        </div>
      </div>
    </div>
  );
}