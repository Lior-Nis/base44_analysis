import React, { useState, useEffect } from "react";
import { Live } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Video, Youtube, Instagram, Facebook, PlayCircle, Archive } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
};

export default function Lives() {
  const [upcomingLives, setUpcomingLives] = useState([]);
  const [pastLives, setPastLives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLives();
  }, []);

  const loadLives = async () => {
    setIsLoading(true);
    try {
      const allLives = await Live.list('-scheduled_date');
      const now = new Date();
      setUpcomingLives(allLives.filter(live => new Date(live.scheduled_date) >= now));
      setPastLives(allLives.filter(live => new Date(live.scheduled_date) < now));
    } catch (error) {
      console.error("Erro ao carregar lives:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const LiveCard = ({ live, isPast = false }) => {
    const PlatformIcon = platformIcons[live.platform] || Video;
    return (
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-100">
        <div className="relative">
          <img
            src={live.thumbnail || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"}
            alt={live.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge className={isPast ? "bg-gray-500 text-white" : "bg-red-500 text-white"}>
              {isPast ? "Finalizada" : "Agendada"}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full">
            <PlatformIcon className="w-5 h-5 text-gray-700" />
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">{live.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2 h-12">{live.description}</p>
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(live.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{format(new Date(live.scheduled_date), "HH:mm", { locale: ptBR })}</div>
          </div>
          {isPast ? (
            <Button asChild variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
              <a href={live.recording_url} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="w-4 h-4 mr-2" />Assistir Gravação
              </a>
            </Button>
          ) : (
            <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <a href={live.live_url} target="_blank" rel="noopener noreferrer">
                <Video className="w-4 h-4 mr-2" />Definir Lembrete
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Nossas Lives</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Aprenda, divirta-se e descubra os segredos da confeitaria conosco.
          </p>
        </motion.div>
        
        {isLoading ? (
          <Skeleton className="w-full h-96" />
        ) : (
          <div className="space-y-16">
            {/* Próximas Lives */}
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Video className="w-6 h-6 text-pink-500"/> Próximas Lives
              </h2>
              {upcomingLives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingLives.map(live => <LiveCard key={live.id} live={live} />)}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma live agendada no momento. Fique de olho!</p>
              )}
            </div>
            
            {/* Lives Passadas */}
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Archive className="w-6 h-6 text-gray-500"/> Lives Passadas
              </h2>
              {pastLives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastLives.map(live => <LiveCard key={live.id} live={live} isPast />)}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma live passada registrada.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}