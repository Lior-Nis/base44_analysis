
import React, { useState } from "react";
import { Heart, MessageCircle, Share, MapPin, Clock, IndianRupee, User, MoreHorizontal, Edit, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useLocalization } from "@/components/common/Localization";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function PostCard({ post, onMessage, currentUser, onEdit, onDelete }) {
  const { t } = useLocalization();
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
  };

  const handleContact = () => {
    if (post.author_phone) {
      window.open(`tel:${post.author_phone}`, '_self');
    } else {
      alert("Phone number not available for this user.");
    }
  };

  const getPostTypeBadge = (type) => {
    return type === 'job' 
      ? { label: t('jobAvailable'), color: 'bg-green-100 text-green-700' }
      : { label: t('serviceOffered'), color: 'bg-blue-100 text-blue-700' };
  };

  const formatPostTime = (dateString) => {
    if (!dateString) return t('loading');
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  const badge = getPostTypeBadge(post.post_type || 'service');
  const isOwner = currentUser && currentUser.email === post.author_email;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl overflow-hidden my-4 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-orange-400">
              <AvatarImage src={post.author_avatar || "/default-avatar.png"} alt={post.author_name} />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                {post.author_name ? post.author_name.charAt(0) : <User className="w-5 h-5 text-gray-500" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-800">{post.author_name}</p>
              <p className="text-xs text-gray-500">
                {t('posted')} {formatPostTime(post.created_date || post.timestamp)}
              </p>
              {post.author_phone && (
                <p className="text-xs text-blue-600 font-medium">
                  📞 {post.author_phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <Badge className={`${badge.color} px-3 py-1 rounded-full text-xs font-semibold`}>
              {badge.label}
            </Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500 ml-1 -mr-2">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>{t('edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{t('delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
        <p className="text-gray-700 mb-4 leading-relaxed">{post.description}</p>

        <div className="flex flex-wrap gap-3 text-sm mb-4">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="font-medium">{t('category')}:</span>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {post.category}
            </Badge>
          </div>
          {post.location && (
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{post.location}</span>
            </div>
          )}
          {(post.price || post.budget) && (
            <div className="flex items-center gap-1 text-gray-600">
              <IndianRupee className="w-4 h-4 text-gray-500" />
              <span>₹{post.price || post.budget}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-y-3 mt-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{t('like')}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-blue-600">
              <Share className="w-4 h-4" />
              <span className="text-sm font-medium">{t('share')}</span>
            </Button>
          </div>
          
          {!isOwner && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleContact}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {t('contact')}
              </Button>
              <Button 
                onClick={() => onMessage(post)}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 flex-shrink-0"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
