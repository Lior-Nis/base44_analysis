"""
Reddit and Social Media Data Collector for Base44 Analysis
Collects community discussions, showcases, and sentiment data
"""

import praw
import tweepy
import pandas as pd
import json
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RedditPost:
    """Data class for Reddit post information"""
    id: str
    title: str
    body: str
    author: str
    subreddit: str
    score: int
    num_comments: int
    created_utc: float
    url: str
    post_type: str  # 'showcase', 'help_request', 'bug_report', 'feature_request', 'comparison'
    sentiment_score: float
    app_mentioned: Optional[str]
    scraped_date: str

@dataclass
class SocialMediaPost:
    """Data class for social media post information"""
    id: str
    platform: str
    text: str
    author: str
    created_at: str
    engagement_score: int  # likes, retweets, etc.
    url: str
    post_type: str
    sentiment_score: float
    app_mentioned: Optional[str]
    scraped_date: str

class Base44CommunityCollector:
    """Collector for Base44 community data across platforms"""
    
    def __init__(self):
        self.reddit_client = None
        self.twitter_client = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.reddit_posts: List[RedditPost] = []
        self.social_posts: List[SocialMediaPost] = []
        
        # Initialize API clients
        self._init_reddit_client()
        self._init_twitter_client()
        
        # Classification keywords
        self.post_type_keywords = {
            'showcase': [
                'built', 'created', 'made', 'check out', 'my app',
                'finished', 'launched', 'completed', 'demo',
                'project', 'show off', 'presenting'
            ],
            'help_request': [
                'help', 'how to', 'stuck', 'problem', 'issue',
                'can\'t', 'unable', 'error', 'broken',
                'assistance', 'support', 'guide'
            ],
            'bug_report': [
                'bug', 'broken', 'not working', 'error', 'crash',
                'issue', 'problem', 'glitch', 'fail'
            ],
            'feature_request': [
                'feature', 'request', 'suggestion', 'would love',
                'please add', 'hope for', 'wish', 'enhancement'
            ],
            'comparison': [
                'vs', 'versus', 'compared to', 'better than',
                'alternative', 'instead of', 'switch from'
            ]
        }
        
    def _init_reddit_client(self):
        """Initialize Reddit API client"""
        try:
            # Check for credentials in environment variables
            client_id = os.getenv('REDDIT_CLIENT_ID')
            client_secret = os.getenv('REDDIT_CLIENT_SECRET')
            user_agent = os.getenv('REDDIT_USER_AGENT', 'Base44AnalysisBot/1.0')
            
            if client_id and client_secret:
                self.reddit_client = praw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent=user_agent
                )
                logger.info("Reddit client initialized successfully")
            else:
                logger.warning("Reddit credentials not found in environment variables")
                
        except Exception as e:
            logger.error(f"Failed to initialize Reddit client: {e}")
            
    def _init_twitter_client(self):
        """Initialize Twitter API client"""
        try:
            # Check for credentials in environment variables
            bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
            
            if bearer_token:
                self.twitter_client = tweepy.Client(bearer_token=bearer_token)
                logger.info("Twitter client initialized successfully")
            else:
                logger.warning("Twitter credentials not found in environment variables")
                
        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {e}")
            
    def _classify_post_type(self, text: str) -> str:
        """Classify post type based on content"""
        text_lower = text.lower()
        scores = {}
        
        for post_type, keywords in self.post_type_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                scores[post_type] = score
                
        if scores:
            return max(scores, key=scores.get)
        return 'general'
        
    def _analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of text using VADER"""
        if not text or not text.strip():
            return 0.0
            
        scores = self.sentiment_analyzer.polarity_scores(text)
        return round(scores['compound'], 3)
        
    def _extract_app_mention(self, text: str) -> Optional[str]:
        """Extract Base44 app URL or name from text"""
        # Look for Base44 app URLs
        app_url_pattern = r'https?://[\w\-\.]+\.base44\.app\b'
        urls = re.findall(app_url_pattern, text, re.IGNORECASE)
        if urls:
            return urls[0]
            
        # Look for app names mentioned with Base44
        app_mention_pattern = r'(?:built|made|created|using|with)\s+(?:base44\s+)?[\"\']?([a-zA-Z\s\-_]+)[\"\']?\s+(?:with|on|using)?\s*base44'
        matches = re.findall(app_mention_pattern, text, re.IGNORECASE)
        if matches:
            return matches[0].strip()
            
        return None
        
    def collect_reddit_data(self, subreddits: List[str] = None, limit: int = 100) -> List[RedditPost]:
        """Collect Reddit posts about Base44"""
        if not self.reddit_client:
            logger.error("Reddit client not available")
            return []
            
        if subreddits is None:
            subreddits = ['nocode', 'webdev', 'entrepreneur', 'startups', 'SaaS']
            
        logger.info(f"Collecting Reddit data from {len(subreddits)} subreddits...")
        
        search_terms = [
            'Base44',
            'base44.com',
            'base44.app',
            'no-code AI',
            'AI no-code platform'
        ]
        
        collected_posts = []
        
        for subreddit_name in subreddits:
            try:
                subreddit = self.reddit_client.subreddit(subreddit_name)
                
                # Search for Base44 mentions
                for term in search_terms:
                    try:
                        search_results = subreddit.search(
                            term, 
                            limit=limit//len(search_terms)//len(subreddits),
                            time_filter='all'
                        )
                        
                        for submission in search_results:
                            # Skip if already collected
                            if any(post.id == submission.id for post in collected_posts):
                                continue
                                
                            # Analyze post content
                            full_text = f"{submission.title} {submission.selftext}"
                            post_type = self._classify_post_type(full_text)
                            sentiment = self._analyze_sentiment(full_text)
                            app_mentioned = self._extract_app_mention(full_text)
                            
                            reddit_post = RedditPost(
                                id=submission.id,
                                title=submission.title,
                                body=submission.selftext,
                                author=str(submission.author) if submission.author else '[deleted]',
                                subreddit=subreddit_name,
                                score=submission.score,
                                num_comments=submission.num_comments,
                                created_utc=submission.created_utc,
                                url=f"https://reddit.com{submission.permalink}",
                                post_type=post_type,
                                sentiment_score=sentiment,
                                app_mentioned=app_mentioned,
                                scraped_date=datetime.now().isoformat()
                            )
                            
                            collected_posts.append(reddit_post)
                            
                        time.sleep(1)  # Rate limiting
                        
                    except Exception as e:
                        logger.error(f"Error searching subreddit {subreddit_name} for term '{term}': {e}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error accessing subreddit {subreddit_name}: {e}")
                continue
                
        logger.info(f"Collected {len(collected_posts)} Reddit posts")
        self.reddit_posts.extend(collected_posts)
        return collected_posts
        
    def collect_twitter_data(self, limit: int = 100) -> List[SocialMediaPost]:
        """Collect Twitter posts about Base44"""
        if not self.twitter_client:
            logger.error("Twitter client not available")
            return []
            
        logger.info("Collecting Twitter data...")
        
        search_queries = [
            'Base44 OR base44.com OR base44.app',
            '"built with Base44"',
            '"no-code AI" Base44',
            'Base44 application'
        ]
        
        collected_posts = []
        
        for query in search_queries:
            try:
                tweets = tweepy.Paginator(
                    self.twitter_client.search_recent_tweets,
                    query=query,
                    max_results=min(100, limit//len(search_queries)),
                    tweet_fields=['created_at', 'author_id', 'public_metrics']
                ).flatten(limit=limit//len(search_queries))
                
                for tweet in tweets:
                    # Skip if already collected
                    if any(post.id == tweet.id for post in collected_posts):
                        continue
                        
                    # Analyze tweet content
                    post_type = self._classify_post_type(tweet.text)
                    sentiment = self._analyze_sentiment(tweet.text)
                    app_mentioned = self._extract_app_mention(tweet.text)
                    
                    # Calculate engagement score
                    metrics = tweet.public_metrics or {}
                    engagement_score = (
                        metrics.get('like_count', 0) + 
                        metrics.get('retweet_count', 0) * 2 + 
                        metrics.get('reply_count', 0)
                    )
                    
                    social_post = SocialMediaPost(
                        id=tweet.id,
                        platform='twitter',
                        text=tweet.text,
                        author=str(tweet.author_id),
                        created_at=tweet.created_at.isoformat() if tweet.created_at else '',
                        engagement_score=engagement_score,
                        url=f"https://twitter.com/i/status/{tweet.id}",
                        post_type=post_type,
                        sentiment_score=sentiment,
                        app_mentioned=app_mentioned,
                        scraped_date=datetime.now().isoformat()
                    )
                    
                    collected_posts.append(social_post)
                    
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                logger.error(f"Error searching Twitter for query '{query}': {e}")
                continue
                
        logger.info(f"Collected {len(collected_posts)} Twitter posts")
        self.social_posts.extend(collected_posts)
        return collected_posts
        
    def search_web_mentions(self, limit: int = 50) -> List[Dict]:
        """Search web for Base44 mentions using mock data for demonstration"""
        logger.info("Searching web for Base44 mentions...")
        
        # Mock data for demonstration - in production would use Google Custom Search API
        mock_mentions = [
            {
                'title': 'How I Built My SaaS MVP with Base44 in 3 Hours',
                'url': 'https://example-blog.com/base44-mvp',
                'text': 'I was amazed at how quickly I could build a fully functional SaaS application using Base44. The AI understood exactly what I needed and generated a complete admin dashboard with user authentication.',
                'source': 'blog_post',
                'date': '2024-01-15'
            },
            {
                'title': 'Base44 Review: Is This No-Code Platform Worth It?',
                'url': 'https://review-site.com/base44-review',
                'text': 'After testing Base44 for a month, I can say it delivers on its promises. While it has some limitations, the speed of development is incredible.',
                'source': 'review_site',
                'date': '2024-01-20'
            },
            {
                'title': 'Replacing Our Internal Tools with Base44 Applications',
                'url': 'https://company-blog.com/base44-migration',
                'text': 'Our team successfully replaced three expensive SaaS tools with custom Base44 applications, saving us over $2000 per month.',
                'source': 'company_blog',
                'date': '2024-02-01'
            }
        ]
        
        web_posts = []
        for mention in mock_mentions[:limit]:
            post_type = self._classify_post_type(mention['text'])
            sentiment = self._analyze_sentiment(mention['text'])
            app_mentioned = self._extract_app_mention(mention['text'])
            
            social_post = SocialMediaPost(
                id=f"web_{hash(mention['url'])}",
                platform='web',
                text=mention['text'],
                author='unknown',
                created_at=mention['date'],
                engagement_score=0,  # Not available for web mentions
                url=mention['url'],
                post_type=post_type,
                sentiment_score=sentiment,
                app_mentioned=app_mentioned,
                scraped_date=datetime.now().isoformat()
            )
            
            web_posts.append(social_post)
            
        logger.info(f"Found {len(web_posts)} web mentions")
        self.social_posts.extend(web_posts)
        return web_posts
        
    def analyze_community_sentiment(self) -> Dict[str, any]:
        """Analyze overall community sentiment and trends"""
        all_posts = self.reddit_posts + self.social_posts
        
        if not all_posts:
            return {}
            
        # Convert to DataFrame for analysis
        reddit_data = [asdict(post) for post in self.reddit_posts]
        social_data = [asdict(post) for post in self.social_posts]
        
        reddit_df = pd.DataFrame(reddit_data) if reddit_data else pd.DataFrame()
        social_df = pd.DataFrame(social_data) if social_data else pd.DataFrame()
        
        analysis = {
            'data_summary': {
                'total_posts': len(all_posts),
                'reddit_posts': len(self.reddit_posts),
                'social_posts': len(self.social_posts)
            },
            'sentiment_analysis': {},
            'post_type_distribution': {},
            'temporal_trends': {},
            'platform_comparison': {}
        }
        
        # Overall sentiment analysis
        if all_posts:
            sentiments = [post.sentiment_score for post in all_posts]
            analysis['sentiment_analysis'] = {
                'average_sentiment': sum(sentiments) / len(sentiments),
                'positive_ratio': len([s for s in sentiments if s > 0.1]) / len(sentiments),
                'negative_ratio': len([s for s in sentiments if s < -0.1]) / len(sentiments),
                'neutral_ratio': len([s for s in sentiments if -0.1 <= s <= 0.1]) / len(sentiments)
            }
            
        # Post type distribution
        post_types = [post.post_type for post in all_posts]
        type_counts = pd.Series(post_types).value_counts().to_dict()
        analysis['post_type_distribution'] = type_counts
        
        # Platform-specific analysis
        if not reddit_df.empty:
            analysis['platform_comparison']['reddit'] = {
                'average_sentiment': reddit_df['sentiment_score'].mean(),
                'most_common_type': reddit_df['post_type'].mode().iloc[0] if not reddit_df['post_type'].mode().empty else None,
                'average_engagement': reddit_df['score'].mean() if 'score' in reddit_df.columns else 0
            }
            
        if not social_df.empty:
            analysis['platform_comparison']['social'] = {
                'average_sentiment': social_df['sentiment_score'].mean(),
                'most_common_type': social_df['post_type'].mode().iloc[0] if not social_df['post_type'].mode().empty else None,
                'average_engagement': social_df['engagement_score'].mean() if 'engagement_score' in social_df.columns else 0
            }
            
        return analysis
        
    def save_reddit_data(self, filename: str = 'data/raw/reddit_posts.csv'):
        """Save Reddit data to CSV"""
        if not self.reddit_posts:
            logger.warning("No Reddit data to save")
            return
            
        df = pd.DataFrame([asdict(post) for post in self.reddit_posts])
        df.to_csv(filename, index=False)
        logger.info(f"Saved {len(self.reddit_posts)} Reddit posts to {filename}")
        
    def save_social_data(self, filename: str = 'data/raw/social_posts.csv'):
        """Save social media data to CSV"""
        if not self.social_posts:
            logger.warning("No social media data to save")
            return
            
        df = pd.DataFrame([asdict(post) for post in self.social_posts])
        df.to_csv(filename, index=False)
        logger.info(f"Saved {len(self.social_posts)} social media posts to {filename}")
        
    def save_sentiment_analysis(self, filename: str = 'data/processed/community_sentiment.json'):
        """Save sentiment analysis results to JSON"""
        analysis = self.analyze_community_sentiment()
        if not analysis:
            logger.warning("No sentiment analysis to save")
            return
            
        with open(filename, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)
        logger.info(f"Saved sentiment analysis to {filename}")
        
    def run_full_collection(self, reddit_limit: int = 100, twitter_limit: int = 100, web_limit: int = 50):
        """Run complete data collection pipeline"""
        logger.info("Starting full community data collection...")
        
        # Collect data from all sources
        reddit_posts = self.collect_reddit_data(limit=reddit_limit)
        twitter_posts = self.collect_twitter_data(limit=twitter_limit)
        web_mentions = self.search_web_mentions(limit=web_limit)
        
        # Analyze sentiment
        sentiment_analysis = self.analyze_community_sentiment()
        
        # Save all data
        self.save_reddit_data()
        self.save_social_data()
        self.save_sentiment_analysis()
        
        logger.info(f"Data collection completed:")
        logger.info(f"  Reddit posts: {len(reddit_posts)}")
        logger.info(f"  Twitter posts: {len(twitter_posts)}")
        logger.info(f"  Web mentions: {len(web_mentions)}")
        logger.info(f"  Total posts: {len(reddit_posts) + len(twitter_posts) + len(web_mentions)}")
        
        return {
            'reddit_posts': len(reddit_posts),
            'twitter_posts': len(twitter_posts),
            'web_mentions': len(web_mentions),
            'sentiment_analysis': sentiment_analysis
        }

if __name__ == "__main__":
    collector = Base44CommunityCollector()
    results = collector.run_full_collection()
    
    print(f"Collection completed:")
    print(f"Reddit posts: {results['reddit_posts']}")
    print(f"Twitter posts: {results['twitter_posts']}")
    print(f"Web mentions: {results['web_mentions']}")
    
    if results['sentiment_analysis']:
        sentiment = results['sentiment_analysis'].get('sentiment_analysis', {})
        print(f"Average sentiment: {sentiment.get('average_sentiment', 0):.3f}")
        print(f"Positive ratio: {sentiment.get('positive_ratio', 0):.1%}")