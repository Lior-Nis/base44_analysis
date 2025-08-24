
import React from "react";
import { format } from "date-fns";
import { Contact } from "@/api/entities";
import { 
  Star, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Calendar,
  MoreHorizontal,
  Download, 
  CheckSquare, 
  Square 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadVCard } from "../components/utils/ContactUtils";

export default function ContactTable({ 
  contacts, 
  onRefresh, 
  selectionMode,
  selectedContacts,
  onSelect
}) {
  const handleToggleStar = async (contact) => {
    try {
      await Contact.update(contact.id, {
        ...contact,
        starred: !contact.starred
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };
  
  const handleDeleteContact = async (contactId) => {
    try {
      await Contact.delete(contactId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {selectionMode && (
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === contacts.length}
                  onChange={() => {
                    if (selectedContacts.size === contacts.length) {
                      onSelect(new Set());
                    } else {
                      onSelect(new Set(contacts.map(c => c.id)));
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} className="hover:bg-gray-50">
              {selectionMode && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={(e) => onSelect(contact.id, e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                </TableCell>
              )}
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={contact.starred ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}
                  onClick={() => handleToggleStar(contact)}
                >
                  <Star className="h-5 w-5" fill={contact.starred ? "currentColor" : "none"} />
                </Button>
              </TableCell>
              <TableCell>
                <div className="font-medium text-gray-900">{contact.full_name}</div>
                {contact.job_title && <div className="text-sm text-gray-500">{contact.job_title}</div>}
              </TableCell>
              <TableCell>
                {contact.company ? (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{contact.company}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{contact.email}</span>
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {contact.location_met ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{contact.location_met}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                  {contact.event_met && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{contact.event_met}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {contact.date_met ? (
                  format(new Date(contact.date_met), "MMM d, yyyy")
                ) : (
                  contact.created_date ? format(new Date(contact.created_date), "MMM d, yyyy") : "-"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadVCard(contact)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
