"""
Content Extractor for Base44 Applications
Extracts user-facing textual content from JSX files for NLP analysis and taxonomy creation
"""

import re
import json
from typing import Dict, List, Set, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AppContent:
    """Container for extracted textual content from an application"""
    app_name: str
    
    # Extracted text content
    ui_labels: List[str] = field(default_factory=list)  # Button labels, menu items
    headings: List[str] = field(default_factory=list)  # H1, H2, etc.
    descriptions: List[str] = field(default_factory=list)  # Paragraph text, descriptions
    placeholders: List[str] = field(default_factory=list)  # Input placeholders
    titles: List[str] = field(default_factory=list)  # Page titles, card titles
    error_messages: List[str] = field(default_factory=list)  # Error/success messages
    
    # Semantic content
    feature_keywords: Set[str] = field(default_factory=set)  # Detected feature keywords
    domain_terms: Set[str] = field(default_factory=set)  # Business domain terms
    action_verbs: Set[str] = field(default_factory=set)  # Action-oriented verbs
    
    # Meta information
    readme_content: str = ""  # README.md content if available
    component_names: Set[str] = field(default_factory=set)  # Custom component names
    page_names: Set[str] = field(default_factory=set)  # Page/route names
    
    # Content statistics
    total_text_length: int = 0
    unique_words: int = 0
    files_processed: int = 0
    
    # Categorization hints
    app_category_hints: List[str] = field(default_factory=list)  # Hints about app category
    business_domain: str = ""  # Detected business domain
    complexity_indicators: List[str] = field(default_factory=list)  # Complexity signals

