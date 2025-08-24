import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReviewCard({ review }) {
    const renderStars = () => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                    <AvatarFallback>{review.customer_name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-semibold">{review.customer_name}</CardTitle>
                        <div className="flex items-center">{renderStars()}</div>
                    </div>
                    <p className="text-xs text-gray-500">
                        {format(new Date(review.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600">{review.comment}</p>
            </CardContent>
        </Card>
    );
}