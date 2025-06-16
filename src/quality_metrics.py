"""
Base44 Application Quality Metrics
Comprehensive quality evaluation system for Base44 applications
"""

import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
from typing import Dict, List, Optional, Tuple
import time
import logging
from dataclasses import dataclass
import json
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QualityMetrics:
    """Data class for application quality metrics"""
    app_name: str
    completeness_score: float
    professional_score: float
    adoption_score: float
    replacement_success_score: float
    time_to_market_score: float
    longevity_score: float
    overall_quality_score: float
    evaluation_date: str

class Base44QualityEvaluator:
    """Comprehensive quality evaluator for Base44 applications"""
    
    def __init__(self, rate_limit: float = 1.0):
        self.rate_limit = rate_limit
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.quality_results: List[QualityMetrics] = []
        
    def _rate_limit_sleep(self):
        """Sleep to respect rate limits"""
        time.sleep(self.rate_limit)
        
    def _make_request(self, url: str) -> Optional[requests.Response]:
        """Make HTTP request with error handling"""
        try:
            self._rate_limit_sleep()
            response = self.session.get(url, timeout=10)
            return response
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
            
    def evaluate_completeness_score(self, app_data: Dict) -> float:
        """
        Evaluate how complete the application is relative to its stated purpose
        Score: 0-10 (10 being fully complete)
        """
        description = app_data.get('description', '')
        features = app_data.get('features', '')
        purpose = app_data.get('category', '')
        
        if not description:
            return 0.0
            
        # Base score from feature count
        feature_list = [f.strip() for f in str(features).split(',') if f.strip()] if features else []
        feature_score = min(len(feature_list) * 1.5, 6.0)  # Max 6 points from features
        
        # Purpose-specific completeness requirements
        purpose_requirements = {
            'MVP': ['authentication', 'database', 'basic_ui'],
            'Internal Tool': ['dashboard', 'data_management', 'user_permissions'],
            'Customer Portal': ['authentication', 'user_interface', 'data_access'],
            'SaaS Replacement': ['core_functionality', 'integration', 'scalability'],
            'Educational': ['content_management', 'user_tracking', 'interactive_elements'],
            'Personal Project': ['basic_functionality', 'user_interface']
        }
        
        requirements = purpose_requirements.get(purpose, ['basic_functionality'])
        
        # Check if key requirements are mentioned
        description_lower = (description + ' ' + str(features)).lower()
        requirement_score = 0
        for req in requirements:
            req_keywords = {
                'authentication': ['auth', 'login', 'user', 'account', 'signin'],
                'database': ['database', 'data', 'storage', 'crud', 'records'],
                'basic_ui': ['interface', 'ui', 'frontend', 'design', 'layout'],
                'dashboard': ['dashboard', 'admin', 'overview', 'summary'],
                'data_management': ['manage', 'edit', 'update', 'create', 'delete'],
                'user_permissions': ['permission', 'role', 'access', 'rights'],
                'user_interface': ['interface', 'ui', 'user experience', 'frontend'],
                'data_access': ['access', 'view', 'retrieve', 'query'],
                'core_functionality': ['function', 'feature', 'capability', 'tool'],
                'integration': ['api', 'integration', 'connect', 'sync'],
                'scalability': ['scale', 'performance', 'load', 'capacity'],
                'content_management': ['content', 'manage', 'cms', 'publish'],
                'user_tracking': ['track', 'progress', 'analytics', 'monitoring'],
                'interactive_elements': ['interactive', 'input', 'form', 'button'],
                'basic_functionality': ['work', 'function', 'feature', 'capability']
            }
            
            keywords = req_keywords.get(req, [req])
            if any(keyword in description_lower for keyword in keywords):
                requirement_score += 4.0 / len(requirements)  # Max 4 points from requirements
                
        total_score = feature_score + requirement_score
        return min(round(total_score, 2), 10.0)
        
    def evaluate_professional_score(self, app_data: Dict) -> float:
        """
        Evaluate professional quality (UI polish, branding, custom domain)
        Score: 0-10 (10 being highly professional)
        """
        url = app_data.get('url', '')
        description = app_data.get('description', '')
        
        if not url:
            return 0.0
            
        score = 0.0
        
        # Domain analysis
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        
        if 'base44.app' in domain:
            score += 3.0  # Base44 subdomain
        elif any(tld in domain for tld in ['.com', '.io', '.co', '.net']):
            score += 6.0  # Custom domain
            
        # Professional indicators in description
        professional_keywords = [
            'professional', 'business', 'enterprise', 'commercial',
            'production', 'live', 'deployed', 'custom design',
            'branded', 'polished', 'user-friendly', 'responsive'
        ]
        
        description_lower = description.lower()
        keyword_matches = sum(1 for keyword in professional_keywords if keyword in description_lower)
        score += min(keyword_matches * 0.5, 2.0)  # Max 2 points from keywords
        
        # Try to check actual website (if accessible)
        if url and url.startswith('http'):
            response = self._make_request(url)
            if response and response.status_code == 200:
                score += 1.0  # Site is accessible
                
                try:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Check for professional elements
                    if soup.find('title'):
                        score += 0.5
                    if soup.find('meta', {'name': 'description'}):
                        score += 0.5
                    if soup.find('link', {'rel': 'icon'}):
                        score += 0.5
                    if soup.find('nav') or soup.find('header'):
                        score += 0.5
                        
                except Exception as e:
                    logger.debug(f"Error parsing HTML for {url}: {e}")
                    
        return min(round(score, 2), 10.0)
        
    def evaluate_adoption_score(self, app_data: Dict) -> float:
        """
        Evaluate adoption indicators (mentions, testimonials, social shares)
        Score: 0-10 (10 being high adoption)
        """
        description = app_data.get('description', '')
        testimonials = app_data.get('testimonials', '')
        source = app_data.get('source', '')
        
        score = 0.0
        
        # Source-based scoring
        source_scores = {
            'product_hunt': 4.0,
            'twitter_mention': 3.0,
            'web_search': 2.0,
            'base44_showcase': 5.0
        }
        
        score += source_scores.get(source, 1.0)
        
        # Testimonial indicators
        testimonial_keywords = [
            'testimonial', 'review', 'feedback', 'recommend',
            'amazing', 'great', 'excellent', 'love it',
            'game changer', 'highly recommend', 'perfect'
        ]
        
        text = (description + ' ' + str(testimonials)).lower()
        testimonial_matches = sum(1 for keyword in testimonial_keywords if keyword in text)
        score += min(testimonial_matches * 0.5, 3.0)
        
        # Usage indicators
        usage_keywords = [
            'users', 'customers', 'clients', 'downloads',
            'active', 'popular', 'widely used', 'adopted'
        ]
        
        usage_matches = sum(1 for keyword in usage_keywords if keyword in text)
        score += min(usage_matches * 0.3, 2.0)
        
        return min(round(score, 2), 10.0)
        
    def evaluate_replacement_success_score(self, app_data: Dict) -> float:
        """
        Evaluate success as a SaaS replacement (cost savings, feature parity)
        Score: 0-10 (10 being highly successful replacement)
        """
        description = app_data.get('description', '')
        purpose = app_data.get('category', '')
        
        if purpose != 'SaaS Replacement':
            return 5.0  # Neutral score for non-replacement apps
            
        description_lower = description.lower()
        score = 5.0  # Base score for replacement apps
        
        # Cost savings indicators
        cost_keywords = [
            'save money', 'cheaper', 'cost effective', 'budget',
            'affordable', 'free alternative', 'reduce cost',
            'expensive', 'save', 'budget-friendly'
        ]
        
        cost_matches = sum(1 for keyword in cost_keywords if keyword in description_lower)
        score += min(cost_matches * 0.5, 2.0)
        
        # Feature parity indicators
        parity_keywords = [
            'all features', 'complete', 'full functionality',
            'everything we need', 'replaces', 'alternative',
            'same features', 'equivalent', 'comparable'
        ]
        
        parity_matches = sum(1 for keyword in parity_keywords if keyword in description_lower)
        score += min(parity_matches * 0.5, 2.0)
        
        # Success indicators
        success_keywords = [
            'successful', 'working great', 'perfect replacement',
            'better than', 'improved', 'upgrade', 'migration'
        ]
        
        success_matches = sum(1 for keyword in success_keywords if keyword in description_lower)
        score += min(success_matches * 0.3, 1.0)
        
        return min(round(score, 2), 10.0)
        
    def evaluate_time_to_market_score(self, app_data: Dict) -> float:
        """
        Evaluate development speed (time-to-market)
        Score: 0-10 (10 being very fast development)
        """
        description = app_data.get('description', '')
        
        if not description:
            return 5.0
            
        description_lower = description.lower()
        score = 5.0  # Base score
        
        # Time indicators (faster = higher score)
        time_patterns = {
            r'(\d+)\s*minutes?': lambda x: max(10 - int(x) / 30, 2),  # Very fast
            r'(\d+)\s*hours?': lambda x: max(10 - int(x) / 4, 1),     # Fast
            r'(\d+)\s*days?': lambda x: max(8 - int(x) / 2, 0),       # Moderate
            r'(\d+)\s*weeks?': lambda x: max(6 - int(x), 0),          # Slow
            r'(\d+)\s*months?': lambda x: max(3 - int(x), 0)          # Very slow
        }
        
        for pattern, score_func in time_patterns.items():
            matches = re.findall(pattern, description_lower)
            if matches:
                time_value = int(matches[0])
                score = score_func(time_value)
                break
                
        # Speed keywords
        speed_keywords = [
            'quickly', 'fast', 'rapid', 'instant', 'immediate',
            'in minutes', 'in hours', 'same day', 'overnight'
        ]
        
        speed_matches = sum(1 for keyword in speed_keywords if keyword in description_lower)
        score += min(speed_matches * 0.5, 2.0)
        
        return min(round(score, 2), 10.0)
        
    def evaluate_longevity_score(self, app_data: Dict) -> float:
        """
        Evaluate application longevity and maintenance status
        Score: 0-10 (10 being actively maintained and long-running)
        """
        url = app_data.get('url', '')
        creation_date = app_data.get('creation_date')
        description = app_data.get('description', '')
        
        score = 5.0  # Base score
        
        # Check if app is still accessible
        if url and url.startswith('http'):
            response = self._make_request(url)
            if response and response.status_code == 200:
                score += 3.0  # App is live
            else:
                score -= 2.0  # App is not accessible
                
        # Age-based scoring (if creation date available)
        if creation_date:
            try:
                created = datetime.fromisoformat(creation_date.replace('Z', '+00:00'))
                age_days = (datetime.now() - created).days
                
                if age_days > 365:  # Over a year old
                    score += 2.0
                elif age_days > 180:  # Over 6 months old
                    score += 1.0
                elif age_days < 30:  # Very new
                    score += 0.5
                    
            except (ValueError, AttributeError):
                pass  # Invalid date format
                
        # Maintenance indicators
        maintenance_keywords = [
            'updated', 'maintained', 'active', 'supported',
            'latest', 'current', 'ongoing', 'regularly'
        ]
        
        description_lower = description.lower()
        maintenance_matches = sum(1 for keyword in maintenance_keywords if keyword in description_lower)
        score += min(maintenance_matches * 0.3, 1.5)
        
        return min(round(score, 2), 10.0)
        
    def calculate_overall_quality_score(self, metrics: Dict[str, float]) -> float:
        """Calculate weighted overall quality score"""
        weights = {
            'completeness_score': 0.25,
            'professional_score': 0.20,
            'adoption_score': 0.15,
            'replacement_success_score': 0.15,
            'time_to_market_score': 0.15,
            'longevity_score': 0.10
        }
        
        weighted_score = sum(metrics[key] * weights[key] for key in weights)
        return round(weighted_score, 2)
        
    def evaluate_app_quality(self, app_data: Dict) -> QualityMetrics:
        """Evaluate all quality metrics for a single application"""
        logger.info(f"Evaluating quality for: {app_data.get('name', 'Unknown')}")
        
        completeness = self.evaluate_completeness_score(app_data)
        professional = self.evaluate_professional_score(app_data)
        adoption = self.evaluate_adoption_score(app_data)
        replacement = self.evaluate_replacement_success_score(app_data)
        time_to_market = self.evaluate_time_to_market_score(app_data)
        longevity = self.evaluate_longevity_score(app_data)
        
        metrics_dict = {
            'completeness_score': completeness,
            'professional_score': professional,
            'adoption_score': adoption,
            'replacement_success_score': replacement,
            'time_to_market_score': time_to_market,
            'longevity_score': longevity
        }
        
        overall = self.calculate_overall_quality_score(metrics_dict)
        
        quality_metrics = QualityMetrics(
            app_name=app_data.get('name', 'Unknown'),
            completeness_score=completeness,
            professional_score=professional,
            adoption_score=adoption,
            replacement_success_score=replacement,
            time_to_market_score=time_to_market,
            longevity_score=longevity,
            overall_quality_score=overall,
            evaluation_date=datetime.now().isoformat()
        )
        
        return quality_metrics
        
    def evaluate_all_apps(self, csv_file: str = 'data/raw/base44_apps.csv') -> List[QualityMetrics]:
        """Evaluate quality metrics for all applications"""
        try:
            apps_df = pd.read_csv(csv_file)
            logger.info(f"Evaluating quality for {len(apps_df)} applications")
        except FileNotFoundError:
            logger.error(f"File {csv_file} not found")
            return []
            
        self.quality_results = []
        
        for idx, row in apps_df.iterrows():
            app_data = row.to_dict()
            quality_metrics = self.evaluate_app_quality(app_data)
            self.quality_results.append(quality_metrics)
            
        logger.info(f"Completed quality evaluation for {len(self.quality_results)} applications")
        return self.quality_results
        
    def generate_quality_report(self) -> Dict[str, any]:
        """Generate comprehensive quality analysis report"""
        if not self.quality_results:
            return {}
            
        df = pd.DataFrame([result.__dict__ for result in self.quality_results])
        
        report = {
            'evaluation_summary': {
                'total_apps_evaluated': len(self.quality_results),
                'evaluation_date': datetime.now().isoformat(),
                'average_overall_quality': df['overall_quality_score'].mean()
            },
            'quality_distributions': {
                'overall_quality': {
                    'mean': df['overall_quality_score'].mean(),
                    'median': df['overall_quality_score'].median(),
                    'std': df['overall_quality_score'].std(),
                    'min': df['overall_quality_score'].min(),
                    'max': df['overall_quality_score'].max()
                },
                'completeness': {
                    'mean': df['completeness_score'].mean(),
                    'high_completeness_ratio': (df['completeness_score'] >= 7).sum() / len(df)
                },
                'professional': {
                    'mean': df['professional_score'].mean(),
                    'professional_ratio': (df['professional_score'] >= 6).sum() / len(df)
                },
                'adoption': {
                    'mean': df['adoption_score'].mean(),
                    'high_adoption_ratio': (df['adoption_score'] >= 6).sum() / len(df)
                }
            },
            'top_apps': {
                'highest_overall_quality': df.nlargest(5, 'overall_quality_score')[['app_name', 'overall_quality_score']].to_dict('records'),
                'most_complete': df.nlargest(5, 'completeness_score')[['app_name', 'completeness_score']].to_dict('records'),
                'most_professional': df.nlargest(5, 'professional_score')[['app_name', 'professional_score']].to_dict('records')
            },
            'quality_insights': self._generate_quality_insights(df)
        }
        
        return report
        
    def _generate_quality_insights(self, df: pd.DataFrame) -> Dict[str, str]:
        """Generate insights from quality analysis"""
        insights = {}
        
        # Overall quality insights
        high_quality_apps = df[df['overall_quality_score'] >= 7]
        if len(high_quality_apps) > 0:
            insights['high_quality_percentage'] = f"{len(high_quality_apps) / len(df) * 100:.1f}% of apps have high overall quality (≥7.0)"
        
        # Completeness insights
        avg_completeness = df['completeness_score'].mean()
        insights['completeness_trend'] = f"Average completeness score is {avg_completeness:.1f}, indicating {'good' if avg_completeness >= 6 else 'moderate'} feature completeness"
        
        # Professional quality insights
        avg_professional = df['professional_score'].mean()
        insights['professional_trend'] = f"Average professional score is {avg_professional:.1f}, suggesting {'high' if avg_professional >= 6 else 'moderate'} professional polish"
        
        # Time to market insights
        avg_ttm = df['time_to_market_score'].mean()
        insights['development_speed'] = f"Average time-to-market score is {avg_ttm:.1f}, indicating {'fast' if avg_ttm >= 6 else 'moderate'} development speed"
        
        return insights
        
    def save_quality_results(self, filename: str = 'data/processed/quality_metrics.csv'):
        """Save quality evaluation results to CSV"""
        if not self.quality_results:
            logger.warning("No quality results to save")
            return
            
        df = pd.DataFrame([result.__dict__ for result in self.quality_results])
        df.to_csv(filename, index=False)
        logger.info(f"Saved quality metrics to {filename}")
        
    def save_quality_report(self, filename: str = 'data/processed/quality_report.json'):
        """Save quality analysis report to JSON"""
        report = self.generate_quality_report()
        if not report:
            logger.warning("No quality report to save")
            return
            
        # Convert numpy types for JSON serialization
        def convert_numpy(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj
            
        def clean_for_json(data):
            if isinstance(data, dict):
                return {k: clean_for_json(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [clean_for_json(v) for v in data]
            else:
                return convert_numpy(data)
                
        clean_report = clean_for_json(report)
        
        with open(filename, 'w') as f:
            json.dump(clean_report, f, indent=2)
        logger.info(f"Saved quality report to {filename}")

if __name__ == "__main__":
    evaluator = Base44QualityEvaluator(rate_limit=1.0)
    
    # Evaluate all apps
    results = evaluator.evaluate_all_apps()
    
    if results:
        # Save results
        evaluator.save_quality_results()
        evaluator.save_quality_report()
        
        # Print summary
        report = evaluator.generate_quality_report()
        summary = report.get('evaluation_summary', {})
        print(f"Quality evaluation completed for {summary.get('total_apps_evaluated', 0)} applications")
        print(f"Average overall quality score: {summary.get('average_overall_quality', 0):.2f}")
    else:
        print("No applications found for quality evaluation")