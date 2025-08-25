"""
Machine Learning Models for Base44 Ecosystem Analysis
Predictive models for complexity, quality, and category classification
"""

import json
import pickle
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass, field
import re
from collections import Counter, defaultdict
import logging

# For ML without external dependencies
from math import sqrt, log, exp
import random
import statistics

logger = logging.getLogger(__name__)

@dataclass
class MLFeatures:
    """Feature vector for machine learning models"""
    # Code structure features
    total_lines: float = 0.0
    code_lines: float = 0.0
    jsx_lines: float = 0.0
    comment_ratio: float = 0.0
    
    # Complexity features
    cyclomatic_complexity: float = 0.0
    nesting_depth: float = 0.0
    jsx_elements_count: float = 0.0
    jsx_conditional_rendering: float = 0.0
    
    # React patterns
    hooks_count: float = 0.0
    state_variables: float = 0.0
    effect_hooks: float = 0.0
    custom_hooks_count: float = 0.0
    
    # Import patterns
    total_imports: float = 0.0
    base44_imports_ratio: float = 0.0
    third_party_imports_ratio: float = 0.0
    local_imports_ratio: float = 0.0
    
    # Component patterns
    custom_components_count: float = 0.0
    html_elements_count: float = 0.0
    jsx_attributes_count: float = 0.0
    
    # API patterns
    api_calls: float = 0.0
    base44_api_calls: float = 0.0
    fetch_calls: float = 0.0
    
    # Code quality
    console_logs: float = 0.0
    todo_comments: float = 0.0
    try_catch_blocks: float = 0.0
    magic_numbers: float = 0.0
    
    # Function patterns
    function_count: float = 0.0
    arrow_functions_ratio: float = 0.0
    async_functions: float = 0.0
    
    # Data structures
    object_literals: float = 0.0
    array_literals: float = 0.0
    destructuring_patterns: float = 0.0
    
    # Performance patterns
    memo_usage: float = 0.0
    usecallback_usage: float = 0.0
    usememo_usage: float = 0.0
    
    # Styling patterns
    inline_styles: float = 0.0
    css_classes: float = 0.0
    styled_components: float = 0.0

