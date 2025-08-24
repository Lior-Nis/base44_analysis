import React from "react";
import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

export default function PartnerCTA() {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 h-full">
      <div className="flex items-center gap-3">
        <Handshake className="w-8 h-8 text-white flex-shrink-0" />
        <div>
          <h4 className="font-bold text-white">Feature Your Brand</h4>
          <p className="text-sm text-white/90">
            Connect with our eco-conscious community.
          </p>
        </div>
      </div>
      <a href="mailto:partnerships@ecohustle.app?subject=EcoHustle Partnership Inquiry">
        <Button variant="secondary" className="bg-white/90 text-emerald-700 hover:bg-white w-full md:w-auto">
          Contact Us
        </Button>
      </a>
    </div>
  );
}