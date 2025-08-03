#!/usr/bin/env python3
"""
Demo script showing Base44 analysis functionality
Works with basic Python libraries to demonstrate the project
"""

import json
import csv
import os
from datetime import datetime

def load_sample_data():
    """Load the scraped data"""
    try:
        with open('data/raw/base44_apps.csv', 'r') as f:
            apps = []
            reader = csv.DictReader(f)
            for row in reader:
                apps.append(row)
        return apps
    except FileNotFoundError:
        print("No data file found. Please run the scraper first.")
        return []

def analyze_basic_stats(apps):
    """Perform basic statistical analysis"""
    if not apps:
        return {}
    
    # Count categories
    categories = {}
    industries = {}
    sources = {}
    
    total_features = 0
    feature_counts = []
    
    for app in apps:
        # Category analysis
        category = app.get('category', 'Unknown')
        categories[category] = categories.get(category, 0) + 1
        
        # Industry analysis
        industry = app.get('industry', 'Unknown')
        industries[industry] = industries.get(industry, 0) + 1
        
        # Source analysis
        source = app.get('source', 'Unknown')
        sources[source] = sources.get(source, 0) + 1
        
        # Feature analysis
        features = app.get('features', '')
        if features:
            feature_list = [f.strip() for f in features.split(',') if f.strip()]
            feature_counts.append(len(feature_list))
            total_features += len(feature_list)
    
    avg_features = total_features / len(apps) if apps else 0
    
    return {
        'total_apps': len(apps),
        'categories': categories,
        'industries': industries,
        'sources': sources,
        'average_features': round(avg_features, 2),
        'feature_counts': feature_counts
    }

def calculate_complexity_scores(apps):
    """Calculate basic complexity scores"""
    complexity_weights = {
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
        'reporting': 3
    }
    
    scored_apps = []
    
    for app in apps:
        features = app.get('features', '')
        description = app.get('description', '')
        
        complexity_score = 0
        
        # Score based on features
        if features:
            feature_list = [f.strip() for f in features.split(',') if f.strip()]
            for feature in feature_list:
                complexity_score += complexity_weights.get(feature, 1)
        
        # Score based on description keywords
        description_lower = description.lower()
        complexity_indicators = {
            'complex': 3, 'advanced': 3, 'enterprise': 4,
            'workflow': 3, 'automation': 4, 'integration': 4,
            'real-time': 4, 'machine learning': 5, 'ai': 4
        }
        
        for indicator, score in complexity_indicators.items():
            if indicator in description_lower:
                complexity_score += score
        
        # Normalize to 0-10 scale
        normalized_score = min(complexity_score / 20 * 10, 10)
        
        app_with_score = app.copy()
        app_with_score['complexity_score'] = round(normalized_score, 2)
        scored_apps.append(app_with_score)
    
    return scored_apps

def generate_insights(stats, scored_apps):
    """Generate analytical insights"""
    insights = []
    
    # App distribution insights
    total_apps = stats['total_apps']
    insights.append(f"📊 Total Applications Analyzed: {total_apps}")
    
    # Category insights
    if stats['categories']:
        most_common_category = max(stats['categories'], key=stats['categories'].get)
        insights.append(f"🎯 Most Common Purpose: {most_common_category} ({stats['categories'][most_common_category]} apps)")
    
    # Industry insights
    if stats['industries']:
        most_common_industry = max(stats['industries'], key=stats['industries'].get)
        insights.append(f"🏭 Top Industry: {most_common_industry} ({stats['industries'][most_common_industry]} apps)")
    
    # Feature insights
    avg_features = stats['average_features']
    insights.append(f"⚙️ Average Features per App: {avg_features}")
    
    # Complexity insights
    if scored_apps:
        complexity_scores = [float(app['complexity_score']) for app in scored_apps]
        avg_complexity = sum(complexity_scores) / len(complexity_scores)
        high_complexity = len([s for s in complexity_scores if s >= 7])
        insights.append(f"🔧 Average Complexity Score: {avg_complexity:.2f}/10")
        insights.append(f"🚀 High-Complexity Apps (≥7.0): {high_complexity} ({high_complexity/len(scored_apps)*100:.1f}%)")
    
    # Source insights
    if stats['sources']:
        primary_source = max(stats['sources'], key=stats['sources'].get)
        insights.append(f"📍 Primary Discovery Source: {primary_source}")
    
    return insights

