import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AlertDialog = ({ children, ...props }) => (
  <Dialog {...props}>
    {children}
  </Dialog>
);

const AlertDialogTrigger = DialogTrigger;

const AlertDialogContent = ({ className, children, ...props }) => (
  <DialogContent className={`sm:max-w-[425px] ${className}`} {...props}>
    {children}
  </DialogContent>
);

const AlertDialogHeader = DialogHeader;

const AlertDialogFooter = DialogFooter;

const AlertDialogTitle = DialogTitle;

const AlertDialogDescription = DialogDescription;

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={className}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    className={className}
    {...props}
  />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};