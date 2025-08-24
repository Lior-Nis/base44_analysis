"""
Base44 SDK Profiler
Specialized analyzer for Base44 SDK usage patterns and API interactions
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
class SDKUsageProfile:
    """Profile of Base44 SDK usage in an application"""
    app_name: str
    
    # SDK Dependencies
    sdk_version: Optional[str] = None
    sdk_dependencies: List[str] = field(default_factory=list)
    
    # API Entity Usage
    entities_imported: Set[str] = field(default_factory=set)
    entities_used: Set[str] = field(default_factory=set)
    entity_operations: Dict[str, List[str]] = field(default_factory=dict)  # entity -> [operations]
    
    # SDK Components
    sdk_components_imported: Set[str] = field(default_factory=set)
    sdk_components_used: Set[str] = field(default_factory=set)
    
    # API Calls
    api_calls_total: int = 0
    api_patterns: Dict[str, int] = field(default_factory=dict)  # pattern -> count
    crud_operations: Dict[str, int] = field(default_factory=dict)  # operation -> count
    
    # Authentication Patterns
    uses_authentication: bool = False
    auth_patterns: List[str] = field(default_factory=list)
    
    # Data Management
    uses_database_operations: bool = False
    database_patterns: List[str] = field(default_factory=list)
    
    # Advanced Features
    uses_realtime: bool = False
    uses_file_upload: bool = False
    uses_webhooks: bool = False
    uses_custom_api: bool = False
    
    # Quality Metrics
    sdk_adherence_score: float = 0.0  # 0-1 score of how much app uses SDK vs custom code
    api_complexity_score: float = 0.0  # Complexity based on API usage patterns
    
    # File Analysis
    files_analyzed: List[str] = field(default_factory=list)
    total_files: int = 0

class SDKProfiler:
    """Main SDK profiler for analyzing Base44 SDK usage patterns"""
    
    def __init__(self):
        # Base44 SDK patterns
        self.sdk_imports = {
            '@base44/sdk',
            '@/api/entities', 
            '@/api',
            '@/utils',
            '@/hooks',
            'base44'
        }
        
        # Common Base44 entity operations
        self.crud_operations = {
            'create', 'read', 'update', 'delete',
            'list', 'get', 'post', 'put', 'patch',
            'find', 'findOne', 'save', 'remove',
            'insert', 'select', 'upsert'
        }
        
        # Authentication patterns
        self.auth_patterns = [
            r'auth\.',
            r'login\(',
            r'logout\(',
            r'authenticate\(',
            r'signIn\(',
            r'signUp\(',
            r'register\(',
            r'token',
            r'session',
            r'user\.current',
            r'currentUser'
        ]
        
        # Database operation patterns
        self.db_patterns = [
            r'\.list\(',
            r'\.get\(',
            r'\.create\(',
            r'\.update\(',
            r'\.delete\(',
            r'\.save\(',
            r'\.find\(',
            r'\.query\(',
            r'\.fetch\(',
            r'database\.',
            r'db\.',
            r'collection\.',
            r'table\.'
        ]
        
        # Advanced feature patterns
        self.realtime_patterns = [
            r'websocket',
            r'socket\.io',
            r'realtime',
            r'subscribe\(',
            r'onUpdate\(',
            r'onChange\(',
            r'listener'
        ]
        
        self.file_patterns = [
            r'upload',
            r'file\.',
            r'FileReader',
            r'FormData',
            r'multipart',
            r'blob'
        ]
        
        self.webhook_patterns = [
            r'webhook',
            r'callback',
            r'hook\.',
            r'trigger\(',
            r'event\.'
        ]
    
    def profile_application(self, app_path: str, app_name: str = None) -> SDKUsageProfile:
        """
        Profile Base44 SDK usage for an entire application
        
        Args:
            app_path: Path to the application directory
            app_name: Name of the application (derived from path if not provided)
            
        Returns:
            SDKUsageProfile with comprehensive SDK usage analysis
        """
        if app_name is None:
            app_name = Path(app_path).name
        
        profile = SDKUsageProfile(app_name=app_name)
        app_path_obj = Path(app_path)
        
        if not app_path_obj.exists():
            logger.error(f"Application path {app_path} does not exist")
            return profile
        
        # Analyze package.json for SDK dependencies
        self._analyze_package_json(app_path_obj, profile)
        
        # Analyze source code files
        src_path = app_path_obj / "src"
        if src_path.exists():
            self._analyze_source_directory(src_path, profile)
        
        # Calculate derived metrics
        self._calculate_metrics(profile)
        
        logger.info(f"Profiled {app_name}: {len(profile.entities_used)} entities, {profile.api_calls_total} API calls")
        return profile
    
    def _analyze_package_json(self, app_path: Path, profile: SDKUsageProfile):
        """Analyze package.json for Base44 SDK dependencies"""
        package_json_path = app_path / "package.json"
        
        if not package_json_path.exists():
            logger.warning(f"No package.json found for {profile.app_name}")
            return
        
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            
            all_deps = {**dependencies, **dev_dependencies}
            
            # Check for Base44 SDK
            for dep_name, version in all_deps.items():
                if any(pattern in dep_name for pattern in ['base44', 'sdk']):
                    profile.sdk_dependencies.append(f"{dep_name}:{version}")
                    if 'base44' in dep_name and 'sdk' in dep_name:
                        profile.sdk_version = version
        
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Could not parse package.json for {profile.app_name}: {e}")
    
    def _analyze_source_directory(self, src_path: Path, profile: SDKUsageProfile):
        """Analyze all source files in the directory"""
        # Find all JavaScript/JSX files
        js_files = list(src_path.rglob("*.js")) + list(src_path.rglob("*.jsx"))
        profile.total_files = len(js_files)
        
        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self._analyze_file_content(content, file_path, profile)
                profile.files_analyzed.append(str(file_path.relative_to(src_path)))
                
            except (FileNotFoundError, UnicodeDecodeError) as e:
                logger.warning(f"Could not read file {file_path}: {e}")
    
    def _analyze_file_content(self, content: str, file_path: Path, profile: SDKUsageProfile):
        """Analyze a single file's content for SDK usage patterns"""
        
        # Analyze imports
        self._analyze_imports(content, profile)
        
        # Analyze API entity usage
        self._analyze_entity_usage(content, profile)
        
        # Analyze API calls and patterns
        self._analyze_api_calls(content, profile)
        
        # Analyze authentication patterns
        self._analyze_auth_patterns(content, profile)
        
        # Analyze database operations
        self._analyze_database_patterns(content, profile)
        
        # Analyze advanced features
        self._analyze_advanced_features(content, profile)
    
    def _analyze_imports(self, content: str, profile: SDKUsageProfile):
        """Analyze import statements for SDK usage"""
        import_lines = re.findall(r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]', content)
        
        for import_source in import_lines:
            # Check for Base44 SDK imports
            if any(pattern in import_source for pattern in self.sdk_imports):
                # Extract imported items
                import_match = re.search(rf'import\s+(.+?)\s+from\s+[\'\"]{re.escape(import_source)}[\'"]', content)
                if import_match:
                    import_clause = import_match.group(1)
                    
                    # Handle different import patterns
                    if '{' in import_clause:
                        # Named imports: import { Component1, Component2 } from '@base44/sdk'
                        named_imports = re.findall(r'\{([^}]+)\}', import_clause)
                        for named in named_imports:
                            items = [item.strip() for item in named.split(',')]
                            
                            if '@/api/entities' in import_source:
                                profile.entities_imported.update(items)
                            else:
                                profile.sdk_components_imported.update(items)
                    else:
                        # Default imports: import SDK from '@base44/sdk'
                        default_import = import_clause.strip()
                        if '@/api/entities' in import_source:
                            profile.entities_imported.add(default_import)
                        else:
                            profile.sdk_components_imported.add(default_import)
    
    def _analyze_entity_usage(self, content: str, profile: SDKUsageProfile):
        """Analyze usage of Base44 entities and their operations"""
        
        # Look for entity usage patterns
        for entity in profile.entities_imported:
            if not entity:
                continue
                
            entity_pattern = rf'\b{re.escape(entity)}\.'
            entity_matches = re.findall(entity_pattern + r'(\w+)', content)
            
            if entity_matches:
                profile.entities_used.add(entity)
                operations = []
                
                for operation in entity_matches:
                    operations.append(operation)
                    
                    # Count CRUD operations
                    if operation.lower() in self.crud_operations:
                        profile.crud_operations[operation] = profile.crud_operations.get(operation, 0) + 1
                        profile.api_calls_total += 1
                
                profile.entity_operations[entity] = operations
    
    def _analyze_api_calls(self, content: str, profile: SDKUsageProfile):
        """Analyze API call patterns and complexity"""
        
        # General API call patterns
        api_patterns = [
            r'\.get\s*\(',
            r'\.post\s*\(',
            r'\.put\s*\(',
            r'\.delete\s*\(',
            r'\.patch\s*\(',
            r'fetch\s*\(',
            r'axios\.',
            r'api\.',
            r'request\s*\(',
        ]
        
        for pattern in api_patterns:
            matches = re.findall(pattern, content)
            if matches:
                clean_pattern = pattern.replace(r'\.', '').replace(r'\s*\(', '').replace(r'\\', '')
                profile.api_patterns[clean_pattern] = profile.api_patterns.get(clean_pattern, 0) + len(matches)
                profile.api_calls_total += len(matches)
    
    def _analyze_auth_patterns(self, content: str, profile: SDKUsageProfile):
        """Analyze authentication-related patterns"""
        for pattern in self.auth_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                profile.uses_authentication = True
                profile.auth_patterns.append(pattern)
    
    def _analyze_database_patterns(self, content: str, profile: SDKUsageProfile):
        """Analyze database operation patterns"""
        for pattern in self.db_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                profile.uses_database_operations = True
                profile.database_patterns.append(pattern)
    
    def _analyze_advanced_features(self, content: str, profile: SDKUsageProfile):
        """Analyze usage of advanced Base44 features"""
        
        # Realtime features
        for pattern in self.realtime_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                profile.uses_realtime = True
                break
        
        # File upload features
        for pattern in self.file_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                profile.uses_file_upload = True
                break
        
        # Webhook features
        for pattern in self.webhook_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                profile.uses_webhooks = True
                break
        
        # Custom API usage (non-standard patterns)
        if re.search(r'customApi|custom_api|apiCustom', content, re.IGNORECASE):
            profile.uses_custom_api = True
    
    def _calculate_metrics(self, profile: SDKUsageProfile):
        """Calculate derived metrics for the SDK usage profile"""
        
        # SDK Adherence Score
        # Higher score means more use of SDK vs custom implementations
        sdk_usage_indicators = (
            len(profile.entities_used) +
            len(profile.sdk_components_used) +
            len(profile.crud_operations) +
            (1 if profile.uses_authentication else 0) +
            (1 if profile.uses_database_operations else 0)
        )
        
        custom_indicators = (
            profile.api_patterns.get('fetch', 0) +
            profile.api_patterns.get('axios', 0) +
            (1 if profile.uses_custom_api else 0)
        )
        
        total_indicators = sdk_usage_indicators + custom_indicators
        if total_indicators > 0:
            profile.sdk_adherence_score = sdk_usage_indicators / total_indicators
        else:
            profile.sdk_adherence_score = 0.0
        
        # API Complexity Score
        # Based on number of different operations, entities, and advanced features
        complexity_factors = [
            len(profile.entities_used) * 0.3,  # Number of entities
            len(profile.crud_operations) * 0.2,  # Different CRUD operations
            profile.api_calls_total * 0.1,  # Total API calls
            len(profile.api_patterns) * 0.2,  # Different API patterns
            (1 if profile.uses_realtime else 0) * 0.1,  # Advanced features
            (1 if profile.uses_file_upload else 0) * 0.1,
        ]
        
        profile.api_complexity_score = min(sum(complexity_factors), 10.0) / 10.0  # Normalize to 0-1
    
    def profile_multiple_applications(self, base_path: str) -> List[SDKUsageProfile]:
        """Profile multiple applications in a directory"""
        base_path_obj = Path(base_path)
        profiles = []
        
        if not base_path_obj.exists():
            logger.error(f"Base path {base_path} does not exist")
            return profiles
        
        # Find all application directories
        for app_dir in base_path_obj.iterdir():
            if app_dir.is_dir() and not app_dir.name.startswith('.'):
                profile = self.profile_application(str(app_dir), app_dir.name)
                profiles.append(profile)
        
        logger.info(f"Profiled {len(profiles)} applications")
        return profiles
    
    def export_profiles(self, profiles: List[SDKUsageProfile], output_path: str):
        """Export SDK profiles to JSON file"""
        output_data = []
        
        for profile in profiles:
            profile_dict = {
                'app_name': profile.app_name,
                'sdk_version': profile.sdk_version,
                'sdk_dependencies': profile.sdk_dependencies,
                'entities_imported': list(profile.entities_imported),
                'entities_used': list(profile.entities_used),
                'entity_operations': profile.entity_operations,
                'sdk_components_imported': list(profile.sdk_components_imported),
                'sdk_components_used': list(profile.sdk_components_used),
                'api_calls_total': profile.api_calls_total,
                'api_patterns': profile.api_patterns,
                'crud_operations': profile.crud_operations,
                'uses_authentication': profile.uses_authentication,
                'auth_patterns': profile.auth_patterns,
                'uses_database_operations': profile.uses_database_operations,
                'database_patterns': profile.database_patterns,
                'uses_realtime': profile.uses_realtime,
                'uses_file_upload': profile.uses_file_upload,
                'uses_webhooks': profile.uses_webhooks,
                'uses_custom_api': profile.uses_custom_api,
                'sdk_adherence_score': profile.sdk_adherence_score,
                'api_complexity_score': profile.api_complexity_score,
                'files_analyzed': profile.files_analyzed,
                'total_files': profile.total_files
            }
            output_data.append(profile_dict)
        
        # Create output directory if needed
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
        
        logger.info(f"Exported {len(profiles)} SDK profiles to {output_path}")


def main():
    """Test the SDK profiler"""
    profiler = SDKProfiler()
    
    # Test with a single application
    test_app = "data/raw/task-flow-copy-ae9098a3"
    
    if Path(test_app).exists():
        profile = profiler.profile_application(test_app)
        
        print(f"SDK Profile for {profile.app_name}:")
        print(f"  SDK Version: {profile.sdk_version}")
        print(f"  SDK Dependencies: {profile.sdk_dependencies}")
        print(f"  Entities Imported: {list(profile.entities_imported)}")
        print(f"  Entities Used: {list(profile.entities_used)}")
        print(f"  Entity Operations: {profile.entity_operations}")
        print(f"  API Calls Total: {profile.api_calls_total}")
        print(f"  CRUD Operations: {profile.crud_operations}")
        print(f"  Uses Authentication: {profile.uses_authentication}")
        print(f"  Uses Database Operations: {profile.uses_database_operations}")
        print(f"  SDK Adherence Score: {profile.sdk_adherence_score:.2f}")
        print(f"  API Complexity Score: {profile.api_complexity_score:.2f}")
        print(f"  Files Analyzed: {len(profile.files_analyzed)}")
    else:
        print(f"Test application {test_app} not found")


if __name__ == "__main__":
    main()