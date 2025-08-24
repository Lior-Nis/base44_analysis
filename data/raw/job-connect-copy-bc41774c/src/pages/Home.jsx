
import React, { useState, useEffect } from "react";
import { Post, User } from "@/api/entities";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AppHeader from "../components/common/AppHeader";
import PostCard from "../components/posts/PostCard";
import { useLocalization } from "@/components/common/Localization";

export default function Home() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = (post) => {
    if (!currentUser || !post.author_email) {
        alert("You need to be logged in to send a message.");
        return;
    }
    const conversationId = [currentUser.email, post.author_email].sort().join('_');
    const conversation = {
      id: conversationId,
      name: post.author_name,
      email: post.author_email,
      avatar: post.author_avatar,
    };
    sessionStorage.setItem('activeConversation', JSON.stringify(conversation));
    navigate(createPageUrl("Messages"));
  };
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (e) {
      console.log("User not logged in", e);
    }
    
    try {
      const fetchedPosts = await Post.list("-created_date", 50);
      setPosts(fetchedPosts);
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleEdit = (post) => {
    sessionStorage.setItem('editingPost', JSON.stringify(post));
    navigate(createPageUrl("CreatePost"));
  };

  const handleDelete = async (postId) => {
    if (window.confirm(t('confirmDelete'))) {
        try {
            await Post.delete(postId);
            fetchData();
            alert(t('postDeleted'));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post.");
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="p-4 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Quick Post Section */}
      {currentUser && (
        <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-700 font-semibold">
                {currentUser.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <Link to={createPageUrl("CreatePost")} className="flex-1">
              <div className="bg-gray-50 rounded-full px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer">
                {t('whatService', { name: currentUser.full_name?.split(' ')[0] || 'there' })}
              </div>
            </Link>
            <Link to={createPageUrl("CreatePost")}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-full">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="p-4 space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onMessage={handleMessage}
              currentUser={currentUser}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noPostsYet')}</h3>
            <p className="text-gray-500 mb-4">{t('beTheFirstPost')}</p>
            <Link to={createPageUrl("CreatePost")}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-full">
                {t('createFirstPost')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
