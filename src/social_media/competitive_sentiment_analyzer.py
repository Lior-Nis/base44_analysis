"""
Competitive Sentiment Analysis Framework
Multi-platform social media analysis for no-code AI platforms
"""

import json
import re
import csv
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, field
from collections import defaultdict, Counter
from datetime import datetime, timedelta
import logging
import statistics
import math

logger = logging.getLogger(__name__)

@dataclass
class PlatformMention:
    """Individual platform mention data structure"""
    platform: str
    content: str
    source: str  # twitter, linkedin, reddit, etc.
    timestamp: datetime
    engagement_metrics: Dict[str, int] = field(default_factory=dict)  # likes, shares, etc.
    user_metrics: Dict[str, Any] = field(default_factory=dict)  # follower count, verified, etc.
    sentiment_score: float = 0.0
    aspect_sentiments: Dict[str, float] = field(default_factory=dict)
    
    # Competitive mentions (when multiple platforms mentioned)
    competitive_context: bool = False
    mentioned_competitors: List[str] = field(default_factory=list)

@dataclass
class CompetitiveSentimentResults:
    """Results from competitive sentiment analysis"""
    platform_name: str
    total_mentions: int = 0
    sentiment_distribution: Dict[str, int] = field(default_factory=dict)
    average_sentiment: float = 0.0
    engagement_metrics: Dict[str, float] = field(default_factory=dict)
    
    # Aspect-based sentiment
    feature_sentiments: Dict[str, float] = field(default_factory=dict)
    
    # Competitive analysis
    competitive_advantage_score: float = 0.0
    mentioned_with_competitors: Dict[str, int] = field(default_factory=dict)
    
    # Temporal analysis
    sentiment_trend: List[Tuple[datetime, float]] = field(default_factory=list)
    momentum_score: float = 0.0

