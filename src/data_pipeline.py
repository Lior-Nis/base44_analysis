"""
Integrated Data Processing Pipeline for Base44 Ecosystem Analysis
Orchestrates all analyzers to create comprehensive analysis of 59 Base44 applications
"""

import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import logging
from datetime import datetime
import time

# Import all our analyzers
from utils.data_processor import DataProcessor
from extractors.ast_analyzer import ASTAnalyzer, ComponentAnalysis
from extractors.sdk_profiler import SDKProfiler, SDKUsageProfile
from extractors.content_extractor import ContentExtractor, AppContent
from extractors.dependency_analyzer import DependencyAnalyzer, DependencyProfile

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class IntegratedAppProfile:
    """Comprehensive profile combining all analysis results for a single application"""
    app_name: str
    
    # Basic metadata
    analysis_timestamp: str = ""
    processing_time_seconds: float = 0.0
    
    # Component analysis results
    component_analysis: Optional[ComponentAnalysis] = None
    
    # SDK usage results
    sdk_profile: Optional[SDKUsageProfile] = None
    
    # Content analysis results
    content_profile: Optional[AppContent] = None
    
    # Dependency analysis results
    dependency_profile: Optional[DependencyProfile] = None
    
    # Derived comprehensive metrics
    overall_complexity_score: float = 0.0
    technical_sophistication: float = 0.0
    base44_integration_level: float = 0.0
    user_experience_complexity: float = 0.0
    
    # Classification results
    predicted_category: str = ""
    category_confidence: float = 0.0
    business_domain: str = ""
    app_type: str = ""  # dashboard, tool, social, ecommerce, etc.

