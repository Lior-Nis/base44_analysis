"""
Enhanced Regex-based Code Analyzer for Base44 Applications
Fallback implementation when Tree-sitter is unavailable, but still comprehensive
"""

import os
import json
import re
# Use built-in statistics instead of numpy for compatibility
import statistics
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field, asdict
from pathlib import Path
import logging
from collections import defaultdict, Counter
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EnhancedComponentMetrics:
    """Comprehensive metrics using regex-based analysis"""
    # Basic identification
    file_path: str
    component_name: str = ""
    file_hash: str = ""
    
    # Code structure metrics
    total_lines: int = 0
    code_lines: int = 0
    comment_lines: int = 0
    blank_lines: int = 0
    jsx_lines: int = 0
    
    # Import analysis
    total_imports: int = 0
    base44_imports: List[str] = field(default_factory=list)
    third_party_imports: List[str] = field(default_factory=list)
    local_imports: List[str] = field(default_factory=list)
    ui_library_imports: List[str] = field(default_factory=list)
    
    # Component usage patterns
    jsx_components_used: Set[str] = field(default_factory=set)
    base44_components_used: Set[str] = field(default_factory=set)
    custom_components: Set[str] = field(default_factory=set)
    html_elements: Set[str] = field(default_factory=set)
    
    # React patterns
    hooks_used: Dict[str, int] = field(default_factory=dict)
    total_hooks: int = 0
    custom_hooks: List[str] = field(default_factory=list)
    state_variables: int = 0
    effect_hooks: int = 0
    
    # JSX complexity
    jsx_elements_count: int = 0
    jsx_attributes_count: int = 0
    jsx_conditional_rendering: int = 0
    jsx_loops: int = 0
    jsx_fragments: int = 0
    
    # Function analysis
    function_count: int = 0
    arrow_functions: int = 0
    async_functions: int = 0
    named_functions: int = 0
    
    # Complexity metrics
    cyclomatic_complexity: int = 0
    nesting_depth: int = 0
    conditional_statements: int = 0
    loops: int = 0
    
    # API patterns
    api_calls: int = 0
    fetch_calls: int = 0
    base44_api_usage: Dict[str, int] = field(default_factory=dict)
    
    # Data structures
    object_literals: int = 0
    array_literals: int = 0
    destructuring_patterns: int = 0
    
    # Code quality indicators
    console_logs: int = 0
    todo_comments: int = 0
    magic_numbers: int = 0
    try_catch_blocks: int = 0
    
    # Event handling
    event_handlers: int = 0
    onclick_handlers: int = 0
    form_handlers: int = 0
    
    # Styling patterns
    inline_styles: int = 0
    css_classes: int = 0
    styled_components: int = 0
    
    # Props patterns
    props_usage: int = 0
    props_destructuring: int = 0
    default_props: int = 0
    
    # String and text analysis
    string_literals: List[str] = field(default_factory=list)
    template_literals: int = 0
    
    # Performance patterns
    memo_usage: int = 0
    usecallback_usage: int = 0
    usememo_usage: int = 0
    
    # Error handling
    error_boundaries: int = 0
    
    # Analysis metadata
    analysis_timestamp: str = ""
    analysis_errors: List[str] = field(default_factory=list)