class FeatureExtractor:
    """Extract ML features from component analysis data"""
    
    def __init__(self):
        self.feature_names = [
            'total_lines', 'code_lines', 'jsx_lines', 'comment_ratio',
            'cyclomatic_complexity', 'nesting_depth', 'jsx_elements_count', 'jsx_conditional_rendering',
            'hooks_count', 'state_variables', 'effect_hooks', 'custom_hooks_count',
            'total_imports', 'base44_imports_ratio', 'third_party_imports_ratio', 'local_imports_ratio',
            'custom_components_count', 'html_elements_count', 'jsx_attributes_count',
            'api_calls', 'base44_api_calls', 'fetch_calls',
            'console_logs', 'todo_comments', 'try_catch_blocks', 'magic_numbers',
            'function_count', 'arrow_functions_ratio', 'async_functions',
            'object_literals', 'array_literals', 'destructuring_patterns',
            'memo_usage', 'usecallback_usage', 'usememo_usage',
            'inline_styles', 'css_classes', 'styled_components'
        ]
    
    def extract_features_from_component(self, component_data: Dict[str, Any]) -> MLFeatures:
        """Extract features from a single component analysis"""
        features = MLFeatures()
        
        # Basic metrics
        features.total_lines = float(component_data.get('total_lines', 0))
        features.code_lines = float(component_data.get('code_lines', 0))
        features.jsx_lines = float(component_data.get('jsx_lines', 0))
        
        # Comment ratio
        comment_lines = float(component_data.get('comment_lines', 0))
        if features.total_lines > 0:
            features.comment_ratio = comment_lines / features.total_lines
        
        # Complexity
        features.cyclomatic_complexity = float(component_data.get('cyclomatic_complexity', 0))
        features.nesting_depth = float(component_data.get('nesting_depth', 0))
        features.jsx_elements_count = float(component_data.get('jsx_elements_count', 0))
        features.jsx_conditional_rendering = float(component_data.get('jsx_conditional_rendering', 0))
        
        # React patterns
        features.hooks_count = float(component_data.get('total_hooks', 0))
        features.state_variables = float(component_data.get('state_variables', 0))
        features.effect_hooks = float(component_data.get('effect_hooks', 0))
        features.custom_hooks_count = float(len(component_data.get('custom_hooks', [])))
        
        # Import patterns
        features.total_imports = float(component_data.get('total_imports', 0))
        base44_imports = len(component_data.get('base44_imports', []))
        third_party_imports = len(component_data.get('third_party_imports', []))
        local_imports = len(component_data.get('local_imports', []))
        
        if features.total_imports > 0:
            features.base44_imports_ratio = base44_imports / features.total_imports
            features.third_party_imports_ratio = third_party_imports / features.total_imports
            features.local_imports_ratio = local_imports / features.total_imports
        
        # Component patterns
        features.custom_components_count = float(len(component_data.get('custom_components', [])))
        features.html_elements_count = float(len(component_data.get('html_elements', [])))
        features.jsx_attributes_count = float(component_data.get('jsx_attributes_count', 0))
        
        # API patterns
        features.api_calls = float(component_data.get('api_calls', 0))
        features.base44_api_calls = float(sum(component_data.get('base44_api_usage', {}).values()))
        features.fetch_calls = float(component_data.get('fetch_calls', 0))
        
        # Code quality
        features.console_logs = float(component_data.get('console_logs', 0))
        features.todo_comments = float(component_data.get('todo_comments', 0))
        features.try_catch_blocks = float(component_data.get('try_catch_blocks', 0))
        features.magic_numbers = float(component_data.get('magic_numbers', 0))
        
        # Function patterns
        features.function_count = float(component_data.get('function_count', 0))
        arrow_functions = float(component_data.get('arrow_functions', 0))
        if features.function_count > 0:
            features.arrow_functions_ratio = arrow_functions / features.function_count
        features.async_functions = float(component_data.get('async_functions', 0))
        
        # Data structures
        features.object_literals = float(component_data.get('object_literals', 0))
        features.array_literals = float(component_data.get('array_literals', 0))
        features.destructuring_patterns = float(component_data.get('destructuring_patterns', 0))
        
        # Performance patterns
        features.memo_usage = float(component_data.get('memo_usage', 0))
        features.usecallback_usage = float(component_data.get('usecallback_usage', 0))
        features.usememo_usage = float(component_data.get('usememo_usage', 0))
        
        # Styling patterns
        features.inline_styles = float(component_data.get('inline_styles', 0))
        features.css_classes = float(component_data.get('css_classes', 0))
        features.styled_components = float(component_data.get('styled_components', 0))
        
        return features
    
    def features_to_vector(self, features: MLFeatures) -> List[float]:
        """Convert features object to vector"""
        return [getattr(features, name) for name in self.feature_names]
    
    def normalize_features(self, feature_vectors: List[List[float]]) -> Tuple[List[List[float]], Dict[int, Tuple[float, float]]]:
        """Normalize feature vectors using min-max scaling"""
        if not feature_vectors:
            return [], {}
        
        n_features = len(feature_vectors[0])
        normalization_params = {}
        
        # Calculate min and max for each feature
        for i in range(n_features):
            values = [vec[i] for vec in feature_vectors]
            min_val = min(values)
            max_val = max(values)
            normalization_params[i] = (min_val, max_val)
        
        # Normalize
        normalized_vectors = []
        for vector in feature_vectors:
            normalized = []
            for i, value in enumerate(vector):
                min_val, max_val = normalization_params[i]
                if max_val > min_val:
                    normalized_value = (value - min_val) / (max_val - min_val)
                else:
                    normalized_value = 0.0
                normalized.append(normalized_value)
            normalized_vectors.append(normalized)
        
        return normalized_vectors, normalization_params

