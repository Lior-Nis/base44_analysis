
import React, { useState, useEffect } from 'react';
import { BlogPost as BlogPostEntity } from '@/api/entities';
import { Plus, Edit3, Trash2, Eye, Calendar, User, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadFile } from '@/api/integrations';

const CATEGORIES = [
  { value: 'dish_deep_dive', label: 'Dish Deep Dive' },
  { value: 'chef_spotlight', label: 'Chef Spotlight' },
  { value: 'island_culture', label: 'Island Culture' },
  { value: 'hidden_gems', label: 'Hidden Gems' },
  { value: 'festive_food', label: 'Festive Food' },
  { value: 'traditions', label: 'Traditions' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' }
];

export default function BlogManagement({ posts, onPostsUpdate }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [postForm, setPostForm] = useState({
    title: '',
    subtitle: '',
    cover_image_url: '',
    content: '',
    excerpt: '',
    author_name: 'TasteFinder Editor',
    category: 'dish_deep_dive',
    featured: false,
    status: 'draft',
    tags: [],
    related_restaurant_ids: [],
    related_dish_names: [],
    read_time_minutes: 5
  });

  const handleAddPost = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      subtitle: '',
      cover_image_url: '',
      content: '',
      excerpt: '',
      author_name: 'TasteFinder Editor',
      category: 'dish_deep_dive',
      featured: false,
      status: 'draft',
      tags: [],
      related_restaurant_ids: [],
      related_dish_names: [],
      read_time_minutes: 5
    });
    setShowPostForm(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      subtitle: post.subtitle || '',
      cover_image_url: post.cover_image_url,
      content: post.content,
      excerpt: post.excerpt || '',
      author_name: post.author_name || 'TasteFinder Editor',
      category: post.category,
      featured: post.featured || false,
      status: post.status || 'draft',
      tags: post.tags || [],
      related_restaurant_ids: post.related_restaurant_ids || [],
      related_dish_names: post.related_dish_names || [],
      read_time_minutes: post.read_time_minutes || 5
    });
    setShowPostForm(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await BlogPostEntity.delete(postId);
        const updatedPosts = posts.filter(post => post.id !== postId);
        onPostsUpdate(updatedPosts);
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const result = await UploadFile({ file });
      setPostForm(prev => ({ ...prev, cover_image_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploadingImage(false);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        ...postForm,
        read_time_minutes: parseInt(postForm.read_time_minutes),
        tags: postForm.tags.filter(tag => tag.trim() !== ''),
        related_restaurant_ids: postForm.related_restaurant_ids.filter(id => id.trim() !== ''),
        related_dish_names: postForm.related_dish_names.filter(name => name.trim() !== '')
      };

      if (editingPost) {
        await BlogPostEntity.update(editingPost.id, postData);
        const updatedPosts = posts.map(post => 
          post.id === editingPost.id ? { ...post, ...postData } : post
        );
        onPostsUpdate(updatedPosts);
      } else {
        const newPost = await BlogPostEntity.create(postData);
        onPostsUpdate([...posts, newPost]);
      }

      setShowPostForm(false);
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getBlogMetrics = () => {
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const publishedPosts = posts.filter(post => post.status === 'published').length;
    const featuredPosts = posts.filter(post => post.featured).length;

    return { totalViews, totalLikes, publishedPosts, featuredPosts };
  };

  const metrics = getBlogMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <p className="text-gray-600">Create and manage food stories and articles</p>
        </div>
        <Button onClick={handleAddPost} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Stories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Views</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.totalViews.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600">Total Likes</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.totalLikes.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Published</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.publishedPosts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Featured</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.featuredPosts}</p>
              </CardContent>
            </Card>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id} className="tropical-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                          {post.subtitle && (
                            <p className="text-sm text-gray-600 mb-2">{post.subtitle}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {getStatusBadge(post.status)}
                            <Badge variant="outline">
                              {CATEGORIES.find(c => c.value === post.category)?.label}
                            </Badge>
                            {post.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600 mr-4">
                          <div>{(post.views || 0).toLocaleString()} views</div>
                          <div>{(post.likes || 0).toLocaleString()} likes</div>
                          <div>by {post.author_name}</div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                  <p className="text-gray-600 mb-6">Create your first food story to get started</p>
                  <Button onClick={handleAddPost} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Story
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {CATEGORIES.map((category) => {
                  const categoryPosts = posts.filter(post => post.category === category.value);
                  const categoryViews = categoryPosts.reduce((sum, post) => sum + (post.views || 0), 0);
                  const categoryLikes = categoryPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
                  
                  return (
                    <div key={category.value} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{category.label}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Posts: {categoryPosts.length}</div>
                        <div>Views: {categoryViews.toLocaleString()}</div>
                        <div>Likes: {categoryLikes.toLocaleString()}</div>
                        <div>Avg engagement: {categoryPosts.length > 0 ? ((categoryLikes / Math.max(categoryViews, 1)) * 100).toFixed(1) : 0}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Story Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <div key={category.value} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{category.label}</h4>
                    <p className="text-sm text-gray-600">
                      {category.value === 'dish_deep_dive' && 'Explore the history and culture behind specific Maldivian dishes'}
                      {category.value === 'chef_spotlight' && 'Feature interviews and profiles of local chefs and restaurant owners'}
                      {category.value === 'island_culture' && 'Discover unique food traditions from different atolls and islands'}
                      {category.value === 'hidden_gems' && 'Uncover lesser-known restaurants and food spots'}
                      {category.value === 'festive_food' && 'Special dishes and traditions for celebrations and holidays'}
                      {category.value === 'traditions' && 'Cultural stories and folklore around Maldivian food'}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {posts.filter(p => p.category === category.value).length} stories
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Form Dialog */}
      <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Story' : 'Create New Story'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitPost} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., What makes Mashuni the ultimate Maldivian breakfast?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={postForm.subtitle}
                  onChange={(e) => setPostForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Short teaser or cultural reference"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={postForm.category}
                    onValueChange={(value) => setPostForm(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="author_name">Author Name</Label>
                  <Input
                    id="author_name"
                    value={postForm.author_name}
                    onChange={(e) => setPostForm(prev => ({ ...prev, author_name: e.target.value }))}
                    placeholder="TasteFinder Editor"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label>Cover Image *</Label>
              {postForm.cover_image_url ? (
                <div className="mt-2 relative">
                  <img
                    src={postForm.cover_image_url}
                    alt="Cover preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={() => setPostForm(prev => ({ ...prev, cover_image_url: '' }))}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-4">
                    Upload cover image (recommended: high-res food or cultural image)
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="cover-image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-image').click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={postForm.content}
                onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your story here using Markdown formatting..."
                rows={12}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={postForm.excerpt}
                onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Short summary for previews..."
                rows={3}
              />
            </div>

            {/* Tags and Related Content */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={postForm.tags.join(', ')}
                  onChange={(e) => setPostForm(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  }))}
                  placeholder="mashuni, breakfast, maldivian"
                />
              </div>

              <div>
                <Label htmlFor="read_time">Reading Time (minutes)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  max="60"
                  value={postForm.read_time_minutes}
                  onChange={(e) => setPostForm(prev => ({ ...prev, read_time_minutes: e.target.value }))}
                />
              </div>
            </div>

            {/* Publishing Options */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-6">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={postForm.status}
                    onValueChange={(value) => setPostForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={postForm.featured}
                    onCheckedChange={(checked) => setPostForm(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Story</Label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPostForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !postForm.title || !postForm.cover_image_url || !postForm.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    {editingPost ? 'Update Story' : 'Create Story'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
