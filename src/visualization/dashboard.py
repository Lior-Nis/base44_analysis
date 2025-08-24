"""
Interactive Dashboard for Base44 Ecosystem Analysis
Generates comprehensive visualizations and interactive charts for the analysis results.
"""

import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from pathlib import Path

class VisualizationDashboard:
    def __init__(self, data_dir: Path):
        self.data_dir = Path(data_dir)
        self.load_data()
        
    def load_data(self):
        """Load all processed data files"""
        try:
            # Load taxonomy data
            with open(self.data_dir / "base44_taxonomy.json", 'r') as f:
                self.taxonomy_data = json.load(f)
            
            self.taxonomy_df = pd.read_csv(self.data_dir / "base44_taxonomy.csv")
            
            # Load ecosystem report
            with open(self.data_dir / "ecosystem_report.json", 'r') as f:
                self.ecosystem_data = json.load(f)
            
            # Load detailed summary
            self.summary_df = pd.read_csv(self.data_dir / "ecosystem_summary.csv")
            
            print("All data files loaded successfully")
            
        except Exception as e:
            print(f"Error loading data: {e}")
            raise
    
    def create_complexity_distribution_chart(self):
        """Create complexity distribution visualization"""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Complexity Distribution', 'Business Domain Distribution', 
                          'App Type Distribution', 'SDK Adherence Distribution'),
            specs=[[{'type': 'domain'}, {'type': 'domain'}],
                   [{'type': 'domain'}, {'type': 'xy'}]]
        )
        
        # Complexity distribution pie chart
        complexity_data = self.ecosystem_data['complexity_analysis']['complexity_distribution']
        fig.add_trace(go.Pie(
            labels=list(complexity_data.keys()),
            values=list(complexity_data.values()),
            name="Complexity"
        ), row=1, col=1)
        
        # Business domain distribution
        domain_data = self.ecosystem_data['application_categories']['business_domains']
        # Filter out empty domains
        domain_data = {k: v for k, v in domain_data.items() if k and v > 0}
        fig.add_trace(go.Pie(
            labels=list(domain_data.keys()),
            values=list(domain_data.values()),
            name="Business Domain"
        ), row=1, col=2)
        
        # App type distribution
        type_data = self.ecosystem_data['application_categories']['app_types']
        fig.add_trace(go.Pie(
            labels=list(type_data.keys()),
            values=list(type_data.values()),
            name="App Type"
        ), row=2, col=1)
        
        # SDK Adherence histogram
        adherence_stats = self.ecosystem_data['base44_integration']['sdk_adherence_distribution']
        sdk_scores = self.summary_df['sdk_adherence_score'].dropna()
        fig.add_trace(go.Histogram(
            x=sdk_scores,
            nbinsx=20,
            name="SDK Adherence",
            marker_color='lightblue'
        ), row=2, col=2)
        
        fig.update_layout(
            title_text="Base44 Ecosystem Overview Dashboard",
            showlegend=True,
            height=800
        )
        
        return fig
    
    def create_complexity_scatter_plot(self):
        """Create scatter plot of complexity vs other metrics"""
        fig = px.scatter(
            self.summary_df,
            x='overall_complexity_score',
            y='technical_sophistication',
            size='total_dependencies',
            color='business_domain',
            hover_data=['app_name', 'sdk_adherence_score', 'page_count'],
            title="Application Complexity vs Technical Sophistication",
            labels={
                'overall_complexity_score': 'Overall Complexity Score',
                'technical_sophistication': 'Technical Sophistication',
                'total_dependencies': 'Number of Dependencies'
            }
        )
        
        fig.update_layout(height=600, showlegend=True)
        return fig
    
    def create_taxonomy_treemap(self):
        """Create treemap visualization of application taxonomy"""
        # Prepare data for treemap
        taxonomy_counts = self.taxonomy_df.groupby(['final_category', 'business_domain']).size().reset_index(name='count')
        taxonomy_counts = taxonomy_counts[taxonomy_counts['business_domain'] != '']
        
        fig = px.treemap(
            taxonomy_counts,
            path=['final_category', 'business_domain'],
            values='count',
            title="Base44 Application Taxonomy Treemap",
            color='count',
            color_continuous_scale='Viridis'
        )
        
        fig.update_layout(height=600)
        return fig
    
    def create_feature_analysis_chart(self):
        """Create feature analysis visualization"""
        # Calculate feature prevalence using available columns
        feature_data = []
        
        # Add TypeScript adoption
        if 'uses_typescript' in self.summary_df.columns:
            ts_prevalence = self.summary_df['uses_typescript'].mean() * 100
            feature_data.append({'feature': 'TypeScript', 'prevalence': ts_prevalence})
        
        # Add metrics as features
        metrics_features = {
            'High Complexity (>0.7)': (self.summary_df['overall_complexity_score'] > 0.7).mean() * 100,
            'High Tech Sophistication (>0.7)': (self.summary_df['technical_sophistication'] > 0.7).mean() * 100,
            'Perfect SDK Adherence': (self.summary_df['sdk_adherence_score'] == 1.0).mean() * 100,
            'Multiple Pages (>5)': (self.summary_df['page_count'] > 5).mean() * 100,
            'High Dependencies (>50)': (self.summary_df['total_dependencies'] > 50).mean() * 100
        }
        
        for feature, prevalence in metrics_features.items():
            feature_data.append({'feature': feature, 'prevalence': prevalence})
        
        feature_df = pd.DataFrame(feature_data).sort_values('prevalence', ascending=True)
        
        fig = px.bar(
            feature_df,
            x='prevalence',
            y='feature',
            orientation='h',
            title="Feature Prevalence Across Base44 Applications",
            labels={'prevalence': 'Prevalence (%)', 'feature': 'Feature'},
            color='prevalence',
            color_continuous_scale='Blues'
        )
        
        fig.update_layout(height=600, showlegend=False)
        return fig
    
    def create_topic_distribution_chart(self):
        """Create topic distribution from LDA analysis"""
        # Get topic distribution data
        topic_counts = self.taxonomy_df.groupby('lda_topic').size()
        confidence_by_topic = self.taxonomy_df.groupby('lda_topic')['lda_confidence'].mean()
        
        fig = make_subplots(
            rows=1, cols=2,
            subplot_titles=('Topic Distribution', 'Average Confidence by Topic'),
            specs=[[{'type': 'domain'}, {'type': 'xy'}]]
        )
        
        # Topic distribution pie chart
        fig.add_trace(go.Pie(
            labels=[f"Topic {i}" for i in topic_counts.index],
            values=topic_counts.values,
            name="Topic Distribution"
        ), row=1, col=1)
        
        # Confidence by topic bar chart
        fig.add_trace(go.Bar(
            x=[f"Topic {i}" for i in confidence_by_topic.index],
            y=confidence_by_topic.values,
            name="Average Confidence",
            marker_color='lightcoral'
        ), row=1, col=2)
        
        fig.update_layout(
            title_text="LDA Topic Modeling Results",
            showlegend=False,
            height=500
        )
        
        return fig
    
    def create_correlation_heatmap(self):
        """Create correlation heatmap of key metrics"""
        # Select numeric columns for correlation using actual column names
        numeric_cols = [
            'overall_complexity_score', 'technical_sophistication', 'sdk_adherence_score',
            'total_dependencies', 'page_count', 'jsx_elements', 'category_confidence'
        ]
        
        # Filter columns that exist in the dataset
        available_cols = [col for col in numeric_cols if col in self.summary_df.columns]
        correlation_data = self.summary_df[available_cols].corr()
        
        fig = px.imshow(
            correlation_data,
            title="Correlation Matrix of Key Metrics",
            color_continuous_scale='RdBu',
            aspect="auto"
        )
        
        fig.update_layout(height=600)
        return fig
    
    def generate_summary_stats(self):
        """Generate comprehensive summary statistics"""
        stats = {
            "ecosystem_overview": self.ecosystem_data["ecosystem_overview"],
            "key_metrics": {
                "average_complexity": round(self.ecosystem_data["complexity_analysis"]["average_overall_complexity"], 3),
                "typescript_adoption": f"{self.ecosystem_data['technology_analysis']['typescript_adoption_rate'] * 100:.1f}%",
                "average_dependencies": round(self.ecosystem_data["technology_analysis"]["average_dependencies"]),
                "sdk_integration_level": round(self.ecosystem_data["base44_integration"]["average_integration_level"], 3)
            },
            "top_categories": dict(list(self.ecosystem_data["application_categories"]["business_domains"].items())[:5]),
            "quality_insights": {
                "high_quality_apps": len(self.summary_df[self.summary_df['overall_complexity_score'] > 0.7]),
                "fully_integrated_apps": len(self.summary_df[self.summary_df['sdk_adherence_score'] == 1.0]),
                "typescript_apps": len(self.summary_df[self.summary_df['uses_typescript'] == True])
            }
        }
        
        return stats
    
    def save_all_visualizations(self, output_dir: Path):
        """Generate and save all visualizations"""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        print("Generating comprehensive visualization dashboard...")
        
        # Create all charts
        charts = {
            "ecosystem_overview": self.create_complexity_distribution_chart(),
            "complexity_scatter": self.create_complexity_scatter_plot(),
            "taxonomy_treemap": self.create_taxonomy_treemap(),
            "feature_analysis": self.create_feature_analysis_chart(),
            "topic_distribution": self.create_topic_distribution_chart(),
            "correlation_heatmap": self.create_correlation_heatmap()
        }
        
        # Save each chart as HTML
        for name, chart in charts.items():
            chart.write_html(output_dir / f"{name}.html")
            print(f"  Saved {name}.html")
        
        # Create combined dashboard
        self.create_combined_dashboard(output_dir)
        
        # Generate summary report
        stats = self.generate_summary_stats()
        with open(output_dir / "dashboard_summary.json", 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"Dashboard completed! All visualizations saved to {output_dir}")
        return stats
    
    def create_combined_dashboard(self, output_dir: Path):
        """Create a combined HTML dashboard"""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Base44 Ecosystem Analysis Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .chart-container { margin: 20px 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
                .stat-box { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 2em; font-weight: bold; color: #007acc; }
                .iframe-container { width: 100%; height: 600px; margin: 20px 0; }
                iframe { width: 100%; height: 100%; border: none; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Base44 No-Code AI Ecosystem Analysis</h1>
                <h2>Comprehensive Dashboard</h2>
                <p>Analysis of 59 Base44 applications with machine learning taxonomy and quality metrics</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value">59</div>
                    <div>Total Applications</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">98.3%</div>
                    <div>TypeScript Adoption</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">63</div>
                    <div>Avg Dependencies</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">3</div>
                    <div>Main Categories</div>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Ecosystem Overview</h3>
                <div class="iframe-container">
                    <iframe src="ecosystem_overview.html"></iframe>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Application Taxonomy</h3>
                <div class="iframe-container">
                    <iframe src="taxonomy_treemap.html"></iframe>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Complexity vs Sophistication</h3>
                <div class="iframe-container">
                    <iframe src="complexity_scatter.html"></iframe>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Feature Analysis</h3>
                <div class="iframe-container">
                    <iframe src="feature_analysis.html"></iframe>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Topic Modeling Results</h3>
                <div class="iframe-container">
                    <iframe src="topic_distribution.html"></iframe>
                </div>
            </div>
            
            <div class="chart-container">
                <h3>Metrics Correlation</h3>
                <div class="iframe-container">
                    <iframe src="correlation_heatmap.html"></iframe>
                </div>
            </div>
        </body>
        </html>
        """
        
        with open(output_dir / "index.html", 'w') as f:
            f.write(html_template)
        
        print("  Created combined dashboard: index.html")

def main():
    """Main function to generate the complete dashboard"""
    data_dir = Path("data/processed")
    output_dir = Path("visualizations")
    
    dashboard = VisualizationDashboard(data_dir)
    stats = dashboard.save_all_visualizations(output_dir)
    
    print("\n" + "="*60)
    print("DASHBOARD SUMMARY")
    print("="*60)
    print(f"Total Applications Analyzed: {stats['ecosystem_overview']['total_applications']}")
    print(f"Processing Time: {stats['ecosystem_overview']['processing_time_seconds']:.1f}s")
    print(f"Average Complexity Score: {stats['key_metrics']['average_complexity']}")
    print(f"TypeScript Adoption: {stats['key_metrics']['typescript_adoption']}")
    print(f"Average Dependencies: {stats['key_metrics']['average_dependencies']}")
    print(f"High Quality Apps: {stats['quality_insights']['high_quality_apps']}")
    print("\nOpen 'visualizations/index.html' to view the interactive dashboard!")

if __name__ == "__main__":
    main()