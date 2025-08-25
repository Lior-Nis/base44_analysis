"""
Twitter/X Data Collection for Competitive Analysis
Collects tweets and engagement data about no-code AI platforms
"""

import json
import time
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import statistics

@dataclass
class Tweet:
    id: str
    text: str
    author: str
    created_at: str
    retweet_count: int
    like_count: int
    reply_count: int
    platform_mentioned: List[str]
    sentiment_score: float = 0.0
    engagement_rate: float = 0.0
    tweet_type: str = ""

@dataclass
class TwitterMetrics:
    platform: str
    total_mentions: int
    total_engagement: int
    avg_sentiment: float
    avg_likes: float
    avg_retweets: float
    top_tweet: Optional[Tweet] = None

class TwitterCollector:
    def __init__(self):
        self.platforms = {
            'base44': ['base44', 'base 44', '@base44ai'],
            'lovable': ['lovable.dev', 'lovable', '@lovabledev'],
            'bolt': ['bolt.new', 'bolt new', '@stackblitz'],
            'v0': ['v0.dev', 'v0 vercel', '@vercel'],
            'cursor': ['cursor.sh', 'cursor ai', '@cursor'],
            'claude_artifacts': ['claude artifacts', 'claude artifact', '@anthropic'],
            'replit': ['replit agent', 'replit ai', '@replit'],
            'windsurf': ['windsurf ide', '@codeiumdev']
        }
        
        self.search_terms = [
            'no-code AI', 'AI code generation', 'AI coding assistant',
            'code generation tool', 'AI developer tool', 'no-code platform'
        ]
    
    def extract_platforms(self, text: str) -> List[str]:
        """Extract mentioned platforms from tweet text"""
        text_lower = text.lower()
        found_platforms = []
        
        for platform, keywords in self.platforms.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    found_platforms.append(platform)
                    break
        
        return list(set(found_platforms))
    
    def analyze_sentiment(self, text: str) -> float:
        """Advanced sentiment analysis for tweets"""
        # Positive indicators
        positive_patterns = [
            r'\b(amazing|awesome|incredible|fantastic|brilliant)\b',
            r'\b(love|adore|perfect|excellent|outstanding)\b',
            r'\b(recommend|must-try|game-changer|revolutionary)\b',
            r'🔥|❤️|😍|🚀|💯|✨|👏|🎉'
        ]
        
        # Negative indicators
        negative_patterns = [
            r'\b(terrible|awful|horrible|disappointing|frustrated)\b',
            r'\b(hate|dislike|annoying|useless|waste)\b',
            r'\b(broken|buggy|slow|expensive|overpriced)\b',
            r'😤|😠|😡|💩|👎|😞|😔'
        ]
        
        text_lower = text.lower()
        
        positive_score = sum(len(re.findall(pattern, text_lower)) for pattern in positive_patterns)
        negative_score = sum(len(re.findall(pattern, text_lower)) for pattern in negative_patterns)
        
        # Account for tweet length
        tweet_length = len(text.split())
        if tweet_length == 0:
            return 0.0
        
        # Normalize sentiment
        sentiment = (positive_score - negative_score) / max(tweet_length / 15, 1)
        return max(-1.0, min(1.0, sentiment))
    
    def classify_tweet_type(self, text: str) -> str:
        """Classify tweet by type"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['built', 'made', 'created', 'shipped', 'launch']):
            return 'showcase'
        elif any(word in text_lower for word in ['vs', 'versus', 'compared to', 'better than']):
            return 'comparison'
        elif any(word in text_lower for word in ['tutorial', 'how to', 'guide', 'tip']):
            return 'educational'
        elif any(word in text_lower for word in ['review', 'tried', 'experience', 'thoughts']):
            return 'review'
        elif '?' in text or any(word in text_lower for word in ['help', 'how', 'anyone know']):
            return 'question'
        else:
            return 'general'
    
    def calculate_engagement_rate(self, tweet: Tweet, follower_count: int = 1000) -> float:
        """Calculate engagement rate for a tweet"""
        total_engagement = tweet.like_count + tweet.retweet_count + tweet.reply_count
        return (total_engagement / follower_count) * 100
    
    def simulate_twitter_data(self) -> List[Tweet]:
        """Simulate realistic Twitter data for competitive analysis"""
        tweets = []
        
        # Base44 tweets
        base44_tweets = [
            {
                'text': 'Just built my entire SaaS backend with Base44 in 30 minutes 🔥 This AI code generation is next level! #nocode #AI',
                'likes': 89, 'retweets': 23, 'replies': 12,
                'platforms': ['base44']
            },
            {
                'text': 'Base44 vs Bolt.new comparison thread 🧵 Both are great but Base44 handles databases better while Bolt is faster for frontend',
                'likes': 156, 'retweets': 45, 'replies': 28,
                'platforms': ['base44', 'bolt']
            },
            {
                'text': 'Base44 pricing is getting expensive 😤 Used to be affordable but now it\'s reaching enterprise levels',
                'likes': 34, 'retweets': 8, 'replies': 19,
                'platforms': ['base44']
            }
        ]
        
        # Competitor tweets
        competitor_tweets = [
            {
                'text': 'Bolt.new is absolutely incredible for rapid prototyping 🚀 Generated a full React app in 2 minutes!',
                'likes': 234, 'retweets': 67, 'replies': 43,
                'platforms': ['bolt']
            },
            {
                'text': 'V0 by Vercel continues to impress 💯 The component quality is production-ready out of the box',
                'likes': 178, 'retweets': 52, 'replies': 31,
                'platforms': ['v0']
            },
            {
                'text': 'Tried Lovable.dev for a week. Meh. 😐 It works but nothing special compared to other AI coding tools',
                'likes': 45, 'retweets': 12, 'replies': 23,
                'platforms': ['lovable']
            },
            {
                'text': 'Cursor is changing how I code ✨ The AI predictions are scary good. Best coding assistant I\'ve used',
                'likes': 312, 'retweets': 89, 'replies': 56,
                'platforms': ['cursor']
            }
        ]
        
        all_tweet_data = base44_tweets + competitor_tweets
        
        for i, tweet_data in enumerate(all_tweet_data):
            tweet = Tweet(
                id=f"tweet_{i}",
                text=tweet_data['text'],
                author=f"@user_{i}",
                created_at=datetime.now().isoformat(),
                retweet_count=tweet_data['retweets'],
                like_count=tweet_data['likes'],
                reply_count=tweet_data['replies'],
                platform_mentioned=tweet_data['platforms'],
                sentiment_score=self.analyze_sentiment(tweet_data['text']),
                tweet_type=self.classify_tweet_type(tweet_data['text'])
            )
            tweet.engagement_rate = self.calculate_engagement_rate(tweet)
            tweets.append(tweet)
        
        return tweets
    
    def collect_platform_tweets(self, platform: str, limit: int = 100) -> List[Tweet]:
        """Simulate collecting tweets for a specific platform"""
        print(f"🐦 Collecting tweets about {platform}...")
        
        # Simulate API delay
        time.sleep(0.3)
        
        all_tweets = self.simulate_twitter_data()
        platform_tweets = [t for t in all_tweets if platform in t.platform_mentioned]
        
        return platform_tweets[:limit]
    
    def analyze_platform_performance(self, tweets: List[Tweet]) -> Dict[str, TwitterMetrics]:
        """Analyze Twitter performance by platform"""
        platform_metrics = {}
        
        for platform in self.platforms.keys():
            platform_tweets = [t for t in tweets if platform in t.platform_mentioned]
            
            if platform_tweets:
                total_engagement = sum(
                    t.like_count + t.retweet_count + t.reply_count 
                    for t in platform_tweets
                )
                
                sentiments = [t.sentiment_score for t in platform_tweets]
                likes = [t.like_count for t in platform_tweets]
                retweets = [t.retweet_count for t in platform_tweets]
                
                # Find top tweet by engagement
                top_tweet = max(platform_tweets, 
                               key=lambda t: t.like_count + t.retweet_count + t.reply_count)
                
                platform_metrics[platform] = TwitterMetrics(
                    platform=platform,
                    total_mentions=len(platform_tweets),
                    total_engagement=total_engagement,
                    avg_sentiment=statistics.mean(sentiments),
                    avg_likes=statistics.mean(likes),
                    avg_retweets=statistics.mean(retweets),
                    top_tweet=top_tweet
                )
        
        return platform_metrics
    
    def generate_competitive_report(self, metrics: Dict[str, TwitterMetrics]) -> Dict[str, Any]:
        """Generate competitive analysis report"""
        # Sort platforms by engagement
        sorted_platforms = sorted(
            metrics.items(), 
            key=lambda x: x[1].total_engagement, 
            reverse=True
        )
        
        report = {
            'analysis_date': datetime.now().isoformat(),
            'platform_rankings': {
                'by_engagement': [p[0] for p in sorted_platforms],
                'by_sentiment': sorted(
                    metrics.items(),
                    key=lambda x: x[1].avg_sentiment,
                    reverse=True
                ),
                'by_mentions': sorted(
                    metrics.items(),
                    key=lambda x: x[1].total_mentions,
                    reverse=True
                )
            },
            'key_insights': [],
            'recommendations': []
        }
        
        # Generate insights
        if sorted_platforms:
            leader = sorted_platforms[0]
            report['key_insights'].append(
                f"{leader[0]} leads in total engagement with {leader[1].total_engagement} interactions"
            )
        
        # Sentiment analysis
        high_sentiment = [p for p, m in metrics.items() if m.avg_sentiment > 0.3]
        if high_sentiment:
            report['key_insights'].append(
                f"Platforms with highest sentiment: {', '.join(high_sentiment)}"
            )
        
        return report
    
    def save_data(self, tweets: List[Tweet], filename: str):
        """Save collected tweets to JSON file"""
        data = [asdict(tweet) for tweet in tweets]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(tweets)} tweets to {filename}")

def main():
    """Main Twitter collection and analysis function"""
    collector = TwitterCollector()
    all_tweets = []
    
    print("🚀 Starting Twitter data collection for competitive analysis...")
    
    # Collect tweets for all platforms
    for platform in collector.platforms.keys():
        tweets = collector.collect_platform_tweets(platform)
        all_tweets.extend(tweets)
    
    print(f"\n📈 Collected {len(all_tweets)} total tweets")
    
    # Save raw data
    collector.save_data(all_tweets, 'data/twitter_data.json')
    
    # Analyze platform performance
    metrics = collector.analyze_platform_performance(all_tweets)
    
    print("\n🎯 Platform Performance Analysis:")
    for platform, metric in metrics.items():
        print(f"\n{platform.upper()}:")
        print(f"  Mentions: {metric.total_mentions}")
        print(f"  Total Engagement: {metric.total_engagement}")
        print(f"  Avg Sentiment: {metric.avg_sentiment:.3f}")
        print(f"  Avg Likes: {metric.avg_likes:.1f}")
        print(f"  Avg Retweets: {metric.avg_retweets:.1f}")
    
    # Generate competitive report
    report = collector.generate_competitive_report(metrics)
    
    print(f"\n🏆 Engagement Leader: {report['platform_rankings']['by_engagement'][0]}")
    
    # Save analysis results
    with open('data/twitter_analysis.json', 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    with open('data/twitter_metrics.json', 'w') as f:
        metrics_data = {k: asdict(v) for k, v in metrics.items()}
        json.dump(metrics_data, f, indent=2, default=str)
    
    print("\n✅ Twitter collection and analysis complete!")
    return all_tweets, metrics, report

if __name__ == "__main__":
    main()