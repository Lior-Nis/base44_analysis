"""
Base44 Application Analyzer
Advanced classification and analysis of Base44 applications
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import re
from textblob import TextBlob
from collections import Counter
import json
import logging
from dataclasses import dataclass
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AppAnalysis:
    """Data class for application analysis results"""
    name: str
    complexity_score: float
    purpose_category: str
    industry_category: str
    user_type: str
    feature_count: int
    description_sentiment: float
    market_fit_score: float
    innovation_score: float

class Base44AppAnalyzer:
    """Advanced analyzer for Base44 applications"""
    
    def __init__(self):
        self.apps_df: Optional[pd.DataFrame] = None
        self.analysis_results: List[AppAnalysis] = []
        
        # Classification dictionaries
        self.purpose_keywords = {
            'MVP': ['mvp', 'minimum viable product', 'prototype', 'proof of concept', 'poc', 'early stage', 'initial version'],
            'Internal Tool': ['internal', 'admin', 'dashboard', 'management', 'employee', 'staff', 'backend', 'operations'],
            'Customer Portal': ['customer', 'client', 'portal', 'frontend', 'user interface', 'self-service', 'customer facing'],
            'SaaS Replacement': ['replace', 'alternative', 'instead of', 'substitute', 'migration', 'switch from', 'better than'],
            'Educational': ['learn', 'tutorial', 'course', 'training', 'education', 'teaching', 'student', 'academic'],
            'Personal Project': ['personal', 'hobby', 'side project', 'for fun', 'experiment', 'learning', 'practice']
        }
        
        self.industry_keywords = {
            'Tech': ['tech', 'software', 'api', 'developer', 'coding', 'programming', 'saas', 'platform', 'app development'],
            'E-commerce': ['shop', 'store', 'ecommerce', 'retail', 'sales', 'product', 'inventory', 'order', 'checkout'],
            'Education': ['school', 'education', 'learn', 'student', 'teacher', 'course', 'curriculum', 'academic'],
            'Healthcare': ['health', 'medical', 'hospital', 'clinic', 'patient', 'doctor', 'healthcare', 'wellness'],
            'Finance': ['finance', 'bank', 'money', 'payment', 'invoice', 'accounting', 'budget', 'financial'],
            'Marketing': ['marketing', 'ads', 'campaign', 'social media', 'seo', 'analytics', 'lead', 'conversion'],
            'Real Estate': ['real estate', 'property', 'listing', 'rental', 'lease', 'broker', 'apartment'],
            'Food & Beverage': ['restaurant', 'food', 'menu', 'ordering', 'delivery', 'cafe', 'kitchen'],
            'Manufacturing': ['manufacturing', 'production', 'supply chain', 'inventory', 'warehouse', 'logistics'],
            'Non-profit': ['non-profit', 'charity', 'volunteer', 'donation', 'community', 'social cause']
        }
        
        self.user_type_indicators = {
            'Solo Entrepreneur': ['solo', 'founder', 'startup', 'entrepreneur', 'one person', 'indie', 'freelancer'],
            'Small Business': ['small business', 'local', 'team', 'company', 'business owner', 'sme'],
            'Enterprise': ['enterprise', 'corporation', 'large company', 'organization', 'department', 'corporate'],
            'Student/Learner': ['student', 'learning', 'school project', 'university', 'college', 'academic']
        }
        
        self.complexity_features = {
            'authentication': 2,
            'database': 3,
            'api': 4,
            'dashboard': 3,
            'payments': 5,
            'email': 2,
            'file_upload': 2,
            'search': 3,
            'analytics': 4,
            'workflow': 4,
            'integration': 5,
            'multi_user': 3,
            'permissions': 4,
            'reporting': 3,
            'mobile': 3,
            'real_time': 5
        }
        
    def load_data(self, csv_file: str = 'data/raw/base44_apps.csv') -> pd.DataFrame:
        """Load Base44 apps data from CSV"""
        try:
            self.apps_df = pd.read_csv(csv_file)
            logger.info(f"Loaded {len(self.apps_df)} applications from {csv_file}")
            return self.apps_df
        except FileNotFoundError:
            logger.error(f"File {csv_file} not found")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return pd.DataFrame()
            
    def classify_purpose(self, description: str) -> str:
        """Classify application purpose based on description"""
        description_lower = description.lower()
        scores = {}
        
        for purpose, keywords in self.purpose_keywords.items():
            score = sum(1 for keyword in keywords if keyword in description_lower)
            if score > 0:
                scores[purpose] = score
                
        if scores:
            return max(scores, key=scores.get)
        return 'Personal Project'  # Default category
        
    def classify_industry(self, description: str) -> str:
        """Classify application industry based on description"""
        description_lower = description.lower()
        scores = {}
        
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in description_lower)
            if score > 0:
                scores[industry] = score
                
        if scores:
            return max(scores, key=scores.get)
        return 'Other'  # Default category
        
    def classify_user_type(self, description: str, creator: str = '') -> str:
        """Classify user type based on description and creator information"""
        text = (description + ' ' + creator).lower()
        scores = {}
        
        for user_type, keywords in self.user_type_indicators.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                scores[user_type] = score
                
        if scores:
            return max(scores, key=scores.get)
        return 'Solo Entrepreneur'  # Default category
        
    def calculate_complexity_score(self, features: str, description: str) -> float:
        """Calculate complexity score based on features and description"""
        if pd.isna(features):
            features = ''
        if pd.isna(description):
            description = ''
            
        feature_list = [f.strip() for f in features.split(',') if f.strip()]
        description_lower = description.lower()
        
        complexity_score = 0
        
        # Score based on explicitly mentioned features
        for feature in feature_list:
            if feature in self.complexity_features:
                complexity_score += self.complexity_features[feature]
                
        # Score based on description analysis
        complexity_indicators = {
            'multi': 2, 'complex': 3, 'advanced': 3, 'enterprise': 4,
            'workflow': 3, 'automation': 4, 'integration': 4,
            'real-time': 4, 'machine learning': 5, 'ai': 4
        }
        
        for indicator, score in complexity_indicators.items():
            if indicator in description_lower:
                complexity_score += score
                
        # Normalize score (0-10 scale)
        max_possible_score = 50  # Reasonable maximum
        normalized_score = min(complexity_score / max_possible_score * 10, 10)
        
        return round(normalized_score, 2)
        
    def analyze_sentiment(self, description: str) -> float:
        """Analyze sentiment of app description"""
        if pd.isna(description) or not description.strip():
            return 0.0
            
        blob = TextBlob(description)
        return round(blob.sentiment.polarity, 3)
        
    def calculate_market_fit_score(self, purpose: str, industry: str, features: str) -> float:
        """Calculate market fit score based on purpose, industry, and features"""
        score = 5.0  # Base score
        
        # Purpose-based scoring
        purpose_scores = {
            'SaaS Replacement': 8.0,
            'Internal Tool': 7.0,
            'Customer Portal': 7.5,
            'MVP': 6.0,
            'Educational': 5.0,
            'Personal Project': 4.0
        }
        score = purpose_scores.get(purpose, 5.0)
        
        # Industry demand multiplier
        high_demand_industries = ['Tech', 'E-commerce', 'Finance', 'Healthcare']
        if industry in high_demand_industries:
            score *= 1.2
            
        # Feature richness bonus
        if isinstance(features, str):
            feature_count = len([f for f in features.split(',') if f.strip()])
            if feature_count >= 5:
                score *= 1.1
                
        return min(round(score, 2), 10.0)
        
    def calculate_innovation_score(self, description: str, features: str) -> float:
        """Calculate innovation score based on unique features and approach"""
        if pd.isna(description):
            description = ''
        if pd.isna(features):
            features = ''
            
        text = (description + ' ' + features).lower()
        
        innovation_keywords = {
            'ai': 3, 'machine learning': 3, 'automation': 2,
            'real-time': 2, 'innovative': 2, 'unique': 2,
            'novel': 3, 'revolutionary': 3, 'breakthrough': 3,
            'cutting-edge': 2, 'advanced': 1, 'smart': 1
        }
        
        score = 5.0  # Base score
        for keyword, points in innovation_keywords.items():
            if keyword in text:
                score += points
                
        return min(round(score, 2), 10.0)
        
    def perform_clustering_analysis(self) -> Dict[str, any]:
        """Perform clustering analysis on applications"""
        if self.apps_df is None or self.apps_df.empty:
            logger.error("No data loaded for clustering analysis")
            return {}
            
        # Prepare text data for clustering
        descriptions = self.apps_df['description'].fillna('').tolist()
        
        # TF-IDF vectorization
        vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(descriptions)
        
        # K-means clustering
        n_clusters = min(5, len(descriptions))  # Adjust based on data size
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(tfidf_matrix)
        
        # Add cluster labels to dataframe
        self.apps_df['cluster'] = clusters
        
        # Analyze clusters
        cluster_analysis = {}
        for i in range(n_clusters):
            cluster_apps = self.apps_df[self.apps_df['cluster'] == i]
            cluster_analysis[f'cluster_{i}'] = {
                'size': len(cluster_apps),
                'top_keywords': self._get_cluster_keywords(cluster_apps, vectorizer, kmeans, i),
                'common_purpose': cluster_apps['category'].mode().iloc[0] if not cluster_apps['category'].mode().empty else 'Unknown',
                'avg_complexity': cluster_apps['features'].apply(lambda x: len(str(x).split(',')) if pd.notna(x) else 0).mean()
            }
            
        return cluster_analysis
        
    def _get_cluster_keywords(self, cluster_apps: pd.DataFrame, vectorizer, kmeans, cluster_id: int) -> List[str]:
        """Get top keywords for a cluster"""
        feature_names = vectorizer.get_feature_names_out()
        cluster_center = kmeans.cluster_centers_[cluster_id]
        top_indices = cluster_center.argsort()[-10:][::-1]
        return [feature_names[i] for i in top_indices]
        
    def analyze_all_apps(self) -> List[AppAnalysis]:
        """Perform comprehensive analysis on all applications"""
        if self.apps_df is None or self.apps_df.empty:
            logger.error("No data loaded for analysis")
            return []
            
        logger.info("Starting comprehensive application analysis...")
        
        self.analysis_results = []
        
        for idx, row in self.apps_df.iterrows():
            # Enhanced classifications
            purpose = self.classify_purpose(row.get('description', ''))
            industry = self.classify_industry(row.get('description', ''))
            user_type = self.classify_user_type(row.get('description', ''), row.get('creator', ''))
            
            # Calculate metrics
            complexity_score = self.calculate_complexity_score(
                row.get('features', ''), row.get('description', '')
            )
            sentiment = self.analyze_sentiment(row.get('description', ''))
            market_fit_score = self.calculate_market_fit_score(
                purpose, industry, row.get('features', '')
            )
            innovation_score = self.calculate_innovation_score(
                row.get('description', ''), row.get('features', '')
            )
            
            # Count features
            features_str = row.get('features', '')
            feature_count = len([f for f in str(features_str).split(',') if f.strip()]) if pd.notna(features_str) else 0
            
            analysis = AppAnalysis(
                name=row.get('name', 'Unknown'),
                complexity_score=complexity_score,
                purpose_category=purpose,
                industry_category=industry,
                user_type=user_type,
                feature_count=feature_count,
                description_sentiment=sentiment,
                market_fit_score=market_fit_score,
                innovation_score=innovation_score
            )
            
            self.analysis_results.append(analysis)
            
        logger.info(f"Completed analysis for {len(self.analysis_results)} applications")
        return self.analysis_results
        
    def generate_summary_statistics(self) -> Dict[str, any]:
        """Generate summary statistics for the analysis"""
        if not self.analysis_results:
            return {}
            
        df = pd.DataFrame([result.__dict__ for result in self.analysis_results])
        
        summary = {
            'total_apps': len(self.analysis_results),
            'purpose_distribution': df['purpose_category'].value_counts().to_dict(),
            'industry_distribution': df['industry_category'].value_counts().to_dict(),
            'user_type_distribution': df['user_type'].value_counts().to_dict(),
            'complexity_stats': {
                'mean': df['complexity_score'].mean(),
                'median': df['complexity_score'].median(),
                'std': df['complexity_score'].std(),
                'min': df['complexity_score'].min(),
                'max': df['complexity_score'].max()
            },
            'feature_stats': {
                'mean': df['feature_count'].mean(),
                'median': df['feature_count'].median(),
                'max': df['feature_count'].max()
            },
            'sentiment_stats': {
                'mean': df['description_sentiment'].mean(),
                'positive_ratio': (df['description_sentiment'] > 0).sum() / len(df),
                'negative_ratio': (df['description_sentiment'] < 0).sum() / len(df)
            },
            'market_fit_stats': {
                'mean': df['market_fit_score'].mean(),
                'high_fit_ratio': (df['market_fit_score'] >= 7).sum() / len(df)
            },
            'innovation_stats': {
                'mean': df['innovation_score'].mean(),
                'high_innovation_ratio': (df['innovation_score'] >= 7).sum() / len(df)
            }
        }
        
        return summary
        
    def save_analysis_results(self, filename: str = 'data/processed/app_analysis.csv'):
        """Save analysis results to CSV"""
        if not self.analysis_results:
            logger.warning("No analysis results to save")
            return
            
        df = pd.DataFrame([result.__dict__ for result in self.analysis_results])
        df.to_csv(filename, index=False)
        logger.info(f"Saved analysis results to {filename}")
        
    def save_summary_stats(self, filename: str = 'data/processed/summary_statistics.json'):
        """Save summary statistics to JSON"""
        summary = self.generate_summary_statistics()
        if not summary:
            logger.warning("No summary statistics to save")
            return
            
        # Convert numpy types to Python types for JSON serialization
        def convert_numpy(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
            
        # Recursively convert numpy types
        def clean_for_json(data):
            if isinstance(data, dict):
                return {k: clean_for_json(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [clean_for_json(v) for v in data]
            else:
                return convert_numpy(data)
                
        clean_summary = clean_for_json(summary)
        
        with open(filename, 'w') as f:
            json.dump(clean_summary, f, indent=2)
        logger.info(f"Saved summary statistics to {filename}")

if __name__ == "__main__":
    analyzer = Base44AppAnalyzer()
    
    # Load data
    apps_df = analyzer.load_data()
    
    if not apps_df.empty:
        # Perform analysis
        results = analyzer.analyze_all_apps()
        
        # Generate and save results
        analyzer.save_analysis_results()
        analyzer.save_summary_stats()
        
        # Print summary
        summary = analyzer.generate_summary_statistics()
        print(f"Analysis completed for {summary.get('total_apps', 0)} applications")
        print(f"Purpose distribution: {summary.get('purpose_distribution', {})}")
        print(f"Industry distribution: {summary.get('industry_distribution', {})}")
    else:
        print("No data available for analysis")