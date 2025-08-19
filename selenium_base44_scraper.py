#!/usr/bin/env python3
"""
Selenium-based Base44 Template Scraper
Scrapes REAL data from https://app.base44.com/app-templates using browser automation
"""

import json
import csv
import time
from datetime import datetime
from typing import List, Dict, Optional

def get_webdriver():
    """
    Set up WebDriver for different environments
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        # Try different Chrome/Chromium setups
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Run in background
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--remote-debugging-port=9222')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        # Try different driver paths
        driver_paths = [
            '/usr/bin/chromedriver',
            '/usr/local/bin/chromedriver', 
            'chromedriver',
            None  # Let selenium find it
        ]
        
        for driver_path in driver_paths:
            try:
                if driver_path:
                    service = Service(driver_path)
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                else:
                    driver = webdriver.Chrome(options=chrome_options)
                    
                print(f"✅ WebDriver initialized successfully")
                return driver, WebDriverWait, EC, By
                
            except Exception as e:
                print(f"⚠️  Driver path {driver_path} failed: {e}")
                continue
                
        # If Chrome doesn't work, try Firefox
        try:
            from selenium.webdriver.firefox.options import Options as FirefoxOptions
            from selenium.webdriver.firefox.service import Service as FirefoxService
            
            firefox_options = FirefoxOptions()
            firefox_options.add_argument('--headless')
            
            driver = webdriver.Firefox(options=firefox_options)
            print(f"✅ Firefox WebDriver initialized successfully")
            return driver, WebDriverWait, EC, By
            
        except Exception as e:
            print(f"⚠️  Firefox driver failed: {e}")
            
        return None, None, None, None
        
    except ImportError as e:
        print(f"❌ Selenium import failed: {e}")
        return None, None, None, None

def scrape_with_requests_fallback():
    """
    Fallback method using requests + analysis of network calls
    """
    import requests
    
    print("🔍 Trying requests-based approach...")
    
    # Try to find API endpoints by examining network requests
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://app.base44.com/app-templates'
    })
    
    # Common API endpoints to try
    api_endpoints = [
        'https://app.base44.com/api/templates',
        'https://app.base44.com/api/public/templates', 
        'https://api.base44.com/templates',
        'https://app.base44.com/templates.json',
        'https://app.base44.com/api/v1/templates',
    ]
    
    for endpoint in api_endpoints:
        try:
            print(f"🔍 Trying: {endpoint}")
            response = session.get(endpoint, timeout=10)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list) or 'templates' in str(data):
                        print(f"✅ Found API endpoint: {endpoint}")
                        return data
                except:
                    pass
                    
        except Exception as e:
            print(f"   ❌ {endpoint}: {e}")
            continue
    
    print("❌ No API endpoints found")
    return None

def create_manual_data_request():
    """
    If automation fails, provide instructions for manual data collection
    """
    instructions = """
    
    📋 MANUAL DATA COLLECTION INSTRUCTIONS
    =====================================
    
    Since automated scraping is challenging in this environment, you can:
    
    1. 🌐 VISIT THE PAGE MANUALLY:
       - Go to: https://app.base44.com/app-templates
       - Wait for templates to load
       - Right-click → "View Page Source" or press F12
    
    2. 🔍 FIND THE DATA:
       - In Developer Tools, go to Network tab
       - Refresh the page
       - Look for XHR/API calls that load template data
       - Copy the response JSON
    
    3. 💾 SAVE THE DATA:
       - Save the JSON response as 'real_base44_data.json'
       - Place it in the project root directory
    
    4. ✅ RUN ANALYSIS:
       - The analysis will automatically use the real data
    
    OR
    
    🤝 I can help you set up browser automation if you can:
       - Install Chrome/Chromium on your system
       - Or provide access to a system with Chrome
    
    Would you like to try the manual approach first?
    """
    
    return instructions

def main():
    """
    Main scraping function with multiple fallback strategies
    """
    print("🚀 SELENIUM SCRAPER FOR BASE44 TEMPLATES")
    print("=" * 50)
    print("🎯 Target: https://app.base44.com/app-templates")
    print("🎯 Goal: Extract REAL template data for academic research")
    print("")
    
    # Strategy 1: Try Selenium WebDriver
    print("📋 STRATEGY 1: Browser Automation (Selenium)")
    print("-" * 50)
    
    driver, WebDriverWait, EC, By = get_webdriver()
    
    if driver:
        try:
            print("🌐 Loading Base44 templates page...")
            driver.get("https://app.base44.com/app-templates")
            
            # Wait for page to load
            print("⏳ Waiting for templates to load...")
            time.sleep(5)
            
            # Try to find template elements
            wait = WebDriverWait(driver, 10)
            
            # Look for common template selectors
            selectors_to_try = [
                '[data-testid*="template"]',
                '.template-card',
                '.app-template',
                '[class*="template"]',
                '[class*="card"]',
                'article',
                '.grid > div',  # Common for template grids
            ]
            
            templates_found = []
            
            for selector in selectors_to_try:
                try:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        print(f"✅ Found {len(elements)} elements with selector: {selector}")
                        
                        for element in elements:
                            try:
                                # Extract text content
                                text = element.text.strip()
                                html = element.get_attribute('outerHTML')
                                
                                if text and len(text) > 20:  # Meaningful content
                                    templates_found.append({
                                        'selector': selector,
                                        'text': text,
                                        'html': html[:500] + '...' if len(html) > 500 else html
                                    })
                            except:
                                continue
                                
                except Exception as e:
                    print(f"   ❌ Selector {selector}: {e}")
                    continue
            
            if templates_found:
                print(f"🎉 SUCCESS! Found {len(templates_found)} template elements")
                
                # Save raw scraped data
                with open('raw_selenium_data.json', 'w', encoding='utf-8') as f:
                    json.dump(templates_found, f, indent=2, ensure_ascii=False)
                
                print("💾 Raw data saved to: raw_selenium_data.json")
                return templates_found
            else:
                print("❌ No template elements found with Selenium")
                
        except Exception as e:
            print(f"❌ Selenium scraping failed: {e}")
            
        finally:
            driver.quit()
            
    # Strategy 2: Try API endpoints
    print("\n📋 STRATEGY 2: API Discovery")
    print("-" * 50)
    
    api_data = scrape_with_requests_fallback()
    if api_data:
        print("✅ Found data via API!")
        with open('api_data.json', 'w', encoding='utf-8') as f:
            json.dump(api_data, f, indent=2, ensure_ascii=False)
        return api_data
        
    # Strategy 3: Manual collection instructions
    print("\n📋 STRATEGY 3: Manual Collection")
    print("-" * 50)
    
    instructions = create_manual_data_request()
    print(instructions)
    
    # Check if manual data exists
    try:
        with open('real_base44_data.json', 'r', encoding='utf-8') as f:
            manual_data = json.load(f)
        print("✅ Found manually collected data!")
        return manual_data
    except FileNotFoundError:
        print("📁 No manual data file found yet")
        
    return None

if __name__ == "__main__":
    print("🎯 ACADEMIC INTEGRITY: Attempting to collect REAL Base44 data")
    data = main()
    
    if data:
        print(f"\n✅ SUCCESS: Collected real data with {len(data)} items")
    else:
        print(f"\n⚠️  DATA COLLECTION INCOMPLETE")
        print("   Need your help to get real data!")
        print("   See manual instructions above.")