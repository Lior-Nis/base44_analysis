import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function VideoEmbed({ videoUrl, videoType, title }) {
  if (!videoUrl) return null;

  const getEmbedUrl = () => {
    switch (videoType) {
      case 'youtube':
        const youtubeId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
        return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null;
      
      case 'vimeo':
        const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
      
      case 'loom':
        const loomId = videoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1];
        return loomId ? `https://www.loom.com/embed/${loomId}` : null;
      
      default:
        return videoUrl;
    }
  };

  const embedUrl = getEmbedUrl();
  if (!embedUrl) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-t-lg">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}