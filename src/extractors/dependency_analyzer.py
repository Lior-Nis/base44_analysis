"""
Dependency Analyzer for Base44 Applications
Analyzes package.json and components.json to understand technical complexity and dependencies
"""

import json
import re
from typing import Dict, List, Set, Optional, Tuple
from dataclasses import dataclass, field
from pathlib import Path
from collections import Counter
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DependencyProfile:
    """Profile of dependencies and technical complexity for an application"""
    app_name: str
    
    # Package.json analysis
    package_name: str = ""
    package_version: str = "0.0.0"
    package_description: str = ""
    
    # Dependencies
    total_dependencies: int = 0
    production_dependencies: int = 0
    dev_dependencies: int = 0
    peer_dependencies: int = 0
    
    # Categorized dependencies
    ui_libraries: Dict[str, str] = field(default_factory=dict)  # name -> version
    build_tools: Dict[str, str] = field(default_factory=dict)
    testing_libraries: Dict[str, str] = field(default_factory=dict)
    styling_tools: Dict[str, str] = field(default_factory=dict)
    state_management: Dict[str, str] = field(default_factory=dict)
    data_fetching: Dict[str, str] = field(default_factory=dict)
    development_tools: Dict[str, str] = field(default_factory=dict)
    utility_libraries: Dict[str, str] = field(default_factory=dict)
    base44_dependencies: Dict[str, str] = field(default_factory=dict)
    
    # Scripts analysis
    available_scripts: Set[str] = field(default_factory=set)
    build_complexity: str = "simple"  # simple, moderate, complex
    
    # Components.json analysis (shadcn/ui style)
    ui_components: List[str] = field(default_factory=list)
    component_aliases: Dict[str, str] = field(default_factory=dict)
    styling_config: Dict = field(default_factory=dict)
    
    # Technical metrics
    dependency_complexity_score: float = 0.0  # 0-1 score based on number and type of deps
    tech_stack_modernity: float = 0.0  # Based on dependency versions and choices
    configuration_complexity: float = 0.0  # Based on config files and setup
    
    # Quality indicators
    uses_typescript: bool = False
    uses_linting: bool = False
    uses_testing: bool = False
    uses_bundler: bool = False
    has_proper_scripts: bool = False

