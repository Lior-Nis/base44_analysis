#!/usr/bin/env python3
"""
Authenticated Base44 Template Scraper with Google OAuth
Scrapes REAL data from https://app.base44.com/app-templates after Google authentication
"""

import json
import csv
import time
import os
from datetime import datetime
from typing import List, Dict, Optional

def get_webdriver():
    """
    Set up WebDriver for authentication and scraping
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        # Chrome options for authentication
        chrome_options = Options()
        # Remove headless mode for authentication
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        # Try to initialize Chrome driver
        try:
            driver = webdriver.Chrome(options=chrome_options)
            print(f"Chrome WebDriver initialized successfully")
            return driver, WebDriverWait, EC, By
        except Exception as e:
            print(f"❌ Chrome driver failed: {e}")
            
        # Try Firefox as fallback
        try:
            from selenium.webdriver.firefox.options import Options as FirefoxOptions
            firefox_options = FirefoxOptions()
            driver = webdriver.Firefox(options=firefox_options)
            print(f"✅ Firefox WebDriver initialized successfully")
            return driver, WebDriverWait, EC, By
        except Exception as e:
            print(f"❌ Firefox driver failed: {e}")
            
        return None, None, None, None
        
    except ImportError as e:
        print(f"❌ Selenium import failed: {e}")
        print("   Please install: pip install selenium")
        return None, None, None, None

def authenticate_with_google(driver, wait, EC, By):
    """
    Handle Google OAuth authentication for Base44
    """
    try:
        print("🔐 Starting Google OAuth authentication...")
        
        # Navigate to Base44 login page
        print("📍 Navigating to Base44...")
        driver.get("https://app.base44.com")
        time.sleep(3)
        
        # Look for sign in / login button
        login_selectors = [
            'button[data-testid*="login"]',
            'button[data-testid*="signin"]',
            'a[href*="login"]',
            'a[href*="signin"]',
            'button:contains("Sign in")',
            'button:contains("Login")',
            '.login-button',
            '.signin-button',
            '[class*="login"]',
            '[class*="signin"]'
        ]
        
        login_clicked = False
        for selector in login_selectors:
            try:
                element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                element.click()
                print(f"✅ Clicked login button: {selector}")
                login_clicked = True
                break
            except:
                continue
                
        if not login_clicked:
            print("⚠️  No login button found, looking for Google sign-in...")
            
        time.sleep(3)
        
        # Look for Google sign-in button
        google_selectors = [
            'button[data-testid*="google"]',
            'button:contains("Google")',
            'button:contains("Continue with Google")',
            'button:contains("Sign in with Google")',
            '[class*="google"]',
            '[data-provider="google"]',
            'a[href*="google"]'
        ]
        
        google_clicked = False
        for selector in google_selectors:
            try:
                element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                element.click()
                print(f"✅ Clicked Google sign-in: {selector}")
                google_clicked = True
                break
            except:
                continue
                
        if not google_clicked:
            print("❌ No Google sign-in button found")
            print("🔍 Current page elements:")
            buttons = driver.find_elements(By.TAG_NAME, "button")
            for i, btn in enumerate(buttons[:10]):  # Show first 10 buttons
                try:
                    text = btn.text.strip() or btn.get_attribute("innerHTML")[:100]
                    print(f"   Button {i}: {text}")
                except:
                    pass
            return False
            
        # Wait for Google OAuth popup or redirect
        print("⏳ Waiting for Google authentication...")
        print("👤 Please complete the Google sign-in in the browser window")
        print("   - Enter your email and password")
        print("   - Complete any 2FA if required")
        print("   - Grant permissions to Base44")
        
        # Wait for authentication to complete (check for redirect back to Base44)
        max_wait_time = 300  # 5 minutes
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            current_url = driver.current_url
            
            # Check if we're back on Base44 and logged in
            if "base44.com" in current_url and "login" not in current_url:
                # Look for signs of being logged in
                try:
                    # Common indicators of being logged in
                    logged_in_indicators = [
                        '[data-testid*="avatar"]',
                        '[data-testid*="profile"]',
                        '.user-menu',
                        '.profile-menu',
                        '[class*="avatar"]',
                        '[class*="profile"]',
                        'button[aria-label*="profile"]',
                        'button[aria-label*="account"]'
                    ]
                    
                    for indicator in logged_in_indicators:
                        if driver.find_elements(By.CSS_SELECTOR, indicator):
                            print("✅ Successfully authenticated with Google!")
                            return True
                            
                except:
                    pass
                    
            time.sleep(2)
            
        print("⏰ Authentication timeout - please check if login completed")
        
        # Ask user to confirm authentication status
        print("\n🤔 AUTHENTICATION STATUS CHECK")
        print("   Look at the browser window:")
        print("   - Are you logged into Base44?")
        print("   - Can you see your profile/avatar?")
        
        user_input = input("   Type 'yes' if authenticated, 'no' if not: ").lower().strip()
        
        if user_input == 'yes':
            print("✅ User confirmed authentication successful")
            return True
        else:
            print("❌ Authentication not completed")
            return False
            
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return False

def extract_template_data(driver, wait, EC, By):
    """
    Extract template data from the authenticated templates page
    """
    try:
        print("📑 Navigating to app templates page...")
        driver.get("https://app.base44.com/app-templates")
        time.sleep(5)
        
        print("🔍 Looking for template elements...")
        
        # Enhanced selectors for templates
        template_selectors = [
            '[data-testid*="template"]',
            '[data-testid*="app"]',
            '.template-card',
            '.app-template',
            '.template-item',
            '[class*="template"]',
            '[class*="card"]',
            'article',
            '.grid > div',
            '[role="article"]',
            '.list-item',
            '.item'
        ]
        
        templates_data = []
        
        for selector in template_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements and len(elements) > 1:  # More than just container
                    print(f"✅ Found {len(elements)} elements with selector: {selector}")
                    
                    for i, element in enumerate(elements):
                        try:
                            # Extract template information
                            template_info = extract_single_template(element)
                            if template_info:
                                template_info['selector_used'] = selector
                                template_info['element_index'] = i
                                templates_data.append(template_info)
                                
                        except Exception as e:
                            print(f"   ⚠️  Error extracting template {i}: {e}")
                            continue
                            
                    if templates_data:
                        break  # Found templates, no need to try other selectors
                        
            except Exception as e:
                print(f"   ❌ Selector {selector}: {e}")
                continue
        
        if not templates_data:
            # Try to get page source for manual analysis
            print("🔍 No templates found with standard selectors")
            print("📄 Analyzing page source...")
            
            page_source = driver.page_source
            
            # Save page source for analysis
            with open('base44_page_source.html', 'w', encoding='utf-8') as f:
                f.write(page_source)
            print("💾 Page source saved to: base44_page_source.html")
            
            # Look for JSON data in page source
            if 'template' in page_source.lower():
                print("✅ Found 'template' mentions in page source")
                # Try to extract JSON data
                import re
                json_pattern = r'({[^{}]*"[^"]*template[^"]*"[^{}]*})'
                matches = re.findall(json_pattern, page_source, re.IGNORECASE)
                
                if matches:
                    print(f"🎯 Found {len(matches)} potential JSON template objects")
                    for i, match in enumerate(matches[:5]):  # Show first 5
                        print(f"   Match {i}: {match[:100]}...")
        
        return templates_data
        
    except Exception as e:
        print(f"❌ Template extraction error: {e}")
        return []

def extract_single_template(element):
    """
    Extract data from a single template element
    """
    try:
        # Get text content
        text_content = element.text.strip()
        
        # Skip if too short (likely not a template)
        if len(text_content) < 20:
            return None
            
        # Extract title (usually in h1, h2, h3, or strong tags)
        title = ""
        title_selectors = ['h1', 'h2', 'h3', 'h4', '[class*="title"]', '[class*="name"]', 'strong']
        for sel in title_selectors:
            try:
                title_elem = element.find_element(By.CSS_SELECTOR, sel)
                title = title_elem.text.strip()
                if title:
                    break
            except:
                continue
        
        # Extract description
        description = ""
        desc_selectors = ['p', '[class*="description"]', '[class*="summary"]', '.text']
        for sel in desc_selectors:
            try:
                desc_elem = element.find_element(By.CSS_SELECTOR, sel)
                desc_text = desc_elem.text.strip()
                if desc_text and len(desc_text) > 20:
                    description = desc_text
                    break
            except:
                continue
        
        # Extract URL/link
        url = ""
        try:
            link_elem = element.find_element(By.CSS_SELECTOR, 'a')
            url = link_elem.get_attribute('href') or ""
        except:
            pass
        
        # Extract any data attributes
        attributes = {}
        try:
            for attr in element.get_property('attributes'):
                if attr['name'].startswith('data-'):
                    attributes[attr['name']] = attr['value']
        except:
            pass
        
        # Create template object
        template_data = {
            'name': title or text_content.split('\n')[0],
            'description': description or text_content,
            'url': url,
            'full_text': text_content,
            'attributes': attributes,
            'scraped_date': datetime.now().isoformat()
        }
        
        # Classify the template
        template_data.update(classify_template(template_data))
        
        return template_data
        
    except Exception as e:
        print(f"❌ Error extracting single template: {e}")
        return None

def classify_template(template_data):
    """
    Classify template category, industry, and features
    """
    text = (template_data.get('name', '') + ' ' + template_data.get('description', '')).lower()
    
    # Category classification
    categories = {
        'Business Management': ['crm', 'customer', 'sales', 'lead', 'business', 'management'],
        'E-commerce': ['ecommerce', 'store', 'shop', 'retail', 'inventory', 'product', 'cart'],
        'Productivity': ['project', 'task', 'kanban', 'productivity', 'workflow', 'todo'],
        'Human Resources': ['hr', 'human resources', 'employee', 'staff', 'personnel', 'hiring'],
        'Finance': ['finance', 'financial', 'budget', 'accounting', 'expense', 'money'],
        'Education': ['learning', 'education', 'course', 'student', 'lms', 'training'],
        'Healthcare': ['health', 'medical', 'patient', 'clinic', 'hospital', 'care'],
        'Events': ['event', 'meeting', 'conference', 'booking', 'calendar', 'appointment'],
        'Operations': ['inventory', 'logistics', 'operations', 'supply', 'warehouse'],
        'Analytics': ['analytics', 'reporting', 'dashboard', 'metrics', 'data', 'insights']
    }
    
    category = 'General'
    for cat, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            category = cat
            break
    
    # Industry classification
    industries = {
        'Tech': ['tech', 'software', 'api', 'developer', 'saas', 'platform'],
        'Retail': ['retail', 'shop', 'store', 'ecommerce', 'product', 'inventory'],
        'Education': ['school', 'education', 'learn', 'student', 'course', 'training'],
        'Healthcare': ['health', 'medical', 'hospital', 'clinic', 'patient', 'care'],
        'Finance': ['finance', 'bank', 'money', 'payment', 'financial', 'accounting'],
        'Corporate': ['corporate', 'enterprise', 'business', 'company', 'organization']
    }
    
    industry = 'General'
    for ind, keywords in industries.items():
        if any(keyword in text for keyword in keywords):
            industry = ind
            break
    
    # Feature extraction
    features = []
    feature_keywords = {
        'authentication': ['auth', 'login', 'user', 'account', 'signin'],
        'database': ['database', 'data', 'storage', 'crud', 'records'],
        'dashboard': ['dashboard', 'analytics', 'reports', 'charts', 'metrics'],
        'payments': ['payment', 'stripe', 'billing', 'checkout', 'transaction'],
        'notifications': ['notification', 'alert', 'email', 'reminder', 'notify'],
        'file_upload': ['upload', 'file', 'image', 'document', 'attachment']
    }
    
    for feature, keywords in feature_keywords.items():
        if any(keyword in text for keyword in keywords):
            features.append(feature)
    
    return {
        'category': category,
        'industry': industry,
        'features': features
    }

def save_templates_data(templates_data):
    """
    Save extracted template data to files
    """
    if not templates_data:
        print("❌ No template data to save")
        return
    
    # Ensure data directory exists
    os.makedirs('data/raw', exist_ok=True)
    
    # Save to JSON
    json_file = 'data/raw/real_base44_templates.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(templates_data, f, indent=2, ensure_ascii=False)
    
    # Save to CSV
    csv_file = 'data/raw/real_base44_templates.csv'
    if templates_data:
        fieldnames = templates_data[0].keys()
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for template in templates_data:
                # Convert lists to strings for CSV
                row = template.copy()
                if 'features' in row and isinstance(row['features'], list):
                    row['features'] = ','.join(row['features'])
                if 'attributes' in row:
                    row['attributes'] = str(row['attributes'])
                writer.writerow(row)
    
    print(f"✅ Saved {len(templates_data)} templates to:")
    print(f"   📄 JSON: {json_file}")
    print(f"   📊 CSV: {csv_file}")

def main():
    """
    Main authenticated scraping function
    """
    print("🚀 AUTHENTICATED BASE44 TEMPLATE SCRAPER")
    print("=" * 60)
    print("🎯 Target: https://app.base44.com/app-templates")
    print("🔐 Authentication: Google OAuth")
    print("🎯 Goal: Extract REAL template data for academic research")
    print("")
    
    # Get WebDriver
    driver, wait, EC, By = get_webdriver()
    
    if not driver:
        print("❌ Cannot initialize WebDriver")
        print("   Please install Chrome or Firefox browser")
        print("   And install chromedriver or geckodriver")
        return None
    
    try:
        # Authenticate with Google
        if not authenticate_with_google(driver, wait, EC, By):
            print("❌ Authentication failed")
            return None
        
        # Extract template data
        templates_data = extract_template_data(driver, wait, EC, By)
        
        if templates_data:
            print(f"🎉 SUCCESS! Extracted {len(templates_data)} real templates")
            save_templates_data(templates_data)
            return templates_data
        else:
            print("❌ No template data extracted")
            print("💡 Check the browser window and page source file for debugging")
            return None
            
    except Exception as e:
        print(f"❌ Scraping error: {e}")
        return None
        
    finally:
        # Keep browser open for debugging if needed
        print("\n🔍 DEBUGGING INFO:")
        print("   Browser window will stay open for 30 seconds")
        print("   You can inspect the page manually")
        print("   Press Ctrl+C to close immediately")
        
        try:
            time.sleep(30)
        except KeyboardInterrupt:
            print("\n⏹️  Interrupted by user")
        
        driver.quit()
        print("🏁 Browser closed")

if __name__ == "__main__":
    print("ACADEMIC INTEGRITY: Collecting REAL Base44 data with authentication")
    print("MANUAL STEP REQUIRED: You will need to complete Google sign-in")
    print("")
    
    # Check if selenium is available
    try:
        import selenium
        print("Selenium is available")
    except ImportError:
        print("Selenium not installed")
        print("   Please run: pip install selenium")
        print("   Also install ChromeDriver or GeckoDriver")
        exit(1)
    
    data = main()
    
    if data:
        print(f"\nSUCCESS: Collected {len(data)} real Base44 templates")
        print("Data ready for academic analysis")
    else:
        print(f"\nDATA COLLECTION INCOMPLETE")
        print("   Check browser window and error messages above")