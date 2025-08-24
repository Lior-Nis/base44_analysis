"""
Taxonomy Builder for Base44 Applications
Uses LDA topic modeling and clustering to automatically generate application taxonomy
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from collections import Counter
import logging
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaxonomyBuilder:
    """Main class for building Base44 application taxonomy using ML techniques"""
    
    def __init__(self, processed_data_dir: str = "data/processed"):
        self.processed_data_dir = Path(processed_data_dir)
        self.applications_data = []
        self.text_corpus = []
        self.feature_matrix = None
        
        # Topic modeling results
        self.lda_model = None
        self.topic_terms = {}
        self.application_topics = {}
        
        # Clustering results  
        self.clusters = {}
        self.cluster_labels = {}
        
        # Taxonomy results
        self.final_taxonomy = {}
        self.application_categories = {}
        
        logger.info("TaxonomyBuilder initialized")
    
    def load_application_data(self) -> List[Dict]:
        """Load processed application data from comprehensive analysis"""
        comprehensive_path = self.processed_data_dir / "comprehensive_analysis.json"
        
        if not comprehensive_path.exists():
            raise FileNotFoundError(f"Comprehensive analysis data not found at {comprehensive_path}")
        
        with open(comprehensive_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.applications_data = data['profiles']
        logger.info(f"Loaded {len(self.applications_data)} application profiles")
        
        # Prepare text corpus for NLP analysis
        self._prepare_text_corpus()
        
        return self.applications_data
    
    def _prepare_text_corpus(self):
        """Prepare combined text corpus for each application"""
        self.text_corpus = []
        
        for app in self.applications_data:
            combined_text_parts = []
            
            # Extract text from content profile
            if app.get('content_profile'):
                content = app['content_profile']
                
                # Combine different text sources
                text_sources = [
                    ' '.join(content.get('titles', [])),
                    ' '.join(content.get('headings', [])),
                    ' '.join(content.get('ui_labels', [])),
                    ' '.join(content.get('descriptions', [])),
                    ' '.join(content.get('feature_keywords', [])),
                    ' '.join(content.get('domain_terms', [])),
                    content.get('business_domain', ''),
                    content.get('readme_content', '')
                ]
                
                combined_text_parts.extend(text_sources)
            
            # Add app name (often descriptive)
            combined_text_parts.append(app.get('app_name', ''))
            
            # Add technical keywords from SDK profile
            if app.get('sdk_profile'):
                sdk = app['sdk_profile']
                combined_text_parts.extend(list(sdk.get('entities_used', [])))
            
            # Clean and combine all text
            combined_text = ' '.join(combined_text_parts)
            cleaned_text = self._clean_text(combined_text)
            
            self.text_corpus.append(cleaned_text)
        
        logger.info(f"Prepared text corpus with {len(self.text_corpus)} documents")
    
    def _clean_text(self, text: str) -> str:
        """Clean text for better NLP processing"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove CSS-like artifacts and styling terms
        css_patterns = [
            r'text-\w+', r'bg-\w+', r'text\s+\w+', r'slate\s+\d+', 
            r'zinc\s+\d+', r'gray\s+\d+', r'blue\s+\d+', r'green\s+\d+',
            r'geist\s+font', r'font\s+geist', r'div\s+\w+', r'className\s*=',
            r'px-\d+', r'py-\d+', r'mb-\d+', r'mt-\d+', r'ml-\d+', r'mr-\d+'
        ]
        
        for pattern in css_patterns:
            text = re.sub(pattern, ' ', text, flags=re.IGNORECASE)
        
        # Remove common non-semantic terms
        noise_words = [
            'div', 'span', 'button', 'input', 'form', 'label', 'img', 'svg',
            'quarterly', 'overview', 'contributions', 'strong', 'performance',
            'geist', 'slate', 'zinc', 'font', 'text', 'className', 'style'
        ]
        
        for noise in noise_words:
            text = re.sub(r'\b' + noise + r'\b', ' ', text, flags=re.IGNORECASE)
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove very short words and very common words
        words = text.split()
        words = [w for w in words if len(w) > 2 and w not in ['the', 'and', 'for', 'are', 'with', 'this', 'that', 'you', 'can', 'will', 'has', 'have']]
        
        return ' '.join(words)
    
    def build_lda_taxonomy(self, n_topics: int = 7, max_features: int = 1000) -> Dict[int, Dict]:
        """
        Build application taxonomy using Latent Dirichlet Allocation
        
        Args:
            n_topics: Number of topics to identify
            max_features: Maximum features for TF-IDF vectorization
            
        Returns:
            Dictionary of topics with their characteristics
        """
        logger.info(f"Building LDA taxonomy with {n_topics} topics")
        
        # Create TF-IDF matrix with more focused parameters
        custom_stop_words = [
            'app', 'application', 'platform', 'base44', 'sdk', 'react', 'vite',
            'component', 'page', 'jsx', 'javascript', 'web', 'website', 'site',
            'build', 'create', 'make', 'get', 'use', 'new', 'add', 'edit'
        ]
        
        vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words=list(set(list(TfidfVectorizer(stop_words='english').get_stop_words()) + custom_stop_words)),
            max_df=0.7,  # Ignore terms that appear in > 70% of documents
            min_df=3,    # Ignore terms that appear in < 3 documents
            ngram_range=(1, 2)  # Include unigrams and bigrams
        )
        
        tfidf_matrix = vectorizer.fit_transform(self.text_corpus)
        feature_names = vectorizer.get_feature_names_out()
        
        # Apply LDA
        self.lda_model = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=100,
            learning_method='batch'
        )
        
        lda_matrix = self.lda_model.fit_transform(tfidf_matrix)
        
        # Extract topics
        self.topic_terms = {}
        for topic_idx, topic in enumerate(self.lda_model.components_):
            top_terms_idx = topic.argsort()[-20:][::-1]  # Top 20 terms per topic
            top_terms = [feature_names[i] for i in top_terms_idx]
            top_weights = topic[top_terms_idx]
            
            self.topic_terms[topic_idx] = {
                'terms': top_terms,
                'weights': top_weights.tolist(),
                'name': self._generate_topic_name(top_terms)
            }
        
        # Assign applications to topics
        self.application_topics = {}
        for app_idx, app in enumerate(self.applications_data):
            app_name = app['app_name']
            topic_distribution = lda_matrix[app_idx]
            
            # Assign to topic with highest probability
            primary_topic = np.argmax(topic_distribution)
            topic_confidence = topic_distribution[primary_topic]
            
            self.application_topics[app_name] = {
                'primary_topic': int(primary_topic),
                'confidence': float(topic_confidence),
                'topic_distribution': topic_distribution.tolist()
            }
        
        logger.info("LDA taxonomy building complete")
        return self.topic_terms
    
    def _generate_topic_name(self, terms: List[str]) -> str:
        """Generate human-readable names for topics based on top terms"""
        
        # Define patterns for topic naming
        domain_patterns = {
            'ecommerce': ['product', 'shop', 'cart', 'order', 'buy', 'sell', 'store', 'payment'],
            'social': ['user', 'profile', 'message', 'chat', 'social', 'community', 'friend'],
            'analytics': ['dashboard', 'chart', 'data', 'report', 'analytics', 'metrics', 'graph'],
            'education': ['student', 'course', 'learn', 'education', 'school', 'quiz', 'lesson'],
            'finance': ['money', 'finance', 'budget', 'expense', 'invoice', 'payment', 'cost'],
            'healthcare': ['health', 'medical', 'patient', 'doctor', 'clinic', 'appointment'],
            'productivity': ['task', 'project', 'manage', 'workflow', 'organize', 'schedule'],
            'content': ['content', 'blog', 'article', 'publish', 'write', 'editor'],
            'ai_tools': ['ai', 'generate', 'model', 'predict', 'algorithm', 'machine'],
            'entertainment': ['game', 'play', 'fun', 'entertainment', 'media', 'video']
        }
        
        # Score each domain based on term overlap
        domain_scores = {}
        for domain, keywords in domain_patterns.items():
            score = sum(1 for term in terms[:10] if any(keyword in term for keyword in keywords))
            if score > 0:
                domain_scores[domain] = score
        
        # Return domain with highest score, or generate from top terms
        if domain_scores:
            best_domain = max(domain_scores.keys(), key=domain_scores.get)
            return best_domain.replace('_', ' ').title()
        else:
            # Fallback: use top 2 terms
            return f"{terms[0].title()} {terms[1].title()}"
    
    def build_feature_based_clustering(self) -> Dict[str, Any]:
        """Build clusters based on numerical features from application analysis"""
        logger.info("Building feature-based clusters")
        
        # Prepare feature matrix
        feature_data = []
        app_names = []
        
        for app in self.applications_data:
            app_name = app['app_name']
            
            # Skip apps with missing data
            if not app.get('dependency_profile') or not app.get('sdk_profile'):
                continue
                
            app_names.append(app_name)
            
            # Extract numerical features
            features = [
                app.get('overall_complexity_score', 0),
                app.get('technical_sophistication', 0),
                app.get('base44_integration_level', 0),
                app.get('user_experience_complexity', 0),
                app.get('dependency_profile', {}).get('total_dependencies', 0),
                app.get('sdk_profile', {}).get('api_calls_total', 0),
                len(app.get('sdk_profile', {}).get('entities_used', [])),
                app.get('content_profile', {}).get('unique_words', 0),
                len(app.get('content_profile', {}).get('page_names', [])),
            ]
            
            feature_data.append(features)
        
        feature_matrix = np.array(feature_data)
        
        # Normalize features
        scaler = StandardScaler()
        feature_matrix_scaled = scaler.fit_transform(feature_matrix)
        
        self.feature_matrix = feature_matrix_scaled
        
        # Try different clustering algorithms
        clustering_results = {}
        
        # K-Means clustering
        best_k = self._find_optimal_k(feature_matrix_scaled, max_k=8)
        kmeans = KMeans(n_clusters=best_k, random_state=42)
        kmeans_labels = kmeans.fit_predict(feature_matrix_scaled)
        
        clustering_results['kmeans'] = {
            'labels': kmeans_labels,
            'n_clusters': best_k,
            'cluster_centers': kmeans.cluster_centers_.tolist()
        }
        
        # DBSCAN clustering
        dbscan = DBSCAN(eps=0.5, min_samples=3)
        dbscan_labels = dbscan.fit_predict(feature_matrix_scaled)
        n_clusters_dbscan = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
        
        clustering_results['dbscan'] = {
            'labels': dbscan_labels,
            'n_clusters': n_clusters_dbscan,
            'n_noise': list(dbscan_labels).count(-1)
        }
        
        # Store results with app names
        for method, results in clustering_results.items():
            self.cluster_labels[method] = dict(zip(app_names, results['labels']))
        
        self.clusters = clustering_results
        logger.info(f"Feature-based clustering complete. K-means: {best_k} clusters, DBSCAN: {n_clusters_dbscan} clusters")
        
        return clustering_results
    
    def _find_optimal_k(self, X: np.ndarray, max_k: int = 10) -> int:
        """Find optimal number of clusters using elbow method and silhouette score"""
        inertias = []
        silhouette_scores = []
        k_range = range(2, max_k + 1)
        
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42)
            labels = kmeans.fit_predict(X)
            
            inertias.append(kmeans.inertia_)
            sil_score = silhouette_score(X, labels)
            silhouette_scores.append(sil_score)
        
        # Choose k with highest silhouette score
        optimal_k = k_range[np.argmax(silhouette_scores)]
        logger.info(f"Optimal K selected: {optimal_k} (silhouette score: {max(silhouette_scores):.3f})")
        
        return optimal_k
    
    def integrate_taxonomies(self) -> Dict[str, Any]:
        """Integrate LDA topics and feature-based clusters into final taxonomy"""
        logger.info("Integrating taxonomies into final classification system")
        
        integrated_results = {}
        
        # For each application, combine topic and cluster information
        for app in self.applications_data:
            app_name = app['app_name']
            
            # Get topic assignment
            lda_info = self.application_topics.get(app_name, {})
            
            # Get cluster assignment (using K-means as primary)
            kmeans_cluster = self.cluster_labels.get('kmeans', {}).get(app_name, -1)
            
            # Get existing category hints
            content_profile = app.get('content_profile', {})
            category_hints = content_profile.get('app_category_hints', [])
            business_domain = content_profile.get('business_domain', '')
            
            # Determine final category
            final_category = self._determine_final_category(
                lda_info, kmeans_cluster, category_hints, business_domain
            )
            
            integrated_results[app_name] = {
                'final_category': final_category,
                'lda_topic': lda_info.get('primary_topic', -1),
                'lda_confidence': lda_info.get('confidence', 0),
                'feature_cluster': kmeans_cluster,
                'business_domain': business_domain,
                'category_hints': category_hints,
                'complexity_level': app.get('overall_complexity_score', 0)
            }
        
        self.application_categories = integrated_results
        
        # Generate taxonomy summary
        taxonomy_summary = self._generate_taxonomy_summary()
        self.final_taxonomy = taxonomy_summary
        
        logger.info("Taxonomy integration complete")
        return taxonomy_summary
    
    def _determine_final_category(self, lda_info: Dict, cluster: int, 
                                 hints: List[str], domain: str) -> str:
        """Determine final category by integrating multiple classification sources"""
        
        # Get topic name if available
        topic_idx = lda_info.get('primary_topic', -1)
        topic_name = ""
        if topic_idx >= 0 and topic_idx in self.topic_terms:
            topic_name = self.topic_terms[topic_idx]['name'].lower()
        
        # Combine evidence from different sources
        category_candidates = []
        
        # From LDA topic
        if topic_name:
            category_candidates.append(topic_name)
        
        # From business domain
        if domain:
            category_candidates.append(domain)
        
        # From category hints
        for hint in hints:
            if 'app' in hint:
                clean_hint = hint.replace('_app', '').replace('app_', '')
                category_candidates.append(clean_hint)
        
        # Vote on most common category
        if category_candidates:
            category_counts = Counter(category_candidates)
            most_common = category_counts.most_common(1)[0][0]
            return most_common
        else:
            # Fallback based on cluster
            cluster_names = {
                0: "productivity",
                1: "social", 
                2: "analytics",
                3: "ecommerce",
                4: "utility"
            }
            return cluster_names.get(cluster, "uncategorized")
    
    def _generate_taxonomy_summary(self) -> Dict[str, Any]:
        """Generate comprehensive taxonomy summary"""
        
        # Count applications by final category
        category_counts = Counter()
        complexity_by_category = {}
        
        for app_name, app_info in self.application_categories.items():
            category = app_info['final_category']
            category_counts[category] += 1
            
            if category not in complexity_by_category:
                complexity_by_category[category] = []
            complexity_by_category[category].append(app_info['complexity_level'])
        
        # Calculate average complexity per category
        avg_complexity_by_category = {}
        for category, complexities in complexity_by_category.items():
            avg_complexity_by_category[category] = np.mean(complexities)
        
        # Topic distribution
        topic_distribution = {}
        for topic_idx, topic_info in self.topic_terms.items():
            apps_in_topic = [app for app, info in self.application_categories.items() 
                           if info['lda_topic'] == topic_idx]
            topic_distribution[topic_info['name']] = {
                'app_count': len(apps_in_topic),
                'top_terms': topic_info['terms'][:5],
                'applications': apps_in_topic
            }
        
        summary = {
            'total_applications': len(self.application_categories),
            'categories': dict(category_counts.most_common()),
            'average_complexity_by_category': avg_complexity_by_category,
            'topic_distribution': topic_distribution,
            'lda_topics': len(self.topic_terms),
            'feature_clusters': self.clusters.get('kmeans', {}).get('n_clusters', 0)
        }
        
        return summary
    
    def visualize_taxonomy(self, output_dir: str = "data/processed/visualizations"):
        """Generate visualizations of the taxonomy"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Set style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # 1. Category distribution pie chart
        plt.figure(figsize=(10, 8))
        categories = list(self.final_taxonomy['categories'].keys())
        counts = list(self.final_taxonomy['categories'].values())
        
        plt.pie(counts, labels=categories, autopct='%1.1f%%', startangle=90)
        plt.title('Base44 Application Category Distribution', fontsize=16, fontweight='bold')
        plt.axis('equal')
        plt.tight_layout()
        plt.savefig(output_path / 'category_distribution.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. Complexity by category bar chart
        plt.figure(figsize=(12, 6))
        complexity_data = self.final_taxonomy['average_complexity_by_category']
        categories = list(complexity_data.keys())
        complexities = list(complexity_data.values())
        
        bars = plt.bar(categories, complexities, color='skyblue', edgecolor='navy', alpha=0.7)
        plt.title('Average Complexity Score by Application Category', fontsize=14, fontweight='bold')
        plt.xlabel('Application Category')
        plt.ylabel('Average Complexity Score')
        plt.xticks(rotation=45, ha='right')
        
        # Add value labels on bars
        for bar, value in zip(bars, complexities):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01, 
                    f'{value:.2f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.savefig(output_path / 'complexity_by_category.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. t-SNE visualization of applications (if we have feature matrix)
        if self.feature_matrix is not None:
            plt.figure(figsize=(12, 10))
            
            # Apply t-SNE
            tsne = TSNE(n_components=2, random_state=42, perplexity=min(30, len(self.feature_matrix)//4))
            tsne_results = tsne.fit_transform(self.feature_matrix)
            
            # Color by category
            app_names = [app['app_name'] for app in self.applications_data 
                        if app.get('dependency_profile') and app.get('sdk_profile')]
            
            categories_for_plot = [self.application_categories.get(name, {}).get('final_category', 'unknown') 
                                 for name in app_names]
            
            unique_categories = list(set(categories_for_plot))
            colors = plt.cm.Set3(np.linspace(0, 1, len(unique_categories)))
            
            for i, category in enumerate(unique_categories):
                mask = np.array(categories_for_plot) == category
                plt.scatter(tsne_results[mask, 0], tsne_results[mask, 1], 
                          c=[colors[i]], label=category, alpha=0.7, s=100)
            
            plt.title('t-SNE Visualization of Base44 Applications', fontsize=14, fontweight='bold')
            plt.xlabel('t-SNE Component 1')
            plt.ylabel('t-SNE Component 2')
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
            plt.tight_layout()
            plt.savefig(output_path / 'tsne_visualization.png', dpi=300, bbox_inches='tight')
            plt.close()
        
        logger.info(f"Visualizations saved to {output_path}")
    
    def export_taxonomy(self, output_path: str = "data/processed/base44_taxonomy.json"):
        """Export complete taxonomy results to JSON"""
        
        export_data = {
            'taxonomy_summary': self.final_taxonomy,
            'lda_topics': self.topic_terms,
            'application_categories': self.application_categories,
            'clustering_results': self.clusters,
            'methodology': {
                'lda_topics': len(self.topic_terms),
                'feature_clusters': self.clusters.get('kmeans', {}).get('n_clusters', 0),
                'total_applications': len(self.application_categories),
                'text_corpus_size': len(self.text_corpus)
            }
        }
        
        output_dir = Path(output_path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        logger.info(f"Taxonomy exported to {output_path}")
        
        # Also create a simplified CSV for easy analysis
        csv_data = []
        for app_name, app_info in self.application_categories.items():
            csv_data.append({
                'app_name': app_name,
                'final_category': app_info['final_category'],
                'business_domain': app_info['business_domain'],
                'lda_topic': app_info['lda_topic'],
                'lda_confidence': app_info['lda_confidence'],
                'feature_cluster': app_info['feature_cluster'],
                'complexity_level': app_info['complexity_level']
            })
        
        df = pd.DataFrame(csv_data)
        csv_path = output_path.replace('.json', '.csv')
        df.to_csv(csv_path, index=False)
        logger.info(f"Taxonomy CSV exported to {csv_path}")


def main():
    """Run the taxonomy building process"""
    taxonomy_builder = TaxonomyBuilder()
    
    # Load application data
    applications = taxonomy_builder.load_application_data()
    print(f"Loaded {len(applications)} applications for taxonomy building")
    
    # Build LDA-based taxonomy
    lda_topics = taxonomy_builder.build_lda_taxonomy(n_topics=7)
    print(f"\nLDA Topics Generated:")
    for topic_id, topic_info in lda_topics.items():
        print(f"  Topic {topic_id}: {topic_info['name']}")
        print(f"    Top terms: {', '.join(topic_info['terms'][:5])}")
    
    # Build feature-based clustering
    clusters = taxonomy_builder.build_feature_based_clustering()
    print(f"\nClustering Results:")
    print(f"  K-means clusters: {clusters['kmeans']['n_clusters']}")
    print(f"  DBSCAN clusters: {clusters['dbscan']['n_clusters']}")
    
    # Integrate taxonomies
    final_taxonomy = taxonomy_builder.integrate_taxonomies()
    print(f"\nFinal Taxonomy:")
    print(f"  Total applications: {final_taxonomy['total_applications']}")
    print(f"  Categories found:")
    for category, count in final_taxonomy['categories'].items():
        print(f"    {category}: {count} apps")
    
    # Generate visualizations
    taxonomy_builder.visualize_taxonomy()
    
    # Export results
    taxonomy_builder.export_taxonomy()
    
    print(f"\nTaxonomy building complete! Check data/processed/ for results.")


if __name__ == "__main__":
    main()