def classify_app_types(scored_apps):
    """Classify apps into taxonomic categories"""
    taxonomy = {
        'Business Automation': [],
        'Customer Tools': [],
        'Data Management': [],
        'Personal Projects': [],
        'SaaS Alternatives': []
    }
    
    for app in scored_apps:
        description = app.get('description', '').lower()
        category = app.get('category', '')
        
        # Classification logic
        if any(word in description for word in ['replace', 'alternative', 'instead of']):
            taxonomy['SaaS Alternatives'].append(app)
        elif category == 'Internal Tool' or any(word in description for word in ['admin', 'management', 'dashboard']):
            taxonomy['Business Automation'].append(app)
        elif category == 'Customer Portal' or any(word in description for word in ['customer', 'client', 'user']):
            taxonomy['Customer Tools'].append(app)
        elif any(word in description for word in ['data', 'database', 'analytics']):
            taxonomy['Data Management'].append(app)
        else:
            taxonomy['Personal Projects'].append(app)
    
    return taxonomy

def save_analysis_results(stats, scored_apps, insights, taxonomy):
    """Save analysis results to files"""
    os.makedirs('data/processed', exist_ok=True)
    
    # Save basic statistics
    with open('data/processed/basic_statistics.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    # Save scored apps
    with open('data/processed/scored_applications.json', 'w') as f:
        json.dump(scored_apps, f, indent=2)
    
    # Save insights
    with open('data/processed/analysis_insights.json', 'w') as f:
        json.dump({
            'insights': insights,
            'generated_at': datetime.now().isoformat()
        }, f, indent=2)
    
    # Save taxonomy
    taxonomy_summary = {category: len(apps) for category, apps in taxonomy.items()}
    with open('data/processed/app_taxonomy.json', 'w') as f:
        json.dump({
            'taxonomy_summary': taxonomy_summary,
            'detailed_taxonomy': taxonomy
        }, f, indent=2)
    
    print(f"✅ Analysis results saved to data/processed/")

def print_results(stats, insights, taxonomy):
    """Print analysis results to console"""
    print("\n" + "="*60)
    print("🎯 BASE44 ECOSYSTEM ANALYSIS RESULTS")
    print("="*60)
    
    print("\n📈 KEY INSIGHTS:")
    for insight in insights:
        print(f"   {insight}")
    
    print(f"\n📊 CATEGORY DISTRIBUTION:")
    for category, count in stats['categories'].items():
        percentage = count / stats['total_apps'] * 100
        print(f"   {category}: {count} apps ({percentage:.1f}%)")
    
    print(f"\n🏭 INDUSTRY DISTRIBUTION:")
    for industry, count in stats['industries'].items():
        percentage = count / stats['total_apps'] * 100
        print(f"   {industry}: {count} apps ({percentage:.1f}%)")
    
    print(f"\n🔍 APPLICATION TAXONOMY:")
    for category, apps in taxonomy.items():
        print(f"   {category}: {len(apps)} applications")
        if apps:
            print(f"      Examples: {', '.join([app['name'] for app in apps[:3]])}")
    
    print("\n" + "="*60)

def main():
    """Main analysis function"""
    print("🚀 Starting Base44 Ecosystem Analysis...")
    
    # Load data
    apps = load_sample_data()
    if not apps:
        print("❌ No data available for analysis")
        return
    
    print(f"📁 Loaded {len(apps)} applications")
    
    # Perform analysis
    stats = analyze_basic_stats(apps)
    scored_apps = calculate_complexity_scores(apps)
    insights = generate_insights(stats, scored_apps)
    taxonomy = classify_app_types(scored_apps)
    
    # Save results
    save_analysis_results(stats, scored_apps, insights, taxonomy)
    
    # Print results
    print_results(stats, insights, taxonomy)
    
    print("\n✨ Analysis completed successfully!")
    print("📁 Results saved to data/processed/ directory")
    print("📋 Check the generated JSON files for detailed analysis")

if __name__ == "__main__":
    main()