class CompetitiveSentimentAnalyzer:
    """Advanced sentiment analysis for competitive platform comparison"""
    
    def __init__(self):
        # Platform definitions
        self.platforms = {
            'base44': {
                'keywords': ['base44', '@base44', 'base44.io'],
                'aliases': ['base 44', 'base-44']
            },
            'lovable': {
                'keywords': ['lovable', '@lovabledev', 'lovable.dev'],
                'aliases': ['lovable ai', 'lovable.ai']
            },
            'bolt': {
                'keywords': ['bolt.new', '@stackblitz', 'bolt stackblitz'],
                'aliases': ['bolt new', 'stackblitz bolt']
            },
            'v0': {
                'keywords': ['v0.dev', 'vercel v0', '@vercel v0'],
                'aliases': ['v0 vercel', 'vercel ai']
            }
        }
        
        # Sentiment analysis lexicons
        self.positive_words = {
            'excellent', 'amazing', 'love', 'great', 'awesome', 'fantastic', 'perfect',
            'impressed', 'brilliant', 'outstanding', 'superb', 'incredible', 'wonderful',
            'fast', 'easy', 'intuitive', 'powerful', 'efficient', 'smooth', 'clean'
        }
        
        self.negative_words = {
            'terrible', 'awful', 'hate', 'bad', 'horrible', 'disappointing', 'frustrating',
            'buggy', 'broken', 'slow', 'confusing', 'complicated', 'poor', 'useless',
            'annoying', 'failed', 'error', 'crash', 'problem', 'issue', 'difficult'
        }
        
        # Feature-specific keywords for aspect-based sentiment
        self.feature_keywords = {
            'ease_of_use': ['easy', 'intuitive', 'simple', 'user-friendly', 'straightforward', 'accessible'],
            'performance': ['fast', 'slow', 'speed', 'performance', 'responsive', 'lag', 'latency'],
            'documentation': ['docs', 'documentation', 'tutorial', 'guide', 'examples', 'help'],
            'community': ['community', 'support', 'forum', 'discord', 'help', 'response'],
            'features': ['feature', 'functionality', 'capability', 'tool', 'option', 'integration'],
            'pricing': ['price', 'cost', 'expensive', 'cheap', 'affordable', 'free', 'subscription'],
            'reliability': ['stable', 'reliable', 'crash', 'bug', 'error', 'downtime', 'uptime'],
            'innovation': ['innovative', 'cutting-edge', 'advanced', 'modern', 'latest', 'breakthrough']
        }
        
        # Platform comparison indicators
        self.comparison_keywords = [
            'vs', 'versus', 'compared to', 'better than', 'worse than', 'alternative to',
            'instead of', 'switch from', 'migrate to', 'choose between'
        ]
    
    def analyze_platform_mention(self, content: str, platform: str, 
                                source: str = 'unknown', 
                                timestamp: datetime = None,
                                engagement_metrics: Dict[str, int] = None) -> PlatformMention:
        """Analyze a single platform mention"""
        
        mention = PlatformMention(
            platform=platform,
            content=content,
            source=source,
            timestamp=timestamp or datetime.now(),
            engagement_metrics=engagement_metrics or {}
        )
        
        # Basic sentiment analysis
        mention.sentiment_score = self._calculate_sentiment_score(content)
        
        # Aspect-based sentiment
        mention.aspect_sentiments = self._analyze_aspect_sentiments(content)
        
        # Check for competitive context
        mention.competitive_context, mention.mentioned_competitors = self._detect_competitive_context(content, platform)
        
        return mention
    
    def _calculate_sentiment_score(self, content: str) -> float:
        """Calculate sentiment score for content"""
        content_lower = content.lower()
        words = re.findall(r'\b\w+\b', content_lower)
        
        positive_count = sum(1 for word in words if word in self.positive_words)
        negative_count = sum(1 for word in words if word in self.negative_words)
        
        # Handle negations
        negation_words = {'not', 'no', 'never', 'none', 'nothing', 'neither', 'nor'}
        negated_positive = 0
        negated_negative = 0
        
        for i, word in enumerate(words):
            if word in negation_words and i + 1 < len(words):
                next_word = words[i + 1]
                if next_word in self.positive_words:
                    negated_positive += 1
                elif next_word in self.negative_words:
                    negated_negative += 1
        
        # Adjust counts for negations
        effective_positive = positive_count - negated_positive + negated_negative
        effective_negative = negative_count - negated_negative + negated_positive
        
        total_sentiment_words = effective_positive + effective_negative
        
        if total_sentiment_words == 0:
            return 0.0  # Neutral
        
        # Normalize to -1 to 1 scale
        sentiment_score = (effective_positive - effective_negative) / total_sentiment_words
        return max(-1.0, min(1.0, sentiment_score))
    
    def _analyze_aspect_sentiments(self, content: str) -> Dict[str, float]:
        """Analyze sentiment for specific aspects/features"""
        content_lower = content.lower()
        aspect_sentiments = {}
        
        for aspect, keywords in self.feature_keywords.items():
            aspect_mentions = []
            
            for keyword in keywords:
                if keyword in content_lower:
                    # Find sentiment in surrounding context (±5 words)
                    words = content_lower.split()
                    for i, word in enumerate(words):
                        if keyword in word:
                            start = max(0, i - 5)
                            end = min(len(words), i + 6)
                            context = ' '.join(words[start:end])
                            aspect_mentions.append(self._calculate_sentiment_score(context))
            
            if aspect_mentions:
                aspect_sentiments[aspect] = statistics.mean(aspect_mentions)
        
        return aspect_sentiments
    
    def _detect_competitive_context(self, content: str, current_platform: str) -> Tuple[bool, List[str]]:
        """Detect if content mentions multiple platforms (competitive context)"""
        content_lower = content.lower()
        mentioned_competitors = []
        
        # Check for comparison keywords
        has_comparison_keywords = any(keyword in content_lower for keyword in self.comparison_keywords)
        
        # Check for other platforms mentioned
        for platform, config in self.platforms.items():
            if platform != current_platform:
                platform_mentioned = False
                
                # Check main keywords
                for keyword in config['keywords']:
                    if keyword.lower() in content_lower:
                        platform_mentioned = True
                        break
                
                # Check aliases
                if not platform_mentioned:
                    for alias in config.get('aliases', []):
                        if alias.lower() in content_lower:
                            platform_mentioned = True
                            break
                
                if platform_mentioned:
                    mentioned_competitors.append(platform)
        
        competitive_context = has_comparison_keywords and len(mentioned_competitors) > 0
        return competitive_context, mentioned_competitors
    
    def analyze_competitive_dataset(self, mentions: List[PlatformMention]) -> Dict[str, CompetitiveSentimentResults]:
        """Analyze complete dataset for competitive insights"""
        results = {}
        
        # Group mentions by platform
        platform_mentions = defaultdict(list)
        for mention in mentions:
            platform_mentions[mention.platform].append(mention)
        
        # Analyze each platform
        for platform, platform_mention_list in platform_mentions.items():
            result = CompetitiveSentimentResults(platform_name=platform)
            
            # Basic metrics
            result.total_mentions = len(platform_mention_list)
            
            # Sentiment distribution
            sentiments = [m.sentiment_score for m in platform_mention_list]
            result.average_sentiment = statistics.mean(sentiments) if sentiments else 0.0
            
            # Categorize sentiments
            for sentiment in sentiments:
                if sentiment > 0.1:
                    category = 'positive'
                elif sentiment < -0.1:
                    category = 'negative'
                else:
                    category = 'neutral'
                
                result.sentiment_distribution[category] = result.sentiment_distribution.get(category, 0) + 1
            
            # Engagement metrics
            if platform_mention_list:
                engagement_keys = set()
                for mention in platform_mention_list:
                    engagement_keys.update(mention.engagement_metrics.keys())
                
                for key in engagement_keys:
                    values = [m.engagement_metrics.get(key, 0) for m in platform_mention_list]
                    if values:
                        result.engagement_metrics[f'avg_{key}'] = statistics.mean(values)
                        result.engagement_metrics[f'total_{key}'] = sum(values)
            
            # Aspect-based sentiment analysis
            aspect_scores = defaultdict(list)
            for mention in platform_mention_list:
                for aspect, score in mention.aspect_sentiments.items():
                    aspect_scores[aspect].append(score)
            
            for aspect, scores in aspect_scores.items():
                if scores:
                    result.feature_sentiments[aspect] = statistics.mean(scores)
            
            # Competitive analysis
            competitive_mentions = [m for m in platform_mention_list if m.competitive_context]
            if competitive_mentions:
                # Calculate competitive advantage score
                competitive_sentiments = [m.sentiment_score for m in competitive_mentions]
                result.competitive_advantage_score = statistics.mean(competitive_sentiments)
                
                # Track which competitors are mentioned together
                for mention in competitive_mentions:
                    for competitor in mention.mentioned_competitors:
                        result.mentioned_with_competitors[competitor] = \
                            result.mentioned_with_competitors.get(competitor, 0) + 1
            
            # Temporal analysis
            if platform_mention_list:
                # Sort by timestamp
                sorted_mentions = sorted(platform_mention_list, key=lambda x: x.timestamp)
                
                # Create sentiment trend (daily averages)
                daily_sentiments = defaultdict(list)
                for mention in sorted_mentions:
                    date = mention.timestamp.date()
                    daily_sentiments[date].append(mention.sentiment_score)
                
                result.sentiment_trend = [
                    (date, statistics.mean(sentiments))
                    for date, sentiments in daily_sentiments.items()
                ]
                
                # Calculate momentum (trend slope)
                if len(result.sentiment_trend) > 1:
                    result.momentum_score = self._calculate_momentum(result.sentiment_trend)
            
            results[platform] = result
        
        return results
    
    def _calculate_momentum(self, sentiment_trend: List[Tuple[datetime, float]]) -> float:
        """Calculate sentiment momentum (trend direction and strength)"""
        if len(sentiment_trend) < 2:
            return 0.0
        
        # Convert dates to numeric values for linear regression
        dates = [(date - sentiment_trend[0][0]).days for date, _ in sentiment_trend]
        sentiments = [sentiment for _, sentiment in sentiment_trend]
        
        # Calculate simple linear regression slope
        n = len(dates)
        sum_x = sum(dates)
        sum_y = sum(sentiments)
        sum_xy = sum(x * y for x, y in zip(dates, sentiments))
        sum_x2 = sum(x * x for x in dates)
        
        if n * sum_x2 - sum_x * sum_x == 0:
            return 0.0
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        
        # Normalize slope to -1 to 1 range (approximate)
        return max(-1.0, min(1.0, slope * 100))  # Scale factor for readability
    
    def generate_competitive_report(self, results: Dict[str, CompetitiveSentimentResults]) -> Dict[str, Any]:
        """Generate comprehensive competitive analysis report"""
        
        report = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'platforms_analyzed': len(results),
                'total_mentions': sum(r.total_mentions for r in results.values())
            },
            'platform_rankings': {},
            'competitive_insights': {},
            'market_trends': {}
        }
        
        # Platform rankings
        platforms_by_sentiment = sorted(
            results.items(),
            key=lambda x: x[1].average_sentiment,
            reverse=True
        )
        
        platforms_by_mentions = sorted(
            results.items(),
            key=lambda x: x[1].total_mentions,
            reverse=True
        )
        
        platforms_by_momentum = sorted(
            results.items(),
            key=lambda x: x[1].momentum_score,
            reverse=True
        )
        
        report['platform_rankings'] = {
            'by_sentiment': [(name, data.average_sentiment) for name, data in platforms_by_sentiment],
            'by_mentions': [(name, data.total_mentions) for name, data in platforms_by_mentions],
            'by_momentum': [(name, data.momentum_score) for name, data in platforms_by_momentum]
        }
        
        # Competitive insights
        for platform_name, platform_result in results.items():
            insights = []
            
            # Sentiment insights
            if platform_result.average_sentiment > 0.3:
                insights.append(f"Strong positive sentiment ({platform_result.average_sentiment:.2f})")
            elif platform_result.average_sentiment < -0.3:
                insights.append(f"Concerning negative sentiment ({platform_result.average_sentiment:.2f})")
            
            # Momentum insights
            if platform_result.momentum_score > 0.5:
                insights.append("Strong positive momentum - gaining favor")
            elif platform_result.momentum_score < -0.5:
                insights.append("Declining sentiment trend")
            
            # Feature strengths/weaknesses
            if platform_result.feature_sentiments:
                best_feature = max(platform_result.feature_sentiments.items(), key=lambda x: x[1])
                worst_feature = min(platform_result.feature_sentiments.items(), key=lambda x: x[1])
                
                insights.append(f"Strongest aspect: {best_feature[0]} ({best_feature[1]:.2f})")
                if worst_feature[1] < 0:
                    insights.append(f"Weakest aspect: {worst_feature[0]} ({worst_feature[1]:.2f})")
            
            report['competitive_insights'][platform_name] = insights
        
        # Market trends
        all_sentiments = [r.average_sentiment for r in results.values()]
        all_momenta = [r.momentum_score for r in results.values()]
        
        report['market_trends'] = {
            'overall_market_sentiment': statistics.mean(all_sentiments) if all_sentiments else 0.0,
            'market_volatility': statistics.stdev(all_sentiments) if len(all_sentiments) > 1 else 0.0,
            'average_momentum': statistics.mean(all_momenta) if all_momenta else 0.0,
            'competitive_intensity': len([r for r in results.values() if r.mentioned_with_competitors])
        }
        
        return report
    
    def export_results(self, results: Dict[str, CompetitiveSentimentResults], 
                      filename: str = 'competitive_sentiment_analysis.json'):
        """Export results to JSON file"""
        
        # Convert results to serializable format
        serializable_results = {}
        for platform, result in results.items():
            serializable_results[platform] = {
                'platform_name': result.platform_name,
                'total_mentions': result.total_mentions,
                'sentiment_distribution': result.sentiment_distribution,
                'average_sentiment': result.average_sentiment,
                'engagement_metrics': result.engagement_metrics,
                'feature_sentiments': result.feature_sentiments,
                'competitive_advantage_score': result.competitive_advantage_score,
                'mentioned_with_competitors': result.mentioned_with_competitors,
                'momentum_score': result.momentum_score,
                'sentiment_trend': [(date.isoformat(), sentiment) for date, sentiment in result.sentiment_trend]
            }
        
        with open(filename, 'w') as f:
            json.dump(serializable_results, f, indent=2)
        
        logger.info(f"Results exported to {filename}")


