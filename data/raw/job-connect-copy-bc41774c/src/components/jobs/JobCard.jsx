import React from "react";
import { MapPin, Clock, Building2, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function JobCard({ job, onApply, onMessage }) {
  const getJobTypeColor = (type) => {
    switch (type) {
      case 'full_time': return 'bg-green-100 text-green-700';
      case 'part_time': return 'bg-blue-100 text-blue-700';
      case 'contract': return 'bg-purple-100 text-purple-700';
      case 'freelance': return 'bg-orange-100 text-orange-700';
      case 'internship': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={job.company_logo} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {job.company?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <Badge className={`${getJobTypeColor(job.type)} mb-2`}>
            {job.type.replace('_', ' ')}
          </Badge>
          {job.remote && (
            <Badge className="bg-indigo-100 text-indigo-700 block">Remote</Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>
              ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Posted {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
          </span>
          <Users className="w-4 h-4 ml-4" />
          <span className="text-sm">{job.applications_count || 0} applicants</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm line-clamp-3 mb-4">{job.description}</p>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={() => onApply?.(job)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium"
        >
          Apply Now
        </Button>
        <Button 
          onClick={() => onMessage?.(job)}
          variant="outline" 
          className="px-6 rounded-full font-medium border-gray-300 hover:border-gray-400"
        >
          Message
        </Button>
      </div>
    </div>
  );
}