class DependencyAnalyzer:
    """Main dependency analyzer for Base44 applications"""
    
    def __init__(self):
        # Dependency categorization patterns
        self.dependency_categories = {
            'ui_libraries': [
                'react', '@radix-ui', 'lucide-react', 'framer-motion', 'react-icons',
                '@headlessui', 'antd', 'material-ui', '@mui', 'chakra-ui',
                'semantic-ui', 'react-bootstrap', 'grommet'
            ],
            'build_tools': [
                'vite', 'webpack', 'rollup', 'parcel', 'esbuild',
                '@vitejs', 'babel', 'typescript', 'swc'
            ],
            'testing_libraries': [
                'jest', 'vitest', '@testing-library', 'cypress', 'playwright',
                'mocha', 'chai', 'sinon', 'enzyme', 'react-test-renderer'
            ],
            'styling_tools': [
                'tailwindcss', 'styled-components', 'emotion', 'sass', 'less',
                'postcss', 'autoprefixer', 'css-modules', '@stitches'
            ],
            'state_management': [
                'redux', '@reduxjs', 'zustand', 'jotai', 'valtio', 'recoil',
                'mobx', 'context', 'swr', 'react-query', '@tanstack/react-query'
            ],
            'data_fetching': [
                'axios', 'fetch', 'apollo', 'relay', 'graphql',
                'swr', '@tanstack/react-query', 'react-query'
            ],
            'development_tools': [
                'eslint', 'prettier', 'husky', 'lint-staged',
                '@types', 'nodemon', 'concurrently'
            ],
            'utility_libraries': [
                'lodash', 'ramda', 'date-fns', 'moment', 'dayjs',
                'uuid', 'classnames', 'clsx', 'yup', 'zod', 'joi'
            ],
            'base44_dependencies': [
                '@base44', 'base44', 'sdk'
            ]
        }
        
        # Modern versions for scoring
        self.modern_versions = {
            'react': '18.0.0',
            'vite': '4.0.0',
            'typescript': '4.0.0',
            'tailwindcss': '3.0.0',
            'eslint': '8.0.0'
        }
        
        # Script complexity indicators
        self.script_complexity = {
            'simple': ['dev', 'build', 'start'],
            'moderate': ['lint', 'test', 'preview', 'format'],
            'complex': ['analyze', 'storybook', 'e2e', 'deploy', 'docker']
        }
    
    def analyze_application(self, app_path: str, app_name: str = None) -> DependencyProfile:
        """
        Analyze dependencies for a Base44 application
        
        Args:
            app_path: Path to the application directory
            app_name: Name of the application (derived from path if not provided)
            
        Returns:
            DependencyProfile with comprehensive dependency analysis
        """
        if app_name is None:
            app_name = Path(app_path).name
        
        profile = DependencyProfile(app_name=app_name)
        app_path_obj = Path(app_path)
        
        if not app_path_obj.exists():
            logger.error(f"Application path {app_path} does not exist")
            return profile
        
        # Analyze package.json
        self._analyze_package_json(app_path_obj, profile)
        
        # Analyze components.json (if exists)
        self._analyze_components_json(app_path_obj, profile)
        
        # Analyze other config files
        self._analyze_config_files(app_path_obj, profile)
        
        # Calculate metrics
        self._calculate_metrics(profile)
        
        logger.info(f"Analyzed dependencies for {app_name}: {profile.total_dependencies} deps, "
                   f"complexity score {profile.dependency_complexity_score:.2f}")
        return profile
    
    def _analyze_package_json(self, app_path: Path, profile: DependencyProfile):
        """Analyze package.json file"""
        package_json_path = app_path / "package.json"
        
        if not package_json_path.exists():
            logger.warning(f"No package.json found for {profile.app_name}")
            return
        
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # Basic package information
            profile.package_name = package_data.get('name', '')
            profile.package_version = package_data.get('version', '0.0.0')
            profile.package_description = package_data.get('description', '')
            
            # Dependencies analysis
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            peer_dependencies = package_data.get('peerDependencies', {})
            
            profile.production_dependencies = len(dependencies)
            profile.dev_dependencies = len(dev_dependencies)
            profile.peer_dependencies = len(peer_dependencies)
            profile.total_dependencies = (profile.production_dependencies + 
                                        profile.dev_dependencies + 
                                        profile.peer_dependencies)
            
            # Categorize all dependencies
            all_deps = {**dependencies, **dev_dependencies, **peer_dependencies}
            self._categorize_dependencies(all_deps, profile)
            
            # Scripts analysis
            scripts = package_data.get('scripts', {})
            profile.available_scripts = set(scripts.keys())
            
            # Quality indicators
            profile.uses_typescript = 'typescript' in all_deps or '@types/' in str(all_deps)
            profile.uses_linting = any(tool in all_deps for tool in ['eslint', 'tslint'])
            profile.uses_testing = any(tool in all_deps for tool in ['jest', 'vitest', '@testing-library'])
            profile.uses_bundler = any(tool in all_deps for tool in ['vite', 'webpack', 'rollup', 'parcel'])
            profile.has_proper_scripts = len(profile.available_scripts) >= 3
            
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Could not parse package.json for {profile.app_name}: {e}")
    
    def _categorize_dependencies(self, dependencies: Dict[str, str], profile: DependencyProfile):
        """Categorize dependencies by their purpose"""
        
        for dep_name, version in dependencies.items():
            categorized = False
            
            for category, patterns in self.dependency_categories.items():
                if any(pattern in dep_name for pattern in patterns):
                    category_dict = getattr(profile, category)
                    category_dict[dep_name] = version
                    categorized = True
                    break
            
            # If not categorized, it's a utility library
            if not categorized and not dep_name.startswith('@types/'):
                profile.utility_libraries[dep_name] = version
    
    def _analyze_components_json(self, app_path: Path, profile: DependencyProfile):
        """Analyze components.json file (shadcn/ui configuration)"""
        components_json_path = app_path / "components.json"
        
        if not components_json_path.exists():
            return
        
        try:
            with open(components_json_path, 'r', encoding='utf-8') as f:
                components_data = json.load(f)
            
            # Extract component configuration
            if 'components' in components_data:
                profile.ui_components = list(components_data['components'].keys())
            
            # Extract aliases
            if 'aliases' in components_data:
                profile.component_aliases = components_data['aliases']
            
            # Extract styling configuration
            if 'style' in components_data:
                profile.styling_config = components_data
            
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Could not parse components.json for {profile.app_name}: {e}")
    
    def _analyze_config_files(self, app_path: Path, profile: DependencyProfile):
        """Analyze other configuration files"""
        
        config_files = {
            'tailwind.config.js': 'tailwind',
            'vite.config.js': 'vite',
            'vite.config.ts': 'vite',
            'webpack.config.js': 'webpack',
            'tsconfig.json': 'typescript',
            '.eslintrc.js': 'eslint',
            '.eslintrc.json': 'eslint',
            'prettier.config.js': 'prettier',
            '.prettierrc': 'prettier'
        }
        
        config_found = []
        for config_file, config_type in config_files.items():
            if (app_path / config_file).exists():
                config_found.append(config_type)
        
        # Use config file presence to adjust quality indicators
        if 'typescript' in config_found:
            profile.uses_typescript = True
        if 'eslint' in config_found:
            profile.uses_linting = True
    
    def _calculate_metrics(self, profile: DependencyProfile):
        """Calculate derived metrics"""
        
        # Dependency complexity score
        # Based on total number and diversity of dependencies
        base_score = min(profile.total_dependencies / 50.0, 1.0)  # Normalize to 50 deps = 1.0
        
        # Bonus for diverse categories
        categories_used = sum(1 for category_dict in [
            profile.ui_libraries, profile.build_tools, profile.testing_libraries,
            profile.styling_tools, profile.state_management, profile.data_fetching
        ] if category_dict)
        
        diversity_bonus = min(categories_used / 6.0, 0.3)  # Max 0.3 bonus
        
        profile.dependency_complexity_score = min(base_score + diversity_bonus, 1.0)
        
        # Tech stack modernity score
        modernity_score = 0.0
        modern_checks = 0
        
        for lib, modern_version in self.modern_versions.items():
            for dep_dict in [profile.ui_libraries, profile.build_tools, profile.styling_tools]:
                if lib in dep_dict:
                    modern_checks += 1
                    # Simple version comparison (could be more sophisticated)
                    current_version = dep_dict[lib].replace('^', '').replace('~', '')
                    if self._is_version_modern(current_version, modern_version):
                        modernity_score += 1
                    break
        
        profile.tech_stack_modernity = modernity_score / max(modern_checks, 1)
        
        # Configuration complexity
        config_indicators = [
            profile.uses_typescript,
            profile.uses_linting,
            profile.uses_testing,
            len(profile.ui_components) > 5,
            len(profile.available_scripts) > 5,
            len(profile.component_aliases) > 0
        ]
        
        profile.configuration_complexity = sum(config_indicators) / len(config_indicators)
        
        # Build complexity
        script_names = profile.available_scripts
        if any(script in script_names for script in self.script_complexity['complex']):
            profile.build_complexity = "complex"
        elif any(script in script_names for script in self.script_complexity['moderate']):
            profile.build_complexity = "moderate"
        else:
            profile.build_complexity = "simple"
    
    def _is_version_modern(self, current: str, modern: str) -> bool:
        """Simple version comparison - could be more sophisticated"""
        try:
            current_parts = [int(x) for x in current.split('.')]
            modern_parts = [int(x) for x in modern.split('.')]
            
            # Compare major.minor
            return (current_parts[0] > modern_parts[0] or 
                   (current_parts[0] == modern_parts[0] and current_parts[1] >= modern_parts[1]))
        except (ValueError, IndexError):
            return False
    
    def analyze_multiple_applications(self, base_path: str) -> List[DependencyProfile]:
        """Analyze dependencies for multiple applications"""
        base_path_obj = Path(base_path)
        profiles = []
        
        if not base_path_obj.exists():
            logger.error(f"Base path {base_path} does not exist")
            return profiles
        
        for app_dir in base_path_obj.iterdir():
            if app_dir.is_dir() and not app_dir.name.startswith('.'):
                profile = self.analyze_application(str(app_dir), app_dir.name)
                profiles.append(profile)
        
        logger.info(f"Analyzed dependencies for {len(profiles)} applications")
        return profiles
    
    def generate_ecosystem_report(self, profiles: List[DependencyProfile]) -> Dict:
        """Generate ecosystem-wide dependency analysis report"""
        
        # Aggregate statistics
        total_apps = len(profiles)
        
        # Most common dependencies
        all_dependencies = Counter()
        for profile in profiles:
            all_deps = {**profile.ui_libraries, **profile.build_tools, 
                       **profile.styling_tools, **profile.utility_libraries}
            for dep in all_deps.keys():
                all_dependencies[dep] += 1
        
        # Technology adoption rates
        tech_adoption = {
            'typescript': sum(1 for p in profiles if p.uses_typescript) / total_apps,
            'linting': sum(1 for p in profiles if p.uses_linting) / total_apps,
            'testing': sum(1 for p in profiles if p.uses_testing) / total_apps,
            'modern_bundler': sum(1 for p in profiles if p.uses_bundler) / total_apps,
        }
        
        # Complexity distribution
        complexity_scores = [p.dependency_complexity_score for p in profiles]
        avg_complexity = sum(complexity_scores) / len(complexity_scores)
        
        # Build complexity distribution
        build_complexity_dist = Counter(p.build_complexity for p in profiles)
        
        # Base44 SDK adoption
        base44_adoption = sum(1 for p in profiles if p.base44_dependencies) / total_apps
        
        report = {
            'ecosystem_overview': {
                'total_applications': total_apps,
                'average_dependencies_per_app': sum(p.total_dependencies for p in profiles) / total_apps,
                'average_complexity_score': avg_complexity,
                'base44_sdk_adoption_rate': base44_adoption
            },
            'most_common_dependencies': dict(all_dependencies.most_common(20)),
            'technology_adoption_rates': tech_adoption,
            'build_complexity_distribution': dict(build_complexity_dist),
            'top_ui_libraries': self._get_top_category_items(profiles, 'ui_libraries'),
            'top_styling_tools': self._get_top_category_items(profiles, 'styling_tools'),
            'top_build_tools': self._get_top_category_items(profiles, 'build_tools'),
        }
        
        return report
    
    def _get_top_category_items(self, profiles: List[DependencyProfile], category: str) -> Dict[str, int]:
        """Get top items in a specific dependency category"""
        category_counter = Counter()
        
        for profile in profiles:
            category_dict = getattr(profile, category, {})
            for item in category_dict.keys():
                category_counter[item] += 1
        
        return dict(category_counter.most_common(10))
    
    def export_profiles(self, profiles: List[DependencyProfile], output_path: str):
        """Export dependency profiles to JSON"""
        output_data = []
        
        for profile in profiles:
            profile_dict = {
                'app_name': profile.app_name,
                'package_name': profile.package_name,
                'package_version': profile.package_version,
                'package_description': profile.package_description,
                'total_dependencies': profile.total_dependencies,
                'production_dependencies': profile.production_dependencies,
                'dev_dependencies': profile.dev_dependencies,
                'ui_libraries': profile.ui_libraries,
                'build_tools': profile.build_tools,
                'testing_libraries': profile.testing_libraries,
                'styling_tools': profile.styling_tools,
                'state_management': profile.state_management,
                'data_fetching': profile.data_fetching,
                'utility_libraries': profile.utility_libraries,
                'base44_dependencies': profile.base44_dependencies,
                'available_scripts': list(profile.available_scripts),
                'build_complexity': profile.build_complexity,
                'ui_components': profile.ui_components,
                'dependency_complexity_score': profile.dependency_complexity_score,
                'tech_stack_modernity': profile.tech_stack_modernity,
                'configuration_complexity': profile.configuration_complexity,
                'uses_typescript': profile.uses_typescript,
                'uses_linting': profile.uses_linting,
                'uses_testing': profile.uses_testing,
                'uses_bundler': profile.uses_bundler,
                'has_proper_scripts': profile.has_proper_scripts
            }
            output_data.append(profile_dict)
        
        # Create output directory
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
        
        # Also generate ecosystem report
        report = self.generate_ecosystem_report(profiles)
        report_path = output_path.replace('.json', '_ecosystem_report.json')
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Exported {len(profiles)} dependency profiles to {output_path}")
        logger.info(f"Exported ecosystem report to {report_path}")


