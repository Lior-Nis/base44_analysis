import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeckoOfTheDay({ geckoOfTheDay }) {
    if (!geckoOfTheDay) {
        return (
            <Card className="bg-slate-900 border-slate-700 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Gecko of the Day
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-400">
                         <p>No gecko featured today. An admin can select one from the Admin Panel!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const { appreciative_message, date, image, uploader } = geckoOfTheDay;

    return (
        <Card className="bg-slate-900 border-slate-700 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Gecko of the Day
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link to={createPageUrl(`GeckoDetail?id=${image.id}`)}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group">
                        <img 
                            src={image.image_url} 
                            alt="Gecko of the day"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold drop-shadow-md">{image.primary_morph.replace(/_/g, ' ')}</h3>
                        </div>
                    </div>
                </Link>
                
                <div className="space-y-3">
                    <p className="text-slate-300 leading-relaxed italic">
                        "{appreciative_message}"
                    </p>
                    
                    {uploader && (
                        <p className="text-sm text-slate-400">
                            Shared by{' '}
                            <Link 
                                to={createPageUrl(`PublicProfile?userId=${uploader.id}`)}
                                className="font-medium text-emerald-400 hover:underline"
                            >
                                {uploader.full_name || uploader.email}
                            </Link>
                        </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Featured on {format(new Date(date), 'MMMM d, yyyy')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}