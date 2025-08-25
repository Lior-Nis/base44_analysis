"""
Advanced AST Analyzer for Base44 Applications
Multi-dimensional code architecture mining with ML-ready features
"""

import os
import json
import numpy as np
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field, asdict
from pathlib import Path
import logging
from collections import defaultdict, Counter
import re
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import pickle
from datetime import datetime

try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_javascript as tsjs
    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AdvancedComponentMetrics:
    """Comprehensive metrics for a single component file"""
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
    imperative_lines: int = 0
    
    # Complexity metrics (multiple dimensions)
    cyclomatic_complexity: int = 0
    cognitive_complexity: int = 0
    halstead_volume: float = 0.0
    halstead_difficulty: float = 0.0
    halstead_effort: float = 0.0
    nesting_depth: int = 0
    
    # Import analysis
    total_imports: int = 0
    base44_imports: List[str] = field(default_factory=list)
    third_party_imports: List[str] = field(default_factory=list)
    local_imports: List[str] = field(default_factory=list)
    relative_imports: List[str] = field(default_factory=list)
    
    # Component usage patterns
    jsx_components_used: Set[str] = field(default_factory=set)
    base44_components_used: Set[str] = field(default_factory=set)
    custom_components_used: Set[str] = field(default_factory=set)
    ui_library_components: Set[str] = field(default_factory=set)
    
    # React patterns
    hooks_used: Dict[str, int] = field(default_factory=dict)
    total_hooks: int = 0
    custom_hooks: List[str] = field(default_factory=list)
    state_variables: int = 0
    effect_hooks: int = 0
    context_usage: int = 0
    
    # JSX complexity
    jsx_elements_count: int = 0
    jsx_attributes_total: int = 0
    jsx_attributes_complex: int = 0
    jsx_conditional_rendering: int = 0
    jsx_loops: int = 0
    jsx_fragments: int = 0
    
    # Props and state management
    props_defined: int = 0
    props_complex: int = 0
    props_destructured: int = 0
    state_mutations: int = 0
    
    # Function analysis
    function_declarations: int = 0
    arrow_functions: int = 0
    async_functions: int = 0
    higher_order_functions: int = 0
    callback_functions: int = 0
    
    # Error handling
    try_catch_blocks: int = 0
    error_boundaries: int = 0
    
    # Performance patterns
    memo_usage: int = 0
    callback_optimization: int = 0
    lazy_loading: int = 0
    
    # API interaction
    api_calls: int = 0
    base44_api_usage: Dict[str, int] = field(default_factory=dict)
    external_api_calls: int = 0
    
    # Data structures
    object_literals: int = 0
    array_literals: int = 0
    destructuring_patterns: int = 0
    
    # Code quality indicators
    todo_comments: int = 0
    console_logs: int = 0
    magic_numbers: int = 0
    long_functions: int = 0  # functions > 20 lines
    
    # Architecture patterns
    component_type: str = "unknown"  # functional, class, hoc, render_prop
    design_patterns: List[str] = field(default_factory=list)
    
    # Semantic features (for ML)
    identifier_tokens: List[str] = field(default_factory=list)
    string_literals: List[str] = field(default_factory=list)
    
    # Dependency metrics
    fan_in: int = 0  # incoming dependencies
    fan_out: int = 0  # outgoing dependencies
    
    # Processing metadata
    analysis_timestamp: str = ""
    parsing_errors: List[str] = field(default_factory=list)