def main():
    """Test the dependency analyzer"""
    analyzer = DependencyAnalyzer()
    
    # Test with a single application
    test_app = "data/raw/task-flow-copy-ae9098a3"
    
    if Path(test_app).exists():
        profile = analyzer.analyze_application(test_app)
        
        print(f"Dependency Analysis for {profile.app_name}:")
        print(f"  Package: {profile.package_name} v{profile.package_version}")
        print(f"  Total Dependencies: {profile.total_dependencies}")
        print(f"  UI Libraries: {list(profile.ui_libraries.keys())}")
        print(f"  Build Tools: {list(profile.build_tools.keys())}")
        print(f"  Styling Tools: {list(profile.styling_tools.keys())}")
        print(f"  Base44 Dependencies: {list(profile.base44_dependencies.keys())}")
        print(f"  Available Scripts: {list(profile.available_scripts)}")
        print(f"  Build Complexity: {profile.build_complexity}")
        print(f"  Uses TypeScript: {profile.uses_typescript}")
        print(f"  Uses Testing: {profile.uses_testing}")
        print(f"  Dependency Complexity Score: {profile.dependency_complexity_score:.2f}")
        print(f"  Tech Stack Modernity: {profile.tech_stack_modernity:.2f}")
        print(f"  Configuration Complexity: {profile.configuration_complexity:.2f}")
    else:
        print(f"Test application {test_app} not found")


if __name__ == "__main__":
    main()