import React, { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post, onMessage }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'job_post': return 'bg-green-100 text-green-700';
      case 'achievement': return 'bg-purple-100 text-purple-700';
      case 'article': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {post.author_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
              <p className="text-sm text-gray-500">{post.author_title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                </span>
                {post.post_type !== 'update' && (
                  <Badge className={`text-xs ${getPostTypeColor(post.post_type)}`}>
                    {post.post_type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="px-4 pb-3">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full rounded-xl object-cover max-h-80"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-blue-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-green-600">
              <Share className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={() => onMessage?.(post)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            Message
          </Button>
        </div>
      </div>
    </div>
  );
}