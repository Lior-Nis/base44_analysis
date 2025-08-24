import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogOut, Settings, User as UserIcon, Gavel } from "lucide-react";
import { t, isRTL } from "@/components/utils/i18n";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUser } from "@/components/utils/UserContext";

export default function UserProfileButton() {
  const { user, isLoading } = useUser();
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      toast({
        title: t("auth.signingOut"),
        description: t("auth.signingOutDescription"),
      });

      await User.logout();

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error during sign out:", error);
      setSigningOut(false);
      toast({
        variant: "destructive",
        title: t("auth.signOutError"),
        description: t("auth.signOutErrorDescription"),
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Show stable loading state
  if (isLoading || !user) {
    return (
      <div className="relative h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  
  const initials = getInitials(user.user_metadata?.full_name || user.email);
  const isRtlLayout = isRTL();

  return (
    <div dir={isRtlLayout ? "rtl" : "ltr"}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:scale-105 transition-transform">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name || user.email}
              />
              <AvatarFallback className="bg-gradient-to-r text-slate-50 text-sm font-medium flex h-full w-full items-center justify-center rounded-full select-none from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transition-colors duration-200">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align={isRtlLayout ? 'start' : 'end'} forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link to={createPageUrl("UserPreferences")}>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t("userPreferences.title")}</span>
              </DropdownMenuItem>
            </Link>
            <Link to={createPageUrl("Settings")}>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t("navigation.systemSettings")}</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
           <Link to={createPageUrl('UserAgreement')}>
              <DropdownMenuItem>
                  <Gavel className="mr-2 h-4 w-4" />
                  <span>{t('userAgreement.link')}</span>
              </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>{t("auth.signOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}