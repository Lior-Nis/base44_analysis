import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Heart, Users } from "lucide-react";

export default function CustomerGallery({ photos, isLoading }) {
  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!photos.length) {
    return (
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Galeria dos Clientes
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Compartilhe momentos especiais com nossos doces
          </p>
          <Link to={createPageUrl("Gallery")}>
            <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white">
              <Camera className="w-5 h-5 mr-2" />
              Enviar Foto
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Galeria dos Clientes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Veja como nossos clientes celebram momentos especiais com nossos doces
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {photos.slice(0, 8).map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || "Foto do cliente"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-medium text-sm">{photo.customer_name}</p>
                {photo.caption && (
                  <p className="text-xs text-gray-200 line-clamp-2 mt-1">
                    {photo.caption}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link to={createPageUrl("Gallery")}>
            <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 mr-4">
              <Camera className="w-5 h-5 mr-2" />
              Ver Galeria Completa
            </Button>
          </Link>
          <Link to={createPageUrl("Gallery")}>
            <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white">
              <Users className="w-5 h-5 mr-2" />
              Enviar Sua Foto
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}