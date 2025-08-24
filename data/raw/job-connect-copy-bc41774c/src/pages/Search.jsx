
import React, { useState, useEffect } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "../components/common/AppHeader";
import PostCard from "../components/posts/PostCard";
import { useLocalization } from "@/components/common/Localization";
import { Post, User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categories = ["All Categories", "Plumber", "Electrician", "Carpenter", "Painter", "Cleaner", "Tutor", "Driver", "Cook", "Gardener", "Other"];

export default function Search() {
  const { t } = useLocalization();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("all");
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Moved fetchData outside useEffect so it can be called on demand (e.g., after delete)
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (e) {
      console.log("User not logged in");
      setCurrentUser(null); // Ensure currentUser is null if not logged in
    }
    
    try {
      const fetchedPosts = await Post.list("-created_date", 200);
      setAllPosts(fetchedPosts);
      setFilteredPosts(fetchedPosts); // Initial filter will happen in the effect below
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const filterPosts = () => {
      let tempPosts = allPosts;

      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        tempPosts = tempPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(lowerCaseQuery) ||
            post.description.toLowerCase().includes(lowerCaseQuery) ||
            post.category.toLowerCase().includes(lowerCaseQuery) ||
            post.author_name.toLowerCase().includes(lowerCaseQuery)
        );
      }

      if (selectedCategory !== "All Categories") {
        tempPosts = tempPosts.filter((post) => post.category === selectedCategory);
      }

      if (selectedType !== "all") {
        tempPosts = tempPosts.filter((post) => post.post_type === selectedType);
      }

      setFilteredPosts(tempPosts);
    };

    filterPosts();
  }, [searchQuery, selectedCategory, selectedType, allPosts]); // Re-run filter when these dependencies change
  
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

  const handleEdit = (post) => {
    sessionStorage.setItem('editingPost', JSON.stringify(post));
    navigate(createPageUrl("CreatePost"));
  };

  const handleDelete = async (postId) => {
    if (window.confirm(t('confirmDelete'))) {
        try {
            await Post.delete(postId);
            fetchData(); // Re-fetch all posts to update the list
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
        <p className="p-4">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="p-4 pb-24">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('exploreJobsServices')}</h2>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1 border-gray-300 focus:border-orange-500">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat === 'All Categories' ? t('allCategories') : cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
            <TabsList className="bg-orange-100 p-1 w-full">
              <TabsTrigger value="all" className="flex-1">{t('all')}</TabsTrigger>
              <TabsTrigger value="job" className="flex-1">{t('jobs')}</TabsTrigger>
              <TabsTrigger value="service" className="flex-1">{t('services')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredPosts.length > 1 ? t('resultsFoundPlural', {count: filteredPosts.length}) : t('resultsFound', {count: filteredPosts.length})}
            </p>
          </div>

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
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
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noResultsFound')}</h3>
              <p className="text-gray-500">
                {searchQuery ? t('noPostsMatchQuery', {query: searchQuery}) : t('noPostsAvailable')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