# Example usage and testing
def create_sample_data() -> List[PlatformMention]:
    """Create sample data for testing"""
    sample_mentions = []
    
    # Sample mentions for different platforms
    mentions_data = [
        ("base44", "Just tried Base44 and it's amazing! The AI generates full databases automatically.", "twitter", 1.0),
        ("base44", "Base44 is okay but the documentation could be better. Still learning.", "linkedin", 0.1),
        ("lovable", "Lovable AI is incredible for full-stack development. Love the GitHub integration!", "twitter", 0.8),
        ("lovable", "Switched from Base44 to Lovable and couldn't be happier. Much more powerful.", "reddit", 0.6),
        ("bolt", "Bolt.new is fast but crashes too often. Getting frustrated with the bugs.", "twitter", -0.4),
        ("v0", "Vercel V0 is perfect for React development. Clean UI generation every time.", "twitter", 0.7),
        ("v0", "V0 vs Bolt vs Lovable - V0 wins for frontend, but limited for backend work.", "twitter", 0.3)
    ]
    
    base_time = datetime.now() - timedelta(days=30)
    
    for i, (platform, content, source, sentiment_hint) in enumerate(mentions_data):
        mention = PlatformMention(
            platform=platform,
            content=content,
            source=source,
            timestamp=base_time + timedelta(days=i*4),
            engagement_metrics={'likes': (i+1)*10, 'shares': (i+1)*2}
        )
        sample_mentions.append(mention)
    
    return sample_mentions


