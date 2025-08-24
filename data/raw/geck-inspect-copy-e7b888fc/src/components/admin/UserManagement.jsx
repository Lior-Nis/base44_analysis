import React, { useState, useEffect } from 'react';
import { User, Notification, DirectMessage } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { 
    Users, Shield, Award, Mail, Trash2, Search, UserPlus, 
    MoreVertical, Crown, Star, MessageSquare, Loader2 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState('');
    const [messageContent, setMessageContent] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const allUsers = await User.list();
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user => 
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const handleUserAction = async (user, action) => {
        setSelectedUser(user);
        setActionType(action);
        
        if (action === 'message') {
            setMessageContent('');
        }
    };

    const confirmAction = async () => {
        if (!selectedUser || !actionType) return;
        
        setIsProcessing(true);
        try {
            switch (actionType) {
                case 'makeAdmin':
                    await User.update(selectedUser.id, { role: 'admin' });
                    toast({ title: "Success", description: `${selectedUser.full_name} is now an admin.` });
                    break;
                case 'removeAdmin':
                    await User.update(selectedUser.id, { role: 'user' });
                    toast({ title: "Success", description: `${selectedUser.full_name} is no longer an admin.` });
                    break;
                case 'makeExpert':
                    await User.update(selectedUser.id, { is_expert: true });
                    await Notification.create({
                        user_email: selectedUser.email,
                        type: 'expert_status',
                        content: 'Congratulations! You have been granted expert verification status.',
                        link: '/Settings'
                    });
                    toast({ title: "Success", description: `${selectedUser.full_name} is now an expert.` });
                    break;
                case 'removeExpert':
                    await User.update(selectedUser.id, { is_expert: false });
                    await Notification.create({
                        user_email: selectedUser.email,
                        type: 'expert_status',
                        content: 'Your expert verification status has been revoked.',
                        link: '/Settings'
                    });
                    toast({ title: "Success", description: `${selectedUser.full_name} is no longer an expert.` });
                    break;
                case 'delete':
                    await User.delete(selectedUser.id);
                    toast({ title: "Success", description: `${selectedUser.full_name} has been deleted.` });
                    break;
                case 'message':
                    if (messageContent.trim()) {
                        await DirectMessage.create({
                            sender_email: 'admin@geckinspect.com',
                            recipient_email: selectedUser.email,
                            content: messageContent.trim(),
                            message_type: 'system'
                        });
                        await Notification.create({
                            user_email: selectedUser.email,
                            type: 'new_message',
                            content: 'You have received a message from the admin team.',
                            link: '/Messages'
                        });
                        toast({ title: "Success", description: `Message sent to ${selectedUser.full_name}.` });
                    }
                    break;
            }
            
            fetchUsers(); // Refresh user list
            setSelectedUser(null);
            setActionType('');
            setMessageContent('');
        } catch (error) {
            console.error(`Failed to ${actionType}:`, error);
            toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
        }
        setIsProcessing(false);
    };

    const getUserBadges = (user) => {
        const badges = [];
        if (user.role === 'admin') badges.push({ label: 'Admin', color: 'bg-purple-600', icon: <Crown className="w-3 h-3" /> });
        if (user.is_expert) badges.push({ label: 'Expert', color: 'bg-green-600', icon: <Award className="w-3 h-3" /> });
        return badges;
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Management ({filteredUsers.length} users)
                </CardTitle>
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-slate-800 border-slate-600 text-slate-100"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-600">
                            <div className="flex items-center gap-4">
                                <img 
                                    src={user.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                                    alt={user.full_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-200">{user.full_name}</span>
                                        {getUserBadges(user).map((badge, index) => (
                                            <Badge key={index} className={`${badge.color} text-white text-xs flex items-center gap-1`}>
                                                {badge.icon}
                                                {badge.label}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    {user.location && <p className="text-xs text-slate-500">{user.location}</p>}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUserAction(user, 'message')}
                                    className="border-slate-600 hover:bg-slate-700"
                                >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    Message
                                </Button>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="ghost" className="hover:bg-slate-700">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-slate-800 border-slate-600 text-slate-200">
                                        {user.role === 'admin' ? (
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'removeAdmin')}>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Remove Admin
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'makeAdmin')}>
                                                <Crown className="w-4 h-4 mr-2" />
                                                Make Admin
                                            </DropdownMenuItem>
                                        )}
                                        
                                        {user.is_expert ? (
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'removeExpert')}>
                                                <Award className="w-4 h-4 mr-2" />
                                                Remove Expert Status
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleUserAction(user, 'makeExpert')}>
                                                <Star className="w-4 h-4 mr-2" />
                                                Grant Expert Status
                                            </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuItem 
                                            onClick={() => handleUserAction(user, 'delete')}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* Confirmation Dialog */}
            <Dialog open={!!selectedUser && actionType !== 'message'} onOpenChange={() => { setSelectedUser(null); setActionType(''); }}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogDescription>
                            {actionType === 'delete' && `Are you sure you want to permanently delete ${selectedUser?.full_name}? This action cannot be undone.`}
                            {actionType === 'makeAdmin' && `Grant admin privileges to ${selectedUser?.full_name}?`}
                            {actionType === 'removeAdmin' && `Remove admin privileges from ${selectedUser?.full_name}?`}
                            {actionType === 'makeExpert' && `Grant expert verification status to ${selectedUser?.full_name}?`}
                            {actionType === 'removeExpert' && `Remove expert status from ${selectedUser?.full_name}?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedUser(null); setActionType(''); }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={confirmAction}
                            disabled={isProcessing}
                            variant={actionType === 'delete' ? 'destructive' : 'default'}
                        >
                            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={!!selectedUser && actionType === 'message'} onOpenChange={() => { setSelectedUser(null); setActionType(''); setMessageContent(''); }}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Send Message to {selectedUser?.full_name}</DialogTitle>
                        <DialogDescription>
                            This message will appear in their direct messages and they'll receive a notification.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message here..."
                        className="bg-slate-800 border-slate-600 text-slate-100 min-h-32"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedUser(null); setActionType(''); setMessageContent(''); }}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAction} disabled={isProcessing || !messageContent.trim()}>
                            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}