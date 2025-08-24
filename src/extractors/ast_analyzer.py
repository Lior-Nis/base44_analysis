"""
AST Analyzer for Base44 Applications
Advanced JSX/JavaScript parsing using Tree-sitter for architectural feature extraction
"""

import os
import re
from typing import Dict, List, Set, Tuple, Optional
from dataclasses import dataclass, field
from pathlib import Path
import logging

try:
    from tree_sitter import Language, Parser, Node
    import tree_sitter_javascript as tsjs
    TREE_SITTER_AVAILABLE = True
except ImportError:
    TREE_SITTER_AVAILABLE = False
    logging.warning("Tree-sitter not available, falling back to regex-based parsing")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ComponentAnalysis:
    """Analysis results for a single component file"""
    file_path: str
    component_name: str = ""
    
    # Import analysis
    total_imports: int = 0
    base44_imports: List[str] = field(default_factory=list)
    third_party_imports: List[str] = field(default_factory=list)
    local_imports: List[str] = field(default_factory=list)
    
    # Component usage
    jsx_components_used: Set[str] = field(default_factory=set)
    base44_components_used: Set[str] = field(default_factory=set)
    
    # React hooks analysis
    hooks_used: Dict[str, int] = field(default_factory=dict)  # hook_name -> count
    total_hooks: int = 0
    
    # Component complexity
    jsx_elements_count: int = 0
    jsx_attributes_total: int = 0
    jsx_attributes_complex: int = 0  # attributes with functions/objects
    
    # Code structure
    jsx_lines: int = 0
    imperative_lines: int = 0
    total_lines: int = 0
    
    # Props analysis
    props_defined: int = 0
    props_complex: int = 0  # props with functions/complex types
    
    # State management
    state_variables: int = 0
    effect_hooks: int = 0
    
    # Error handling
    parsing_errors: List[str] = field(default_factory=list)

