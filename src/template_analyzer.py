"""
Base44 Template Analyzer
Simplified NLP analysis focused on Base44 app templates
"""

import pandas as pd
import numpy as np
import json
import logging
from typing import List, Dict, Optional
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.cluster import KMeans
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Base44TemplateAnalyzer:
    """Simplified analyzer for Base44 app templates"""
    
    def __init__(self):
        self.templates_df: Optional[pd.DataFrame] = None
        self.analysis_results: Dict = {}
        
    def load_templates(self, csv_file: str = 'data/raw/base44_templates.csv') -> pd.DataFrame:
        """Load Base44 templates data"""
        try:
            self.templates_df = pd.read_csv(csv_file)
            logger.info(f"Loaded {len(self.templates_df)} templates for analysis")
            return self.templates_df
        except FileNotFoundError:
            logger.error(f"File {csv_file} not found")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return pd.DataFrame()
            
    def analyze_template_categories(self) -> Dict:
        """Analyze distribution of template categories"""
        if self.templates_df is None or self.templates_df.empty:
            return {}
            
        logger.info("Analyzing template categories...")
        
        category_stats = {
            'distribution': self.templates_df['category'].value_counts().to_dict(),
            'total_categories': self.templates_df['category'].nunique(),
            'most_common': self.templates_df['category'].mode().iloc[0] if not self.templates_df['category'].empty else None
        }
        
        return category_stats
        
    def analyze_industries(self) -> Dict:
        """Analyze industry distribution"""
        if self.templates_df is None or self.templates_df.empty:
            return {}
            
        logger.info("Analyzing industry distribution...")
        
        industry_stats = {
            'distribution': self.templates_df['industry'].value_counts().to_dict(),
            'total_industries': self.templates_df['industry'].nunique(),
            'most_common': self.templates_df['industry'].mode().iloc[0] if not self.templates_df['industry'].empty else None
        }
        
        return industry_stats
        
    def analyze_features(self) -> Dict:
        """Analyze feature usage across templates"""
        if self.templates_df is None or self.templates_df.empty:
            return {}
            
        logger.info("Analyzing template features...")
        
        # Extract all features
        all_features = []
        for features_str in self.templates_df['features']:
            if pd.notna(features_str):
                if isinstance(features_str, str):
                    features = [f.strip() for f in features_str.split(',')]
                    all_features.extend(features)
                elif isinstance(features_str, list):
                    all_features.extend(features_str)
        
        feature_counts = Counter(all_features)
        
        feature_stats = {
            'most_common_features': dict(feature_counts.most_common(10)),
            'total_unique_features': len(feature_counts),
            'average_features_per_template': len(all_features) / len(self.templates_df) if len(self.templates_df) > 0 else 0,
            'feature_distribution': dict(feature_counts)
        }
        
        return feature_stats
        
    def calculate_complexity_scores(self) -> pd.DataFrame:
        """Calculate complexity scores for templates"""
        if self.templates_df is None or self.templates_df.empty:
            return pd.DataFrame()
            
        logger.info("Calculating template complexity scores...")
        
        df = self.templates_df.copy()
        
        # Feature count score (0-10 scale)
        df['feature_count'] = df['features'].apply(lambda x: len(x.split(',')) if pd.notna(x) and isinstance(x, str) else 0)
        df['feature_score'] = np.clip(df['feature_count'] * 2, 0, 10)
        
        # Description length score (0-10 scale)
        df['description_length'] = df['description'].str.len().fillna(0)
        df['description_score'] = np.clip(df['description_length'] / 50, 0, 10)
        
        # Category complexity weight
        category_weights = {
            'Business Management': 8,
            'E-commerce': 9,
            'Analytics': 7,
            'Human Resources': 6,
            'Finance': 8,
            'Operations': 7,
            'Education': 5,
            'Productivity': 6,
            'Events': 5,
            'General': 4
        }
        df['category_score'] = df['category'].map(category_weights).fillna(4)
        
        # Overall complexity score (weighted average)
        df['complexity_score'] = (
            df['feature_score'] * 0.4 +
            df['description_score'] * 0.2 +
            df['category_score'] * 0.4
        ).round(2)
        
        return df[['name', 'category', 'feature_count', 'complexity_score']]
        
    def extract_key_topics(self, n_topics: int = 5) -> Dict:
        """Extract key topics from template descriptions using LDA"""
        if self.templates_df is None or self.templates_df.empty:
            return {}
            
        logger.info("Extracting key topics from template descriptions...")
        
        # Prepare text data
        descriptions = self.templates_df['description'].fillna('').tolist()
        
        if not any(descriptions):
            return {}
        
        # Vectorize text
        vectorizer = TfidfVectorizer(
            max_features=50,
            stop_words='english',
            min_df=1,
            max_df=0.8,
            ngram_range=(1, 2)
        )
        
        try:
            doc_term_matrix = vectorizer.fit_transform(descriptions)
            
            # Apply LDA
            lda = LatentDirichletAllocation(
                n_components=n_topics,
                random_state=42,
                max_iter=100
            )
            lda.fit(doc_term_matrix)
            
            # Extract topics
            feature_names = vectorizer.get_feature_names_out()
            topics = {}
            
            for topic_idx, topic in enumerate(lda.components_):
                top_words = [feature_names[i] for i in topic.argsort()[-10:][::-1]]
                topics[f"Topic_{topic_idx + 1}"] = top_words
                
            return {
                'topics': topics,
                'n_topics': n_topics,
                'top_features': list(feature_names[:20])
            }
            
        except Exception as e:
            logger.error(f"Error in topic extraction: {e}")
            return {}
            
    def generate_insights(self) -> Dict:
        """Generate comprehensive insights about Base44 templates"""
        if self.templates_df is None or self.templates_df.empty:
            return {}
            
        logger.info("Generating template insights...")
        
        insights = {
            'overview': {
                'total_templates': len(self.templates_df),
                'analysis_date': datetime.now().isoformat()
            },
            'categories': self.analyze_template_categories(),
            'industries': self.analyze_industries(),
            'features': self.analyze_features(),
            'complexity': self.calculate_complexity_scores().to_dict('records'),
            'topics': self.extract_key_topics()
        }
        
        self.analysis_results = insights
        return insights
        
    def save_insights(self, filename: str = 'data/processed/template_analysis.json'):
        """Save analysis insights to JSON file"""
        if not self.analysis_results:
            logger.warning("No analysis results to save")
            return
            
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_results, f, indent=2, ensure_ascii=False, default=str)
            
        logger.info(f"Saved template analysis insights to {filename}")
        
    def generate_summary_report(self) -> str:
        """Generate a text summary of the analysis"""
        if not self.analysis_results:
            return "No analysis results available"
            
        insights = self.analysis_results
        
        report_lines = [
            "# Base44 Template Analysis Summary",
            "",
            f"**Total Templates Analyzed:** {insights['overview']['total_templates']}",
            f"**Analysis Date:** {insights['overview']['analysis_date'][:10]}",
            "",
            "## Category Distribution",
        ]
        
        if 'categories' in insights and 'distribution' in insights['categories']:
            for category, count in insights['categories']['distribution'].items():
                report_lines.append(f"- {category}: {count} templates")
                
        report_lines.extend([
            "",
            "## Industry Focus",
        ])
        
        if 'industries' in insights and 'distribution' in insights['industries']:
            for industry, count in insights['industries']['distribution'].items():
                report_lines.append(f"- {industry}: {count} templates")
                
        report_lines.extend([
            "",
            "## Most Common Features",
        ])
        
        if 'features' in insights and 'most_common_features' in insights['features']:
            for feature, count in list(insights['features']['most_common_features'].items())[:5]:
                report_lines.append(f"- {feature}: {count} templates")
                
        if 'topics' in insights and 'topics' in insights['topics']:
            report_lines.extend([
                "",
                "## Key Topics",
            ])
            for topic_name, words in insights['topics']['topics'].items():
                report_lines.append(f"- {topic_name}: {', '.join(words[:5])}")
                
        return "\n".join(report_lines)
        
    def run_full_analysis(self) -> Dict:
        """Run complete template analysis pipeline"""
        logger.info("Starting full Base44 template analysis...")
        
        # Load data
        if self.templates_df is None:
            self.load_templates()
            
        if self.templates_df is None or self.templates_df.empty:
            logger.error("No template data available for analysis")
            return {}
            
        # Generate insights
        insights = self.generate_insights()
        
        # Save results
        self.save_insights()
        
        # Generate and save summary report
        summary = self.generate_summary_report()
        with open('data/processed/template_analysis_summary.md', 'w', encoding='utf-8') as f:
            f.write(summary)
            
        logger.info("Template analysis completed successfully")
        return insights

if __name__ == "__main__":
    analyzer = Base44TemplateAnalyzer()
    results = analyzer.run_full_analysis()
    print("Analysis completed. Check data/processed/ for results.")