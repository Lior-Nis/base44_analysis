import React, { useState, useEffect } from "react";
import { CourseProgress } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Award, Download } from "lucide-react";
import { GenerateImage } from "@/api/integrations";

export default function ProgressTracker({ course, onMaterialComplete }) {
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [course.id]);

  const loadProgress = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userProgress = await CourseProgress.filter({
        course_id: course.id,
        student_email: currentUser.email
      });
      
      if (userProgress.length > 0) {
        setProgress(userProgress[0]);
      } else {
        // Create initial progress record
        const newProgress = await CourseProgress.create({
          course_id: course.id,
          student_email: currentUser.email,
          materials_completed: [],
          completion_percentage: 0
        });
        setProgress(newProgress);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const markMaterialComplete = async (materialIndex) => {
    if (!progress || !user) return;

    const materialId = `material_${materialIndex}`;
    const completedMaterials = [...(progress.materials_completed || [])];
    
    if (!completedMaterials.includes(materialId)) {
      completedMaterials.push(materialId);
      
      const totalMaterials = course.materials?.length || 1;
      const completionPercentage = Math.round((completedMaterials.length / totalMaterials) * 100);
      
      try {
        await CourseProgress.update(progress.id, {
          materials_completed: completedMaterials,
          completion_percentage: completionPercentage
        });
        
        setProgress(prev => ({
          ...prev,
          materials_completed: completedMaterials,
          completion_percentage: completionPercentage
        }));

        if (onMaterialComplete) {
          onMaterialComplete(materialIndex);
        }

        // Auto-generate certificate if course is completed
        if (completionPercentage === 100 && !progress.certificate_earned) {
          generateCertificate();
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const generateCertificate = async () => {
    if (!user || !progress) return;
    
    setGeneratingCertificate(true);
    try {
      const certificatePrompt = `Create a professional academic certificate with elegant design. 
      Certificate of Completion for: "${course.title}"
      Student Name: ${user.full_name || user.email.split('@')[0]}
      Course Subject: ${course.subject}
      Academic Zone Professional Development
      Include decorative borders, academic styling, and formal layout suitable for professional educators.`;
      
      const { url: certificateUrl } = await GenerateImage({
        prompt: certificatePrompt
      });
      
      await CourseProgress.update(progress.id, {
        certificate_earned: true,
        certificate_url: certificateUrl
      });
      
      setProgress(prev => ({
        ...prev,
        certificate_earned: true,
        certificate_url: certificateUrl
      }));
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
    setGeneratingCertificate(false);
  };

  if (!progress || !user) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Course Completion</span>
            <span className="text-sm text-slate-600">{progress.completion_percentage}%</span>
          </div>
          <Progress value={progress.completion_percentage} className="h-2" />
        </div>

        {course.materials && course.materials.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Materials Progress</h4>
            {course.materials.map((material, index) => {
              const materialId = `material_${index}`;
              const isCompleted = progress.materials_completed?.includes(materialId);
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle 
                      className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-slate-300'}`}
                    />
                    <span className={`text-sm ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                      {material.name}
                    </span>
                  </div>
                  {!isCompleted && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markMaterialComplete(index)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {progress.completion_percentage === 100 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-green-600">Course Completed!</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Certified
              </Badge>
            </div>
            
            {progress.certificate_earned && progress.certificate_url ? (
              <Button 
                onClick={() => window.open(progress.certificate_url, '_blank')}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            ) : (
              <Button 
                onClick={generateCertificate}
                disabled={generatingCertificate}
                className="w-full"
              >
                <Award className="w-4 h-4 mr-2" />
                {generatingCertificate ? 'Generating Certificate...' : 'Generate Certificate'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}