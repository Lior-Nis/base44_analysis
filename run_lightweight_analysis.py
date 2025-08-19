#!/usr/bin/env python3
"""
Lightweight Base44 template analysis without heavy dependencies
Uses basic Python libraries only
"""

import os
import sys
import json
import csv
from datetime import datetime
from collections import Counter
import re

def ensure_directories():
    """Ensure required directories exist"""
    directories = [
        'data',
        'data/raw',
        'data/processed',
        'results'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Directory: {directory}")

def collect_sample_templates():
    """Generate sample Base44 templates data"""
    print("\n" + "="*50)
    print("🔍 COLLECTING BASE44 TEMPLATE DATA")
    print("="*50)
    
    # Sample template data (would normally be scraped from https://app.base44.com/app-templates)
    templates = [
        {
            'name': 'CRM Dashboard',
            'description': 'Complete customer relationship management system with contact tracking, deal pipeline, and analytics dashboard.',
            'url': 'https://app.base44.com/templates/crm-dashboard',
            'category': 'Business Management',
            'industry': 'Sales',
            'features': 'authentication,database,dashboard,analytics,notifications',
            'template_id': 'crm_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'E-commerce Admin Panel',
            'description': 'Comprehensive admin panel for online stores with inventory management, order tracking, and customer analytics.',
            'url': 'https://app.base44.com/templates/ecommerce-admin',
            'category': 'E-commerce',
            'industry': 'Retail',
            'features': 'authentication,database,dashboard,inventory,reporting',
            'template_id': 'ecom_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'Project Management Tool',
            'description': 'Agile project management platform with kanban boards, time tracking, and team collaboration features.',
            'url': 'https://app.base44.com/templates/project-manager',
            'category': 'Productivity',
            'industry': 'Tech',
            'features': 'authentication,dashboard,collaboration,time_tracking,kanban',
            'template_id': 'proj_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'HR Management System',
            'description': 'Human resources management with employee records, leave management, and performance tracking.',
            'url': 'https://app.base44.com/templates/hr-system',
            'category': 'Human Resources',
            'industry': 'Corporate',
            'features': 'authentication,database,dashboard,document_management,reporting',
            'template_id': 'hr_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'Financial Dashboard',
            'description': 'Personal finance tracker with expense categorization, budget planning, and financial goal tracking.',
            'url': 'https://app.base44.com/templates/finance-tracker',
            'category': 'Finance',
            'industry': 'Personal Finance',
            'features': 'authentication,dashboard,analytics,budgeting,reporting',
            'template_id': 'fin_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'Inventory Management',
            'description': 'Stock and inventory tracking system with low-stock alerts, supplier management, and analytics.',
            'url': 'https://app.base44.com/templates/inventory-manager',
            'category': 'Operations',
            'industry': 'Logistics',
            'features': 'database,dashboard,alerts,reporting,supplier_management',
            'template_id': 'inv_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'Event Management Platform',
            'description': 'End-to-end event planning tool with attendee management, scheduling, and payment processing.',
            'url': 'https://app.base44.com/templates/event-manager',
            'category': 'Event Planning',
            'industry': 'Events',
            'features': 'authentication,database,payments,notifications,scheduling',
            'template_id': 'event_001',
            'scraped_date': datetime.now().isoformat()
        },
        {
            'name': 'Learning Management System',
            'description': 'Educational platform with course creation, student progress tracking, and assignment management.',
            'url': 'https://app.base44.com/templates/lms',
            'category': 'Education',
            'industry': 'Education',
            'features': 'authentication,database,file_upload,progress_tracking,assignments',
            'template_id': 'lms_001',
            'scraped_date': datetime.now().isoformat()
        }
    ]
    
    # Save to CSV
    with open('data/raw/base44_templates.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['name', 'url', 'description', 'category', 'industry', 'features', 'template_id', 'scraped_date']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(templates)
    
    # Save to JSON
    with open('data/raw/base44_templates.json', 'w', encoding='utf-8') as jsonfile:
        json.dump(templates, jsonfile, indent=2, ensure_ascii=False)
    
    print(f"✅ Collected {len(templates)} Base44 templates")
    return templates

def analyze_templates(templates):
    """Analyze the template data"""
    print("\n" + "="*50)
    print("📊 ANALYZING BASE44 TEMPLATES")
    print("="*50)
    
    # Category analysis
    categories = Counter(template['category'] for template in templates)
    print(f"✓ Found {len(categories)} unique categories")
    
    # Industry analysis
    industries = Counter(template['industry'] for template in templates)
    print(f"✓ Found {len(industries)} unique industries")
    
    # Feature analysis
    all_features = []
    for template in templates:
        features = [f.strip() for f in template['features'].split(',')]
        all_features.extend(features)
    
    feature_counts = Counter(all_features)
    print(f"✓ Found {len(feature_counts)} unique features")
    
    # Complexity scoring
    complexity_scores = []
    for template in templates:
        features = [f.strip() for f in template['features'].split(',')]
        feature_count = len(features)
        description_length = len(template['description'])
        
        # Category complexity weights
        category_weights = {
            'Business Management': 8,
            'E-commerce': 9,
            'Productivity': 6,
            'Human Resources': 6,
            'Finance': 8,
            'Operations': 7,
            'Event Planning': 5,
            'Education': 5
        }
        
        category_score = category_weights.get(template['category'], 4)
        feature_score = min(feature_count * 2, 10)
        description_score = min(description_length / 50, 10)
        
        complexity_score = (feature_score * 0.4 + description_score * 0.2 + category_score * 0.4)
        
        complexity_scores.append({
            'name': template['name'],
            'category': template['category'],
            'feature_count': feature_count,
            'complexity_score': round(complexity_score, 2)
        })
    
    # Create analysis results
    results = {
        'overview': {
            'total_templates': len(templates),
            'analysis_date': datetime.now().isoformat()
        },
        'categories': {
            'distribution': dict(categories),
            'total_categories': len(categories),
            'most_common': categories.most_common(1)[0][0] if categories else None
        },
        'industries': {
            'distribution': dict(industries),
            'total_industries': len(industries),
            'most_common': industries.most_common(1)[0][0] if industries else None
        },
        'features': {
            'most_common_features': dict(feature_counts.most_common(10)),
            'total_unique_features': len(feature_counts),
            'average_features_per_template': len(all_features) / len(templates)
        },
        'complexity': complexity_scores
    }
    
    print(f"✅ Analysis completed")
    print(f"   - {results['overview']['total_templates']} templates analyzed")
    print(f"   - {len(results['categories']['distribution'])} categories found")
    print(f"   - {len(results['industries']['distribution'])} industries covered")
    print(f"   - {results['features']['total_unique_features']} unique features identified")
    
    return results

def save_results(results):
    """Save analysis results"""
    # Save detailed JSON results
    with open('data/processed/template_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    # Generate and save summary report
    report_lines = [
        "# Base44 Template Analysis Summary",
        "",
        f"**Total Templates Analyzed:** {results['overview']['total_templates']}",
        f"**Analysis Date:** {results['overview']['analysis_date'][:10]}",
        "",
        "## Category Distribution",
    ]
    
    for category, count in results['categories']['distribution'].items():
        report_lines.append(f"- {category}: {count} templates")
        
    report_lines.extend([
        "",
        "## Industry Focus",
    ])
    
    for industry, count in results['industries']['distribution'].items():
        report_lines.append(f"- {industry}: {count} templates")
        
    report_lines.extend([
        "",
        "## Most Common Features",
    ])
    
    for feature, count in list(results['features']['most_common_features'].items())[:5]:
        report_lines.append(f"- {feature}: {count} templates")
        
    report_lines.extend([
        "",
        "## Complexity Scores (Top 5)",
    ])
    
    # Sort by complexity score
    sorted_complexity = sorted(results['complexity'], key=lambda x: x['complexity_score'], reverse=True)
    for item in sorted_complexity[:5]:
        report_lines.append(f"- {item['name']}: {item['complexity_score']} (Category: {item['category']})")
    
    summary_text = "\n".join(report_lines)
    
    with open('data/processed/template_analysis_summary.md', 'w', encoding='utf-8') as f:
        f.write(summary_text)
    
    print(f"✅ Results saved to:")
    print(f"   - data/processed/template_analysis.json")
    print(f"   - data/processed/template_analysis_summary.md")

def display_summary():
    """Display the analysis summary"""
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
    print("🚀 Base44 Template Analysis Pipeline (Lightweight)")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Setup directories
    print("\n📁 Setting up directories...")
    ensure_directories()
    
    # Collect template data
    templates = collect_sample_templates()
    
    # Analyze templates
    results = analyze_templates(templates)
    
    # Save results
    print("\n💾 Saving results...")
    save_results(results)
    
    # Display summary
    display_summary()
    
    print(f"\n✅ Pipeline completed successfully!")
    print(f"   Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)