@dataclass
class ApplicationArchitecture:
    """High-level architecture analysis for entire application"""
    app_name: str
    total_files: int = 0
    
    # Directory structure analysis
    component_directories: Dict[str, int] = field(default_factory=dict)
    depth_analysis: Dict[int, int] = field(default_factory=dict)  # depth -> file count
    
    # Component relationship graph
    dependency_graph: Dict[str, List[str]] = field(default_factory=dict)
    circular_dependencies: List[Tuple[str, str]] = field(default_factory=list)
    
    # Architecture patterns
    architectural_style: str = "unknown"  # mvc, component-based, layered
    layer_analysis: Dict[str, List[str]] = field(default_factory=dict)
    
    # Aggregated metrics
    total_complexity: float = 0.0
    average_complexity: float = 0.0
    complexity_distribution: Dict[str, int] = field(default_factory=dict)
    
    # Technology stack
    frameworks_used: Set[str] = field(default_factory=set)
    libraries_used: Set[str] = field(default_factory=set)
    ui_frameworks: Set[str] = field(default_factory=set)
    
    # Base44 integration depth
    base44_integration_score: float = 0.0
    base44_features_used: Set[str] = field(default_factory=set)
    
    # Code quality metrics
    overall_quality_score: float = 0.0
    technical_debt_indicators: Dict[str, int] = field(default_factory=dict)

