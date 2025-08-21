#!/usr/bin/env python3
"""
Fix CSV export from existing JSON data
"""
import json
import csv
import os

def fix_csv_export():
    """
    Convert existing JSON data to proper CSV format
    """
    json_file = 'data/raw/base44_all_templates.json'
    csv_file = 'data/raw/base44_all_templates_fixed.csv'
    
    if not os.path.exists(json_file):
        print("Error: JSON file not found")
        return
    
    # Load JSON data
    with open(json_file, 'r', encoding='utf-8') as f:
        templates = json.load(f)
    
    print(f"Loaded {len(templates)} templates from JSON")
    
    # Define fieldnames
    fieldnames = [
        'template_id', 'name', 'description', 'url', 'category', 'industry', 
        'features', 'extraction_method', 'scraped_date', 'source'
    ]
    
    # Write to CSV with proper error handling
    try:
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            
            for template in templates:
                row = {}
                for field in fieldnames:
                    value = template.get(field, '')
                    if field == 'features':
                        if isinstance(value, list):
                            row[field] = ','.join(str(f) for f in value)
                        else:
                            row[field] = str(value) if value else ''
                    else:
                        # Clean the value
                        clean_value = str(value).replace('\n', ' ').replace('\r', ' ') if value else ''
                        row[field] = clean_value
                writer.writerow(row)
        
        print(f"SUCCESS: Fixed CSV saved to {csv_file}")
        
        # Show first few rows
        with open(csv_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()[:5]
            print("\nFirst few rows:")
            for i, line in enumerate(lines):
                print(f"{i+1}: {line.strip()}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    fix_csv_export()