import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Phone, Mail, Globe, Zap } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetails({ project }) {
  return (
    <div className="space-y-6">
      <Card className="glass-effect shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Business Type</p>
            <Badge className="mt-1 capitalize bg-indigo-100 text-indigo-800">
              {project.business_type.replace(/_/g, ' ')}
            </Badge>
          </div>
          
          {project.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Service Area</p>
                <p className="text-sm text-gray-900">{project.location}</p>
              </div>
            </div>
          )}
          
          {project.contact_phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{project.contact_phone}</p>
              </div>
            </div>
          )}
          
          {project.contact_email && (
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{project.contact_email}</p>
              </div>
            </div>
          )}
          
          {project.website_url && (
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Current Website</p>
                <p className="text-sm text-blue-600 hover:underline">
                  <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                    {project.website_url}
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-effect shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Generation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Template</p>
            <Badge className="mt-1 capitalize bg-purple-100 text-purple-800">
              {project.template_type.replace(/_/g, ' ')}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">AI Model</p>
            <p className="text-sm text-gray-900 mt-1">{project.ai_model}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-sm text-gray-900 mt-1">
              {format(new Date(project.created_date), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge 
              className={`mt-1 ${
                project.status === 'generated' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {project.status === 'generated' ? 'Ready for Download' : 'In Progress'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">Ready to Launch?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your website is optimized and ready for deployment to any hosting platform.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">SEO Optimized</Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Mobile Ready</Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Fast Loading</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}