class AdvancedASTAnalyzer:
    """Advanced multi-dimensional AST analyzer with ML feature extraction"""
    
    def __init__(self):
        self.parser = None
        self.language = None
        self.setup_parser()
        
        # Enhanced pattern recognition
        self.react_hooks = {
            'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
            'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
            'useDebugValue', 'useId', 'useTransition', 'useDeferredValue',
            'useSyncExternalStore', 'useInsertionEffect'
        }
        
        self.base44_patterns = {
            '@base44/sdk', 'base44', 'sdk', '@/api/entities', '@/api', '@base44',
            'base44Client', 'entities', 'integrations'
        }
        
        self.ui_library_patterns = {
            'radix-ui', '@radix-ui', 'shadcn', 'lucide-react', 'react-hook-form',
            'sonner', 'recharts', 'framer-motion'
        }
        
        self.design_patterns = {
            'observer': ['subscribe', 'observer', 'listener'],
            'factory': ['create', 'factory', 'builder'],
            'singleton': ['instance', 'singleton'],
            'hoc': ['with', 'Higher', 'hoc'],
            'render_prop': ['render', 'children as function']
        }
        
        # Complexity weights for different constructs
        self.complexity_weights = {
            'if_statement': 1,
            'conditional_expression': 1,
            'switch_statement': 1,
            'for_statement': 2,
            'while_statement': 2,
            'try_statement': 1,
            'catch_clause': 1,
            'logical_expression': 1,
            'jsx_expression_container': 0.5
        }
        
        # Cache for performance
        self.analysis_cache = {}
        
    def setup_parser(self):
        """Initialize Tree-sitter parser with error handling"""
        if not TREE_SITTER_AVAILABLE:
            logger.warning("Tree-sitter not available, falling back to regex analysis")
            return
            
        try:
            self.language = tsjs.language()
            self.parser = Parser()
            self.parser.set_language(self.language)
            logger.info("Advanced Tree-sitter parser initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize parser: {e}")
            self.parser = None
            self.language = None
    
    def analyze_component(self, file_path: str, content: str) -> AdvancedComponentMetrics:
        """Comprehensive analysis of a single component"""
        # Check cache first
        file_hash = hashlib.md5(content.encode()).hexdigest()
        cache_key = f"{file_path}:{file_hash}"
        
        if cache_key in self.analysis_cache:
            logger.debug(f"Using cached analysis for {file_path}")
            return self.analysis_cache[cache_key]
        
        metrics = AdvancedComponentMetrics(
            file_path=file_path,
            file_hash=file_hash,
            analysis_timestamp=datetime.now().isoformat()
        )
        
        # Basic line analysis
        self._analyze_lines(content, metrics)
        
        if self.parser is None:
            # Fallback analysis
            self._regex_fallback_analysis(content, metrics)
        else:
            try:
                tree = self.parser.parse(bytes(content, "utf8"))
                root_node = tree.root_node
                
                # Comprehensive AST analysis
                self._analyze_imports(root_node, content, metrics)
                self._analyze_components_and_jsx(root_node, content, metrics)
                self._analyze_hooks_and_react_patterns(root_node, content, metrics)
                self._analyze_functions_and_complexity(root_node, content, metrics)
                self._analyze_data_structures(root_node, content, metrics)
                self._analyze_api_patterns(root_node, content, metrics)
                self._analyze_code_quality(root_node, content, metrics)
                self._extract_semantic_features(root_node, content, metrics)
                
                # Calculate derived metrics
                self._calculate_complexity_metrics(metrics)
                self._determine_component_type(metrics)
                self._detect_design_patterns(content, metrics)
                
            except Exception as e:
                error_msg = f"Error in AST analysis for {file_path}: {str(e)}"
                metrics.parsing_errors.append(error_msg)
                logger.warning(error_msg)
                self._regex_fallback_analysis(content, metrics)
        
        # Cache the result
        self.analysis_cache[cache_key] = metrics
        return metrics
    
    def _analyze_lines(self, content: str, metrics: AdvancedComponentMetrics):
        """Analyze different types of lines in the code"""
        lines = content.splitlines()
        metrics.total_lines = len(lines)
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                metrics.blank_lines += 1
            elif stripped.startswith('//') or stripped.startswith('/*'):
                metrics.comment_lines += 1
            elif any(jsx_indicator in stripped for jsx_indicator in ['<', '/>', 'jsx', 'JSX']):
                metrics.jsx_lines += 1
                metrics.code_lines += 1
            else:
                metrics.code_lines += 1
    
    def _analyze_imports(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Enhanced import analysis with categorization"""
        imports = self._find_nodes_by_type(node, "import_statement")
        metrics.total_imports = len(imports)
        
        for import_node in imports:
            source = self._extract_import_source(import_node, content)
            if not source:
                continue
            
            imported_names = self._extract_import_names(import_node, content)
            
            # Categorize imports more precisely
            if any(pattern in source for pattern in self.base44_patterns):
                metrics.base44_imports.extend(imported_names)
            elif source.startswith('./') or source.startswith('../'):
                metrics.relative_imports.extend(imported_names)
            elif source.startswith('/') or source.startswith('@/'):
                metrics.local_imports.extend(imported_names)
            elif any(ui_lib in source for ui_lib in self.ui_library_patterns):
                metrics.ui_library_components.update(imported_names)
                metrics.third_party_imports.extend(imported_names)
            else:
                metrics.third_party_imports.extend(imported_names)
    
    def _analyze_components_and_jsx(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Comprehensive JSX and component analysis"""
        # JSX elements
        jsx_elements = self._find_nodes_by_type(node, "jsx_element")
        jsx_self_closing = self._find_nodes_by_type(node, "jsx_self_closing_element")
        jsx_fragments = self._find_nodes_by_type(node, "jsx_fragment")
        
        metrics.jsx_elements_count = len(jsx_elements) + len(jsx_self_closing)
        metrics.jsx_fragments = len(jsx_fragments)
        
        # Analyze all JSX elements
        for jsx_node in jsx_elements + jsx_self_closing:
            self._analyze_jsx_element(jsx_node, content, metrics)
        
        # Conditional rendering detection
        conditional_expressions = self._find_nodes_by_type(node, "conditional_expression")
        logical_expressions = self._find_nodes_by_type(node, "logical_expression")
        metrics.jsx_conditional_rendering = len(conditional_expressions) + len([
            expr for expr in logical_expressions 
            if "&&" in self._get_node_text(expr, content)
        ])
        
        # Loop detection in JSX
        map_calls = [
            call for call in self._find_nodes_by_type(node, "call_expression")
            if "map" in self._get_node_text(call, content)
        ]
        metrics.jsx_loops = len(map_calls)
    
    def _analyze_jsx_element(self, jsx_node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Detailed analysis of individual JSX elements"""
        component_name = self._extract_jsx_component_name(jsx_node, content)
        if component_name:
            metrics.jsx_components_used.add(component_name)
            
            # Categorize components
            if component_name in metrics.base44_imports:
                metrics.base44_components_used.add(component_name)
            elif component_name[0].isupper():
                metrics.custom_components_used.add(component_name)
        
        # Analyze attributes
        attributes = self._find_child_nodes_by_type(jsx_node, "jsx_attribute")
        metrics.jsx_attributes_total += len(attributes)
        
        for attr in attributes:
            if self._is_complex_attribute(attr, content):
                metrics.jsx_attributes_complex += 1
    
    def _analyze_hooks_and_react_patterns(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Advanced React hooks and patterns analysis"""
        call_expressions = self._find_nodes_by_type(node, "call_expression")
        
        for call in call_expressions:
            function_name = self._extract_function_name(call, content)
            
            if function_name in self.react_hooks:
                metrics.hooks_used[function_name] = metrics.hooks_used.get(function_name, 0) + 1
                metrics.total_hooks += 1
                
                # Specific hook analysis
                if function_name == 'useState':
                    metrics.state_variables += 1
                elif function_name in ['useEffect', 'useLayoutEffect', 'useInsertionEffect']:
                    metrics.effect_hooks += 1
                elif function_name == 'useContext':
                    metrics.context_usage += 1
                elif function_name in ['useMemo', 'useCallback']:
                    metrics.callback_optimization += 1
                elif function_name == 'memo':
                    metrics.memo_usage += 1
            
            elif function_name and function_name.startswith('use') and function_name[3:4].isupper():
                # Custom hooks
                metrics.custom_hooks.append(function_name)
    
    def _analyze_functions_and_complexity(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Function analysis and complexity calculations"""
        # Function declarations
        func_declarations = self._find_nodes_by_type(node, "function_declaration")
        arrow_functions = self._find_nodes_by_type(node, "arrow_function")
        
        metrics.function_declarations = len(func_declarations)
        metrics.arrow_functions = len(arrow_functions)
        
        all_functions = func_declarations + arrow_functions
        
        for func in all_functions:
            func_text = self._get_node_text(func, content)
            func_lines = len(func_text.splitlines())
            
            if func_lines > 20:
                metrics.long_functions += 1
            
            # Check for async functions
            if 'async' in func_text:
                metrics.async_functions += 1
            
            # Calculate cyclomatic complexity for this function
            complexity = self._calculate_cyclomatic_complexity(func, content)
            metrics.cyclomatic_complexity += complexity
            
            # Check nesting depth
            depth = self._calculate_nesting_depth(func)
            metrics.nesting_depth = max(metrics.nesting_depth, depth)
        
        # Higher-order function detection
        hof_patterns = ['return function', '=>', 'function(', 'callback']
        for pattern in hof_patterns:
            if pattern in content:
                metrics.higher_order_functions += content.count(pattern)
    
    def _analyze_data_structures(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Data structure usage analysis"""
        object_literals = self._find_nodes_by_type(node, "object")
        array_literals = self._find_nodes_by_type(node, "array")
        destructuring = self._find_nodes_by_type(node, "object_pattern") + \
                      self._find_nodes_by_type(node, "array_pattern")
        
        metrics.object_literals = len(object_literals)
        metrics.array_literals = len(array_literals)
        metrics.destructuring_patterns = len(destructuring)
        
        # Analyze props destructuring specifically
        for pattern in self._find_nodes_by_type(node, "object_pattern"):
            if self._is_likely_props_pattern(pattern, content):
                props = self._find_child_nodes_by_type(pattern, "property_identifier")
                metrics.props_destructured = len(props)
    
    def _analyze_api_patterns(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """API usage pattern analysis"""
        # General API calls (fetch, axios, etc.)
        api_patterns = ['fetch(', 'axios.', '.get(', '.post(', '.put(', '.delete(']
        for pattern in api_patterns:
            metrics.api_calls += content.count(pattern)
        
        # Base44 specific API usage
        call_expressions = self._find_nodes_by_type(node, "call_expression")
        for call in call_expressions:
            call_text = self._get_node_text(call, content)
            
            # Look for Base44 SDK patterns
            if any(pattern in call_text for pattern in self.base44_patterns):
                # Extract the method being called
                method_match = re.search(r'\.(\w+)\s*\(', call_text)
                if method_match:
                    method = method_match.group(1)
                    metrics.base44_api_usage[method] = metrics.base44_api_usage.get(method, 0) + 1
    
    def _analyze_code_quality(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Code quality and technical debt indicators"""
        # TODO comments
        metrics.todo_comments = len(re.findall(r'//.*TODO|/\*.*TODO.*\*/', content, re.IGNORECASE))
        
        # Console logs (potential debugging code left behind)
        metrics.console_logs = content.count('console.log') + content.count('console.warn') + \
                              content.count('console.error')
        
        # Magic numbers (hardcoded numeric values)
        magic_number_pattern = r'\b\d{2,}\b'  # Numbers with 2+ digits
        metrics.magic_numbers = len(re.findall(magic_number_pattern, content))
        
        # Error handling
        try_statements = self._find_nodes_by_type(node, "try_statement")
        metrics.try_catch_blocks = len(try_statements)
        
        # Error boundaries (React-specific)
        if 'componentDidCatch' in content or 'getDerivedStateFromError' in content:
            metrics.error_boundaries += 1
    
    def _extract_semantic_features(self, node: Node, content: str, metrics: AdvancedComponentMetrics):
        """Extract semantic features for ML analysis"""
        # Extract identifiers
        identifiers = self._find_nodes_by_type(node, "identifier")
        metrics.identifier_tokens = [
            self._get_node_text(ident, content) for ident in identifiers[:100]  # Limit for memory
        ]
        
        # Extract string literals
        strings = self._find_nodes_by_type(node, "string")
        metrics.string_literals = [
            self._get_node_text(string, content).strip('\'"') for string in strings[:50]
        ]
    
    def _calculate_complexity_metrics(self, metrics: AdvancedComponentMetrics):
        """Calculate advanced complexity metrics"""
        # Halstead metrics (simplified)
        operators = metrics.jsx_attributes_complex + metrics.api_calls + metrics.total_hooks
        operands = len(metrics.identifier_tokens) + len(metrics.string_literals)
        
        if operators > 0 and operands > 0:
            vocabulary = operators + operands
            length = sum(metrics.hooks_used.values()) + metrics.jsx_elements_count
            
            metrics.halstead_volume = length * np.log2(vocabulary) if vocabulary > 1 else 0
            metrics.halstead_difficulty = (operators / 2) * (operands / len(set(metrics.identifier_tokens))) if operands > 0 else 0
            metrics.halstead_effort = metrics.halstead_volume * metrics.halstead_difficulty
        
        # Cognitive complexity (simplified)
        metrics.cognitive_complexity = (
            metrics.cyclomatic_complexity +
            metrics.nesting_depth * 2 +
            metrics.jsx_conditional_rendering +
            metrics.jsx_loops * 2
        )
    
    def _determine_component_type(self, metrics: AdvancedComponentMetrics):
        """Determine the type of React component"""
        if 'class' in str(metrics.identifier_tokens):
            metrics.component_type = "class"
        elif metrics.hooks_used:
            metrics.component_type = "functional"
        elif any('with' in token for token in metrics.identifier_tokens[:10]):
            metrics.component_type = "hoc"
        elif 'render' in str(metrics.identifier_tokens):
            metrics.component_type = "render_prop"
        else:
            metrics.component_type = "functional"
    
    def _detect_design_patterns(self, content: str, metrics: AdvancedComponentMetrics):
        """Detect common design patterns in the code"""
        for pattern, keywords in self.design_patterns.items():
            if any(keyword.lower() in content.lower() for keyword in keywords):
                metrics.design_patterns.append(pattern)
    
    def analyze_application_architecture(self, app_path: str) -> ApplicationArchitecture:
        """Analyze the overall architecture of a Base44 application"""
        app_name = Path(app_path).name
        architecture = ApplicationArchitecture(app_name=app_name)
        
        # Find all component files
        component_files = []
        for ext in ['.jsx', '.js', '.tsx', '.ts']:
            component_files.extend(Path(app_path).rglob(f"*{ext}"))
        
        architecture.total_files = len(component_files)
        
        # Analyze directory structure
        for file_path in component_files:
            relative_path = file_path.relative_to(app_path)
            dir_name = str(relative_path.parent)
            
            architecture.component_directories[dir_name] = \
                architecture.component_directories.get(dir_name, 0) + 1
            
            # Depth analysis
            depth = len(relative_path.parts) - 1
            architecture.depth_analysis[depth] = \
                architecture.depth_analysis.get(depth, 0) + 1
        
        # Analyze individual components and aggregate metrics
        total_complexity = 0
        component_metrics = []
        
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_file = {}
            
            for file_path in component_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    future = executor.submit(self.analyze_component, str(file_path), content)
                    future_to_file[future] = file_path
                except Exception as e:
                    logger.warning(f"Could not read {file_path}: {e}")
            
            for future in as_completed(future_to_file):
                try:
                    metrics = future.result()
                    component_metrics.append(metrics)
                    total_complexity += metrics.cognitive_complexity
                    
                    # Aggregate technology usage
                    architecture.frameworks_used.update(metrics.third_party_imports)
                    architecture.base44_features_used.update(metrics.base44_imports)
                    
                except Exception as e:
                    logger.error(f"Analysis failed for {future_to_file[future]}: {e}")
        
        # Calculate aggregated metrics
        if component_metrics:
            architecture.total_complexity = total_complexity
            architecture.average_complexity = total_complexity / len(component_metrics)
            
            # Complexity distribution
            complexity_ranges = [(0, 5), (6, 15), (16, 30), (31, float('inf'))]
            range_labels = ['Simple', 'Moderate', 'Complex', 'Very Complex']
            
            for metrics in component_metrics:
                for i, (min_val, max_val) in enumerate(complexity_ranges):
                    if min_val <= metrics.cognitive_complexity <= max_val:
                        label = range_labels[i]
                        architecture.complexity_distribution[label] = \
                            architecture.complexity_distribution.get(label, 0) + 1
                        break
            
            # Base44 integration score
            base44_usage = sum(1 for m in component_metrics if m.base44_imports)
            architecture.base44_integration_score = base44_usage / len(component_metrics)
        
        # Determine architectural style
        if 'pages' in architecture.component_directories:
            architecture.architectural_style = "page-based"
        elif 'components' in architecture.component_directories:
            architecture.architectural_style = "component-based"
        else:
            architecture.architectural_style = "flat"
        
        return architecture
    
    def batch_analyze_templates(self, templates_dir: str, output_file: str = None) -> Dict[str, Any]:
        """Analyze all Base44 templates in batch with progress tracking"""
        results = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'total_templates': 0,
                'successful_analyses': 0,
                'failed_analyses': 0
            },
            'applications': {},
            'aggregated_insights': {}
        }
        
        # Find all template directories
        template_dirs = [d for d in Path(templates_dir).iterdir() 
                        if d.is_dir() and 'copy' in d.name]
        
        results['analysis_metadata']['total_templates'] = len(template_dirs)
        
        logger.info(f"Starting batch analysis of {len(template_dirs)} templates...")
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_template = {}
            
            for template_dir in template_dirs:
                future = executor.submit(self.analyze_application_architecture, str(template_dir))
                future_to_template[future] = template_dir.name
            
            for i, future in enumerate(as_completed(future_to_template), 1):
                template_name = future_to_template[future]
                
                try:
                    architecture = future.result()
                    results['applications'][template_name] = asdict(architecture)
                    results['analysis_metadata']['successful_analyses'] += 1
                    
                    logger.info(f"Completed {i}/{len(template_dirs)}: {template_name}")
                    
                except Exception as e:
                    logger.error(f"Failed to analyze {template_name}: {e}")
                    results['analysis_metadata']['failed_analyses'] += 1
        
        # Generate aggregated insights
        self._generate_aggregated_insights(results)
        
        # Save results if output file specified
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            logger.info(f"Results saved to {output_file}")
        
        return results
    
    def _generate_aggregated_insights(self, results: Dict[str, Any]):
        """Generate cross-application insights and patterns"""
        applications = results['applications']
        
        if not applications:
            return
        
        insights = {
            'complexity_patterns': {},
            'technology_adoption': {},
            'architectural_patterns': {},
            'base44_usage_patterns': {}
        }
        
        # Complexity patterns
        all_complexities = [app['average_complexity'] for app in applications.values() 
                           if app['average_complexity'] > 0]
        
        if all_complexities:
            insights['complexity_patterns'] = {
                'mean_complexity': np.mean(all_complexities),
                'std_complexity': np.std(all_complexities),
                'median_complexity': np.median(all_complexities),
                'complexity_range': [min(all_complexities), max(all_complexities)]
            }
        
        # Technology adoption
        framework_counter = Counter()
        for app in applications.values():
            framework_counter.update(app['frameworks_used'])
        
        insights['technology_adoption'] = dict(framework_counter.most_common(20))
        
        # Architectural patterns
        arch_patterns = Counter(app['architectural_style'] for app in applications.values())
        insights['architectural_patterns'] = dict(arch_patterns)
        
        # Base44 usage patterns
        base44_scores = [app['base44_integration_score'] for app in applications.values()]
        if base44_scores:
            insights['base44_usage_patterns'] = {
                'average_integration': np.mean(base44_scores),
                'high_integration_apps': sum(1 for score in base44_scores if score > 0.7),
                'low_integration_apps': sum(1 for score in base44_scores if score < 0.3)
            }
        
        results['aggregated_insights'] = insights
    
    # Helper methods (keeping the original ones and adding new ones)
    def _find_nodes_by_type(self, node: Node, node_type: str) -> List[Node]:
        """Recursively find all nodes of a specific type"""
        results = []
        if node.type == node_type:
            results.append(node)
        for child in node.children:
            results.extend(self._find_nodes_by_type(child, node_type))
        return results
    
    def _find_child_nodes_by_type(self, node: Node, node_type: str) -> List[Node]:
        """Find direct child nodes of a specific type"""
        return [child for child in node.children if child.type == node_type]
    
    def _get_node_text(self, node: Node, content: str) -> str:
        """Extract text content from a node"""
        return content[node.start_byte:node.end_byte]
    
    def _extract_import_source(self, import_node: Node, content: str) -> Optional[str]:
        """Extract the source string from an import statement"""
        for child in import_node.children:
            if child.type == "string" or "string" in child.type:
                return self._get_node_text(child, content).strip('\'"')
        return None
    
    def _extract_import_names(self, import_node: Node, content: str) -> List[str]:
        """Extract imported names from an import statement"""
        names = []
        import_text = self._get_node_text(import_node, content)
        
        import_clause_match = re.search(r'import\s+(.*?)\s+from', import_text)
        if import_clause_match:
            import_clause = import_clause_match.group(1)
            
            if not '{' in import_clause:
                names.append(import_clause.strip())
            else:
                named_imports = re.findall(r'\{([^}]+)\}', import_clause)
                for named in named_imports:
                    names.extend([name.strip() for name in named.split(',')])
        
        return names
    
    def _extract_jsx_component_name(self, jsx_node: Node, content: str) -> Optional[str]:
        """Extract component name from JSX element"""
        for child in jsx_node.children:
            if child.type in ["jsx_opening_element", "jsx_self_closing_element"]:
                for grandchild in child.children:
                    if "identifier" in grandchild.type:
                        return self._get_node_text(grandchild, content)
        return None
    
    def _extract_function_name(self, call_node: Node, content: str) -> Optional[str]:
        """Extract function name from call expression"""
        for child in call_node.children:
            if child.type == "identifier":
                return self._get_node_text(child, content)
            elif child.type == "member_expression":
                parts = []
                for grandchild in child.children:
                    if grandchild.type == "identifier":
                        parts.append(self._get_node_text(grandchild, content))
                return parts[-1] if parts else None
        return None
    
    def _is_complex_attribute(self, attr_node: Node, content: str) -> bool:
        """Check if JSX attribute has complex value"""
        for child in attr_node.children:
            if child.type == "jsx_expression_container":
                for expr_child in child.children:
                    if expr_child.type in ["arrow_function", "function_expression", "object"]:
                        return True
        return False
    
    def _is_likely_props_pattern(self, pattern_node: Node, content: str) -> bool:
        """Heuristic to determine if object pattern is props destructuring"""
        pattern_text = self._get_node_text(pattern_node, content)
        return len(pattern_text) > 10
    
    def _calculate_cyclomatic_complexity(self, node: Node, content: str) -> int:
        """Calculate cyclomatic complexity for a node"""
        complexity = 1  # Base complexity
        
        for node_type, weight in self.complexity_weights.items():
            matching_nodes = self._find_nodes_by_type(node, node_type)
            complexity += len(matching_nodes) * weight
        
        return complexity
    
    def _calculate_nesting_depth(self, node: Node, current_depth: int = 0) -> int:
        """Calculate maximum nesting depth"""
        max_depth = current_depth
        
        for child in node.children:
            if child.type in ['if_statement', 'for_statement', 'while_statement', 'try_statement']:
                child_depth = self._calculate_nesting_depth(child, current_depth + 1)
                max_depth = max(max_depth, child_depth)
        
        return max_depth
    
    def _regex_fallback_analysis(self, content: str, metrics: AdvancedComponentMetrics):
        """Enhanced regex-based fallback analysis"""
        # Basic import analysis
        import_matches = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', content)
        metrics.total_imports = len(import_matches)
        
        # JSX analysis
        jsx_elements = re.findall(r'<(\w+)', content)
        metrics.jsx_elements_count = len(jsx_elements)
        metrics.jsx_components_used = set(jsx_elements)
        
        # Hooks analysis
        for hook in self.react_hooks:
            count = len(re.findall(rf'\b{hook}\s*\(', content))
            if count > 0:
                metrics.hooks_used[hook] = count
                metrics.total_hooks += count
        
        # Basic complexity
        if_statements = len(re.findall(r'\bif\s*\(', content))
        for_loops = len(re.findall(r'\bfor\s*\(', content))
        while_loops = len(re.findall(r'\bwhile\s*\(', content))
        
        metrics.cyclomatic_complexity = 1 + if_statements + for_loops + while_loops
        metrics.cognitive_complexity = metrics.cyclomatic_complexity


def main():
    """Test the advanced analyzer"""
    analyzer = AdvancedASTAnalyzer()
    
    # Test batch analysis
    templates_dir = "/data/data/com.termux/files/home/base44_analysis/data/raw"
    output_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/advanced_analysis_results.json"
    
    results = analyzer.batch_analyze_templates(templates_dir, output_file)
    
    print(f"Analysis completed:")
    print(f"  Total templates: {results['analysis_metadata']['total_templates']}")
    print(f"  Successful: {results['analysis_metadata']['successful_analyses']}")
    print(f"  Failed: {results['analysis_metadata']['failed_analyses']}")
    
    if 'aggregated_insights' in results:
        insights = results['aggregated_insights']
        print(f"\nKey insights:")
        if 'complexity_patterns' in insights:
            print(f"  Average complexity: {insights['complexity_patterns'].get('mean_complexity', 'N/A'):.2f}")
        if 'technology_adoption' in insights:
            print(f"  Top technologies: {list(insights['technology_adoption'].keys())[:5]}")


if __name__ == "__main__":
    main()