class RegexCodeAnalyzer:
    """Enhanced regex-based code analyzer for JavaScript/JSX files"""
    
    def __init__(self):
        # Pattern definitions
        self.react_hooks = {
            'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
            'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
            'useDebugValue', 'useId', 'useTransition', 'useDeferredValue'
        }
        
        self.base44_patterns = {
            '@base44/sdk', 'base44', 'sdk', '@/api/entities', '@/api', '@base44',
            'base44Client', 'entities', 'integrations'
        }
        
        self.ui_libraries = {
            'radix-ui', '@radix-ui', 'shadcn', 'lucide-react', 'react-hook-form',
            'sonner', 'recharts', 'framer-motion', '@/components/ui'
        }
        
        # Compiled regex patterns for performance
        self._compile_patterns()
        
        # Cache for analysis results
        self.cache = {}
    
    def _compile_patterns(self):
        """Pre-compile regex patterns for better performance"""
        self.patterns = {
            'import_statement': re.compile(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', re.MULTILINE),
            'import_names': re.compile(r'import\s+(.*?)\s+from'),
            'jsx_element': re.compile(r'<(\w+)', re.MULTILINE),
            'jsx_self_closing': re.compile(r'<(\w+)[^>]*/?>', re.MULTILINE),
            'jsx_attributes': re.compile(r'(\w+)=\{[^}]*\}|(\w+)="[^"]*"', re.MULTILINE),
            'jsx_conditional': re.compile(r'\{[^}]*\?[^}]*:[^}]*\}|\{[^}]*&&[^}]*\}', re.MULTILINE),
            'jsx_loop': re.compile(r'\.map\s*\(', re.MULTILINE),
            'function_declaration': re.compile(r'function\s+(\w+)\s*\(', re.MULTILINE),
            'arrow_function': re.compile(r'=>', re.MULTILINE),
            'async_function': re.compile(r'async\s+', re.MULTILINE),
            'hook_usage': re.compile(r'(use\w+)\s*\(', re.MULTILINE),
            'api_call': re.compile(r'fetch\s*\(|axios\.|\.get\(|\.post\(|\.put\(|\.delete\(', re.MULTILINE),
            'console_log': re.compile(r'console\.(log|warn|error|info)', re.MULTILINE),
            'todo_comment': re.compile(r'//.*TODO|/\*.*TODO.*\*/', re.IGNORECASE | re.MULTILINE),
            'try_catch': re.compile(r'try\s*\{', re.MULTILINE),
            'object_literal': re.compile(r'\{[^{}]*\}', re.MULTILINE),
            'array_literal': re.compile(r'\[[^\[\]]*\]', re.MULTILINE),
            'destructuring': re.compile(r'const\s*\{[^}]+\}\s*=|const\s*\[[^\]]+\]\s*=', re.MULTILINE),
            'string_literal': re.compile(r'["\']([^"\']*)["\']', re.MULTILINE),
            'template_literal': re.compile(r'`([^`]*)`', re.MULTILINE),
            'event_handler': re.compile(r'on\w+\s*=', re.IGNORECASE | re.MULTILINE),
            'inline_style': re.compile(r'style\s*=\s*\{', re.MULTILINE),
            'css_class': re.compile(r'className\s*=', re.MULTILINE),
            'magic_number': re.compile(r'\b\d{2,}\b', re.MULTILINE)
        }
    
    def analyze_component(self, file_path: str, content: str) -> EnhancedComponentMetrics:
        """Comprehensive regex-based analysis of a component"""
        # Check cache
        file_hash = hashlib.md5(content.encode()).hexdigest()
        cache_key = f"{file_path}:{file_hash}"
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        metrics = EnhancedComponentMetrics(
            file_path=file_path,
            file_hash=file_hash,
            analysis_timestamp=datetime.now().isoformat()
        )
        
        try:
            # Basic line analysis
            self._analyze_lines(content, metrics)
            
            # Import analysis
            self._analyze_imports(content, metrics)
            
            # JSX analysis
            self._analyze_jsx_patterns(content, metrics)
            
            # React patterns
            self._analyze_react_patterns(content, metrics)
            
            # Function analysis
            self._analyze_functions(content, metrics)
            
            # Complexity analysis
            self._analyze_complexity(content, metrics)
            
            # API patterns
            self._analyze_api_patterns(content, metrics)
            
            # Data structures
            self._analyze_data_structures(content, metrics)
            
            # Code quality
            self._analyze_code_quality(content, metrics)
            
            # String analysis
            self._analyze_strings(content, metrics)
            
            # Performance patterns
            self._analyze_performance_patterns(content, metrics)
            
            # Component type detection
            self._detect_component_type(content, metrics)
            
            # Calculate derived metrics
            self._calculate_derived_metrics(metrics)
            
        except Exception as e:
            error_msg = f"Analysis error for {file_path}: {str(e)}"
            metrics.analysis_errors.append(error_msg)
            logger.warning(error_msg)
        
        # Cache the result
        self.cache[cache_key] = metrics
        return metrics
    
    def _analyze_lines(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze different types of lines"""
        lines = content.splitlines()
        metrics.total_lines = len(lines)
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                metrics.blank_lines += 1
            elif stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
                metrics.comment_lines += 1
            elif any(jsx_indicator in stripped for jsx_indicator in ['<', '/>', 'jsx', 'return (']):
                metrics.jsx_lines += 1
                metrics.code_lines += 1
            else:
                metrics.code_lines += 1
    
    def _analyze_imports(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze import statements"""
        import_matches = self.patterns['import_statement'].findall(content)
        metrics.total_imports = len(import_matches)
        
        for source in import_matches:
            # Extract imported names
            import_line = [line for line in content.split('\n') if f'from "{source}"' in line or f"from '{source}'" in line]
            imported_names = []
            
            if import_line:
                name_match = self.patterns['import_names'].search(import_line[0])
                if name_match:
                    import_clause = name_match.group(1).strip()
                    
                    # Handle different import styles
                    if '{' in import_clause:
                        # Named imports
                        named_part = re.findall(r'\{([^}]+)\}', import_clause)[0]
                        imported_names = [name.strip() for name in named_part.split(',')]
                    elif import_clause and not import_clause.startswith('*'):
                        # Default import
                        imported_names = [import_clause.strip()]
            
            # Categorize imports
            if any(pattern in source for pattern in self.base44_patterns):
                metrics.base44_imports.extend(imported_names)
            elif any(ui_lib in source for ui_lib in self.ui_libraries):
                metrics.ui_library_imports.extend(imported_names)
            elif source.startswith('.') or source.startswith('/') or source.startswith('@/'):
                metrics.local_imports.extend(imported_names)
            else:
                metrics.third_party_imports.extend(imported_names)
    
    def _analyze_jsx_patterns(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze JSX elements and patterns"""
        # JSX elements
        jsx_elements = self.patterns['jsx_element'].findall(content)
        jsx_self_closing = self.patterns['jsx_self_closing'].findall(content)
        
        all_elements = jsx_elements + jsx_self_closing
        metrics.jsx_elements_count = len(all_elements)
        
        # Categorize elements
        for element in all_elements:
            if element[0].isupper():
                # React component
                metrics.jsx_components_used.add(element)
                if element in metrics.base44_imports:
                    metrics.base44_components_used.add(element)
                else:
                    metrics.custom_components.add(element)
            else:
                # HTML element
                metrics.html_elements.add(element)
        
        # JSX attributes
        attributes = self.patterns['jsx_attributes'].findall(content)
        metrics.jsx_attributes_count = len(attributes)
        
        # Conditional rendering
        conditionals = self.patterns['jsx_conditional'].findall(content)
        metrics.jsx_conditional_rendering = len(conditionals)
        
        # JSX loops (map functions)
        loops = self.patterns['jsx_loop'].findall(content)
        metrics.jsx_loops = len(loops)
        
        # Fragments
        fragments = content.count('<>') + content.count('<React.Fragment>')
        metrics.jsx_fragments = fragments
    
    def _analyze_react_patterns(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze React hooks and patterns"""
        hook_matches = self.patterns['hook_usage'].findall(content)
        
        for hook in hook_matches:
            if hook in self.react_hooks:
                metrics.hooks_used[hook] = metrics.hooks_used.get(hook, 0) + 1
                metrics.total_hooks += 1
                
                # Special hook analysis
                if hook == 'useState':
                    metrics.state_variables += 1
                elif hook in ['useEffect', 'useLayoutEffect']:
                    metrics.effect_hooks += 1
            elif hook.startswith('use') and hook[3:4].isupper():
                metrics.custom_hooks.append(hook)
    
    def _analyze_functions(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze function patterns"""
        # Named functions
        named_functions = self.patterns['function_declaration'].findall(content)
        metrics.named_functions = len(named_functions)
        
        # Arrow functions
        arrow_functions = self.patterns['arrow_function'].findall(content)
        metrics.arrow_functions = len(arrow_functions)
        
        # Async functions
        async_functions = self.patterns['async_function'].findall(content)
        metrics.async_functions = len(async_functions)
        
        metrics.function_count = metrics.named_functions + metrics.arrow_functions
        
        # Detect component name
        if named_functions:
            # Look for capitalized function names (likely components)
            for func_name in named_functions:
                if func_name[0].isupper():
                    metrics.component_name = func_name
                    break
    
    def _analyze_complexity(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze code complexity"""
        # Conditional statements
        if_statements = len(re.findall(r'\bif\s*\(', content))
        switch_statements = len(re.findall(r'\bswitch\s*\(', content))
        conditional_expressions = len(re.findall(r'\?.*:', content))
        
        metrics.conditional_statements = if_statements + switch_statements + conditional_expressions
        
        # Loops
        for_loops = len(re.findall(r'\bfor\s*\(', content))
        while_loops = len(re.findall(r'\bwhile\s*\(', content))
        
        metrics.loops = for_loops + while_loops
        
        # Cyclomatic complexity (simplified)
        metrics.cyclomatic_complexity = 1 + metrics.conditional_statements + metrics.loops
        
        # Nesting depth (approximate by counting nested braces)
        max_nesting = 0
        current_nesting = 0
        
        for char in content:
            if char == '{':
                current_nesting += 1
                max_nesting = max(max_nesting, current_nesting)
            elif char == '}':
                current_nesting = max(0, current_nesting - 1)
        
        metrics.nesting_depth = max_nesting
    
    def _analyze_api_patterns(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze API usage patterns"""
        api_calls = self.patterns['api_call'].findall(content)
        metrics.api_calls = len(api_calls)
        
        # Specific API call types
        metrics.fetch_calls = content.count('fetch(')
        
        # Base44 API usage
        for pattern in self.base44_patterns:
            if pattern in content:
                # Look for method calls on Base44 objects
                base44_calls = re.findall(f'{re.escape(pattern)}\\.([\\w]+)', content)
                for method in base44_calls:
                    metrics.base44_api_usage[method] = metrics.base44_api_usage.get(method, 0) + 1
    
    def _analyze_data_structures(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze data structure usage"""
        # Object literals
        objects = self.patterns['object_literal'].findall(content)
        metrics.object_literals = len(objects)
        
        # Array literals
        arrays = self.patterns['array_literal'].findall(content)
        metrics.array_literals = len(arrays)
        
        # Destructuring
        destructuring = self.patterns['destructuring'].findall(content)
        metrics.destructuring_patterns = len(destructuring)
        
        # Props patterns
        props_usage = content.count('props.') + content.count('props[')
        metrics.props_usage = props_usage
        
        # Props destructuring (in function parameters)
        props_destructuring = len(re.findall(r'function\s+\w+\s*\(\s*\{[^}]+\}', content))
        props_destructuring += len(re.findall(r'=>\s*\(\s*\{[^}]+\}', content))
        metrics.props_destructuring = props_destructuring
    
    def _analyze_code_quality(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze code quality indicators"""
        # Console logs
        console_matches = self.patterns['console_log'].findall(content)
        metrics.console_logs = len(console_matches)
        
        # TODO comments
        todo_matches = self.patterns['todo_comment'].findall(content)
        metrics.todo_comments = len(todo_matches)
        
        # Try-catch blocks
        try_catch_matches = self.patterns['try_catch'].findall(content)
        metrics.try_catch_blocks = len(try_catch_matches)
        
        # Magic numbers
        magic_numbers = self.patterns['magic_number'].findall(content)
        # Filter out common non-magic numbers
        filtered_magic = [num for num in magic_numbers if num not in ['100', '200', '300', '400', '500']]
        metrics.magic_numbers = len(filtered_magic)
        
        # Event handlers
        event_handlers = self.patterns['event_handler'].findall(content)
        metrics.event_handlers = len(event_handlers)
        
        # Specific event types
        metrics.onclick_handlers = content.count('onClick=')
        metrics.form_handlers = content.count('onSubmit=') + content.count('onChange=')
        
        # Styling patterns
        inline_styles = self.patterns['inline_style'].findall(content)
        metrics.inline_styles = len(inline_styles)
        
        css_classes = self.patterns['css_class'].findall(content)
        metrics.css_classes = len(css_classes)
        
        # Styled components
        styled_components = content.count('styled.') + content.count('styled(')
        metrics.styled_components = styled_components
    
    def _analyze_strings(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze string literals and templates"""
        # String literals
        string_matches = self.patterns['string_literal'].findall(content)
        metrics.string_literals = string_matches[:50]  # Limit for memory
        
        # Template literals
        template_matches = self.patterns['template_literal'].findall(content)
        metrics.template_literals = len(template_matches)
    
    def _analyze_performance_patterns(self, content: str, metrics: EnhancedComponentMetrics):
        """Analyze performance-related patterns"""
        # Memo usage
        metrics.memo_usage = content.count('React.memo') + content.count('memo(')
        
        # useCallback usage
        metrics.usecallback_usage = content.count('useCallback(')
        
        # useMemo usage
        metrics.usememo_usage = content.count('useMemo(')
    
    def _detect_component_type(self, content: str, metrics: EnhancedComponentMetrics):
        """Detect the type of React component"""
        if 'class ' in content and 'extends' in content:
            metrics.component_name = re.search(r'class\s+(\w+)', content).group(1) if re.search(r'class\s+(\w+)', content) else "UnknownClass"
        elif 'function ' in content:
            func_match = re.search(r'function\s+(\w+)', content)
            if func_match and func_match.group(1)[0].isupper():
                metrics.component_name = func_match.group(1)
        elif '=>' in content and any(hook in content for hook in self.react_hooks):
            # Likely a functional component with arrow function
            const_match = re.search(r'const\s+(\w+)\s*=', content)
            if const_match and const_match.group(1)[0].isupper():
                metrics.component_name = const_match.group(1)
    
    def _calculate_derived_metrics(self, metrics: EnhancedComponentMetrics):
        """Calculate derived metrics"""
        # Component complexity score
        complexity_score = (
            metrics.cyclomatic_complexity * 1.0 +
            metrics.nesting_depth * 0.5 +
            metrics.jsx_elements_count * 0.1 +
            len(metrics.hooks_used) * 0.3 +
            metrics.api_calls * 0.2
        )
        
        # Store as a simple attribute (can be added to dataclass if needed)
        setattr(metrics, 'complexity_score', complexity_score)
    
    def batch_analyze_directory(self, directory_path: str, 
                               file_extensions: List[str] = ['.jsx', '.js', '.tsx', '.ts']) -> List[EnhancedComponentMetrics]:
        """Analyze all files in a directory"""
        results = []
        dir_path = Path(directory_path)
        
        if not dir_path.exists():
            logger.error(f"Directory {directory_path} does not exist")
            return results
        
        # Find all relevant files
        files_to_analyze = []
        for ext in file_extensions:
            files_to_analyze.extend(dir_path.rglob(f"*{ext}"))
        
        logger.info(f"Found {len(files_to_analyze)} files to analyze in {directory_path}")
        
        # Analyze files with threading
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_file = {}
            
            for file_path in files_to_analyze:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    future = executor.submit(self.analyze_component, str(file_path), content)
                    future_to_file[future] = file_path
                    
                except Exception as e:
                    logger.warning(f"Could not read {file_path}: {e}")
            
            for future in as_completed(future_to_file):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"Analysis failed for {future_to_file[future]}: {e}")
        
        logger.info(f"Successfully analyzed {len(results)} files")
        return results
    
    def batch_analyze_templates(self, templates_dir: str, output_file: str = None) -> Dict[str, Any]:
        """Analyze all Base44 templates in the directory"""
        results = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'analyzer_type': 'regex_based',
                'total_templates': 0,
                'successful_analyses': 0,
                'failed_analyses': 0
            },
            'templates': {},
            'aggregated_metrics': {}
        }
        
        # Find template directories
        templates_path = Path(templates_dir)
        template_dirs = [d for d in templates_path.iterdir() 
                        if d.is_dir() and ('copy' in d.name or 'template' in d.name)]
        
        results['analysis_metadata']['total_templates'] = len(template_dirs)
        logger.info(f"Starting analysis of {len(template_dirs)} templates...")
        
        for i, template_dir in enumerate(template_dirs, 1):
            template_name = template_dir.name
            logger.info(f"Analyzing template {i}/{len(template_dirs)}: {template_name}")
            
            try:
                # Analyze all files in the template
                component_analyses = self.batch_analyze_directory(str(template_dir))
                
                # Aggregate template-level metrics
                template_summary = self._create_template_summary(template_name, component_analyses)
                results['templates'][template_name] = template_summary
                results['analysis_metadata']['successful_analyses'] += 1
                
            except Exception as e:
                logger.error(f"Failed to analyze template {template_name}: {e}")
                results['analysis_metadata']['failed_analyses'] += 1
        
        # Generate cross-template insights
        self._generate_cross_template_insights(results)
        
        # Save results
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            logger.info(f"Results saved to {output_file}")
        
        return results
    
    def _create_template_summary(self, template_name: str, analyses: List[EnhancedComponentMetrics]) -> Dict[str, Any]:
        """Create summary metrics for a template"""
        if not analyses:
            return {'error': 'No files analyzed'}
        
        summary = {
            'template_name': template_name,
            'total_files': len(analyses),
            'total_lines': sum(a.total_lines for a in analyses),
            'total_components': len([a for a in analyses if a.component_name]),
            
            # Aggregated complexity
            'average_complexity': statistics.mean([getattr(a, 'complexity_score', 0) for a in analyses]) if analyses else 0,
            'total_jsx_elements': sum(a.jsx_elements_count for a in analyses),
            'total_hooks': sum(a.total_hooks for a in analyses),
            
            # Technology usage
            'base44_integration': len([a for a in analyses if a.base44_imports]) / len(analyses),
            'ui_library_usage': len([a for a in analyses if a.ui_library_imports]) / len(analyses),
            
            # Component breakdown
            'functional_components': len([a for a in analyses if a.hooks_used]),
            'components_with_state': sum(a.state_variables for a in analyses),
            'components_with_effects': sum(a.effect_hooks for a in analyses),
            
            # Code quality
            'average_cyclomatic_complexity': statistics.mean([a.cyclomatic_complexity for a in analyses]) if analyses else 0,
            'console_logs_total': sum(a.console_logs for a in analyses),
            'todo_comments_total': sum(a.todo_comments for a in analyses),
            
            # API usage
            'api_calls_total': sum(a.api_calls for a in analyses),
            'base44_api_methods': self._merge_api_usage([a.base44_api_usage for a in analyses]),
            
            # Most used patterns
            'most_used_hooks': self._get_most_common_items([a.hooks_used for a in analyses]),
            'most_used_components': self._get_most_used_components(analyses),
        }
        
        return summary
    
    def _merge_api_usage(self, api_usage_list: List[Dict[str, int]]) -> Dict[str, int]:
        """Merge API usage dictionaries"""
        merged = defaultdict(int)
        for usage_dict in api_usage_list:
            for method, count in usage_dict.items():
                merged[method] += count
        return dict(merged)
    
    def _get_most_common_items(self, dict_list: List[Dict[str, int]], top_n: int = 10) -> Dict[str, int]:
        """Get most common items across multiple dictionaries"""
        combined = defaultdict(int)
        for d in dict_list:
            for key, value in d.items():
                combined[key] += value
        
        # Return top N items
        return dict(Counter(combined).most_common(top_n))
    
    def _get_most_used_components(self, analyses: List[EnhancedComponentMetrics], top_n: int = 10) -> List[str]:
        """Get most frequently used components across analyses"""
        all_components = []
        for analysis in analyses:
            all_components.extend(list(analysis.jsx_components_used))
        
        return [comp for comp, count in Counter(all_components).most_common(top_n)]
    
    def _generate_cross_template_insights(self, results: Dict[str, Any]):
        """Generate insights across all templates"""
        templates = results['templates']
        
        if not templates:
            return
        
        complexities = [t['average_complexity'] for t in templates.values() if 'average_complexity' in t and t['average_complexity'] > 0]
        
        insights = {
            'complexity_distribution': {
                'mean': statistics.mean(complexities) if complexities else 0,
                'std': statistics.stdev(complexities) if len(complexities) > 1 else 0,
                'median': statistics.median(complexities) if complexities else 0
            },
            
            'base44_adoption': {
                'templates_using_base44': sum(1 for t in templates.values() if t.get('base44_integration', 0) > 0),
                'average_integration_level': statistics.mean([t.get('base44_integration', 0) for t in templates.values()]) if templates.values() else 0,
                'high_integration_templates': [name for name, t in templates.items() 
                                             if t.get('base44_integration', 0) > 0.5]
            },
            
            'code_quality_metrics': {
                'average_cyclomatic_complexity': statistics.mean([t.get('average_cyclomatic_complexity', 0) 
                                                        for t in templates.values()]) if templates.values() else 0,
                'templates_with_console_logs': sum(1 for t in templates.values() if t.get('console_logs_total', 0) > 0),
                'templates_with_todos': sum(1 for t in templates.values() if t.get('todo_comments_total', 0) > 0)
            },
            
            'architectural_patterns': {
                'hook_usage_distribution': self._analyze_hook_patterns(templates),
                'component_size_distribution': [t.get('total_components', 0) for t in templates.values()],
                'api_usage_patterns': self._analyze_api_patterns_cross_template(templates)
            }
        }
        
        results['aggregated_metrics'] = insights
    
    def _analyze_hook_patterns(self, templates: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze React hook usage patterns across templates"""
        all_hooks = defaultdict(int)
        
        for template in templates.values():
            if 'most_used_hooks' in template:
                for hook, count in template['most_used_hooks'].items():
                    all_hooks[hook] += count
        
        return {
            'most_popular_hooks': dict(Counter(all_hooks).most_common(10)),
            'hook_diversity': len(all_hooks),
            'average_hooks_per_template': statistics.mean([len(t.get('most_used_hooks', {})) for t in templates.values()]) if templates.values() else 0
        }
    
    def _analyze_api_patterns_cross_template(self, templates: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze API usage patterns across all templates"""
        all_base44_methods = defaultdict(int)
        
        for template in templates.values():
            if 'base44_api_methods' in template:
                for method, count in template['base44_api_methods'].items():
                    all_base44_methods[method] += count
        
        return {
            'most_used_base44_methods': dict(Counter(all_base44_methods).most_common(10)),
            'templates_with_api_calls': sum(1 for t in templates.values() if t.get('api_calls_total', 0) > 0),
            'api_adoption_rate': sum(1 for t in templates.values() if t.get('api_calls_total', 0) > 0) / len(templates) if templates else 0
        }


def main():
    """Test the regex analyzer"""
    analyzer = RegexCodeAnalyzer()
    
    # Test with templates directory
    templates_dir = "/data/data/com.termux/files/home/base44_analysis/data/raw"
    output_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/regex_analysis_results.json"
    
    results = analyzer.batch_analyze_templates(templates_dir, output_file)
    
    print("\n=== REGEX-BASED ANALYSIS RESULTS ===")
    print(f"Total templates analyzed: {results['analysis_metadata']['successful_analyses']}")
    print(f"Failed analyses: {results['analysis_metadata']['failed_analyses']}")
    
    if 'aggregated_metrics' in results:
        metrics = results['aggregated_metrics']
        
        if 'complexity_distribution' in metrics:
            complexity = metrics['complexity_distribution']
            print(f"\nComplexity Statistics:")
            print(f"  Mean complexity: {complexity['mean']:.2f}")
            print(f"  Median complexity: {complexity['median']:.2f}")
            print(f"  Std deviation: {complexity['std']:.2f}")
        
        if 'base44_adoption' in metrics:
            adoption = metrics['base44_adoption']
            print(f"\nBase44 Adoption:")
            print(f"  Templates using Base44: {adoption['templates_using_base44']}")
            print(f"  Average integration level: {adoption['average_integration_level']:.2%}")
        
        if 'architectural_patterns' in metrics and 'hook_usage_distribution' in metrics['architectural_patterns']:
            hooks = metrics['architectural_patterns']['hook_usage_distribution']
            print(f"\nMost Popular Hooks:")
            for hook, count in list(hooks.get('most_popular_hooks', {}).items())[:5]:
                print(f"  {hook}: {count}")


if __name__ == "__main__":
    main()