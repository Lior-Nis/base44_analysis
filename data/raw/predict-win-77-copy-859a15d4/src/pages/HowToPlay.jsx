import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, Trophy, HelpCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';

const strategies = [
  {
    title: "Start with Small Bets",
    description: "When you're new to Predict Win 77 Bet, start with smaller amounts to understand the game flow without high risk. This helps you learn the patterns.",
    icon: TrendingUp
  },
  {
    title: "Analyze Previous Results",
    description: "Look at the history of game results. While past performance doesn't guarantee future outcomes, it can help you spot trends or frequent numbers.",
    icon: Target
  },
  {
    title: "Follow the Trend",
    description: "Sometimes a particular color or number sequence appears frequently. Riding the trend can be a simple but effective strategy.",
    icon: TrendingUp
  },
  {
    title: "Don't Chase Losses",
    description: "If you're on a losing streak, take a break. Avoid the temptation to place bigger bets to recover your losses quickly, as this can lead to bigger risks.",
    icon: CheckCircle
  }
];

const faqs = [
  {
    question: "What is the best way to predict Win 77 Bet?",
    answer: "The best approach combines analyzing past results with a consistent betting strategy. There's no single 'best way' as the game involves chance, but understanding trends and managing your budget are key. Our guides provide detailed strategies to improve your chances."
  },
  {
    question: "How can I get accurate predictions for Win 77 Bet?",
    answer: "Accurate prediction comes from a mix of data analysis and disciplined betting. Our platform provides a history of results that you can study. Avoid sites promising 'guaranteed' wins, as no prediction is 100% accurate."
  },
  {
    question: "Are there any tricks to win the color prediction game?",
    answer: "There are no 'tricks,' but there are strategies. A popular strategy is the 'double-up' method, where you double your bet on a single color after a loss. However, this requires a significant budget and carries risk. We recommend starting small and observing patterns."
  }
];

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">Player's Handbook</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            How to Play & Win: Your Ultimate Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn the best strategies, tips, and answers to frequently asked questions about Predict Win 77 Bet.
          </p>
        </div>

        {/* Strategies Section */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Top Strategies for Predict Win 77 Bet
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {strategies.map((strategy, index) => (
              <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <strategy.icon className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">{strategy.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{strategy.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-12">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-400" />
              Frequently Asked Questions (FAQ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Test Your Skills?</h2>
          <p className="text-gray-300 mb-6">You've learned the strategies. Now it's time to play!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("ColourGame")}>
              <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 text-lg">
                Play Colour Prediction
              </Button>
            </Link>
            <Link to={createPageUrl("Cricket")}>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-3 text-lg">
                Bet on Cricket
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}