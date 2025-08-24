import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Video, Youtube, Instagram, Facebook } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook
};

export default function LivesSection({ lives, isLoading }) {
  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!lives.length) {
    return (
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Lives Culinárias
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Acompanhe nossas lives e aprenda a fazer deliciosos doces em casa
          </p>
          <Link to={createPageUrl("Lives")}>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Video className="w-5 h-5 mr-2" />
              Ver Todas as Lives
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Próximas Lives
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Acompanhe nossas lives culinárias e aprenda a fazer deliciosos doces em casa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {lives.map((live, index) => {
            const PlatformIcon = platformIcons[live.platform] || Video;
            return (
              <motion.div
                key={live.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <div className="relative">
                    <img
                      src={live.thumbnail || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"}
                      alt={live.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white">
                        <Calendar className="w-3 h-3 mr-1" />
                        Agendada
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 p-2 rounded-full">
                        <PlatformIcon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">
                      {live.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {live.description}
                    </p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(live.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(live.scheduled_date), "HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Video className="w-4 h-4 mr-2" />
                      Definir Lembrete
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to={createPageUrl("Lives")}>
            <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              <Video className="w-5 h-5 mr-2" />
              Ver Todas as Lives
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}