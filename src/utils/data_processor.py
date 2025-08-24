"""
Data Processor Utility
Core data processing functions for Base44 ecosystem analysis
"""

import os
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
from dataclasses import dataclass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AppMetadata:
    """Metadata structure for each Base44 application"""
    app_name: str
    app_path: str
    has_package_json: bool
    has_components_json: bool
    has_src_dir: bool
    jsx_files: List[str]
    tsx_files: List[str]
    total_files: int
    
class DataProcessor:
    """Main data processing class for Base44 ecosystem analysis"""
    
    def __init__(self, data_dir: str = "data/raw"):
        """
        Initialize the data processor
        
        Args:
            data_dir: Path to the raw data directory containing Base44 apps
        """
        self.data_dir = Path(data_dir)
        self.apps_metadata: List[AppMetadata] = []
        self.processed_data: Dict = {}
        
        if not self.data_dir.exists():
            raise FileNotFoundError(f"Data directory {data_dir} does not exist")
            
    def discover_applications(self) -> List[AppMetadata]:
        """
        Discover all Base44 applications in the data directory
        
        Returns:
            List of AppMetadata objects for each discovered application
        """
        logger.info(f"Discovering applications in {self.data_dir}")
        
        apps = []
        
        # Get all subdirectories in data/raw
        for app_dir in self.data_dir.iterdir():
            if not app_dir.is_dir():
                continue
                
            app_name = app_dir.name
            logger.info(f"Processing application: {app_name}")
            
            # Check for key files
            package_json_path = app_dir / "package.json"
            components_json_path = app_dir / "components.json"
            src_dir_path = app_dir / "src"
            
            # Find all JSX/TSX files
            jsx_files = []
            tsx_files = []
            total_files = 0
            
            if src_dir_path.exists():
                for file_path in src_dir_path.rglob("*.jsx"):
                    jsx_files.append(str(file_path.relative_to(app_dir)))
                    
                for file_path in src_dir_path.rglob("*.tsx"):
                    tsx_files.append(str(file_path.relative_to(app_dir)))
                    
                # Count total files in src directory
                total_files = len(list(src_dir_path.rglob("*")))
            
            # Create metadata
            metadata = AppMetadata(
                app_name=app_name,
                app_path=str(app_dir),
                has_package_json=package_json_path.exists(),
                has_components_json=components_json_path.exists(),
                has_src_dir=src_dir_path.exists(),
                jsx_files=jsx_files,
                tsx_files=tsx_files,
                total_files=total_files
            )
            
            apps.append(metadata)
        
        self.apps_metadata = apps
        logger.info(f"Discovered {len(apps)} applications")
        return apps
    
    def load_package_json(self, app_metadata: AppMetadata) -> Optional[Dict]:
        """
        Load and parse package.json for a specific application
        
        Args:
            app_metadata: Application metadata
            
        Returns:
            Parsed package.json content or None if not found
        """
        if not app_metadata.has_package_json:
            return None
            
        package_json_path = Path(app_metadata.app_path) / "package.json"
        
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Could not load package.json for {app_metadata.app_name}: {e}")
            return None
    
    def load_components_json(self, app_metadata: AppMetadata) -> Optional[Dict]:
        """
        Load and parse components.json for a specific application
        
        Args:
            app_metadata: Application metadata
            
        Returns:
            Parsed components.json content or None if not found
        """
        if not app_metadata.has_components_json:
            return None
            
        components_json_path = Path(app_metadata.app_path) / "components.json"
        
        try:
            with open(components_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Could not load components.json for {app_metadata.app_name}: {e}")
            return None
    
    def read_source_file(self, app_metadata: AppMetadata, file_path: str) -> Optional[str]:
        """
        Read source file content
        
        Args:
            app_metadata: Application metadata
            file_path: Relative path to the source file
            
        Returns:
            File content as string or None if not found
        """
        full_path = Path(app_metadata.app_path) / file_path
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except (FileNotFoundError, UnicodeDecodeError) as e:
            logger.warning(f"Could not read file {file_path} for {app_metadata.app_name}: {e}")
            return None
    
    def get_basic_stats(self) -> Dict:
        """
        Get basic statistics about the discovered applications
        
        Returns:
            Dictionary containing basic statistics
        """
        if not self.apps_metadata:
            self.discover_applications()
        
        stats = {
            'total_applications': len(self.apps_metadata),
            'apps_with_package_json': sum(1 for app in self.apps_metadata if app.has_package_json),
            'apps_with_components_json': sum(1 for app in self.apps_metadata if app.has_components_json),
            'apps_with_src_dir': sum(1 for app in self.apps_metadata if app.has_src_dir),
            'total_jsx_files': sum(len(app.jsx_files) for app in self.apps_metadata),
            'total_tsx_files': sum(len(app.tsx_files) for app in self.apps_metadata),
            'average_files_per_app': sum(app.total_files for app in self.apps_metadata) / len(self.apps_metadata) if self.apps_metadata else 0
        }
        
        return stats
    
    def create_summary_dataframe(self) -> pd.DataFrame:
        """
        Create a pandas DataFrame with summary information about all applications
        
        Returns:
            DataFrame with application summary data
        """
        if not self.apps_metadata:
            self.discover_applications()
        
        data = []
        for app in self.apps_metadata:
            data.append({
                'app_name': app.app_name,
                'has_package_json': app.has_package_json,
                'has_components_json': app.has_components_json,
                'has_src_dir': app.has_src_dir,
                'jsx_files_count': len(app.jsx_files),
                'tsx_files_count': len(app.tsx_files),
                'total_files': app.total_files
            })
        
        return pd.DataFrame(data)
    
    def validate_data_integrity(self) -> Tuple[bool, List[str]]:
        """
        Validate the integrity of the discovered data
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        if not self.apps_metadata:
            self.discover_applications()
        
        # Check if we have enough applications
        if len(self.apps_metadata) < 10:
            issues.append(f"Only {len(self.apps_metadata)} applications found, expected more")
        
        # Check for applications without key files
        apps_without_package_json = [app.app_name for app in self.apps_metadata if not app.has_package_json]
        if apps_without_package_json:
            issues.append(f"Applications without package.json: {apps_without_package_json}")
        
        apps_without_src = [app.app_name for app in self.apps_metadata if not app.has_src_dir]
        if apps_without_src:
            issues.append(f"Applications without src directory: {apps_without_src}")
        
        # Check for applications with no JSX/TSX files
        apps_without_react_files = [app.app_name for app in self.apps_metadata if len(app.jsx_files) == 0 and len(app.tsx_files) == 0]
        if apps_without_react_files:
            issues.append(f"Applications without JSX/TSX files: {apps_without_react_files}")
        
        is_valid = len(issues) == 0
        return is_valid, issues
    
    def export_metadata(self, output_path: str = "data/processed/app_metadata.json") -> None:
        """
        Export discovered metadata to JSON file
        
        Args:
            output_path: Path where to save the metadata
        """
        # Create output directory if it doesn't exist
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Convert metadata to serializable format
        metadata_dict = []
        for app in self.apps_metadata:
            metadata_dict.append({
                'app_name': app.app_name,
                'app_path': app.app_path,
                'has_package_json': app.has_package_json,
                'has_components_json': app.has_components_json,
                'has_src_dir': app.has_src_dir,
                'jsx_files': app.jsx_files,
                'tsx_files': app.tsx_files,
                'total_files': app.total_files
            })
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(metadata_dict, f, indent=2)
        
        logger.info(f"Metadata exported to {output_path}")


def main():
    """Demo function to test the data processor"""
    # Initialize processor
    processor = DataProcessor()
    
    # Discover applications
    apps = processor.discover_applications()
    print(f"Discovered {len(apps)} applications")
    
    # Get basic stats
    stats = processor.get_basic_stats()
    print("\nBasic Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Validate data integrity
    is_valid, issues = processor.validate_data_integrity()
    print(f"\nData Integrity: {'✓ Valid' if is_valid else '✗ Issues Found'}")
    if issues:
        for issue in issues:
            print(f"  - {issue}")
    
    # Create summary DataFrame
    df = processor.create_summary_dataframe()
    print(f"\nSample of discovered applications:")
    print(df.head())
    
    # Export metadata
    processor.export_metadata()
    

if __name__ == "__main__":
    main()