class Base44EcosystemPipeline:
    """Main pipeline for comprehensive Base44 ecosystem analysis"""
    
    def __init__(self, data_dir: str = "data/raw", output_dir: str = "data/processed"):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize all analyzers
        self.data_processor = DataProcessor(str(self.data_dir))
        self.ast_analyzer = ASTAnalyzer()
        self.sdk_profiler = SDKProfiler()
        self.content_extractor = ContentExtractor()
        self.dependency_analyzer = DependencyAnalyzer()
        
        # Results storage
        self.integrated_profiles: List[IntegratedAppProfile] = []
        self.processing_stats = {}
        
        logger.info("Base44 Ecosystem Pipeline initialized")
    
    def run_full_analysis(self, limit: Optional[int] = None) -> List[IntegratedAppProfile]:
        """
        Run comprehensive analysis on all Base44 applications
        
        Args:
            limit: Optional limit on number of applications to analyze (for testing)
            
        Returns:
            List of IntegratedAppProfile objects with complete analysis
        """
        start_time = time.time()
        logger.info("Starting comprehensive Base44 ecosystem analysis")
        
        # Discover all applications
        apps_metadata = self.data_processor.discover_applications()
        
        if limit:
            apps_metadata = apps_metadata[:limit]
            logger.info(f"Limited analysis to {limit} applications for testing")
        
        logger.info(f"Discovered {len(apps_metadata)} applications to analyze")
        
        # Process each application
        for i, app_metadata in enumerate(apps_metadata):
            logger.info(f"Processing application {i+1}/{len(apps_metadata)}: {app_metadata.app_name}")
            
            try:
                profile = self._analyze_single_application(app_metadata)
                self.integrated_profiles.append(profile)
                
                # Log progress every 10 applications
                if (i + 1) % 10 == 0:
                    logger.info(f"Completed {i+1}/{len(apps_metadata)} applications")
                    
            except Exception as e:
                logger.error(f"Failed to analyze {app_metadata.app_name}: {e}")
                continue
        
        # Calculate processing statistics
        total_time = time.time() - start_time
        self.processing_stats = {
            'total_applications_processed': len(self.integrated_profiles),
            'total_processing_time_seconds': total_time,
            'average_time_per_app': total_time / len(self.integrated_profiles) if self.integrated_profiles else 0,
            'analysis_date': datetime.now().isoformat(),
            'successful_analyses': len([p for p in self.integrated_profiles if p.component_analysis is not None])
        }
        
        logger.info(f"Completed analysis of {len(self.integrated_profiles)} applications in {total_time:.2f} seconds")
        
        # Save results
        self._save_results()
        
        return self.integrated_profiles
    
    def _analyze_single_application(self, app_metadata) -> IntegratedAppProfile:
        """Analyze a single application using all analyzers"""
        start_time = time.time()
        
        profile = IntegratedAppProfile(
            app_name=app_metadata.app_name,
            analysis_timestamp=datetime.now().isoformat()
        )
        
        app_path = app_metadata.app_path
        
        # Run AST analysis
        try:
            if app_metadata.jsx_files:
                # Analyze the main App.jsx file if it exists
                main_file_path = Path(app_path) / "src" / "App.jsx"
                if main_file_path.exists():
                    with open(main_file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    profile.component_analysis = self.ast_analyzer.analyze_file(str(main_file_path), content)
            
        except Exception as e:
            logger.warning(f"AST analysis failed for {app_metadata.app_name}: {e}")
        
        # Run SDK profiling
        try:
            profile.sdk_profile = self.sdk_profiler.profile_application(app_path, app_metadata.app_name)
        except Exception as e:
            logger.warning(f"SDK profiling failed for {app_metadata.app_name}: {e}")
        
        # Run content extraction
        try:
            profile.content_profile = self.content_extractor.extract_application_content(app_path, app_metadata.app_name)
        except Exception as e:
            logger.warning(f"Content extraction failed for {app_metadata.app_name}: {e}")
        
        # Run dependency analysis
        try:
            profile.dependency_profile = self.dependency_analyzer.analyze_application(app_path, app_metadata.app_name)
        except Exception as e:
            logger.warning(f"Dependency analysis failed for {app_metadata.app_name}: {e}")
        
        # Calculate derived metrics
        self._calculate_integrated_metrics(profile)
        
        # Classify application
        self._classify_application(profile)
        
        profile.processing_time_seconds = time.time() - start_time
        
        return profile
    
    def _calculate_integrated_metrics(self, profile: IntegratedAppProfile):
        """Calculate comprehensive metrics by combining results from all analyzers"""
        
        scores = []
        weights = []
        
        # Technical complexity from dependencies
        if profile.dependency_profile:
            scores.append(profile.dependency_profile.dependency_complexity_score)
            weights.append(0.25)
        
        # API complexity from SDK usage
        if profile.sdk_profile:
            scores.append(profile.sdk_profile.api_complexity_score)
            weights.append(0.25)
        
        # Component complexity from AST analysis
        if profile.component_analysis:
            # Normalize component complexity
            component_score = min(profile.component_analysis.jsx_elements_count / 50.0, 1.0)
            scores.append(component_score)
            weights.append(0.25)
        
        # Content complexity
        if profile.content_profile:
            # Normalize content complexity based on unique words and features
            content_score = min((profile.content_profile.unique_words / 200.0) + 
                              (len(profile.content_profile.feature_keywords) / 20.0), 1.0)
            scores.append(content_score)
            weights.append(0.25)
        
        # Calculate weighted average
        if scores:
            profile.overall_complexity_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
        
        # Technical sophistication
        tech_factors = []
        if profile.dependency_profile:
            tech_factors.extend([
                profile.dependency_profile.tech_stack_modernity,
                profile.dependency_profile.configuration_complexity,
                1.0 if profile.dependency_profile.uses_typescript else 0.0,
                1.0 if profile.dependency_profile.uses_testing else 0.0
            ])
        
        if tech_factors:
            profile.technical_sophistication = sum(tech_factors) / len(tech_factors)
        
        # Base44 integration level
        integration_factors = []
        if profile.sdk_profile:
            integration_factors.extend([
                profile.sdk_profile.sdk_adherence_score,
                min(len(profile.sdk_profile.entities_used) / 5.0, 1.0),  # Normalize to 5 entities
                min(profile.sdk_profile.api_calls_total / 20.0, 1.0)  # Normalize to 20 API calls
            ])
        
        if integration_factors:
            profile.base44_integration_level = sum(integration_factors) / len(integration_factors)
        
        # User experience complexity
        ux_factors = []
        if profile.content_profile:
            ux_factors.extend([
                min(len(profile.content_profile.page_names) / 10.0, 1.0),  # Multiple pages
                min(len(profile.content_profile.component_names) / 20.0, 1.0),  # Custom components
                min(len(profile.content_profile.ui_labels) / 30.0, 1.0)  # UI elements
            ])
        
        if profile.component_analysis:
            ux_factors.append(min(profile.component_analysis.jsx_elements_count / 100.0, 1.0))
        
        if ux_factors:
            profile.user_experience_complexity = sum(ux_factors) / len(ux_factors)
    
    def _classify_application(self, profile: IntegratedAppProfile):
        """Classify application based on integrated analysis"""
        
        # Determine business domain
        if profile.content_profile and profile.content_profile.business_domain:
            profile.business_domain = profile.content_profile.business_domain
        
        # Determine app type based on multiple factors
        type_scores = {
            'dashboard': 0,
            'tool': 0,
            'social': 0,
            'ecommerce': 0,
            'content_management': 0,
            'analytics': 0,
            'utility': 0
        }
        
        # Content-based classification
        if profile.content_profile:
            for hint in profile.content_profile.app_category_hints:
                if 'dashboard' in hint or 'analytics' in hint:
                    type_scores['dashboard'] += 2
                elif 'crud' in hint:
                    type_scores['tool'] += 1
                elif 'social' in hint:
                    type_scores['social'] += 2
                elif 'ecommerce' in hint:
                    type_scores['ecommerce'] += 2
                elif 'content' in hint:
                    type_scores['content_management'] += 2
            
            # Feature keywords
            features = profile.content_profile.feature_keywords
            if 'dashboard' in features or 'chart' in features:
                type_scores['dashboard'] += 2
            if 'user' in features and 'message' in features:
                type_scores['social'] += 1
            if 'product' in features or 'cart' in features:
                type_scores['ecommerce'] += 2
        
        # SDK usage patterns
        if profile.sdk_profile:
            if len(profile.sdk_profile.entities_used) > 3:
                type_scores['dashboard'] += 1
            if profile.sdk_profile.uses_authentication:
                type_scores['social'] += 1
                type_scores['ecommerce'] += 1
        
        # Technical complexity indicates app type
        if profile.overall_complexity_score > 0.7:
            type_scores['dashboard'] += 1
        elif profile.overall_complexity_score < 0.3:
            type_scores['utility'] += 1
        
        # Assign primary type
        if type_scores:
            profile.app_type = max(type_scores.keys(), key=type_scores.get)
            max_score = max(type_scores.values())
            total_score = sum(type_scores.values())
            profile.category_confidence = max_score / max(total_score, 1) if total_score > 0 else 0.0
        
        # Predicted category (more general)
        complexity_level = "high" if profile.overall_complexity_score > 0.6 else "medium" if profile.overall_complexity_score > 0.3 else "low"
        profile.predicted_category = f"{profile.app_type}_{complexity_level}"
    
    def _save_results(self):
        """Save all analysis results to various output formats"""
        
        # Save integrated profiles as JSON
        profiles_data = []
        for profile in self.integrated_profiles:
            profile_dict = asdict(profile)
            # Convert nested objects to dicts
            if profile.component_analysis:
                profile_dict['component_analysis'] = asdict(profile.component_analysis)
            if profile.sdk_profile:
                profile_dict['sdk_profile'] = asdict(profile.sdk_profile)
            if profile.content_profile:
                profile_dict['content_profile'] = asdict(profile.content_profile)
            if profile.dependency_profile:
                profile_dict['dependency_profile'] = asdict(profile.dependency_profile)
            
            profiles_data.append(profile_dict)
        
        # Save comprehensive results
        comprehensive_results = {
            'processing_stats': self.processing_stats,
            'profiles': profiles_data
        }
        
        comprehensive_path = self.output_dir / "comprehensive_analysis.json"
        with open(comprehensive_path, 'w', encoding='utf-8') as f:
            json.dump(comprehensive_results, f, indent=2, default=str)
        
        logger.info(f"Saved comprehensive analysis to {comprehensive_path}")
        
        # Create summary DataFrame
        summary_data = []
        for profile in self.integrated_profiles:
            row = {
                'app_name': profile.app_name,
                'overall_complexity_score': profile.overall_complexity_score,
                'technical_sophistication': profile.technical_sophistication,
                'base44_integration_level': profile.base44_integration_level,
                'user_experience_complexity': profile.user_experience_complexity,
                'predicted_category': profile.predicted_category,
                'business_domain': profile.business_domain,
                'app_type': profile.app_type,
                'category_confidence': profile.category_confidence,
                'processing_time': profile.processing_time_seconds
            }
            
            # Add key metrics from sub-analyses
            if profile.dependency_profile:
                row['total_dependencies'] = profile.dependency_profile.total_dependencies
                row['uses_typescript'] = profile.dependency_profile.uses_typescript
            
            if profile.sdk_profile:
                row['entities_used'] = len(profile.sdk_profile.entities_used)
                row['api_calls_total'] = profile.sdk_profile.api_calls_total
                row['sdk_adherence_score'] = profile.sdk_profile.sdk_adherence_score
            
            if profile.content_profile:
                row['unique_words'] = profile.content_profile.unique_words
                row['page_count'] = len(profile.content_profile.page_names)
            
            if profile.component_analysis:
                row['jsx_elements'] = profile.component_analysis.jsx_elements_count
                row['hooks_used'] = profile.component_analysis.total_hooks
            
            summary_data.append(row)
        
        # Save as CSV for easy analysis
        df = pd.DataFrame(summary_data)
        csv_path = self.output_dir / "ecosystem_summary.csv"
        df.to_csv(csv_path, index=False)
        logger.info(f"Saved ecosystem summary to {csv_path}")
        
        # Generate ecosystem report
        self._generate_ecosystem_report(df)
    
    def _generate_ecosystem_report(self, df: pd.DataFrame):
        """Generate comprehensive ecosystem analysis report"""
        
        report = {
            'ecosystem_overview': {
                'total_applications': len(df),
                'analysis_date': self.processing_stats['analysis_date'],
                'processing_time_seconds': self.processing_stats['total_processing_time_seconds'],
                'successful_analyses': self.processing_stats['successful_analyses']
            },
            'complexity_analysis': {
                'average_overall_complexity': float(df['overall_complexity_score'].mean()),
                'complexity_distribution': {
                    'high_complexity': int(len(df[df['overall_complexity_score'] > 0.6])),
                    'medium_complexity': int(len(df[(df['overall_complexity_score'] > 0.3) & (df['overall_complexity_score'] <= 0.6)])),
                    'low_complexity': int(len(df[df['overall_complexity_score'] <= 0.3]))
                }
            },
            'technology_analysis': {
                'average_technical_sophistication': float(df['technical_sophistication'].mean()),
                'typescript_adoption_rate': float(df['uses_typescript'].sum() / len(df)) if 'uses_typescript' in df.columns else 0,
                'average_dependencies': float(df['total_dependencies'].mean()) if 'total_dependencies' in df.columns else 0
            },
            'base44_integration': {
                'average_integration_level': float(df['base44_integration_level'].mean()),
                'sdk_adherence_distribution': df['sdk_adherence_score'].describe().to_dict() if 'sdk_adherence_score' in df.columns else {}
            },
            'application_categories': {
                'business_domains': df['business_domain'].value_counts().to_dict(),
                'app_types': df['app_type'].value_counts().to_dict(),
                'predicted_categories': df['predicted_category'].value_counts().to_dict()
            },
            'user_experience': {
                'average_ux_complexity': float(df['user_experience_complexity'].mean()),
                'average_page_count': float(df['page_count'].mean()) if 'page_count' in df.columns else 0,
                'average_jsx_elements': float(df['jsx_elements'].mean()) if 'jsx_elements' in df.columns else 0
            }
        }
        
        report_path = self.output_dir / "ecosystem_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Generated ecosystem report: {report_path}")
        
        # Print summary to console
        print("\n" + "="*60)
        print("BASE44 ECOSYSTEM ANALYSIS SUMMARY")
        print("="*60)
        print(f"Total Applications Analyzed: {report['ecosystem_overview']['total_applications']}")
        print(f"Average Complexity Score: {report['complexity_analysis']['average_overall_complexity']:.2f}")
        print(f"Average Base44 Integration: {report['base44_integration']['average_integration_level']:.2f}")
        print(f"TypeScript Adoption: {report['technology_analysis']['typescript_adoption_rate']:.1%}")
        
        print(f"\nTop Business Domains:")
        for domain, count in list(report['application_categories']['business_domains'].items())[:5]:
            print(f"  {domain}: {count} apps")
        
        print(f"\nTop Application Types:")
        for app_type, count in list(report['application_categories']['app_types'].items())[:5]:
            print(f"  {app_type}: {count} apps")
        
        print("="*60)

def main():
    """Run the comprehensive Base44 ecosystem analysis"""
    pipeline = Base44EcosystemPipeline()
    
    # Run full analysis on all 59 applications
    profiles = pipeline.run_full_analysis()  
    
    print(f"\nAnalysis complete! Processed {len(profiles)} applications.")
    print("Check the data/processed directory for detailed results.")

if __name__ == "__main__":
    main()