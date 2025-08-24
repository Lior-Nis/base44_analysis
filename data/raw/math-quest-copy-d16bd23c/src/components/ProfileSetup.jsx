import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from "@/components/ui/use-toast";

export default function ProfileSetup({ user, onComplete }) {
    const [nickname, setNickname] = useState(user.full_name || "");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nickname) {
            toast({ title: "Nickname required", description: "Please enter a nickname.", variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            const userData = { nickname };
            if (phoneNumber) {
                userData.phone_number = phoneNumber;
            }
            await User.updateMyUserData(userData);
            toast({ title: "Profile updated!", description: "You're all set to play." });
            onComplete({ ...user, ...userData });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Could not save your profile. Please try again.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="game-title text-2xl">Welcome to MathQuest!</DialogTitle>
                    <DialogDescription>
                        Let's set up your profile so friends can find you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="nickname" className="text-right">Nickname</label>
                            <Input
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="col-span-3"
                                placeholder="Your in-game name"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="phone" className="text-right">Phone</label>
                            <Input
                                id="phone"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="(Optional) For friends"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save and Play"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}