class ASTAnalyzer:
    """Main AST analyzer class using Tree-sitter for JSX/JavaScript parsing"""
    
    def __init__(self):
        self.parser = None
        self.language = None
        self.setup_parser()
        
        # Common React hooks to detect
        self.react_hooks = {
            'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
            'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
            'useDebugValue', 'useId', 'useTransition', 'useDeferredValue'
        }
        
        # Base44 SDK patterns to detect
        self.base44_patterns = {
            '@base44/sdk', 'base44', 'sdk', '@/api/entities', '@/api', '@base44'
        }
    
    def setup_parser(self):
        """Initialize Tree-sitter parser for JavaScript/JSX"""
        if not TREE_SITTER_AVAILABLE:
            logger.warning("Tree-sitter not available, analysis will be limited")
            return
        
        try:
            # Use the pre-built JavaScript language - try different API approaches
            self.language = tsjs.language()
            
            # Try different initialization methods
            try:
                self.parser = Parser()
                self.parser.set_language(self.language)
            except AttributeError:
                # Older API
                self.parser = Parser(self.language)
            
            logger.info("Tree-sitter parser initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Tree-sitter parser: {e}")
            # Fall back to regex-only analysis
            self.parser = None
            self.language = None
    
    def analyze_file(self, file_path: str, content: str) -> ComponentAnalysis:
        """
        Analyze a single JSX/JavaScript file
        
        Args:
            file_path: Path to the file being analyzed
            content: File content as string
            
        Returns:
            ComponentAnalysis object with extracted features
        """
        analysis = ComponentAnalysis(file_path=file_path)
        
        # Basic metrics
        analysis.total_lines = len(content.splitlines())
        
        if self.parser is None:
            # Fallback to regex-based analysis
            return self._regex_fallback_analysis(file_path, content, analysis)
        
        try:
            # Parse with Tree-sitter
            tree = self.parser.parse(bytes(content, "utf8"))
            root_node = tree.root_node
            
            # Extract various features
            self._analyze_imports(root_node, content, analysis)
            self._analyze_jsx_elements(root_node, content, analysis)
            self._analyze_hooks(root_node, content, analysis)
            self._analyze_component_structure(root_node, content, analysis)
            self._analyze_props_and_state(root_node, content, analysis)
            
            # Calculate derived metrics
            self._calculate_derived_metrics(analysis)
            
        except Exception as e:
            error_msg = f"Error parsing {file_path}: {str(e)}"
            analysis.parsing_errors.append(error_msg)
            logger.warning(error_msg)
            
            # Fallback to regex analysis
            return self._regex_fallback_analysis(file_path, content, analysis)
        
        return analysis
    
    def _analyze_imports(self, node: Node, content: str, analysis: ComponentAnalysis):
        """Analyze import statements in the file"""
        imports = self._find_nodes_by_type(node, "import_statement")
        analysis.total_imports = len(imports)
        
        for import_node in imports:
            import_text = self._get_node_text(import_node, content)
            
            # Extract import source
            source = self._extract_import_source(import_node, content)
            if not source:
                continue
            
            # Categorize imports
            if any(pattern in source for pattern in self.base44_patterns):
                # Base44 SDK import
                imported_names = self._extract_import_names(import_node, content)
                analysis.base44_imports.extend(imported_names)
            elif source.startswith('.') or source.startswith('/'):
                # Local import
                imported_names = self._extract_import_names(import_node, content)
                analysis.local_imports.extend(imported_names)
            else:
                # Third-party import
                imported_names = self._extract_import_names(import_node, content)
                analysis.third_party_imports.extend(imported_names)
    
    def _analyze_jsx_elements(self, node: Node, content: str, analysis: ComponentAnalysis):
        """Analyze JSX elements and their complexity"""
        # Find all JSX elements
        jsx_elements = self._find_nodes_by_type(node, "jsx_element")
        jsx_self_closing = self._find_nodes_by_type(node, "jsx_self_closing_element")
        
        all_jsx = jsx_elements + jsx_self_closing
        analysis.jsx_elements_count = len(all_jsx)
        
        for jsx_node in all_jsx:
            # Extract component name
            component_name = self._extract_jsx_component_name(jsx_node, content)
            if component_name:
                analysis.jsx_components_used.add(component_name)
                
                # Check if it's a Base44 component
                if any(base44_name in analysis.base44_imports for base44_name in [component_name]):
                    analysis.base44_components_used.add(component_name)
            
            # Analyze attributes
            attributes = self._find_child_nodes_by_type(jsx_node, "jsx_attribute")
            analysis.jsx_attributes_total += len(attributes)
            
            # Check for complex attributes
            for attr in attributes:
                if self._is_complex_attribute(attr, content):
                    analysis.jsx_attributes_complex += 1
    
    def _analyze_hooks(self, node: Node, content: str, analysis: ComponentAnalysis):
        """Analyze React hooks usage"""
        call_expressions = self._find_nodes_by_type(node, "call_expression")
        
        for call in call_expressions:
            function_name = self._extract_function_name(call, content)
            
            if function_name in self.react_hooks:
                analysis.hooks_used[function_name] = analysis.hooks_used.get(function_name, 0) + 1
                analysis.total_hooks += 1
                
                # Special handling for state and effect hooks
                if function_name == 'useState':
                    analysis.state_variables += 1
                elif function_name in ['useEffect', 'useLayoutEffect']:
                    analysis.effect_hooks += 1
    
    def _analyze_component_structure(self, node: Node, content: str, analysis: ComponentAnalysis):
        """Analyze overall component structure and patterns"""
        # Find function declarations and arrow functions that might be components
        functions = (self._find_nodes_by_type(node, "function_declaration") +
                    self._find_nodes_by_type(node, "arrow_function"))
        
        for func in functions:
            func_name = self._extract_function_name(func, content)
            if func_name and func_name[0].isupper():  # Likely a React component
                analysis.component_name = func_name
                break
        
        # Count imperative constructs
        imperative_constructs = (
            self._find_nodes_by_type(node, "if_statement") +
            self._find_nodes_by_type(node, "for_statement") +
            self._find_nodes_by_type(node, "while_statement") +
            self._find_nodes_by_type(node, "try_statement")
        )
        analysis.imperative_lines = len(imperative_constructs)
        
        # Estimate JSX lines (rough approximation)
        analysis.jsx_lines = analysis.jsx_elements_count * 2  # Rough estimate
    
    def _analyze_props_and_state(self, node: Node, content: str, analysis: ComponentAnalysis):
        """Analyze props usage and state management patterns"""
        # Look for destructuring patterns that might be props
        object_patterns = self._find_nodes_by_type(node, "object_pattern")
        for pattern in object_patterns:
            # Check if this is likely props destructuring
            if self._is_likely_props_pattern(pattern, content):
                properties = self._find_child_nodes_by_type(pattern, "property_identifier")
                analysis.props_defined += len(properties)
    
    def _calculate_derived_metrics(self, analysis: ComponentAnalysis):
        """Calculate derived metrics from the extracted features"""
        # Ensure no division by zero
        if analysis.total_lines > 0:
            analysis.jsx_lines = min(analysis.jsx_lines, analysis.total_lines)
            analysis.imperative_lines = min(analysis.imperative_lines, analysis.total_lines - analysis.jsx_lines)
    
    def _regex_fallback_analysis(self, file_path: str, content: str, analysis: ComponentAnalysis) -> ComponentAnalysis:
        """
        Fallback regex-based analysis when Tree-sitter is not available
        Less accurate but provides basic metrics
        """
        logger.info(f"Using regex fallback for {file_path}")
        
        # Basic import analysis
        import_matches = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', content)
        analysis.total_imports = len(import_matches)
        
        for source in import_matches:
            if any(pattern in source for pattern in self.base44_patterns):
                analysis.base44_imports.append(source)
            elif source.startswith('.') or source.startswith('/'):
                analysis.local_imports.append(source)
            else:
                analysis.third_party_imports.append(source)
        
        # Basic JSX analysis
        jsx_elements = re.findall(r'<(\w+)', content)
        analysis.jsx_elements_count = len(jsx_elements)
        analysis.jsx_components_used = set(jsx_elements)
        
        # Basic hooks analysis
        for hook in self.react_hooks:
            hook_count = len(re.findall(rf'\b{hook}\s*\(', content))
            if hook_count > 0:
                analysis.hooks_used[hook] = hook_count
                analysis.total_hooks += hook_count
        
        # Basic line counting
        jsx_line_pattern = r'^\s*<.*>.*$'
        jsx_lines = len(re.findall(jsx_line_pattern, content, re.MULTILINE))
        analysis.jsx_lines = jsx_lines
        
        return analysis
    
    # Helper methods for Tree-sitter node traversal
    def _find_nodes_by_type(self, node: Node, node_type: str) -> List[Node]:
        """Find all nodes of a specific type in the tree"""
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
                source = self._get_node_text(child, content).strip('\'"')
                return source
        return None
    
    def _extract_import_names(self, import_node: Node, content: str) -> List[str]:
        """Extract imported names from an import statement"""
        names = []
        import_text = self._get_node_text(import_node, content)
        
        # Simple regex to extract import names
        # This could be more sophisticated with proper AST traversal
        import_clause_match = re.search(r'import\s+(.*?)\s+from', import_text)
        if import_clause_match:
            import_clause = import_clause_match.group(1)
            
            # Handle default imports
            if not '{' in import_clause:
                names.append(import_clause.strip())
            else:
                # Handle named imports
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
                # Handle cases like object.method()
                parts = []
                for grandchild in child.children:
                    if grandchild.type == "identifier":
                        parts.append(self._get_node_text(grandchild, content))
                if parts:
                    return parts[-1]  # Return the method name
        return None
    
    def _is_complex_attribute(self, attr_node: Node, content: str) -> bool:
        """Check if JSX attribute has complex value (function, object, etc.)"""
        for child in attr_node.children:
            if child.type == "jsx_expression_container":
                for expr_child in child.children:
                    if expr_child.type in ["arrow_function", "function_expression", "object"]:
                        return True
        return False
    
    def _is_likely_props_pattern(self, pattern_node: Node, content: str) -> bool:
        """Heuristic to determine if object pattern is props destructuring"""
        # This is a simplified heuristic - could be improved
        pattern_text = self._get_node_text(pattern_node, content)
        return len(pattern_text) > 10  # Simple length check
    
    def analyze_directory(self, directory_path: str, file_extensions: List[str] = ['.jsx', '.js', '.tsx', '.ts']) -> List[ComponentAnalysis]:
        """
        Analyze all relevant files in a directory
        
        Args:
            directory_path: Path to directory containing source files
            file_extensions: File extensions to analyze
            
        Returns:
            List of ComponentAnalysis objects
        """
        results = []
        dir_path = Path(directory_path)
        
        if not dir_path.exists():
            logger.error(f"Directory {directory_path} does not exist")
            return results
        
        # Find all relevant files
        for ext in file_extensions:
            for file_path in dir_path.rglob(f"*{ext}"):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    analysis = self.analyze_file(str(file_path), content)
                    results.append(analysis)
                    
                except (FileNotFoundError, UnicodeDecodeError) as e:
                    logger.warning(f"Could not read file {file_path}: {e}")
        
        logger.info(f"Analyzed {len(results)} files in {directory_path}")
        return results


def main():
    """Test the AST analyzer"""
    analyzer = ASTAnalyzer()
    
    # Test with a single file first
    test_file = "data/raw/task-flow-copy-ae9098a3/src/pages/Dashboard.jsx"
    
    if os.path.exists(test_file):
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        analysis = analyzer.analyze_file(test_file, content)
        
        print(f"Analysis Results for {test_file}:")
        print(f"  Component Name: {analysis.component_name}")
        print(f"  Total Imports: {analysis.total_imports}")
        print(f"  Base44 Imports: {analysis.base44_imports}")
        print(f"  JSX Elements: {analysis.jsx_elements_count}")
        print(f"  Components Used: {list(analysis.jsx_components_used)[:10]}...")  # First 10
        print(f"  Hooks Used: {analysis.hooks_used}")
        print(f"  Total Lines: {analysis.total_lines}")
        print(f"  JSX Lines: {analysis.jsx_lines}")
        print(f"  Imperative Lines: {analysis.imperative_lines}")
        
        if analysis.parsing_errors:
            print(f"  Parsing Errors: {analysis.parsing_errors}")
    else:
        print(f"Test file {test_file} not found")


if __name__ == "__main__":
    main()