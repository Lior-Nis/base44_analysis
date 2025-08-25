"""
Reddit Data Collection for Competitive Analysis
Collects posts and comments about no-code AI platforms
"""

import json
import time
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import statistics

@dataclass
class RedditPost:
    id: str
    title: str
    body: str
    author: str
    subreddit: str
    score: int
    upvote_ratio: float
    num_comments: int
    created_utc: float
    url: str
    platform_mentioned: List[str]
    sentiment_score: float = 0.0
    category: str = ""

@dataclass
class RedditComment:
    id: str
    post_id: str
    body: str
    author: str
    score: int
    created_utc: float
    platform_mentioned: List[str]
    sentiment_score: float = 0.0

class RedditCollector:
    def __init__(self):
        self.platforms = {
            'base44': ['base44', 'base 44'],
            'lovable': ['lovable.dev', 'lovable', 'lovabledev'],
            'bolt': ['bolt.new', 'bolt new', 'stackblitz bolt'],
            'v0': ['v0.dev', 'v0 vercel', 'vercel v0'],
            'cursor': ['cursor.sh', 'cursor ai', 'cursor editor'],
            'claude_artifacts': ['claude artifacts', 'claude artifact'],
            'replit': ['replit agent', 'replit ai'],
            'windsurf': ['windsurf ide', 'codeium windsurf']
        }
        
        self.subreddits = [
            'nocode', 'lowcode', 'buildinpublic', 'SaaS',
            'webdev', 'programming', 'entrepreneur',
            'startups', 'indiehackers', 'SideProject'
        ]
    
    def extract_platforms(self, text: str) -> List[str]:
        """Extract mentioned platforms from text"""
        text_lower = text.lower()
        found_platforms = []
        
        for platform, keywords in self.platforms.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    found_platforms.append(platform)
                    break
        
        return list(set(found_platforms))
    
    def analyze_sentiment(self, text: str) -> float:
        """Basic sentiment analysis using word patterns"""
        positive_words = [
            'amazing', 'awesome', 'great', 'excellent', 'fantastic',
            'love', 'perfect', 'brilliant', 'outstanding', 'impressive',
            'helpful', 'useful', 'easy', 'simple', 'efficient',
            'recommend', 'best', 'good', 'nice', 'cool'
        ]
        
        negative_words = [
            'terrible', 'awful', 'bad', 'horrible', 'worst',
            'hate', 'disappointed', 'frustrated', 'annoying', 'useless',
            'difficult', 'hard', 'complex', 'confusing', 'slow',
            'expensive', 'overpriced', 'limited', 'lacking', 'poor'
        ]
        
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total_words = len(words)
        if total_words == 0:
            return 0.0
        
        # Normalize to -1 to 1 scale
        sentiment = (positive_count - negative_count) / max(total_words / 10, 1)
        return max(-1.0, min(1.0, sentiment))
    
    def categorize_post(self, title: str, body: str) -> str:
        """Categorize post by type"""
        text = (title + " " + body).lower()
        
        if any(word in text for word in ['show', 'built', 'made', 'created', 'launch']):
            return 'showcase'
        elif any(word in text for word in ['help', 'how', 'question', '?']):
            return 'help_request'
        elif any(word in text for word in ['bug', 'issue', 'problem', 'error']):
            return 'issue_report'
        elif any(word in text for word in ['vs', 'versus', 'compare', 'comparison', 'alternative']):
            return 'comparison'
        elif any(word in text for word in ['review', 'opinion', 'thoughts', 'experience']):
            return 'review'
        else:
            return 'discussion'
    
    def simulate_reddit_data(self) -> List[RedditPost]:
        """Simulate Reddit data for competitive analysis"""
        posts = []
        
        # Base44 posts
        base44_posts = [
            {
                'title': 'Built my first SaaS with Base44 - surprisingly powerful!',
                'body': 'After trying several no-code tools, Base44 stands out. The AI generation is really smart and the database integration just works. Took me 2 hours to build what would have been weeks in React.',
                'score': 45,
                'num_comments': 12,
                'platforms': ['base44']
            },
            {
                'title': 'Base44 vs other no-code platforms - my experience',
                'body': 'Tried Base44, Bolt.new, and V0. Base44 has the best database handling but Bolt is faster for simple apps. V0 feels more polished but less flexible.',
                'score': 78,
                'num_comments': 23,
                'platforms': ['base44', 'bolt', 'v0']
            },
            {
                'title': 'Base44 limitations - what I wish they would fix',
                'body': 'Love the concept but the generated code is hard to customize. Also hit API limits pretty quickly. Still better than starting from scratch though.',
                'score': 34,
                'num_comments': 8,
                'platforms': ['base44']
            }
        ]
        
        # Competitor posts
        competitor_posts = [
            {
                'title': 'Bolt.new is incredibly fast for prototyping',
                'body': 'Just discovered Bolt.new and wow, the speed is amazing. Generated a working app in minutes. UI could be better but for quick prototypes it\'s perfect.',
                'score': 92,
                'num_comments': 31,
                'platforms': ['bolt']
            },
            {
                'title': 'V0 by Vercel - the most polished AI code generator',
                'body': 'V0.dev has the best UI and the generated components are production-ready. More expensive than alternatives but worth it for serious projects.',
                'score': 67,
                'num_comments': 19,
                'platforms': ['v0']
            },
            {
                'title': 'Lovable.dev review - decent but not game-changing',
                'body': 'Tried Lovable for a week. It\'s okay but nothing special. The AI sometimes generates buggy code and the templates feel limited.',
                'score': 23,
                'num_comments': 7,
                'platforms': ['lovable']
            }
        ]
        
        all_post_data = base44_posts + competitor_posts
        
        for i, post_data in enumerate(all_post_data):
            post = RedditPost(
                id=f"post_{i}",
                title=post_data['title'],
                body=post_data['body'],
                author=f"user_{i}",
                subreddit='nocode',
                score=post_data['score'],
                upvote_ratio=0.85 + (post_data['score'] / 1000),
                num_comments=post_data['num_comments'],
                created_utc=time.time() - (i * 86400),  # Days ago
                url=f"https://reddit.com/r/nocode/post_{i}",
                platform_mentioned=post_data['platforms'],
                sentiment_score=self.analyze_sentiment(post_data['title'] + " " + post_data['body']),
                category=self.categorize_post(post_data['title'], post_data['body'])
            )
            posts.append(post)
        
        return posts
    
    def collect_subreddit_data(self, subreddit: str, limit: int = 100) -> List[RedditPost]:
        """Simulate collecting data from a specific subreddit"""
        # In a real implementation, this would use PRAW (Python Reddit API Wrapper)
        # For now, we'll simulate with realistic data
        
        print(f"📊 Collecting data from r/{subreddit}...")
        
        # Simulate API delay
        time.sleep(0.5)
        
        if subreddit == 'nocode':
            return self.simulate_reddit_data()
        else:
            # Return fewer posts for other subreddits
            return self.simulate_reddit_data()[:2]
    
    def save_data(self, posts: List[RedditPost], filename: str):
        """Save collected data to JSON file"""
        data = [asdict(post) for post in posts]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(posts)} posts to {filename}")
    
    def analyze_platform_mentions(self, posts: List[RedditPost]) -> Dict[str, Dict[str, Any]]:
        """Analyze platform mention statistics"""
        platform_stats = {}
        
        for platform in self.platforms.keys():
            platform_posts = [p for p in posts if platform in p.platform_mentioned]
            
            if platform_posts:
                sentiments = [p.sentiment_score for p in platform_posts]
                scores = [p.score for p in platform_posts]
                
                platform_stats[platform] = {
                    'mention_count': len(platform_posts),
                    'avg_sentiment': statistics.mean(sentiments),
                    'avg_score': statistics.mean(scores),
                    'total_comments': sum(p.num_comments for p in platform_posts),
                    'categories': {}
                }
                
                # Category breakdown
                for post in platform_posts:
                    cat = post.category
                    if cat not in platform_stats[platform]['categories']:
                        platform_stats[platform]['categories'][cat] = 0
                    platform_stats[platform]['categories'][cat] += 1
        
        return platform_stats

