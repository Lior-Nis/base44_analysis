
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CheckCircle, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const morphColors = {
  flame: "bg-red-100 text-red-700",
  harlequin: "bg-orange-100 text-orange-700",
  pinstripe: "bg-yellow-100 text-yellow-700",
  tiger: "bg-amber-100 text-amber-700",
  brindle: "bg-brown-100 text-brown-700",
  extreme_harlequin: "bg-pink-100 text-pink-700",
  super_dalmatian: "bg-purple-100 text-purple-700",
  dalmatian: "bg-indigo-100 text-indigo-700",
  patternless: "bg-gray-100 text-gray-700",
  bicolor: "bg-blue-100 text-blue-700",
  tricolor: "bg-green-100 text-green-700"
};

const DEFAULT_GECKO_IMAGE = 'https://i.imgur.com/sw9gnDp.png';

export default function RecentActivity({ geckoImages = [], isLoading = false }) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-200">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800">
              <Skeleton className="w-16 h-16 rounded-lg bg-slate-700" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-700" />
                <Skeleton className="h-3 w-24 bg-slate-700" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-slate-700" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-sage-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800"> {/* Changed text color for readability on light background */}
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {geckoImages.length === 0 ? (
          <div className="text-center py-8 text-sage-600"> {/* Adjusted text color for new card background */}
            <Camera className="w-12 h-12 mx-auto mb-4 text-sage-400" /> {/* Adjusted icon color */}
            <p>No training images yet</p>
            <p className="text-sm text-sage-500 mt-1">Upload your first gecko image to get started</p> {/* Adjusted text color */}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {geckoImages.map((image) => {
              const imageUrl = image.image_url || DEFAULT_GECKO_IMAGE;

              return (
                <div key={image.id} className="group cursor-pointer">
                  <div className="aspect-square rounded-lg overflow-hidden bg-sage-100 mb-2">
                    <img
                      src={imageUrl}
                      alt={`${image.primary_morph ? image.primary_morph.replace(/_/g, ' ') : 'Unidentified'} gecko`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // If the original image fails to load, try the default image.
                        // Prevent infinite loop if default image also fails by checking if it's already the default.
                        if (e.currentTarget.src !== DEFAULT_GECKO_IMAGE) {
                          e.currentTarget.src = DEFAULT_GECKO_IMAGE;
                        }
                      }}
                    />
                  </div>
                  {/* Badge and metadata */}
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={morphColors[image.primary_morph] || "bg-gray-100 text-gray-700"}>
                        {image.primary_morph ? image.primary_morph.replace(/_/g, ' ') : 'Unknown Morph'}
                      </Badge>
                      {image.verified && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-sage-600">
                      {format(new Date(image.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {image.confidence_score !== undefined && image.confidence_score !== null && (
                      <span className="text-xs text-sage-500 mt-1">
                        {Math.round(image.confidence_score)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
