#!/usr/bin/env python3
"""
Main script to run Base44 template analysis
Simplified workflow focused on Base44 app templates
"""

import os
import sys
from datetime import datetime

# Add src directory to path
sys.path.append('src')

from src.base44_template_scraper import Base44TemplatesScraper
from src.template_analyzer import Base44TemplateAnalyzer

def ensure_directories():
    """Ensure required directories exist"""
    directories = [
        'data',
        'data/raw',
        'data/processed',
        'results',
        'results/figures'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Directory: {directory}")

def run_data_collection():
    """Collect Base44 template data"""
    print("\n" + "="*50)
    print("🔍 COLLECTING BASE44 TEMPLATE DATA")
    print("="*50)
    
    scraper = Base44TemplatesScraper(rate_limit=2.0)
    templates = scraper.run_scrape()
    
    print(f"✅ Collected {len(templates)} templates")
    return len(templates) > 0

def run_analysis():
    """Run template analysis"""
    print("\n" + "="*50)
    print("📊 ANALYZING BASE44 TEMPLATES")
    print("="*50)
    
    analyzer = Base44TemplateAnalyzer()
    results = analyzer.run_full_analysis()
    
    if results:
        print("✅ Analysis completed successfully")
        print(f"   - {results['overview']['total_templates']} templates analyzed")
        print(f"   - {len(results['categories']['distribution'])} categories found")
        print(f"   - {len(results['industries']['distribution'])} industries covered")
        print(f"   - {results['features']['total_unique_features']} unique features identified")
        return True
    else:
        print("❌ Analysis failed")
        return False

def display_summary():
    """Display analysis summary"""
    try:
        with open('data/processed/template_analysis_summary.md', 'r') as f:
            summary = f.read()
        
        print("\n" + "="*50)
        print("📋 ANALYSIS SUMMARY")
        print("="*50)
        print(summary)
    except FileNotFoundError:
        print("📋 Summary file not found")

def main():
    """Main execution function"""
    print("🚀 Base44 Template Analysis Pipeline")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ensure directories exist
    print("\n📁 Setting up directories...")
    ensure_directories()
    
    # Step 1: Data Collection
    if not run_data_collection():
        print("❌ Data collection failed. Exiting.")
        return False
    
    # Step 2: Analysis
    if not run_analysis():
        print("❌ Analysis failed. Exiting.")
        return False
    
    # Step 3: Display Summary
    display_summary()
    
    print(f"\n✅ Pipeline completed successfully!")
    print(f"   Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Results saved to: data/processed/")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)