class NaiveBayesClassifier:
    """Simple Naive Bayes classifier for component categorization"""
    
    def __init__(self):
        self.class_priors = {}
        self.feature_means = {}
        self.feature_stdevs = {}
        self.classes = []
    
    def fit(self, X: List[List[float]], y: List[str]):
        """Train the classifier"""
        self.classes = list(set(y))
        n_samples = len(X)
        n_features = len(X[0]) if X else 0
        
        # Calculate class priors
        class_counts = Counter(y)
        for cls in self.classes:
            self.class_priors[cls] = class_counts[cls] / n_samples
        
        # Calculate feature statistics for each class
        for cls in self.classes:
            cls_indices = [i for i, label in enumerate(y) if label == cls]
            cls_features = [X[i] for i in cls_indices]
            
            self.feature_means[cls] = []
            self.feature_stdevs[cls] = []
            
            for feature_idx in range(n_features):
                feature_values = [sample[feature_idx] for sample in cls_features]
                
                mean = statistics.mean(feature_values) if feature_values else 0
                stdev = statistics.stdev(feature_values) if len(feature_values) > 1 else 1e-6
                
                self.feature_means[cls].append(mean)
                self.feature_stdevs[cls].append(stdev)
    
    def _gaussian_probability(self, x: float, mean: float, stdev: float) -> float:
        """Calculate Gaussian probability density"""
        if stdev == 0:
            stdev = 1e-6
        exponent = exp(-((x - mean) ** 2) / (2 * stdev ** 2))
        return (1 / (sqrt(2 * 3.14159) * stdev)) * exponent
    
    def predict_proba(self, X: List[float]) -> Dict[str, float]:
        """Predict class probabilities"""
        probabilities = {}
        
        for cls in self.classes:
            # Start with class prior
            prob = log(self.class_priors[cls])
            
            # Multiply by feature likelihoods
            for i, feature_value in enumerate(X):
                mean = self.feature_means[cls][i]
                stdev = self.feature_stdevs[cls][i]
                likelihood = self._gaussian_probability(feature_value, mean, stdev)
                prob += log(likelihood + 1e-10)  # Add small value to prevent log(0)
            
            probabilities[cls] = exp(prob)
        
        # Normalize probabilities
        total_prob = sum(probabilities.values())
        if total_prob > 0:
            for cls in probabilities:
                probabilities[cls] /= total_prob
        
        return probabilities
    
    def predict(self, X: List[float]) -> str:
        """Predict class label"""
        probabilities = self.predict_proba(X)
        return max(probabilities, key=probabilities.get)

class LinearRegressor:
    """Simple linear regression for complexity prediction"""
    
    def __init__(self):
        self.weights = []
        self.bias = 0.0
        self.feature_names = []
    
    def fit(self, X: List[List[float]], y: List[float], learning_rate: float = 0.01, epochs: int = 1000):
        """Train linear regression model using gradient descent"""
        n_samples = len(X)
        n_features = len(X[0]) if X else 0
        
        # Initialize weights and bias
        self.weights = [random.uniform(-0.1, 0.1) for _ in range(n_features)]
        self.bias = 0.0
        
        # Gradient descent
        for epoch in range(epochs):
            # Forward pass
            predictions = []
            for sample in X:
                pred = self.bias + sum(w * x for w, x in zip(self.weights, sample))
                predictions.append(pred)
            
            # Calculate gradients
            weight_gradients = [0.0] * n_features
            bias_gradient = 0.0
            
            for i, (sample, actual, pred) in enumerate(zip(X, y, predictions)):
                error = pred - actual
                
                # Weight gradients
                for j, feature_val in enumerate(sample):
                    weight_gradients[j] += (2 / n_samples) * error * feature_val
                
                # Bias gradient
                bias_gradient += (2 / n_samples) * error
            
            # Update parameters
            for j in range(n_features):
                self.weights[j] -= learning_rate * weight_gradients[j]
            self.bias -= learning_rate * bias_gradient
            
            # Optional: early stopping based on loss
            if epoch % 100 == 0:
                mse = sum((pred - actual) ** 2 for pred, actual in zip(predictions, y)) / n_samples
                if mse < 1e-6:
                    break
    
    def predict(self, X: List[float]) -> float:
        """Predict single value"""
        return self.bias + sum(w * x for w, x in zip(self.weights, X))
    
    def predict_batch(self, X: List[List[float]]) -> List[float]:
        """Predict multiple values"""
        return [self.predict(sample) for sample in X]
    
    def get_feature_importance(self) -> List[Tuple[int, float]]:
        """Get feature importance based on weight magnitudes"""
        importance = [(i, abs(weight)) for i, weight in enumerate(self.weights)]
        return sorted(importance, key=lambda x: x[1], reverse=True)

