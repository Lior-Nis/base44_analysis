import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { User, Review } from "@/api/entities";
import { Star, Send, Loader2 } from "lucide-react";

export default function ReviewForm({ productId, productName, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Por favor, selecione uma nota.");
      return;
    }
    if (!comment) {
      setError("Por favor, escreva um comentário.");
      return;
    }
    if (!user) {
      setError("Você precisa estar logado para enviar uma avaliação.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      await Review.create({
        product_id: productId,
        customer_name: user.full_name,
        rating: rating,
        comment: comment,
        is_approved: false // Admin will approve later
      });
      setSubmitted(true);
      onReviewSubmit();
    } catch(err) {
      setError("Ocorreu um erro ao enviar sua avaliação. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="mt-8 glass-effect">
        <CardHeader>
          <CardTitle>Avaliação Enviada!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Obrigado pelo seu feedback! Sua avaliação foi enviada para moderação e será publicada em breve.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8 glass-effect">
      <CardHeader>
        <CardTitle>Deixe sua avaliação para {productName}</CardTitle>
        {!user && <p className="text-sm text-red-500">Você precisa estar logado para avaliar.</p>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold">Sua nota:</label>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'
                  }`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="font-semibold">Seu comentário:</label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos o que você achou deste produto..."
              className="mt-2"
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting || !user} className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-amber-500 text-white">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}