import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Contact } from "@/api/entities";
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  Copy,
  Building,
  Check,
  X,
  QrCode,
  Image,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactEditForm from "./ContactEditForm";
import { downloadVCard } from "../components/utils/ContactUtils";
import { motion } from "framer-motion";

export default function ContactCard({ contact, onRefresh, selected, onSelect }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);

  const handleToggleStar = async () => {
    setLoading(true);
    try {
      await Contact.update(contact.id, {
        ...contact,
        starred: !contact.starred
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating contact:", error);
    }
    setLoading(false);
  };

  const handleDeleteContact = async () => {
    setLoading(true);
    try {
      await Contact.delete(contact.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
    setLoading(false);
    setShowDeleteDialog(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSaveContact = async (updatedData) => {
    setLoading(true);
    try {
      await Contact.update(contact.id, {
        ...contact,
        ...updatedData
      });
      if (onRefresh) onRefresh();
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden bg-white shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 flex flex-col relative h-full">
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(contact.id, e.target.checked)}
              className="h-4 w-4 sm:h-5 sm:w-5 rounded border-slate-300 text-slate-800 focus:ring-slate-700"
            />
          </div>
        )}
        
        <CardContent className="p-4 sm:p-5 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3 items-center flex-1 min-w-0">
              {contact.image_url ? (
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md cursor-pointer"
                  onClick={() => setShowImageDialog(true)}
                >
                  <img 
                    src={contact.image_url} 
                    alt={`${contact.full_name}'s business card`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-base sm:text-lg font-medium shadow-md ring-2 ring-white"
                >
                  {getInitials(contact.full_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">
                  {contact.full_name}
                </h3>
                {contact.job_title && (
                  <p className="text-xs sm:text-sm text-slate-500 truncate">
                    {contact.job_title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 sm:h-9 sm:w-9 ${contact.starred ? "text-amber-500 hover:text-amber-600" : "text-slate-400 hover:text-slate-600"}`}
                onClick={handleToggleStar}
                disabled={loading}
              >
                <Star className="h-4 w-4 sm:h-5 sm:w-5" fill={contact.starred ? "currentColor" : "none"} />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => downloadVCard(contact)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download vCard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={() => {
                      if (contact.phone) copyToClipboard(contact.phone, "phone");
                    }}
                    disabled={!contact.phone}
                  >
                    {copyStatus === "phone" ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Phone
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      if (contact.email) copyToClipboard(contact.email, "email");
                    }}
                    disabled={!contact.email}
                  >
                    {copyStatus === "email" ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Email
                      </>
                    )}
                  </DropdownMenuItem>

                  {contact.image_url && (
                    <DropdownMenuItem onClick={() => setShowImageDialog(true)}>
                      <Image className="h-4 w-4 mr-2" />
                      View Business Card
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Contact
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {contact.company && (
              <InfoItem icon={<Building className="h-4 w-4 text-slate-400" />} text={contact.company} />
            )}

            {contact.phone && (
              <InfoItem icon={<Phone className="h-4 w-4 text-slate-400" />} text={contact.phone} href={`tel:${contact.phone}`} />
            )}

            {contact.email && (
              <InfoItem icon={<Mail className="h-4 w-4 text-slate-400" />} text={contact.email} href={`mailto:${contact.email}`} />
            )}

            {contact.website && (
              <InfoItem icon={<Globe className="h-4 w-4 text-slate-400" />} text={contact.website} href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} isExternal />
            )}

            {(contact.location_met || contact.event_met) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {contact.location_met && (
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                    <MapPin className="h-3 w-3 mr-1" />
                    {contact.location_met}
                  </Badge>
                )}
                {contact.event_met && (
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {contact.event_met}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/70 p-3 sm:p-4 border-t border-slate-200/80 mt-auto">
          <div className="flex flex-wrap gap-1.5 w-full">
            {contact.tags && contact.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-200/80 text-slate-700 text-xs px-2 py-0.5 font-medium">
                {tag}
              </Badge>
            ))}
            {contact.tags && contact.tags.length > 3 && (
              <Badge variant="secondary" className="bg-slate-200/80 text-slate-700 text-xs px-2 py-0.5 font-medium">
                +{contact.tags.length - 3}
              </Badge>
            )}
            {(!contact.tags || contact.tags.length === 0) && (
              <span className="text-xs text-slate-400">No tags</span>
            )}
          </div>
        </CardFooter>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Contact</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {contact.full_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteContact} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Update the information for {contact.full_name}
              </DialogDescription>
            </DialogHeader>
            
            <ContactEditForm 
              contact={contact}
              onSave={handleSaveContact}
              onCancel={() => setShowEditDialog(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Business Card Image Dialog */}
        {contact.image_url && (
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Business Card</DialogTitle>
                <DialogDescription>
                  {contact.full_name} - {contact.company || ""}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <div className="border rounded-lg overflow-hidden bg-gray-50 max-w-full">
                  <img 
                    src={contact.image_url} 
                    alt={`${contact.full_name}'s business card`} 
                    className="max-w-full h-auto object-contain"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    </motion.div>
  );
}

const InfoItem = ({ icon, text, href, isExternal }) => (
  <div className="flex items-center gap-2 min-w-0">
    <div className="flex-shrink-0">
      {icon}
    </div>
    {href ? (
      <a 
        href={href} 
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-slate-600 hover:text-slate-900 hover:underline truncate text-sm"
      >
        {text}
      </a>
    ) : (
      <span className="text-slate-600 truncate text-sm">{text}</span>
    )}
  </div>
);