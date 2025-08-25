"""
Competitive Intelligence Dashboard Generator
Creates interactive visualizations comparing no-code AI platforms
"""

import json
import statistics
from typing import Dict, List, Any, Optional
from dataclasses import asdict
from datetime import datetime

class CompetitiveDashboard:
    def __init__(self):
        self.platforms = [
            'base44', 'lovable', 'bolt', 'v0', 'cursor',
            'claude_artifacts', 'replit', 'windsurf'
        ]
        
        self.platform_colors = {
            'base44': '#FF6B6B',
            'lovable': '#4ECDC4',
            'bolt': '#45B7D1',
            'v0': '#96CEB4',
            'cursor': '#FFEAA7',
            'claude_artifacts': '#DDA0DD',
            'replit': '#98D8C8',
            'windsurf': '#F7DC6F'
        }
    
    def load_social_data(self) -> Dict[str, Any]:
        """Load and combine social media data"""
        try:
            with open('data/reddit_analysis.json', 'r') as f:
                reddit_data = json.load(f)
        except FileNotFoundError:
            reddit_data = {}
        
        try:
            with open('data/twitter_metrics.json', 'r') as f:
                twitter_data = json.load(f)
        except FileNotFoundError:
            twitter_data = {}
        
        return {
            'reddit': reddit_data,
            'twitter': twitter_data
        }
    
    def create_platform_comparison_chart(self, data: Dict[str, Any]) -> str:
        """Create platform comparison visualization"""
        reddit_data = data.get('reddit', {})
        twitter_data = data.get('twitter', {})
        
        # Prepare data for visualization
        platforms = []
        reddit_mentions = []
        twitter_mentions = []
        reddit_sentiment = []
        twitter_sentiment = []
        
        for platform in self.platforms:
            if platform in reddit_data or platform in twitter_data:
                platforms.append(platform.replace('_', ' ').title())
                
                # Reddit data
                reddit_info = reddit_data.get(platform, {})
                reddit_mentions.append(reddit_info.get('mention_count', 0))
                reddit_sentiment.append(reddit_info.get('avg_sentiment', 0))
                
                # Twitter data
                twitter_info = twitter_data.get(platform, {})
                twitter_mentions.append(twitter_info.get('total_mentions', 0))
                twitter_sentiment.append(twitter_info.get('avg_sentiment', 0))
        
        chart_html = f"""
        <div id="platformComparison" style="width: 100%; height: 500px;"></div>
        <script>
            var trace1 = {{
                x: {platforms},
                y: {reddit_mentions},
                name: 'Reddit Mentions',
                type: 'bar',
                marker: {{color: '#FF6B6B'}}
            }};
            
            var trace2 = {{
                x: {platforms},
                y: {twitter_mentions},
                name: 'Twitter Mentions',
                type: 'bar',
                marker: {{color: '#4ECDC4'}}
            }};
            
            var layout = {{
                title: 'Platform Mentions Across Social Media',
                xaxis: {{title: 'Platforms'}},
                yaxis: {{title: 'Number of Mentions'}},
                barmode: 'group',
                font: {{size: 12}}
            }};
            
            Plotly.newPlot('platformComparison', [trace1, trace2], layout);
        </script>
        """
        
        return chart_html
    
    def create_sentiment_analysis_chart(self, data: Dict[str, Any]) -> str:
        """Create sentiment analysis visualization"""
        reddit_data = data.get('reddit', {})
        twitter_data = data.get('twitter', {})
        
        platforms = []
        reddit_sentiment = []
        twitter_sentiment = []
        
        for platform in self.platforms:
            if platform in reddit_data or platform in twitter_data:
                platforms.append(platform.replace('_', ' ').title())
                reddit_sentiment.append(reddit_data.get(platform, {}).get('avg_sentiment', 0))
                twitter_sentiment.append(twitter_data.get(platform, {}).get('avg_sentiment', 0))
        
        chart_html = f"""
        <div id="sentimentAnalysis" style="width: 100%; height: 500px;"></div>
        <script>
            var trace1 = {{
                x: {platforms},
                y: {reddit_sentiment},
                name: 'Reddit Sentiment',
                type: 'bar',
                marker: {{color: '#45B7D1'}}
            }};
            
            var trace2 = {{
                x: {platforms},
                y: {twitter_sentiment},
                name: 'Twitter Sentiment',
                type: 'bar',
                marker: {{color: '#96CEB4'}}
            }};
            
            var layout = {{
                title: 'Average Sentiment Score by Platform',
                xaxis: {{title: 'Platforms'}},
                yaxis: {{title: 'Sentiment Score (-1 to 1)', range: [-1, 1]}},
                barmode: 'group',
                font: {{size: 12}},
                shapes: [{{
                    type: 'line',
                    x0: -0.5, x1: {len(platforms) - 0.5},
                    y0: 0, y1: 0,
                    line: {{color: 'red', width: 2, dash: 'dash'}}
                }}]
            }};
            
            Plotly.newPlot('sentimentAnalysis', [trace1, trace2], layout);
        </script>
        """
        
        return chart_html
    
    def create_engagement_heatmap(self, data: Dict[str, Any]) -> str:
        """Create engagement heatmap"""
        twitter_data = data.get('twitter', {})
        
        platforms = []
        likes = []
        retweets = []
        total_engagement = []
        
        for platform in self.platforms:
            if platform in twitter_data:
                info = twitter_data[platform]
                platforms.append(platform.replace('_', ' ').title())
                likes.append(info.get('avg_likes', 0))
                retweets.append(info.get('avg_retweets', 0))
                total_engagement.append(info.get('total_engagement', 0))
        
        heatmap_html = f"""
        <div id="engagementHeatmap" style="width: 100%; height: 400px;"></div>
        <script>
            var data = [{{
                z: [{likes}, {retweets}, {total_engagement}],
                x: {platforms},
                y: ['Avg Likes', 'Avg Retweets', 'Total Engagement'],
                type: 'heatmap',
                colorscale: 'Viridis'
            }}];
            
            var layout = {{
                title: 'Twitter Engagement Heatmap',
                xaxis: {{title: 'Platforms'}},
                yaxis: {{title: 'Engagement Metrics'}},
                font: {{size: 12}}
            }};
            
            Plotly.newPlot('engagementHeatmap', data, layout);
        </script>
        """
        
        return heatmap_html
    
    def create_competitive_radar_chart(self, data: Dict[str, Any]) -> str:
        """Create competitive analysis radar chart"""
        reddit_data = data.get('reddit', {})
        twitter_data = data.get('twitter', {})
        
        # Focus on top platforms
        top_platforms = ['base44', 'bolt', 'v0', 'cursor']
        traces = []
        
        for platform in top_platforms:
            if platform in reddit_data or platform in twitter_data:
                # Normalize metrics to 0-10 scale
                reddit_mentions = min(reddit_data.get(platform, {}).get('mention_count', 0) * 2, 10)
                twitter_mentions = min(twitter_data.get(platform, {}).get('total_mentions', 0) * 1.5, 10)
                reddit_sentiment = (reddit_data.get(platform, {}).get('avg_sentiment', 0) + 1) * 5
                twitter_sentiment = (twitter_data.get(platform, {}).get('avg_sentiment', 0) + 1) * 5
                engagement = min(twitter_data.get(platform, {}).get('total_engagement', 0) / 50, 10)
                
                trace = {
                    'type': 'scatterpolar',
                    'r': [reddit_mentions, twitter_mentions, reddit_sentiment, twitter_sentiment, engagement],
                    'theta': ['Reddit Mentions', 'Twitter Mentions', 'Reddit Sentiment', 'Twitter Sentiment', 'Engagement'],
                    'fill': 'toself',
                    'name': platform.replace('_', ' ').title()
                }
                traces.append(trace)
        
        radar_html = f"""
        <div id="competitiveRadar" style="width: 100%; height: 500px;"></div>
        <script>
            var traces = {json.dumps(traces)};
            
            var layout = {{
                polar: {{
                    radialaxis: {{
                        visible: true,
                        range: [0, 10]
                    }}
                }},
                title: 'Competitive Analysis Radar Chart',
                font: {{size: 12}}
            }};
            
            Plotly.newPlot('competitiveRadar', traces, layout);
        </script>
        """
        
        return radar_html
    
    def generate_insights_summary(self, data: Dict[str, Any]) -> str:
        """Generate key insights from the data"""
        reddit_data = data.get('reddit', {})
        twitter_data = data.get('twitter', {})
        
        insights = []
        
        # Find platform with most mentions
        total_mentions = {}
        for platform in self.platforms:
            reddit_mentions = reddit_data.get(platform, {}).get('mention_count', 0)
            twitter_mentions = twitter_data.get(platform, {}).get('total_mentions', 0)
            total_mentions[platform] = reddit_mentions + twitter_mentions
        
        if total_mentions:
            top_platform = max(total_mentions, key=total_mentions.get)
            insights.append(f"🏆 **{top_platform.title()}** leads in total social media mentions ({total_mentions[top_platform]} mentions)")
        
        # Find highest sentiment platform
        avg_sentiments = {}
        for platform in self.platforms:
            reddit_sent = reddit_data.get(platform, {}).get('avg_sentiment', 0)
            twitter_sent = twitter_data.get(platform, {}).get('avg_sentiment', 0)
            if reddit_sent != 0 or twitter_sent != 0:
                avg_sentiments[platform] = (reddit_sent + twitter_sent) / 2
        
        if avg_sentiments:
            best_sentiment = max(avg_sentiments, key=avg_sentiments.get)
            insights.append(f"😊 **{best_sentiment.title()}** has the highest average sentiment ({avg_sentiments[best_sentiment]:.3f})")
        
        # Find highest engagement on Twitter
        twitter_engagement = {p: data.get('total_engagement', 0) for p, data in twitter_data.items()}
        if twitter_engagement:
            top_engagement = max(twitter_engagement, key=twitter_engagement.get)
            insights.append(f"📈 **{top_engagement.title()}** generates the most Twitter engagement ({twitter_engagement[top_engagement]} total interactions)")
        
        return "\\n".join(f"- {insight}" for insight in insights)
    
    def generate_dashboard(self) -> str:
        """Generate complete competitive dashboard"""
        data = self.load_social_data()
        
        dashboard_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Competitive Intelligence Dashboard</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #333;
                }}
                
                .dashboard {{
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                    overflow: hidden;
                }}
                
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                
                .content {{
                    padding: 30px;
                }}
                
                .chart-container {{
                    margin-bottom: 40px;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                }}
                
                .insights {{
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    border-left: 5px solid #667eea;
                }}
                
                .metrics-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }}
                
                .metric-card {{
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                    text-align: center;
                }}
                
                .metric-value {{
                    font-size: 2em;
                    font-weight: bold;
                    color: #667eea;
                }}
                
                .metric-label {{
                    color: #6c757d;
                    margin-top: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="dashboard">
                <div class="header">
                    <h1>🔍 Competitive Intelligence Dashboard</h1>
                    <p>Social Media Analysis of No-Code AI Platforms</p>
                    <p><small>Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}</small></p>
                </div>
                
                <div class="content">
                    <div class="insights">
                        <h3>🎯 Key Insights</h3>
                        <div style="line-height: 1.8;">
                            {self.generate_insights_summary(data)}
                        </div>
                    </div>
                    
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">{len([p for p in data.get('reddit', {}).keys() if data['reddit'][p].get('mention_count', 0) > 0])}</div>
                            <div class="metric-label">Platforms on Reddit</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">{len([p for p in data.get('twitter', {}).keys() if data['twitter'][p].get('total_mentions', 0) > 0])}</div>
                            <div class="metric-label">Platforms on Twitter</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">{sum(data.get('reddit', {}).get(p, {}).get('mention_count', 0) for p in self.platforms)}</div>
                            <div class="metric-label">Total Reddit Mentions</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">{sum(data.get('twitter', {}).get(p, {}).get('total_mentions', 0) for p in self.platforms)}</div>
                            <div class="metric-label">Total Twitter Mentions</div>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        {self.create_platform_comparison_chart(data)}
                    </div>
                    
                    <div class="chart-container">
                        {self.create_sentiment_analysis_chart(data)}
                    </div>
                    
                    <div class="chart-container">
                        {self.create_engagement_heatmap(data)}
                    </div>
                    
                    <div class="chart-container">
                        {self.create_competitive_radar_chart(data)}
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return dashboard_html

def main():
    """Generate competitive intelligence dashboard"""
    print("🚀 Generating competitive intelligence dashboard...")
    
    dashboard = CompetitiveDashboard()
    html_content = dashboard.generate_dashboard()
    
    # Save dashboard
    with open('visualizations/competitive_intelligence.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Competitive intelligence dashboard generated!")
    print("📊 View at: visualizations/competitive_intelligence.html")

if __name__ == "__main__":
    main()