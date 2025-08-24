import React, { useState, useEffect } from "react";
import { Policy } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function PolicyManagement({ onStatsUpdate }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);

  const initialFormState = {
    title: "",
    description: "",
    category: "other",
    content: "",
    file_url: "",
    effective_date: "",
    last_reviewed: "",
    status: "active"
  };
  const [currentPolicy, setCurrentPolicy] = useState(initialFormState);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const policyData = await Policy.list('-effective_date');
      setPolicies(policyData);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
    setLoading(false);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setCurrentPolicy({
      ...policy,
      effective_date: policy.effective_date ? format(parseISO(policy.effective_date), 'yyyy-MM-dd') : '',
      last_reviewed: policy.last_reviewed ? format(parseISO(policy.last_reviewed), 'yyyy-MM-dd') : ''
    });
    setShowForm(true);
  };
  
  const handleNew = () => {
    setEditingPolicy(null);
    setCurrentPolicy(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await Policy.delete(policyId);
        loadPolicies();
        onStatsUpdate();
      } catch (error) {
        console.error("Error deleting policy:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await Policy.update(editingPolicy.id, currentPolicy);
      } else {
        await Policy.create(currentPolicy);
      }
      setShowForm(false);
      loadPolicies();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving policy:", error);
    }
  };
  
  if (loading) return <div>Loading policies...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Policy Management</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.title}</TableCell>
                  <TableCell>{policy.category}</TableCell>
                  <TableCell>{policy.status}</TableCell>
                  <TableCell>{format(parseISO(policy.effective_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(policy)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(policy.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Policy" : "Create New Policy"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={currentPolicy.title} onChange={(e) => setCurrentPolicy({...currentPolicy, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={currentPolicy.category} onValueChange={(value) => setCurrentPolicy({...currentPolicy, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="conduct">Conduct</SelectItem>
                    <SelectItem value="procedures">Procedures</SelectItem>
                    <SelectItem value="benefits">Benefits</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={currentPolicy.description} onChange={(e) => setCurrentPolicy({...currentPolicy, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <ReactQuill theme="snow" value={currentPolicy.content} onChange={(value) => setCurrentPolicy({...currentPolicy, content: value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="file_url">File URL</Label>
                <Input id="file_url" value={currentPolicy.file_url} onChange={(e) => setCurrentPolicy({...currentPolicy, file_url: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={currentPolicy.status} onValueChange={(value) => setCurrentPolicy({...currentPolicy, status: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input id="effective_date" type="date" value={currentPolicy.effective_date} onChange={(e) => setCurrentPolicy({...currentPolicy, effective_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_reviewed">Last Reviewed Date</Label>
                <Input id="last_reviewed" type="date" value={currentPolicy.last_reviewed} onChange={(e) => setCurrentPolicy({...currentPolicy, last_reviewed: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Policy</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}