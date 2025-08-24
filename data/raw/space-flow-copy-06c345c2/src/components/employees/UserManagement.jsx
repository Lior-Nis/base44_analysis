
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User, Trash2, UserX, Calendar, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { Employee } from "@/api/entities";
import { Booking } from "@/api/entities";
import { OutOfOffice } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";

export default function UserManagement({ employee, onSuccess }) {
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [relatedData, setRelatedData] = useState(null);
  const { toast } = useToast();

  const checkRelatedData = async () => {
    try {
      const [bookings, outOfOfficeEntries] = await Promise.all([
        Booking.filter({ user_email: employee.email }),
        OutOfOffice.filter({ employee_email: employee.email })
      ]);

      setRelatedData({
        bookings: bookings.filter(b => b.status !== 'cancelled'),
        outOfOfficeEntries,
        total: bookings.length + outOfOfficeEntries.length
      });

      setShowCleanupDialog(true);
    } catch (error) {
      console.error("Error checking related data:", error);
      toast({
        title: "Error",
        description: "Failed to check user's related data.",
        variant: "destructive",
      });
    }
  };

  const handleCleanupAndDeactivate = async () => {
    setCleaning(true);
    try {
      // Defensive check to ensure employee exists before proceeding
      const employeeCheck = await Employee.filter({ id: employee.id });
      if (employeeCheck.length === 0) {
        toast({
          title: "Action Aborted",
          description: "This employee record no longer exists. The list will be refreshed.",
          variant: "destructive",
        });
        setShowCleanupDialog(false);
        onSuccess?.();
        setCleaning(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Cancel all future bookings
      if (relatedData?.bookings) {
        for (const booking of relatedData.bookings) {
          try {
            if (new Date(booking.booking_date) >= new Date() && booking.status !== 'cancelled') {
              await Booking.update(booking.id, { status: 'cancelled' });
              successCount++;
            }
          } catch (error) {
            console.error(`Failed to cancel booking ${booking.id}:`, error);
            errorCount++;
          }
        }
      }

      // Remove out of office entries
      if (relatedData?.outOfOfficeEntries) {
        for (const ooo of relatedData.outOfOfficeEntries) {
          try {
            await OutOfOffice.delete(ooo.id);
            successCount++;
          } catch (error) {
            console.error(`Failed to delete out of office ${ooo.id}:`, error);
            errorCount++;
          }
        }
      }

      // Deactivate employee record
      try {
        await Employee.update(employee.id, { 
          active: false,
          dedicated_workspace_id: null,
          preferred_zone_id: null
        });
        successCount++;
      } catch (error) {
        console.error("Failed to deactivate employee:", error);
        errorCount++;
      }

      // Try to deactivate user record if it exists
      try {
        const users = await UserEntity.filter({ email: employee.email });
        if (users.length > 0) {
          // Note: We can't actually delete the user record due to system constraints
          // but we can clear their data
          await UserEntity.update(users[0].id, {
            department: '',
            job_title: '',
            assigned_location_id: null,
            preferred_locations: [],
            work_schedule: {
              sunday: "remote",
              monday: "remote", 
              tuesday: "remote",
              wednesday: "remote",
              thursday: "remote"
            }
          });
          successCount++;
        }
      } catch (error) {
        // User update might fail due to permissions, but that's ok
        console.warn("Could not update user record (this is normal):", error);
      }

      toast({
        title: "Cleanup Complete",
        description: `Successfully processed ${successCount} items${errorCount > 0 ? ` (${errorCount} errors)` : ''}.`,
      });

      setShowCleanupDialog(false);
      onSuccess?.();

    } catch (error) {
      console.error("Error during cleanup:", error);
      toast({
        title: "Error",
        description: "Failed to complete user cleanup.",
        variant: "destructive",
      });
    }
    setCleaning(false);
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <UserX className="w-5 h-5" />
            User Deactivation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <User className="w-4 h-4" />
            <AlertDescription>
              This will safely deactivate <strong>{employee.name}</strong> ({employee.email}) 
              by cancelling their future bookings, removing out-of-office entries, and 
              deactivating their employee record.
            </AlertDescription>
          </Alert>

          <Button
            onClick={checkRelatedData}
            variant="destructive"
            className="w-full"
          >
            <UserX className="w-4 h-4 mr-2" />
            Deactivate User & Clean Data
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Deactivation</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  You are about to deactivate <strong>{employee.name}</strong> ({employee.email}).
                  This will perform the following actions:
                </p>
                
                {relatedData && (
                  <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Cancel {relatedData.bookings.filter(b => new Date(b.booking_date) >= new Date()).length} future bookings
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        Remove {relatedData.outOfOfficeEntries.length} out-of-office entries
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-600" />
                      <span className="text-sm">
                        Deactivate employee record and clear workspace assignments
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-600">
                  <strong>Note:</strong> The user record in the platform cannot be deleted due to system constraints, 
                  but this process will effectively remove them from the application.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCleanupAndDeactivate}
              disabled={cleaning}
            >
              {cleaning ? "Processing..." : "Deactivate User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
