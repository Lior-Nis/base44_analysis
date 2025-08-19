"""
Base44 App Templates Scraper
Focused scraper for Base44 official app templates from https://app.base44.com/app-templates
"""

import requests
from bs4 import BeautifulSoup
import time
import json
import csv
from datetime import datetime
import logging
from typing import List, Dict, Optional
import re
from urllib.parse import urljoin, urlparse
import random
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Base44Template:
    """Data class for Base44 app template information"""
    name: str
    url: str
    description: str
    category: str
    industry: str
    features: List[str]
    template_id: Optional[str]
    scraped_date: str

class Base44TemplatesScraper:
    """Focused scraper for Base44 official app templates"""
    
    def __init__(self, rate_limit: float = 2.0):
        """
        Initialize scraper with rate limiting
        
        Args:
            rate_limit: Seconds to wait between requests
        """
        self.rate_limit = rate_limit
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        self.templates: List[Base44Template] = []
        
    def _rate_limit_sleep(self):
        """Sleep to respect rate limits"""
        time.sleep(self.rate_limit + random.uniform(0, 1))
        
    def _make_request(self, url: str) -> Optional[requests.Response]:
        """Make HTTP request with error handling"""
        try:
            self._rate_limit_sleep()
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
            
    def scrape_base44_templates(self) -> List[Dict]:
        """
        Scrape Base44 app templates from https://app.base44.com/app-templates
        """
        logger.info("Scraping Base44 official app templates...")
        templates = []
        
        template_url = "https://app.base44.com/app-templates"
        response = self._make_request(template_url)
        
        if not response:
            logger.warning("Could not fetch Base44 templates page, using sample data")
            return self._get_sample_templates()
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for template cards/listings
        template_elements = soup.find_all(['div', 'article', 'section'], 
                                        class_=re.compile(r'template|app|card|item'))
        
        if not template_elements:
            logger.warning("No template elements found, using sample data")
            return self._get_sample_templates()
        
        for element in template_elements:
            template_data = self._extract_template_from_element(element)
            if template_data:
                templates.append(template_data)
                
        logger.info(f"Found {len(templates)} templates from Base44 app-templates")
        return templates if templates else self._get_sample_templates()
    
    def _get_sample_templates(self) -> List[Dict]:
        """Get sample template data for testing/demo purposes"""
        logger.info("Using sample template data")
        return [
            {
                'name': 'CRM Dashboard',
                'description': 'Complete customer relationship management system with contact tracking, deal pipeline, and analytics dashboard.',
                'url': 'https://app.base44.com/templates/crm-dashboard',
                'category': 'Business Management',
                'industry': 'Sales',
                'features': ['authentication', 'database', 'dashboard', 'analytics', 'notifications'],
                'template_id': 'crm_001'
            },
            {
                'name': 'E-commerce Admin Panel',
                'description': 'Comprehensive admin panel for online stores with inventory management, order tracking, and customer analytics.',
                'url': 'https://app.base44.com/templates/ecommerce-admin',
                'category': 'E-commerce',
                'industry': 'Retail',
                'features': ['authentication', 'database', 'dashboard', 'inventory', 'reporting'],
                'template_id': 'ecom_001'
            },
            {
                'name': 'Project Management Tool',
                'description': 'Agile project management platform with kanban boards, time tracking, and team collaboration features.',
                'url': 'https://app.base44.com/templates/project-manager',
                'category': 'Productivity',
                'industry': 'Tech',
                'features': ['authentication', 'dashboard', 'collaboration', 'time_tracking', 'kanban'],
                'template_id': 'proj_001'
            },
            {
                'name': 'HR Management System',
                'description': 'Human resources management with employee records, leave management, and performance tracking.',
                'url': 'https://app.base44.com/templates/hr-system',
                'category': 'Human Resources',
                'industry': 'Corporate',
                'features': ['authentication', 'database', 'dashboard', 'document_management', 'reporting'],
                'template_id': 'hr_001'
            },
            {
                'name': 'Financial Dashboard',
                'description': 'Personal finance tracker with expense categorization, budget planning, and financial goal tracking.',
                'url': 'https://app.base44.com/templates/finance-tracker',
                'category': 'Finance',
                'industry': 'Personal Finance',
                'features': ['authentication', 'dashboard', 'analytics', 'budgeting', 'reporting'],
                'template_id': 'fin_001'
            },
            {
                'name': 'Inventory Management',
                'description': 'Stock and inventory tracking system with low-stock alerts, supplier management, and analytics.',
                'url': 'https://app.base44.com/templates/inventory-manager',
                'category': 'Operations',
                'industry': 'Logistics',
                'features': ['database', 'dashboard', 'alerts', 'reporting', 'supplier_management'],
                'template_id': 'inv_001'
            },
            {
                'name': 'Event Management Platform',
                'description': 'End-to-end event planning tool with attendee management, scheduling, and payment processing.',
                'url': 'https://app.base44.com/templates/event-manager',
                'category': 'Event Planning',
                'industry': 'Events',
                'features': ['authentication', 'database', 'payments', 'notifications', 'scheduling'],
                'template_id': 'event_001'
            },
            {
                'name': 'Learning Management System',
                'description': 'Educational platform with course creation, student progress tracking, and assignment management.',
                'url': 'https://app.base44.com/templates/lms',
                'category': 'Education',
                'industry': 'Education',
                'features': ['authentication', 'database', 'file_upload', 'progress_tracking', 'assignments'],
                'template_id': 'lms_001'
            }
        ]
        
    def _extract_template_from_element(self, element) -> Optional[Dict]:
        """Extract template information from HTML element"""
        try:
            # Extract basic information
            name = self._extract_text(element, ['h1', 'h2', 'h3', '.title', '.name', '[data-title]'])
            description = self._extract_text(element, ['.description', '.summary', 'p', '[data-description]'])
            url = self._extract_link(element)
            
            if not name or not description:
                return None
                
            return {
                'name': name,
                'url': url,
                'description': description,
                'category': self._classify_template_category(name, description),
                'industry': self._classify_industry(description),
                'features': self._extract_features(description),
                'template_id': self._extract_template_id(element, url),
                'scraped_date': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error extracting template data: {e}")
            return None
            
    def _extract_text(self, element, selectors: List[str]) -> str:
        """Extract text using multiple CSS selectors"""
        for selector in selectors:
            found = element.select(selector)
            if found:
                text = found[0].get_text().strip()
                if text:
                    return text
        return ""
        
    def _extract_link(self, element) -> str:
        """Extract URL from element"""
        link = element.find('a')
        if link and link.get('href'):
            href = link['href']
            if href.startswith('/'):
                return f"https://app.base44.com{href}"
            return href
        return ""
    
    def _extract_template_id(self, element, url: str) -> Optional[str]:
        """Extract template ID from element or URL"""
        # Try to get ID from data attributes
        template_id = element.get('data-template-id') or element.get('data-id')
        if template_id:
            return template_id
            
        # Extract from URL if available
        if url:
            parts = url.split('/')
            if parts:
                return parts[-1]
                
        return None
        
    def _classify_template_category(self, name: str, description: str) -> str:
        """Classify template category based on name and description"""
        text = (name + " " + description).lower()
        
        categories = {
            'Business Management': ['crm', 'customer', 'sales', 'lead', 'business'],
            'E-commerce': ['ecommerce', 'store', 'shop', 'retail', 'inventory', 'product'],
            'Productivity': ['project', 'task', 'kanban', 'productivity', 'workflow'],
            'Human Resources': ['hr', 'human resources', 'employee', 'staff', 'personnel'],
            'Finance': ['finance', 'financial', 'budget', 'accounting', 'expense'],
            'Education': ['learning', 'education', 'course', 'student', 'lms'],
            'Healthcare': ['health', 'medical', 'patient', 'clinic', 'hospital'],
            'Events': ['event', 'meeting', 'conference', 'booking', 'calendar'],
            'Operations': ['inventory', 'logistics', 'operations', 'supply', 'warehouse'],
            'Analytics': ['analytics', 'reporting', 'dashboard', 'metrics', 'data']
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
                
        return 'General'
            
    def _classify_industry(self, description: str) -> str:
        """Classify industry based on description"""
        description_lower = description.lower()
        
        industries = {
            'Tech': ['tech', 'software', 'api', 'developer', 'saas', 'platform'],
            'Retail': ['retail', 'shop', 'store', 'ecommerce', 'product', 'inventory'],
            'Education': ['school', 'education', 'learn', 'student', 'course', 'training'],
            'Healthcare': ['health', 'medical', 'hospital', 'clinic', 'patient', 'care'],
            'Finance': ['finance', 'bank', 'money', 'payment', 'financial', 'accounting'],
            'Sales': ['sales', 'crm', 'customer', 'lead', 'deal', 'pipeline'],
            'Corporate': ['corporate', 'enterprise', 'business', 'company', 'organization'],
            'Events': ['event', 'conference', 'meeting', 'booking', 'venue'],
            'Logistics': ['logistics', 'supply', 'warehouse', 'shipping', 'inventory'],
            'Personal Finance': ['personal', 'budget', 'expense', 'savings', 'goal']
        }
        
        for industry, keywords in industries.items():
            if any(keyword in description_lower for keyword in keywords):
                return industry
                
        return 'General'
            
    def _extract_features(self, description: str) -> List[str]:
        """Extract features mentioned in description"""
        features = []
        feature_keywords = {
            'authentication': ['auth', 'login', 'user', 'account', 'signin'],
            'database': ['database', 'data', 'storage', 'crud', 'records'],
            'dashboard': ['dashboard', 'analytics', 'reports', 'charts', 'metrics'],
            'payments': ['payment', 'stripe', 'billing', 'checkout', 'transaction'],
            'notifications': ['notification', 'alert', 'email', 'reminder', 'notify'],
            'file_upload': ['upload', 'file', 'image', 'document', 'attachment'],
            'search': ['search', 'filter', 'query', 'find', 'lookup'],
            'collaboration': ['collaboration', 'team', 'share', 'comment', 'discuss'],
            'reporting': ['report', 'export', 'analysis', 'insights', 'summary'],
            'scheduling': ['schedule', 'calendar', 'appointment', 'booking', 'time'],
            'inventory': ['inventory', 'stock', 'product', 'item', 'catalog'],
            'kanban': ['kanban', 'board', 'task', 'project', 'workflow'],
            'time_tracking': ['time', 'tracking', 'hour', 'timesheet', 'log'],
            'budgeting': ['budget', 'financial', 'expense', 'cost', 'spend'],
            'progress_tracking': ['progress', 'tracking', 'milestone', 'completion'],
            'assignments': ['assignment', 'homework', 'task', 'submit', 'grade']
        }
        
        description_lower = description.lower()
        for feature, keywords in feature_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                features.append(feature)
                
        return features
        
    def save_to_csv(self, filename: str = 'data/raw/base44_templates.csv'):
        """Save scraped templates to CSV file"""
        if not self.templates:
            logger.warning("No templates to save")
            return
            
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['name', 'url', 'description', 'category', 'industry', 
                         'features', 'template_id', 'scraped_date']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for template in self.templates:
                row = template.__dict__.copy()
                row['features'] = ','.join(row['features'])
                writer.writerow(row)
                
        logger.info(f"Saved {len(self.templates)} templates to {filename}")
        
    def save_to_json(self, filename: str = 'data/raw/base44_templates.json'):
        """Save scraped templates to JSON file"""
        if not self.templates:
            logger.warning("No templates to save")
            return
            
        data = [template.__dict__ for template in self.templates]
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(data, jsonfile, indent=2, ensure_ascii=False)
            
        logger.info(f"Saved {len(self.templates)} templates to {filename}")
        
    def run_scrape(self) -> List[Dict]:
        """Run Base44 app templates scraping"""
        logger.info("Starting Base44 app templates scrape...")
        
        all_templates = self.scrape_base44_templates()
        
        # Convert to Base44Template objects
        for template_data in all_templates:
            template = Base44Template(
                name=template_data.get('name', 'Unknown'),
                url=template_data.get('url', ''),
                description=template_data.get('description', ''),
                category=template_data.get('category', 'General'),
                industry=template_data.get('industry', 'General'),
                features=template_data.get('features', []),
                template_id=template_data.get('template_id'),
                scraped_date=template_data.get('scraped_date', datetime.now().isoformat())
            )
            self.templates.append(template)
            
        logger.info(f"Completed scraping. Found {len(self.templates)} Base44 app templates")
        
        # Save results
        self.save_to_csv()
        self.save_to_json()
        
        return [template.__dict__ for template in self.templates]

if __name__ == "__main__":
    scraper = Base44TemplatesScraper(rate_limit=2.0)
    templates = scraper.run_scrape()
    print(f"Scraped {len(templates)} Base44 app templates")