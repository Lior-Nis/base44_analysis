
import React, { useState, useEffect } from "react";
import { Subscriber, User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus, Users, Plus, Mail, User as UserIcon } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import { motion, AnimatePresence } from "framer-motion";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // New state for current user

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const user = await User.me(); // Fetch current user
      setCurrentUser(user);
      
      // Only load subscribers for the current user, filtering by created_by email
      const data = await Subscriber.filter({ created_by: user.email }, '-created_date');
      setSubscribers(data);
    } catch (error) {
      console.error("Error loading subscribers:", error);
      // Optionally handle error state for UI (e.g., set an error message)
    }
    setLoading(false);
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      // Pass the current user's email as created_by
      await Subscriber.create({ name: newName, email: newEmail, created_by: currentUser?.email });
      setNewName("");
      setNewEmail("");
      loadSubscribers(); // Reload subscribers to include the newly added one
    } catch (error) {
      console.error("Error adding subscriber:", error);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    try {
      await Subscriber.delete(id);
      setSubscribers(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Subscribers
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your newsletter audience
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Subscriber Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <UserPlus className="w-5 h-5" />
                  Add New Subscriber
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSubscriber} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      id="name"
                      placeholder="e.g., Jane Doe"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/30 border-white/20 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., jane@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="bg-white/30 border-white/20 backdrop-blur-sm"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subscriber
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Subscribers List */}
          <div className="lg:col-span-2">
            <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <Users className="w-5 h-5" />
                  Subscriber List ({subscribers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Your subscriber list is empty.</p>
                    <p className="text-sm">Add your first subscriber to get started.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {subscribers.map(sub => (
                          <motion.tr
                            key={sub.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="hover:bg-white/10 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-gray-500" /> {/* Changed to UserIcon */}
                                <span className="font-medium text-gray-800">{sub.name || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">{sub.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