class ClusteringAnalyzer:
    """K-means style clustering for pattern discovery"""
    
    def __init__(self, k: int = 5):
        self.k = k
        self.centroids = []
        self.labels = []
        self.feature_names = []
    
    def _distance(self, point1: List[float], point2: List[float]) -> float:
        """Calculate Euclidean distance"""
        return sqrt(sum((a - b) ** 2 for a, b in zip(point1, point2)))
    
    def fit(self, X: List[List[float]], max_iterations: int = 100):
        """Fit K-means clustering"""
        if len(X) < self.k:
            self.k = len(X)
        
        n_features = len(X[0]) if X else 0
        
        # Initialize centroids randomly
        self.centroids = []
        for _ in range(self.k):
            centroid = [random.uniform(min(X[i][j] for i in range(len(X))), 
                                     max(X[i][j] for i in range(len(X)))) 
                       for j in range(n_features)]
            self.centroids.append(centroid)
        
        for iteration in range(max_iterations):
            # Assign points to clusters
            new_labels = []
            for point in X:
                distances = [self._distance(point, centroid) for centroid in self.centroids]
                cluster = distances.index(min(distances))
                new_labels.append(cluster)
            
            # Check for convergence
            if iteration > 0 and new_labels == self.labels:
                break
            
            self.labels = new_labels
            
            # Update centroids
            for cluster_idx in range(self.k):
                cluster_points = [X[i] for i, label in enumerate(self.labels) if label == cluster_idx]
                
                if cluster_points:
                    new_centroid = []
                    for feature_idx in range(n_features):
                        feature_values = [point[feature_idx] for point in cluster_points]
                        new_centroid.append(statistics.mean(feature_values))
                    self.centroids[cluster_idx] = new_centroid
    
    def predict(self, X: List[float]) -> int:
        """Predict cluster for a single point"""
        distances = [self._distance(X, centroid) for centroid in self.centroids]
        return distances.index(min(distances))
    
    def get_cluster_characteristics(self, X: List[List[float]], feature_names: List[str]) -> Dict[int, Dict[str, float]]:
        """Analyze characteristics of each cluster"""
        characteristics = {}
        
        for cluster_idx in range(self.k):
            cluster_points = [X[i] for i, label in enumerate(self.labels) if label == cluster_idx]
            
            if not cluster_points:
                continue
            
            cluster_chars = {}
            for feature_idx, feature_name in enumerate(feature_names):
                feature_values = [point[feature_idx] for point in cluster_points]
                cluster_chars[feature_name] = {
                    'mean': statistics.mean(feature_values),
                    'median': statistics.median(feature_values),
                    'std': statistics.stdev(feature_values) if len(feature_values) > 1 else 0
                }
            
            characteristics[cluster_idx] = cluster_chars
        
        return characteristics

