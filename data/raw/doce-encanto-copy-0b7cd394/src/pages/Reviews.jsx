import React, { useState, useEffect } from "react";
import { Review, Product } from "@/api/entities";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, PieChart, TrendingUp, Filter } from "lucide-react";
import ReviewCard from "../components/reviews/ReviewCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("-created_date");

  useEffect(() => {
    loadData();
  }, [filter, sort]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reviewsData, productsData] = await Promise.all([
        Review.filter(filter === "all" ? { is_approved: true } : { product_id: filter, is_approved: true }, sort),
        Product.list()
      ]);
      setReviews(reviewsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Avaliações dos Clientes</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A opinião de quem mais importa para nós. Veja o que estão dizendo!
          </p>
        </motion.div>

        <Card className="mb-8 p-4 bg-white/80 backdrop-blur-sm border-pink-100">
          <CardContent className="flex flex-col md:flex-row items-center justify-around p-0">
            <div className="text-center p-4">
              <TrendingUp className="w-8 h-8 mx-auto text-pink-500 mb-2" />
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-gray-500">Avaliações Totais</p>
            </div>
            <div className="text-center p-4">
              <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{averageRating}</p>
              <p className="text-gray-500">Média Geral</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select onValueChange={setFilter} defaultValue="all">
            <SelectTrigger className="w-full md:w-[280px]"><Filter className="w-4 h-4 mr-2" />Filtrar por produto</SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={setSort} defaultValue="-created_date">
            <SelectTrigger className="w-full md:w-[180px]">Ordenar por</SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Mais Recentes</SelectItem>
              <SelectItem value="created_date">Mais Antigas</SelectItem>
              <SelectItem value="-rating">Melhor Avaliação</SelectItem>
              <SelectItem value="rating">Pior Avaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-16">Nenhuma avaliação encontrada para este filtro.</p>
        )}
      </div>
    </div>
  );
}