class ContentExtractor:
    """Main content extractor for Base44 applications"""
    
    def __init__(self):
        # Patterns for different types of content
        self.jsx_patterns = {
            'button_text': [
                r'<[Bb]utton[^>]*>([^<]+)</[Bb]utton>',
                r'<button[^>]*>([^<]+)</button>',
                r'<[Aa][^>]*>([^<]+)</[Aa]>',  # Links that might be buttons
            ],
            'headings': [
                r'<h[1-6][^>]*>([^<]+)</h[1-6]>',
                r'<[Tt]itle[^>]*>([^<]+)</[Tt]itle>',
                r'<[Hh]eading[^>]*>([^<]+)</[Hh]eading>',
            ],
            'text_content': [
                r'<p[^>]*>([^<]+)</p>',
                r'<span[^>]*>([^<]+)</span>',
                r'<div[^>]*>([^<]+)</div>',
                r'<label[^>]*>([^<]+)</label>',
            ],
            'placeholders': [
                r'placeholder=["\'](.*?)["\']',
                r'hint=["\'](.*?)["\']',
                r'tooltip=["\'](.*?)["\']',
            ],
            'alt_text': [
                r'alt=["\'](.*?)["\']',
                r'aria-label=["\'](.*?)["\']',
                r'title=["\'](.*?)["\']',
            ]
        }
        
        # Business domain keywords
        self.domain_keywords = {
            'ecommerce': ['shop', 'cart', 'product', 'order', 'payment', 'checkout', 'inventory'],
            'finance': ['budget', 'expense', 'invoice', 'payment', 'finance', 'money', 'transaction'],
            'healthcare': ['patient', 'doctor', 'medical', 'health', 'appointment', 'diagnosis'],
            'education': ['student', 'course', 'lesson', 'grade', 'learning', 'quiz', 'exam'],
            'crm': ['customer', 'lead', 'contact', 'pipeline', 'deal', 'opportunity'],
            'project_management': ['task', 'project', 'team', 'deadline', 'milestone', 'sprint'],
            'social': ['user', 'profile', 'message', 'chat', 'friend', 'social', 'community'],
            'content_management': ['content', 'blog', 'article', 'publish', 'editor', 'cms'],
            'analytics': ['dashboard', 'metrics', 'analytics', 'report', 'chart', 'data'],
            'ai_tools': ['ai', 'machine learning', 'predict', 'model', 'algorithm', 'neural']
        }
        
        # Feature keywords
        self.feature_keywords = {
            'authentication': ['login', 'register', 'auth', 'signup', 'signin', 'logout'],
            'data_management': ['create', 'read', 'update', 'delete', 'crud', 'database'],
            'user_interface': ['button', 'form', 'input', 'menu', 'navigation', 'modal'],
            'collaboration': ['share', 'collaborate', 'team', 'invite', 'permission'],
            'notifications': ['notify', 'alert', 'message', 'notification', 'email'],
            'search': ['search', 'filter', 'sort', 'find', 'query'],
            'file_management': ['upload', 'download', 'file', 'document', 'attachment'],
            'reporting': ['report', 'export', 'print', 'pdf', 'excel', 'csv'],
            'real_time': ['live', 'real-time', 'realtime', 'sync', 'websocket'],
            'mobile': ['responsive', 'mobile', 'tablet', 'touch', 'swipe']
        }
        
        # Action verbs that indicate app functionality
        self.action_verbs = {
            'create', 'add', 'new', 'build', 'generate', 'make',
            'edit', 'update', 'modify', 'change', 'customize',
            'delete', 'remove', 'cancel', 'clear',
            'save', 'submit', 'send', 'upload', 'download',
            'view', 'show', 'display', 'preview', 'browse',
            'search', 'find', 'filter', 'sort', 'query',
            'share', 'invite', 'collaborate', 'publish',
            'manage', 'organize', 'track', 'monitor', 'analyze'
        }
        
        # Complexity indicators
        self.complexity_indicators = {
            'advanced_ui': ['dashboard', 'chart', 'graph', 'visualization', 'calendar'],
            'integrations': ['api', 'webhook', 'integration', 'connector', 'sync'],
            'automation': ['workflow', 'automation', 'trigger', 'scheduled', 'batch'],
            'customization': ['theme', 'customizable', 'configuration', 'settings', 'preferences'],
            'enterprise': ['enterprise', 'admin', 'role', 'permission', 'audit', 'compliance']
        }
    
    def extract_application_content(self, app_path: str, app_name: str = None) -> AppContent:
        """
        Extract textual content from a Base44 application
        
        Args:
            app_path: Path to the application directory
            app_name: Name of the application (derived from path if not provided)
            
        Returns:
            AppContent object with extracted textual content
        """
        if app_name is None:
            app_name = Path(app_path).name
        
        content = AppContent(app_name=app_name)
        app_path_obj = Path(app_path)
        
        if not app_path_obj.exists():
            logger.error(f"Application path {app_path} does not exist")
            return content
        
        # Extract README content
        self._extract_readme_content(app_path_obj, content)
        
        # Extract content from source files
        src_path = app_path_obj / "src"
        if src_path.exists():
            self._extract_source_content(src_path, content)
        
        # Analyze and categorize content
        self._analyze_content(content)
        
        logger.info(f"Extracted content from {content.app_name}: {len(content.ui_labels)} labels, "
                   f"{len(content.headings)} headings, {content.total_text_length} chars")
        return content
    
    def _extract_readme_content(self, app_path: Path, content: AppContent):
        """Extract content from README.md file"""
        readme_path = app_path / "README.md"
        
        if readme_path.exists():
            try:
                with open(readme_path, 'r', encoding='utf-8') as f:
                    content.readme_content = f.read()
                    
                # Extract title from README (usually first heading)
                title_match = re.search(r'^#\s+(.+)$', content.readme_content, re.MULTILINE)
                if title_match:
                    content.titles.append(title_match.group(1).strip())
                    
                # Extract description paragraphs
                paragraphs = re.findall(r'^([A-Z][^#\n]*(?:\n(?![#\-*])[^#\n]*)*)', 
                                      content.readme_content, re.MULTILINE)
                content.descriptions.extend([p.strip() for p in paragraphs if len(p.strip()) > 20])
                
            except (FileNotFoundError, UnicodeDecodeError) as e:
                logger.warning(f"Could not read README for {content.app_name}: {e}")
    
    def _extract_source_content(self, src_path: Path, content: AppContent):
        """Extract content from all source files"""
        # Find all JSX/JS files
        js_files = list(src_path.rglob("*.js")) + list(src_path.rglob("*.jsx"))
        
        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                
                self._extract_file_content(file_content, file_path, content)
                content.files_processed += 1
                
            except (FileNotFoundError, UnicodeDecodeError) as e:
                logger.warning(f"Could not read file {file_path}: {e}")
    
    def _extract_file_content(self, file_content: str, file_path: Path, content: AppContent):
        """Extract content from a single file"""
        
        # Extract component name from filename
        component_name = file_path.stem
        if component_name not in ['index', 'App', 'main']:
            content.component_names.add(component_name)
        
        # Extract page names (from pages directory)
        if 'pages' in file_path.parts:
            content.page_names.add(component_name)
        
        # Extract different types of text content using regex patterns
        for content_type, patterns in self.jsx_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, file_content, re.DOTALL | re.IGNORECASE)
                
                for match in matches:
                    text = self._clean_text(match)
                    if text and len(text.strip()) > 1:
                        
                        if content_type == 'button_text':
                            content.ui_labels.append(text)
                        elif content_type == 'headings':
                            content.headings.append(text)
                        elif content_type == 'text_content':
                            # Filter out single words and very short text
                            if len(text.strip()) > 5 and ' ' in text.strip():
                                content.descriptions.append(text)
                        elif content_type == 'placeholders':
                            content.placeholders.append(text)
                        elif content_type == 'alt_text':
                            content.descriptions.append(text)
        
        # Extract string literals that might be user-facing text
        string_literals = re.findall(r'["\']([^"\']{3,50})["\']', file_content)
        for literal in string_literals:
            cleaned = self._clean_text(literal)
            if self._is_user_facing_text(cleaned):
                content.descriptions.append(cleaned)
        
        # Extract error/success messages
        error_patterns = [
            r'error["\']:\s*["\']([^"\']+)["\']',
            r'message["\']:\s*["\']([^"\']+)["\']',
            r'alert\(["\']([^"\']+)["\']',
            r'toast\(["\']([^"\']+)["\']',
        ]
        
        for pattern in error_patterns:
            matches = re.findall(pattern, file_content, re.IGNORECASE)
            for match in matches:
                text = self._clean_text(match)
                if text and len(text) > 5:
                    content.error_messages.append(text)
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text by removing JSX artifacts and extra whitespace"""
        if not text:
            return ""
        
        # Remove JSX expressions and variables
        text = re.sub(r'\{[^}]*\}', '', text)
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Clean whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common JSX artifacts
        text = re.sub(r'className=.*$', '', text)
        text = re.sub(r'style=.*$', '', text)
        
        return text.strip()
    
    def _is_user_facing_text(self, text: str) -> bool:
        """Heuristic to determine if text is likely user-facing"""
        if not text or len(text) < 3:
            return False
        
        # Filter out code-like strings
        if any(char in text for char in ['{', '}', '(', ')', ';', '=']):
            return False
        
        # Filter out file paths and URLs
        if any(pattern in text.lower() for pattern in ['http', 'www', '.com', '.js', '/', '\\']):
            return False
        
        # Filter out common non-user-facing strings
        non_user_patterns = [
            r'^[a-z_]+$',  # snake_case variables
            r'^[A-Z_]+$',  # CONSTANTS
            r'^\d+$',      # numbers only
            r'^#[0-9a-f]+$',  # hex colors
        ]
        
        for pattern in non_user_patterns:
            if re.match(pattern, text):
                return False
        
        # Keep text that looks like user-facing content
        return True
    
    def _analyze_content(self, content: AppContent):
        """Analyze extracted content to derive insights"""
        
        # Combine all text for analysis
        all_text = ' '.join([
            *content.ui_labels,
            *content.headings,
            *content.descriptions,
            *content.placeholders,
            *content.titles,
            *content.error_messages,
            content.readme_content
        ]).lower()
        
        content.total_text_length = len(all_text)
        
        # Count unique words
        words = re.findall(r'\b\w+\b', all_text)
        content.unique_words = len(set(words))
        
        # Detect feature keywords
        for feature_type, keywords in self.feature_keywords.items():
            for keyword in keywords:
                if keyword in all_text:
                    content.feature_keywords.add(keyword)
        
        # Detect domain terms and classify business domain
        domain_scores = {}
        for domain, keywords in self.domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in all_text)
            if score > 0:
                domain_scores[domain] = score
                content.domain_terms.update([kw for kw in keywords if kw in all_text])
        
        # Assign primary business domain
        if domain_scores:
            content.business_domain = max(domain_scores.keys(), key=domain_scores.get)
        
        # Detect action verbs
        for verb in self.action_verbs:
            if verb in all_text:
                content.action_verbs.add(verb)
        
        # Detect complexity indicators
        for complexity_type, indicators in self.complexity_indicators.items():
            for indicator in indicators:
                if indicator in all_text:
                    content.complexity_indicators.append(indicator)
        
        # Generate category hints based on content analysis
        self._generate_category_hints(content)
    
    def _generate_category_hints(self, content: AppContent):
        """Generate hints about the application category based on content analysis"""
        
        # Business domain hints
        if content.business_domain:
            content.app_category_hints.append(f"business_domain:{content.business_domain}")
        
        # Feature-based hints
        feature_groups = {
            'dashboard_app': ['dashboard', 'analytics', 'chart', 'metrics'],
            'crud_app': ['create', 'update', 'delete', 'manage'],
            'social_app': ['user', 'profile', 'message', 'chat'],
            'ecommerce_app': ['product', 'cart', 'order', 'payment'],
            'content_app': ['content', 'blog', 'article', 'publish'],
            'tool_app': ['generate', 'convert', 'calculate', 'process']
        }
        
        for category, keywords in feature_groups.items():
            if any(kw in content.feature_keywords for kw in keywords):
                content.app_category_hints.append(category)
        
        # Complexity-based hints
        if len(content.complexity_indicators) > 5:
            content.app_category_hints.append('high_complexity')
        elif len(content.complexity_indicators) > 2:
            content.app_category_hints.append('medium_complexity')
        else:
            content.app_category_hints.append('simple_app')
    
    def extract_multiple_applications(self, base_path: str) -> List[AppContent]:
        """Extract content from multiple applications"""
        base_path_obj = Path(base_path)
        contents = []
        
        if not base_path_obj.exists():
            logger.error(f"Base path {base_path} does not exist")
            return contents
        
        for app_dir in base_path_obj.iterdir():
            if app_dir.is_dir() and not app_dir.name.startswith('.'):
                content = self.extract_application_content(str(app_dir), app_dir.name)
                contents.append(content)
        
        logger.info(f"Extracted content from {len(contents)} applications")
        return contents
    
    def export_content(self, contents: List[AppContent], output_path: str):
        """Export extracted content to JSON file for NLP processing"""
        output_data = []
        
        for content in contents:
            content_dict = {
                'app_name': content.app_name,
                'ui_labels': content.ui_labels,
                'headings': content.headings,
                'descriptions': content.descriptions,
                'placeholders': content.placeholders,
                'titles': content.titles,
                'error_messages': content.error_messages,
                'feature_keywords': list(content.feature_keywords),
                'domain_terms': list(content.domain_terms),
                'action_verbs': list(content.action_verbs),
                'readme_content': content.readme_content,
                'component_names': list(content.component_names),
                'page_names': list(content.page_names),
                'total_text_length': content.total_text_length,
                'unique_words': content.unique_words,
                'files_processed': content.files_processed,
                'app_category_hints': content.app_category_hints,
                'business_domain': content.business_domain,
                'complexity_indicators': content.complexity_indicators
            }
            output_data.append(content_dict)
        
        # Create output directory if needed
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
        
        logger.info(f"Exported content from {len(contents)} applications to {output_path}")
        
        # Also create a simplified version for LDA processing
        lda_data = []
        for content in contents:
            # Combine all textual content for topic modeling
            combined_text = ' '.join([
                *content.titles,
                *content.headings,
                *content.ui_labels,
                *content.descriptions,
                ' '.join(content.feature_keywords),
                ' '.join(content.domain_terms)
            ])
            
            lda_data.append({
                'app_name': content.app_name,
                'combined_text': combined_text,
                'business_domain': content.business_domain,
                'category_hints': content.app_category_hints
            })
        
        lda_path = output_path.replace('.json', '_lda.json')
        with open(lda_path, 'w', encoding='utf-8') as f:
            json.dump(lda_data, f, indent=2)
        
        logger.info(f"Exported LDA-ready data to {lda_path}")


def main():
    """Test the content extractor"""
    extractor = ContentExtractor()
    
    # Test with a single application
    test_app = "data/raw/task-flow-copy-ae9098a3"
    
    if Path(test_app).exists():
        content = extractor.extract_application_content(test_app)
        
        print(f"Content Analysis for {content.app_name}:")
        print(f"  UI Labels: {content.ui_labels[:5]}...")  # First 5
        print(f"  Headings: {content.headings[:3]}...")
        print(f"  Feature Keywords: {list(content.feature_keywords)}")
        print(f"  Business Domain: {content.business_domain}")
        print(f"  Category Hints: {content.app_category_hints}")
        print(f"  Page Names: {list(content.page_names)}")
        print(f"  Total Text Length: {content.total_text_length}")
        print(f"  Unique Words: {content.unique_words}")
        print(f"  Files Processed: {content.files_processed}")
    else:
        print(f"Test application {test_app} not found")


if __name__ == "__main__":
    main()