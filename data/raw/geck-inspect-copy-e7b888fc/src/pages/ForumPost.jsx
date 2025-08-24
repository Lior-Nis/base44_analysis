import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ForumPost, ForumComment, User, ForumCategory } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ForumPostPage() {
    const location = useLocation();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');

    const postId = new URLSearchParams(location.search).get('id');

    useEffect(() => {
        const fetchData = async () => {
            if (!postId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [user, fetchedPost] = await Promise.all([
                    User.me().catch(() => null),
                    ForumPost.get(postId)
                ]);
                
                setCurrentUser(user);
                
                if (fetchedPost) {
                    setPost(fetchedPost);
                    const [fetchedComments, fetchedCategory] = await Promise.all([
                        ForumComment.filter({ post_id: postId }, '-created_date'),
                        ForumCategory.get(fetchedPost.category_id)
                    ]);
                    setComments(fetchedComments);
                    setCategory(fetchedCategory);
                }
            } catch (error) {
                console.error("Failed to load post data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [postId]);

    const handleLike = async (item, type) => {
        if (!currentUser) return;

        const likedBy = item.liked_by_users || [];
        const isLiked = likedBy.includes(currentUser.email);
        const newLikedBy = isLiked 
            ? likedBy.filter(email => email !== currentUser.email)
            : [...likedBy, currentUser.email];

        try {
            if (type === 'post') {
                const updatedPost = await ForumPost.update(item.id, { liked_by_users: newLikedBy });
                setPost(updatedPost);
            } else {
                const updatedComment = await ForumComment.update(item.id, { liked_by_users: newLikedBy });
                setComments(comments.map(c => c.id === item.id ? updatedComment : c));
            }
        } catch (error) {
            console.error("Failed to update like:", error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !currentUser) return;
        try {
            const createdComment = await ForumComment.create({
                post_id: postId,
                content: newComment,
                author_name: currentUser.full_name,
            });
            setComments([createdComment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-white">Loading post...</div>;
    }

    if (!post) {
        return <div className="p-8 text-center text-white">Post not found.</div>;
    }
    
    const isPostLiked = post.liked_by_users?.includes(currentUser?.email);

    return (
        <div className="p-4 md:p-8 bg-slate-950 text-slate-100 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <Link to={createPageUrl("Forum")} className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Forum
                    </Link>
                    {category && <p className="text-sm text-slate-400">In <span className="font-semibold text-emerald-400">{category.name}</span></p>}
                </div>

                <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-3xl text-slate-100">{post.title}</CardTitle>
                        <div className="text-sm text-slate-400 flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1"><UserIcon className="w-4 h-4"/>{post.author_name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/>{format(new Date(post.created_date), 'PPP')}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none text-slate-300">
                        <p>{post.content}</p>
                    </CardContent>
                    <CardFooter className="border-t border-slate-700 pt-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLike(post, 'post')}
                            className={`flex items-center gap-2 ${isPostLiked ? 'text-emerald-400' : 'text-slate-400'}`}
                            disabled={!currentUser}
                        >
                            <ThumbsUp className={`w-4 h-4 ${isPostLiked ? 'fill-current' : ''}`} />
                            Like ({post.liked_by_users?.length || 0})
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-100">{comments.length} Comments</h3>
                    {comments.map(comment => {
                        const isCommentLiked = comment.liked_by_users?.includes(currentUser?.email);
                        return (
                            <Card key={comment.id} className="bg-slate-900 border-slate-700">
                                <CardContent className="p-4">
                                    <p className="text-slate-300 mb-2">{comment.content}</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-400">
                                            {comment.author_name} • {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                                        </p>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleLike(comment, 'comment')}
                                            className={`flex items-center gap-1 text-xs ${isCommentLiked ? 'text-emerald-400' : 'text-slate-400'}`}
                                            disabled={!currentUser}
                                        >
                                            <ThumbsUp className={`w-3 h-3 ${isCommentLiked ? 'fill-current' : ''}`} />
                                            ({comment.liked_by_users?.length || 0})
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {currentUser && (
                    <Card className="bg-slate-900 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-slate-100">Leave a Comment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Write your comment here..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="bg-slate-800 border-slate-600 text-slate-100 h-24"
                            />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePostComment}>Post Comment</Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}