class MLAnalysisEngine:
    """Main engine for ML analysis of Base44 components"""
    
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.complexity_predictor = LinearRegressor()
        self.category_classifier = NaiveBayesClassifier()
        self.pattern_clusterer = ClusteringAnalyzer()
        self.normalization_params = {}
    
    def load_data(self, analysis_results_file: str) -> Tuple[List[Dict], List[str]]:
        """Load component analysis data"""
        with open(analysis_results_file, 'r') as f:
            data = json.load(f)
        
        components = []
        template_names = []
        
        for template_name, template_data in data.get('templates', {}).items():
            # Skip templates without component data
            if 'error' in template_data:
                continue
            
            # For now, we'll work with template-level aggregated data
            # In a full implementation, we'd extract individual component data
            components.append(template_data)
            template_names.append(template_name)
        
        return components, template_names
    
    def prepare_features(self, components: List[Dict]) -> Tuple[List[List[float]], List[MLFeatures]]:
        """Extract and normalize features from components"""
        feature_objects = []
        
        for component in components:
            # Convert template-level data to component-like format for feature extraction
            component_data = {
                'total_lines': component.get('total_lines', 0),
                'code_lines': component.get('total_lines', 0) * 0.8,  # Estimate
                'jsx_lines': component.get('total_jsx_elements', 0) * 2,  # Estimate
                'comment_lines': component.get('total_lines', 0) * 0.1,  # Estimate
                'cyclomatic_complexity': component.get('average_cyclomatic_complexity', 0),
                'nesting_depth': 3,  # Default estimate
                'jsx_elements_count': component.get('total_jsx_elements', 0),
                'jsx_conditional_rendering': component.get('total_jsx_elements', 0) * 0.2,  # Estimate
                'total_hooks': component.get('total_hooks', 0),
                'state_variables': component.get('components_with_state', 0),
                'effect_hooks': component.get('components_with_effects', 0),
                'custom_hooks': [],
                'total_imports': component.get('total_files', 0) * 5,  # Estimate
                'base44_imports': [] if component.get('base44_integration', 0) == 0 else ['base44'],
                'third_party_imports': ['react', 'radix'],  # Common ones
                'local_imports': ['./component'],
                'custom_components': set(['CustomComponent'] * int(component.get('functional_components', 0) * 0.3)),
                'html_elements': set(['div', 'span']),
                'jsx_attributes_count': component.get('total_jsx_elements', 0) * 3,  # Estimate
                'api_calls': component.get('api_calls_total', 0),
                'base44_api_usage': component.get('base44_api_methods', {}),
                'fetch_calls': component.get('api_calls_total', 0) * 0.5,  # Estimate
                'console_logs': component.get('console_logs_total', 0),
                'todo_comments': component.get('todo_comments_total', 0),
                'try_catch_blocks': 1,  # Estimate
                'magic_numbers': 5,  # Estimate
                'function_count': component.get('functional_components', 0),
                'arrow_functions': component.get('functional_components', 0) * 0.7,  # Estimate
                'async_functions': component.get('api_calls_total', 0) * 0.3,  # Estimate
                'object_literals': component.get('total_files', 0) * 2,  # Estimate
                'array_literals': component.get('total_files', 0),  # Estimate
                'destructuring_patterns': component.get('total_hooks', 0) * 0.5,  # Estimate
                'memo_usage': 0,  # Default
                'usecallback_usage': 0,  # Default
                'usememo_usage': 0,  # Default
                'inline_styles': component.get('total_jsx_elements', 0) * 0.1,  # Estimate
                'css_classes': component.get('total_jsx_elements', 0) * 0.8,  # Estimate
                'styled_components': 0,  # Default
            }
            
            features = self.feature_extractor.extract_features_from_component(component_data)
            feature_objects.append(features)
        
        # Convert to vectors
        feature_vectors = [self.feature_extractor.features_to_vector(features) 
                          for features in feature_objects]
        
        # Normalize features
        normalized_vectors, self.normalization_params = self.feature_extractor.normalize_features(feature_vectors)
        
        return normalized_vectors, feature_objects
    
    def train_complexity_predictor(self, X: List[List[float]], templates: List[Dict]):
        """Train complexity prediction model"""
        # Use average complexity as target
        y = [template.get('average_complexity', 0) for template in templates]
        
        self.complexity_predictor.fit(X, y)
        
        # Calculate R-squared for evaluation
        predictions = self.complexity_predictor.predict_batch(X)
        y_mean = statistics.mean(y)
        
        ss_tot = sum((actual - y_mean) ** 2 for actual in y)
        ss_res = sum((actual - pred) ** 2 for actual, pred in zip(y, predictions))
        
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        return {
            'r_squared': r_squared,
            'mse': ss_res / len(y),
            'feature_importance': self.complexity_predictor.get_feature_importance()
        }
    
    def train_category_classifier(self, X: List[List[float]], template_names: List[str]):
        """Train category classification model"""
        # Extract categories from template names (simple heuristic)
        categories = []
        for name in template_names:
            if 'ai' in name.lower():
                categories.append('AI/ML')
            elif 'crypto' in name.lower():
                categories.append('Crypto/Finance')
            elif 'edu' in name.lower() or 'learn' in name.lower():
                categories.append('Education')
            elif 'fit' in name.lower() or 'health' in name.lower():
                categories.append('Health/Fitness')
            elif 'task' in name.lower() or 'flow' in name.lower() or 'manage' in name.lower():
                categories.append('Productivity')
            elif 'market' in name.lower() or 'shop' in name.lower() or 'commerce' in name.lower():
                categories.append('E-commerce')
            else:
                categories.append('General')
        
        self.category_classifier.fit(X, categories)
        
        # Calculate accuracy
        predictions = [self.category_classifier.predict(x) for x in X]
        accuracy = sum(1 for actual, pred in zip(categories, predictions) if actual == pred) / len(categories)
        
        return {
            'accuracy': accuracy,
            'categories': list(set(categories)),
            'category_distribution': Counter(categories)
        }
    
    def discover_patterns(self, X: List[List[float]], k: int = 5):
        """Discover patterns using clustering"""
        self.pattern_clusterer = ClusteringAnalyzer(k=k)
        self.pattern_clusterer.fit(X)
        
        # Analyze cluster characteristics
        characteristics = self.pattern_clusterer.get_cluster_characteristics(
            X, self.feature_extractor.feature_names)
        
        return {
            'cluster_assignments': self.pattern_clusterer.labels,
            'cluster_characteristics': characteristics,
            'cluster_sizes': Counter(self.pattern_clusterer.labels)
        }
    
    def run_complete_analysis(self, analysis_results_file: str, output_file: str):
        """Run complete ML analysis pipeline"""
        logger.info("Starting ML analysis pipeline...")
        
        # Load data
        components, template_names = self.load_data(analysis_results_file)
        logger.info(f"Loaded {len(components)} templates for ML analysis")
        
        if len(components) < 5:
            logger.warning("Not enough templates for meaningful ML analysis")
            return
        
        # Prepare features
        X, feature_objects = self.prepare_features(components)
        logger.info(f"Extracted {len(self.feature_extractor.feature_names)} features")
        
        # Train models
        results = {
            'analysis_metadata': {
                'n_templates': len(components),
                'n_features': len(self.feature_extractor.feature_names),
                'feature_names': self.feature_extractor.feature_names
            }
        }
        
        # Complexity prediction
        logger.info("Training complexity predictor...")
        complexity_results = self.train_complexity_predictor(X, components)
        results['complexity_prediction'] = complexity_results
        
        # Category classification
        logger.info("Training category classifier...")
        classification_results = self.train_category_classifier(X, template_names)
        results['category_classification'] = classification_results
        
        # Pattern discovery
        logger.info("Discovering patterns through clustering...")
        pattern_results = self.discover_patterns(X, k=min(5, len(components)))
        results['pattern_discovery'] = pattern_results
        
        # Template-specific predictions
        template_predictions = []
        for i, (template_name, x) in enumerate(zip(template_names, X)):
            pred_complexity = self.complexity_predictor.predict(x)
            pred_category = self.category_classifier.predict(x)
            pred_cluster = self.pattern_clusterer.predict(x)
            
            template_predictions.append({
                'template_name': template_name,
                'predicted_complexity': pred_complexity,
                'predicted_category': pred_category,
                'pattern_cluster': pred_cluster,
                'actual_complexity': components[i].get('average_complexity', 0)
            })
        
        results['template_predictions'] = template_predictions
        
        # Save results
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"ML analysis completed. Results saved to {output_file}")
        return results


