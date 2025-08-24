import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/api/entities';
import { Users, Shield, Edit3, Search, Filter, Crown, UserX, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await UserEntity.list('-created_date');
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setIsLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (roleFilter === 'admin') return user.is_admin;
        if (roleFilter === 'restaurant_owner') return user.is_restaurant_owner;
        if (roleFilter === 'regular') return !user.is_admin && !user.is_restaurant_owner;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      await UserEntity.update(editingUser.id, {
        is_admin: editingUser.is_admin,
        is_restaurant_owner: editingUser.is_restaurant_owner,
        phone: editingUser.phone,
        location: editingUser.location
      });
      
      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setShowEditDialog(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
    setIsUpdating(false);
  };

  const getUserRole = (user) => {
    if (user.is_admin) return 'Admin';
    if (user.is_restaurant_owner) return 'Restaurant Owner';
    return 'Regular User';
  };

  const getUserRoleBadgeVariant = (user) => {
    if (user.is_admin) return 'default';
    if (user.is_restaurant_owner) return 'secondary';
    return 'outline';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
            <div className="text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {users.filter(u => u.is_admin).length}
            </div>
            <div className="text-gray-600">Administrators</div>
          </CardContent>
        </Card>
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {users.filter(u => u.is_restaurant_owner).length}
            </div>
            <div className="text-gray-600">Restaurant Owners</div>
          </CardContent>
        </Card>
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {users.filter(u => !u.is_admin && !u.is_restaurant_owner).length}
            </div>
            <div className="text-gray-600">Regular Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="tropical-shadow">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter" className="text-sm font-medium mb-2 block">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="restaurant_owner">Restaurant Owners</SelectItem>
                  <SelectItem value="regular">Regular Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="tropical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-[var(--brand-primary)] text-white font-medium">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.full_name || 'Unnamed User'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getUserRoleBadgeVariant(user)}>
                          {getUserRole(user)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Joined {formatDate(user.created_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6">
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  {editingUser.avatar_url ? (
                    <img src={editingUser.avatar_url} alt={editingUser.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-[var(--brand-primary)] text-white text-lg font-medium">
                      {editingUser.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-lg font-semibold">{editingUser.full_name || 'Unnamed User'}</h3>
                <p className="text-gray-600">{editingUser.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+960 XXX-XXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingUser.location || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="User location"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium">Permissions</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Administrator</Label>
                      <p className="text-sm text-gray-600">Full access to admin portal</p>
                    </div>
                    <Switch
                      checked={editingUser.is_admin}
                      onCheckedChange={(checked) => 
                        setEditingUser(prev => ({ ...prev, is_admin: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Restaurant Owner</Label>
                      <p className="text-sm text-gray-600">Can manage restaurants</p>
                    </div>
                    <Switch
                      checked={editingUser.is_restaurant_owner}
                      onCheckedChange={(checked) => 
                        setEditingUser(prev => ({ ...prev, is_restaurant_owner: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  disabled={isUpdating}
                  className="btn-primary"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}