
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartItemCard({ item, updating, onUpdateQuantity, onRemove }) {
  return (
    <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {item.item_name[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">
              {item.item_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize border-white/20 text-gray-300">
                {item.item_type}
              </Badge>
              <span className="text-lg font-bold text-white">
                ${item.price}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="h-8 w-8 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-md"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-medium text-white">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={updating}
              className="h-8 w-8 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-md"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="text-right">
            <div className="font-semibold text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              disabled={updating}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