def main():
    """Run ML analysis on Base44 templates"""
    engine = MLAnalysisEngine()
    
    input_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/regex_analysis_results.json"
    output_file = "/data/data/com.termux/files/home/base44_analysis/data/processed/ml_analysis_results.json"
    
    results = engine.run_complete_analysis(input_file, output_file)
    
    if results:
        print("\n=== MACHINE LEARNING ANALYSIS RESULTS ===")
        print(f"Templates analyzed: {results['analysis_metadata']['n_templates']}")
        print(f"Features extracted: {results['analysis_metadata']['n_features']}")
        
        # Complexity prediction results
        complexity = results['complexity_prediction']
        print(f"\nComplexity Prediction:")
        print(f"  R-squared: {complexity['r_squared']:.3f}")
        print(f"  MSE: {complexity['mse']:.3f}")
        
        # Top feature importance
        top_features = complexity['feature_importance'][:5]
        print(f"  Top predictive features:")
        for idx, importance in top_features:
            feature_name = results['analysis_metadata']['feature_names'][idx]
            print(f"    {feature_name}: {importance:.3f}")
        
        # Classification results
        classification = results['category_classification']
        print(f"\nCategory Classification:")
        print(f"  Accuracy: {classification['accuracy']:.3f}")
        print(f"  Categories found: {len(classification['categories'])}")
        print(f"  Distribution: {dict(classification['category_distribution'])}")
        
        # Pattern discovery
        patterns = results['pattern_discovery']
        print(f"\nPattern Discovery:")
        print(f"  Clusters found: {len(patterns['cluster_sizes'])}")
        print(f"  Cluster sizes: {dict(patterns['cluster_sizes'])}")


if __name__ == "__main__":
    main()