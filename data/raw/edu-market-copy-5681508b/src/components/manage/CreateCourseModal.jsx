import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";
import { Plus, Trash2, Upload, Link as LinkIcon } from "lucide-react";

export default function CreateCourseModal({ open, onClose, onSave, editingCourse }) {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    subject: "mathematics",
    grade_level: "elementary",
    price: 0,
    difficulty: "beginner",
    duration: "",
    learning_objectives: [""],
    materials: [],
    is_active: true
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setCourseData({
        ...editingCourse,
        learning_objectives: editingCourse.learning_objectives || [""],
        materials: editingCourse.materials || []
      });
    } else {
      setCourseData({
        title: "",
        description: "",
        subject: "mathematics",
        grade_level: "elementary",
        price: 0,
        difficulty: "beginner",
        duration: "",
        learning_objectives: [""],
        materials: [],
        is_active: true
      });
    }
  }, [editingCourse, open]);

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...courseData.learning_objectives];
    newObjectives[index] = value;
    setCourseData(prev => ({
      ...prev,
      learning_objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setCourseData(prev => ({
      ...prev,
      learning_objectives: [...prev.learning_objectives, ""]
    }));
  };

  const removeObjective = (index) => {
    setCourseData(prev => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const newMaterial = {
        name: file.name,
        type: getFileType(file.name),
        file_url: file_url,
        google_link: ""
      };
      setCourseData(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial]
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'ppt' || ext === 'pptx') return 'powerpoint';
    if (ext === 'pdf') return 'pdf';
    return 'worksheet';
  };

  const addGoogleMaterial = () => {
    const newMaterial = {
      name: "",
      type: "google_doc",
      file_url: "",
      google_link: ""
    };
    setCourseData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterial]
    }));
  };

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...courseData.materials];
    newMaterials[index] = {
      ...newMaterials[index],
      [field]: value
    };
    setCourseData(prev => ({
      ...prev,
      materials: newMaterials
    }));
  };

  const removeMaterial = (index) => {
    setCourseData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const filteredObjectives = courseData.learning_objectives.filter(obj => obj.trim() !== "");
    onSave({
      ...courseData,
      learning_objectives: filteredObjectives
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? "Edit Course" : "Create New Course"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Algebra Fundamentals"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={courseData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={courseData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what students will learn..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={courseData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="ela">ELA</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grade Level</Label>
              <Select value={courseData.grade_level} onValueChange={(value) => handleInputChange('grade_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary</SelectItem>
                  <SelectItem value="middle_school">Middle School</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={courseData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={courseData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="e.g., 2 weeks, 5 hours"
            />
          </div>

          <div className="space-y-4">
            <Label>Learning Objectives</Label>
            {courseData.learning_objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder="What will students learn?"
                  className="flex-1"
                />
                {courseData.learning_objectives.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addObjective}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Learning Objective
            </Button>
          </div>

          <div className="space-y-4">
            <Label>Course Materials</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileUpload(file);
                    });
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Upload PowerPoints, PDFs, Documents</p>
                  <p className="text-xs text-slate-400">Click to select files</p>
                </label>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addGoogleMaterial}
                className="h-full flex flex-col gap-2"
              >
                <LinkIcon className="w-8 h-8" />
                <span>Add Google Doc/Slides Link</span>
              </Button>
            </div>

            {courseData.materials.map((material, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      placeholder="Material name"
                    />
                    <Select 
                      value={material.type} 
                      onValueChange={(value) => updateMaterial(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="google_doc">Google Doc</SelectItem>
                        <SelectItem value="google_slides">Google Slides</SelectItem>
                        <SelectItem value="worksheet">Worksheet</SelectItem>
                      </SelectContent>
                    </Select>
                    {(material.type === 'google_doc' || material.type === 'google_slides') && (
                      <Input
                        value={material.google_link}
                        onChange={(e) => updateMaterial(index, 'google_link', e.target.value)}
                        placeholder="Google Doc/Slides sharing link"
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeMaterial(index)}
                    className="ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || !courseData.title}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingCourse ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}