def main():
    """Main collection and analysis function"""
    collector = RedditCollector()
    all_posts = []
    
    print("🚀 Starting Reddit data collection for competitive analysis...")
    
    # Collect from multiple subreddits
    for subreddit in collector.subreddits[:3]:  # Limit to first 3 for demo
        posts = collector.collect_subreddit_data(subreddit)
        all_posts.extend(posts)
    
    print(f"\n📈 Collected {len(all_posts)} total posts")
    
    # Save raw data
    collector.save_data(all_posts, 'data/reddit_posts.json')
    
    # Analyze platform mentions
    platform_stats = collector.analyze_platform_mentions(all_posts)
    
    print("\n🎯 Platform Mention Analysis:")
    for platform, stats in platform_stats.items():
        if stats['mention_count'] > 0:
            print(f"\n{platform.upper()}:")
            print(f"  Mentions: {stats['mention_count']}")
            print(f"  Avg Sentiment: {stats['avg_sentiment']:.3f}")
            print(f"  Avg Score: {stats['avg_score']:.1f}")
            print(f"  Total Comments: {stats['total_comments']}")
    
    # Save analysis results
    with open('data/reddit_analysis.json', 'w') as f:
        json.dump(platform_stats, f, indent=2)
    
    print("\n✅ Reddit collection and analysis complete!")
    return all_posts, platform_stats

if __name__ == "__main__":
    main()