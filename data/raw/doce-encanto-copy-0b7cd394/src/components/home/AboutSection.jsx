import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  ChefHat, 
  Award, 
  Heart, 
  Clock,
  Users,
  Star
} from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: ChefHat,
      title: "Receitas Artesanais",
      description: "Doces feitos com receitas tradicionais e ingredientes selecionados"
    },
    {
      icon: Award,
      title: "Qualidade Premium",
      description: "Comprometimento com a excelência em cada produto"
    },
    {
      icon: Heart,
      title: "Feito com Amor",
      description: "Cada doce é preparado com carinho e dedicação"
    },
    {
      icon: Clock,
      title: "Sempre Frescos",
      description: "Produtos preparados diariamente para garantir frescor"
    },
    {
      icon: Users,
      title: "Para Toda Família",
      description: "Opções para todos os gostos e idades"
    },
    {
      icon: Star,
      title: "Momentos Especiais",
      description: "Tornamos suas celebrações ainda mais doces"
    }
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-6">
            Por que Escolher a Doce Encanto?
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Há mais de 8 anos, dedicamos nosso amor e expertise para criar os doces mais especiais da cidade. 
            Nossa missão é adoçar seus momentos mais importantes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group h-full border-pink-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-pink-50/30">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-4 group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}