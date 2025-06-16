"""
Base44 Application Data Visualizer
Comprehensive visualization toolkit for Base44 phenomenon analysis
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
from wordcloud import WordCloud
import networkx as nx
from typing import Dict, List, Optional, Tuple
import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Base44Visualizer:
    """Comprehensive visualization toolkit for Base44 analysis"""
    
    def __init__(self, output_dir: str = 'results/figures'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Set visualization style
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # Color schemes
        self.color_schemes = {
            'purpose': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            'industry': ['#FF7675', '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055', '#00B894', '#00CEC9', '#81ECEC'],
            'quality': ['#E74C3C', '#F39C12', '#F1C40F', '#2ECC71', '#27AE60']
        }
        
    def load_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Load all analysis data"""
        try:
            apps_df = pd.read_csv('data/raw/base44_apps.csv')
            analysis_df = pd.read_csv('data/processed/app_analysis.csv')
            quality_df = pd.read_csv('data/processed/quality_metrics.csv')
            
            logger.info(f"Loaded data: {len(apps_df)} apps, {len(analysis_df)} analyses, {len(quality_df)} quality metrics")
            return apps_df, analysis_df, quality_df
            
        except FileNotFoundError as e:
            logger.error(f"Data file not found: {e}")
            return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()
            
    def create_purpose_distribution_chart(self, analysis_df: pd.DataFrame) -> go.Figure:
        """Create pie chart showing distribution of app purposes"""
        purpose_counts = analysis_df['purpose_category'].value_counts()
        
        fig = go.Figure(data=[go.Pie(
            labels=purpose_counts.index,
            values=purpose_counts.values,
            hole=0.3,
            marker_colors=self.color_schemes['purpose'][:len(purpose_counts)]
        )])
        
        fig.update_layout(
            title="Distribution of Base44 Application Purposes",
            font=dict(size=14),
            showlegend=True,
            width=800,
            height=600
        )
        
        return fig
        
    def create_industry_distribution_chart(self, analysis_df: pd.DataFrame) -> go.Figure:
        """Create horizontal bar chart showing industry distribution"""
        industry_counts = analysis_df['industry_category'].value_counts()
        
        fig = go.Figure(data=[go.Bar(
            x=industry_counts.values,
            y=industry_counts.index,
            orientation='h',
            marker_color=self.color_schemes['industry'][:len(industry_counts)]
        )])
        
        fig.update_layout(
            title="Base44 Applications by Industry",
            xaxis_title="Number of Applications",
            yaxis_title="Industry",
            font=dict(size=12),
            width=800,
            height=600
        )
        
        return fig
        
    def create_complexity_vs_quality_scatter(self, analysis_df: pd.DataFrame, quality_df: pd.DataFrame) -> go.Figure:
        """Create scatter plot of complexity vs quality scores"""
        # Merge dataframes
        merged_df = pd.merge(analysis_df, quality_df, left_on='name', right_on='app_name', how='inner')
        
        fig = px.scatter(
            merged_df,
            x='complexity_score',
            y='overall_quality_score',
            color='purpose_category',
            size='feature_count',
            hover_data=['name', 'industry_category'],
            title="Application Complexity vs Quality Score",
            labels={
                'complexity_score': 'Complexity Score',
                'overall_quality_score': 'Overall Quality Score',
                'purpose_category': 'Purpose'
            }
        )
        
        fig.update_layout(
            width=900,
            height=600,
            font=dict(size=12)
        )
        
        return fig
        
    def create_quality_metrics_radar_chart(self, quality_df: pd.DataFrame) -> go.Figure:
        """Create radar chart showing average quality metrics"""
        metrics = ['completeness_score', 'professional_score', 'adoption_score', 
                  'replacement_success_score', 'time_to_market_score', 'longevity_score']
        
        avg_metrics = quality_df[metrics].mean()
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatterpolar(
            r=avg_metrics.values,
            theta=['Completeness', 'Professional', 'Adoption', 'Replacement Success', 'Time to Market', 'Longevity'],
            fill='toself',
            name='Average Quality Metrics',
            marker_color='rgba(70, 130, 180, 0.6)'
        ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 10]
                )),
            showlegend=True,
            title="Average Quality Metrics for Base44 Applications",
            width=700,
            height=700
        )
        
        return fig
        
    def create_feature_heatmap(self, apps_df: pd.DataFrame) -> go.Figure:
        """Create heatmap showing feature usage across different app types"""
        # Parse features and create feature matrix
        feature_columns = []
        all_features = set()
        
        for features_str in apps_df['features'].dropna():
            features = [f.strip() for f in str(features_str).split(',') if f.strip()]
            all_features.update(features)
            
        all_features = sorted(list(all_features))
        
        # Create feature matrix
        feature_matrix = []
        categories = apps_df['category'].unique()
        
        for category in categories:
            category_apps = apps_df[apps_df['category'] == category]
            category_features = []
            
            for feature in all_features:
                count = 0
                for features_str in category_apps['features'].dropna():
                    if feature in str(features_str):
                        count += 1
                category_features.append(count)
            feature_matrix.append(category_features)
            
        fig = go.Figure(data=go.Heatmap(
            z=feature_matrix,
            x=all_features,
            y=categories,
            colorscale='Viridis',
            hoverongaps=False
        ))
        
        fig.update_layout(
            title="Feature Usage Heatmap by Application Category",
            xaxis_title="Features",
            yaxis_title="Application Category",
            width=1200,
            height=600,
            font=dict(size=10)
        )
        
        return fig
        
    def create_quality_distribution_histogram(self, quality_df: pd.DataFrame) -> go.Figure:
        """Create histogram showing distribution of overall quality scores"""
        fig = go.Figure()
        
        fig.add_trace(go.Histogram(
            x=quality_df['overall_quality_score'],
            nbinsx=20,
            marker_color='skyblue',
            opacity=0.7,
            name='Quality Distribution'
        ))
        
        # Add mean line
        mean_quality = quality_df['overall_quality_score'].mean()
        fig.add_vline(
            x=mean_quality,
            line_dash="dash",
            line_color="red",
            annotation_text=f"Mean: {mean_quality:.2f}"
        )
        
        fig.update_layout(
            title="Distribution of Overall Quality Scores",
            xaxis_title="Overall Quality Score",
            yaxis_title="Number of Applications",
            width=800,
            height=500,
            font=dict(size=12)
        )
        
        return fig
        
    def create_development_speed_analysis(self, analysis_df: pd.DataFrame, quality_df: pd.DataFrame) -> go.Figure:
        """Create box plot showing development speed by app category"""
        merged_df = pd.merge(analysis_df, quality_df, left_on='name', right_on='app_name', how='inner')
        
        fig = px.box(
            merged_df,
            x='purpose_category',
            y='time_to_market_score',
            color='purpose_category',
            title="Development Speed by Application Purpose",
            labels={
                'purpose_category': 'Application Purpose',
                'time_to_market_score': 'Time to Market Score'
            }
        )
        
        fig.update_layout(
            width=1000,
            height=600,
            font=dict(size=12),
            showlegend=False
        )
        
        return fig
        
    def create_sentiment_analysis_chart(self, analysis_df: pd.DataFrame) -> go.Figure:
        """Create chart showing sentiment analysis of app descriptions"""
        sentiment_categories = []
        for sentiment in analysis_df['description_sentiment']:
            if sentiment > 0.1:
                sentiment_categories.append('Positive')
            elif sentiment < -0.1:
                sentiment_categories.append('Negative')
            else:
                sentiment_categories.append('Neutral')
                
        sentiment_counts = pd.Series(sentiment_categories).value_counts()
        
        fig = go.Figure(data=[go.Bar(
            x=sentiment_counts.index,
            y=sentiment_counts.values,
            marker_color=['green', 'gray', 'red']
        )])
        
        fig.update_layout(
            title="Sentiment Analysis of Application Descriptions",
            xaxis_title="Sentiment",
            yaxis_title="Number of Applications",
            width=600,
            height=400,
            font=dict(size=12)
        )
        
        return fig
        
    def create_word_cloud(self, apps_df: pd.DataFrame) -> None:
        """Create word cloud from application descriptions"""
        # Combine all descriptions
        text = ' '.join(apps_df['description'].dropna().astype(str))
        
        # Create word cloud
        wordcloud = WordCloud(
            width=1200,
            height=600,
            background_color='white',
            colormap='viridis',
            max_words=100,
            relative_scaling=0.5,
            random_state=42
        ).generate(text)
        
        # Create matplotlib figure
        plt.figure(figsize=(15, 8))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title('Most Common Words in Base44 Application Descriptions', fontsize=16, pad=20)
        plt.tight_layout()
        
        # Save
        output_path = self.output_dir / 'word_cloud.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Word cloud saved to {output_path}")
        
    def create_network_graph(self, apps_df: pd.DataFrame) -> None:
        """Create network graph showing relationships between apps, industries, and features"""
        G = nx.Graph()
        
        # Add nodes and edges
        for idx, app in apps_df.iterrows():
            app_name = app['name']
            industry = app.get('industry', 'Unknown')
            features = str(app.get('features', '')).split(',')
            
            # Add app node
            G.add_node(app_name, node_type='app', size=20)
            
            # Add industry node and edge
            if industry and industry != 'Unknown':
                G.add_node(industry, node_type='industry', size=30)
                G.add_edge(app_name, industry)
                
            # Add feature nodes and edges
            for feature in features[:3]:  # Limit to top 3 features
                feature = feature.strip()
                if feature:
                    G.add_node(feature, node_type='feature', size=10)
                    G.add_edge(app_name, feature)
                    
        # Create layout
        pos = nx.spring_layout(G, k=3, iterations=50)
        
        # Create matplotlib figure
        plt.figure(figsize=(20, 15))
        
        # Draw different node types with different colors
        app_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'app']
        industry_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'industry']
        feature_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'feature']
        
        nx.draw_networkx_nodes(G, pos, nodelist=app_nodes, node_color='lightblue', node_size=300, alpha=0.7)
        nx.draw_networkx_nodes(G, pos, nodelist=industry_nodes, node_color='lightgreen', node_size=500, alpha=0.7)
        nx.draw_networkx_nodes(G, pos, nodelist=feature_nodes, node_color='lightcoral', node_size=200, alpha=0.7)
        
        # Draw edges
        nx.draw_networkx_edges(G, pos, alpha=0.3, width=0.5)
        
        # Draw labels for major nodes only
        major_nodes = {n: n for n in app_nodes[:10]}  # Show only first 10 app names
        major_nodes.update({n: n for n in industry_nodes})
        nx.draw_networkx_labels(G, pos, labels=major_nodes, font_size=8)
        
        plt.title('Base44 Application Ecosystem Network', fontsize=16, pad=20)
        plt.axis('off')
        plt.tight_layout()
        
        # Save
        output_path = self.output_dir / 'network_graph.png'
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Network graph saved to {output_path}")
        
    def create_time_series_analysis(self, apps_df: pd.DataFrame) -> go.Figure:
        """Create time series showing Base44 adoption over time"""
        # Mock time series data (in real scenario, would use actual creation dates)
        dates = pd.date_range(start='2023-01-01', end='2024-12-31', freq='M')
        cumulative_apps = np.cumsum(np.random.poisson(5, len(dates)))
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=dates,
            y=cumulative_apps,
            mode='lines+markers',
            name='Cumulative Applications',
            line=dict(color='blue', width=3),
            marker=dict(size=6)
        ))
        
        fig.update_layout(
            title="Base44 Application Creation Over Time",
            xaxis_title="Date",
            yaxis_title="Cumulative Number of Applications",
            width=1000,
            height=500,
            font=dict(size=12)
        )
        
        return fig
        
    def create_success_metrics_dashboard(self, analysis_df: pd.DataFrame, quality_df: pd.DataFrame) -> go.Figure:
        """Create comprehensive dashboard with multiple success metrics"""
        merged_df = pd.merge(analysis_df, quality_df, left_on='name', right_on='app_name', how='inner')
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Quality by Purpose', 'Complexity Distribution', 
                          'Market Fit vs Innovation', 'Professional Score by Industry'),
            specs=[[{"type": "bar"}, {"type": "histogram"}],
                   [{"type": "scatter"}, {"type": "box"}]]
        )
        
        # Quality by Purpose
        purpose_quality = merged_df.groupby('purpose_category')['overall_quality_score'].mean()
        fig.add_trace(
            go.Bar(x=purpose_quality.index, y=purpose_quality.values, name="Quality by Purpose"),
            row=1, col=1
        )
        
        # Complexity Distribution
        fig.add_trace(
            go.Histogram(x=merged_df['complexity_score'], name="Complexity Distribution"),
            row=1, col=2
        )
        
        # Market Fit vs Innovation
        fig.add_trace(
            go.Scatter(
                x=merged_df['market_fit_score'],
                y=merged_df['innovation_score'],
                mode='markers',
                name="Market Fit vs Innovation",
                text=merged_df['name']
            ),
            row=2, col=1
        )
        
        # Professional Score by Industry
        fig.add_trace(
            go.Box(y=merged_df['professional_score'], name="Professional Score"),
            row=2, col=2
        )
        
        fig.update_layout(
            title="Base44 Applications Success Metrics Dashboard",
            height=800,
            showlegend=False,
            font=dict(size=10)
        )
        
        return fig
        
    def generate_all_visualizations(self) -> None:
        """Generate all visualizations and save them"""
        logger.info("Starting comprehensive visualization generation...")
        
        # Load data
        apps_df, analysis_df, quality_df = self.load_data()
        
        if apps_df.empty or analysis_df.empty or quality_df.empty:
            logger.error("Cannot generate visualizations without data")
            return
            
        # Generate all charts
        visualizations = [
            ("purpose_distribution", self.create_purpose_distribution_chart(analysis_df)),
            ("industry_distribution", self.create_industry_distribution_chart(analysis_df)),
            ("complexity_vs_quality", self.create_complexity_vs_quality_scatter(analysis_df, quality_df)),
            ("quality_radar", self.create_quality_metrics_radar_chart(quality_df)),
            ("feature_heatmap", self.create_feature_heatmap(apps_df)),
            ("quality_histogram", self.create_quality_distribution_histogram(quality_df)),
            ("development_speed", self.create_development_speed_analysis(analysis_df, quality_df)),
            ("sentiment_analysis", self.create_sentiment_analysis_chart(analysis_df)),
            ("time_series", self.create_time_series_analysis(apps_df)),
            ("success_dashboard", self.create_success_metrics_dashboard(analysis_df, quality_df))
        ]
        
        # Save interactive charts
        for name, fig in visualizations:
            output_path = self.output_dir / f"{name}.html"
            fig.write_html(output_path)
            logger.info(f"Saved {name} to {output_path}")
            
        # Generate static visualizations
        self.create_word_cloud(apps_df)
        self.create_network_graph(apps_df)
        
        # Create summary HTML
        self.create_visualization_summary()
        
        logger.info("All visualizations generated successfully!")
        
    def create_visualization_summary(self) -> None:
        """Create HTML summary page with all visualizations"""
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Base44 Phenomenon Analysis - Visualizations</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .chart-container { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
                .chart-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                .chart-description { margin-bottom: 15px; color: #666; }
                img { max-width: 100%; height: auto; }
                iframe { width: 100%; height: 600px; border: none; }
            </style>
        </head>
        <body>
            <h1>Base44 Phenomenon Analysis - Visualization Dashboard</h1>
            
            <div class="chart-container">
                <div class="chart-title">Application Purpose Distribution</div>
                <div class="chart-description">Shows the distribution of different types of applications built on Base44</div>
                <iframe src="purpose_distribution.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Industry Distribution</div>
                <div class="chart-description">Applications categorized by industry sectors</div>
                <iframe src="industry_distribution.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Complexity vs Quality Analysis</div>
                <div class="chart-description">Relationship between application complexity and overall quality scores</div>
                <iframe src="complexity_vs_quality.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Quality Metrics Overview</div>
                <div class="chart-description">Radar chart showing average quality metrics across all applications</div>
                <iframe src="quality_radar.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Feature Usage Heatmap</div>
                <div class="chart-description">Heatmap showing which features are most commonly used by application category</div>
                <iframe src="feature_heatmap.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Success Metrics Dashboard</div>
                <div class="chart-description">Comprehensive dashboard showing multiple success metrics</div>
                <iframe src="success_dashboard.html"></iframe>
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Application Descriptions Word Cloud</div>
                <div class="chart-description">Most common words used in Base44 application descriptions</div>
                <img src="word_cloud.png" alt="Word Cloud">
            </div>
            
            <div class="chart-container">
                <div class="chart-title">Application Ecosystem Network</div>
                <div class="chart-description">Network graph showing relationships between applications, industries, and features</div>
                <img src="network_graph.png" alt="Network Graph">
            </div>
            
        </body>
        </html>
        """
        
        output_path = self.output_dir / 'visualization_summary.html'
        with open(output_path, 'w') as f:
            f.write(html_content)
            
        logger.info(f"Visualization summary created at {output_path}")

if __name__ == "__main__":
    visualizer = Base44Visualizer()
    visualizer.generate_all_visualizations()