def main():
    """Test the competitive sentiment analyzer"""
    analyzer = CompetitiveSentimentAnalyzer()
    
    # Create sample data
    sample_mentions = create_sample_data()
    
    # Analyze each mention
    processed_mentions = []
    for mention in sample_mentions:
        processed_mention = analyzer.analyze_platform_mention(
            mention.content, 
            mention.platform, 
            mention.source, 
            mention.timestamp, 
            mention.engagement_metrics
        )
        processed_mentions.append(processed_mention)
    
    # Run competitive analysis
    results = analyzer.analyze_competitive_dataset(processed_mentions)
    
    # Generate report
    report = analyzer.generate_competitive_report(results)
    
    # Display results
    print("\n🔍 COMPETITIVE SENTIMENT ANALYSIS RESULTS")
    print("=" * 50)
    
    print(f"📊 Analysis Overview:")
    print(f"  Platforms analyzed: {report['analysis_metadata']['platforms_analyzed']}")
    print(f"  Total mentions: {report['analysis_metadata']['total_mentions']}")
    
    print(f"\n🏆 Platform Rankings:")
    print("  By Sentiment:")
    for platform, score in report['platform_rankings']['by_sentiment']:
        print(f"    {platform}: {score:.2f}")
    
    print("  By Mention Volume:")
    for platform, count in report['platform_rankings']['by_mentions']:
        print(f"    {platform}: {count} mentions")
    
    print("  By Momentum:")
    for platform, momentum in report['platform_rankings']['by_momentum']:
        print(f"    {platform}: {momentum:.2f}")
    
    print(f"\n💡 Key Insights:")
    for platform, insights in report['competitive_insights'].items():
        print(f"  {platform}:")
        for insight in insights:
            print(f"    • {insight}")
    
    print(f"\n📈 Market Trends:")
    trends = report['market_trends']
    print(f"  Overall market sentiment: {trends['overall_market_sentiment']:.2f}")
    print(f"  Market volatility: {trends['market_volatility']:.2f}")
    print(f"  Average momentum: {trends['average_momentum']:.2f}")
    
    # Export results
    output_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/competitive_sentiment_results.json"
    analyzer.export_results(results, output_file)
    
    # Export report
    report_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/competitive_analysis_report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to:")
    print(f"  {output_file}")
    print(f"  {report_file}")


if __name__ == "__main__":
    main()