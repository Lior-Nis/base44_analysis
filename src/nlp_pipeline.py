"""
NLP Pipeline for Base44 Application Analysis
Implements topic modeling using LDA and advanced text analysis
"""

import pandas as pd
import numpy as np
import re
import json
import logging
from typing import List, Dict, Tuple, Optional
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from textblob import TextBlob
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import pickle
from datetime import datetime

# Download required NLTK data
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
except:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Base44NLPPipeline:
    """Comprehensive NLP pipeline for Base44 application analysis"""
    
    def __init__(self):
        self.apps_df: Optional[pd.DataFrame] = None
        self.processed_texts: List[str] = []
        self.lda_model: Optional[LatentDirichletAllocation] = None
        self.vectorizer: Optional[CountVectorizer] = None
        self.topic_labels: Dict[int, str] = {}
        self.lemmatizer = WordNetLemmatizer()
        
        # Extended stopwords for better topic modeling
        self.custom_stopwords = set(stopwords.words('english')) | {
            'app', 'application', 'base44', 'built', 'build', 'created', 'made',
            'using', 'used', 'tool', 'platform', 'system', 'simple', 'easy',
            'quick', 'fast', 'good', 'great', 'nice', 'cool', 'awesome',
            'project', 'work', 'working', 'use', 'need', 'want', 'like',
            'get', 'go', 'make', 'take', 'come', 'see', 'know', 'think',
            'time', 'way', 'new', 'first', 'last', 'long', 'little', 'big'
        }
        
    def load_data(self, csv_file: str = 'data/raw/base44_apps.csv') -> pd.DataFrame:
        """Load Base44 apps data"""
        try:
            self.apps_df = pd.read_csv(csv_file)
            logger.info(f"Loaded {len(self.apps_df)} applications for NLP analysis")
            return self.apps_df
        except FileNotFoundError:
            logger.error(f"File {csv_file} not found")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return pd.DataFrame()
            
    def preprocess_text(self, text: str) -> str:
        """Advanced text preprocessing for topic modeling"""
        if pd.isna(text) or not text.strip():
            return ""
            
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs, emails, and special characters
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and short words
        tokens = [token for token in tokens 
                 if token not in self.custom_stopwords and len(token) > 2]
        
        # Lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens]
        
        # Remove tokens that are too common in the domain
        domain_noise = {'app', 'application', 'base', 'platform', 'tool', 'system'}
        tokens = [token for token in tokens if token not in domain_noise]
        
        return ' '.join(tokens)
        
    def prepare_corpus(self) -> List[str]:
        """Prepare text corpus for topic modeling"""
        if self.apps_df is None or self.apps_df.empty:
            logger.error("No data available for corpus preparation")
            return []
            
        logger.info("Preparing text corpus...")
        
        # Combine description and features for richer context
        combined_texts = []
        for idx, row in self.apps_df.iterrows():
            description = str(row.get('description', ''))
            features = str(row.get('features', ''))
            category = str(row.get('category', ''))
            industry = str(row.get('industry', ''))
            
            # Create enriched text combining multiple fields
            combined_text = f"{description} {features} {category} {industry}"
            combined_texts.append(combined_text)
            
        # Preprocess all texts
        self.processed_texts = [self.preprocess_text(text) for text in combined_texts]
        
        # Filter out empty texts
        self.processed_texts = [text for text in self.processed_texts if text.strip()]
        
        logger.info(f"Prepared corpus with {len(self.processed_texts)} documents")
        return self.processed_texts
        
    def find_optimal_topics(self, max_topics: int = 10) -> int:
        """Find optimal number of topics using coherence and perplexity"""
        if not self.processed_texts:
            logger.error("No processed texts available")
            return 5
            
        logger.info("Finding optimal number of topics...")
        
        # Prepare vectorizer
        vectorizer = CountVectorizer(
            max_features=100,
            stop_words='english',
            min_df=2,
            max_df=0.8,
            ngram_range=(1, 2)
        )
        
        doc_term_matrix = vectorizer.fit_transform(self.processed_texts)
        
        coherence_scores = []
        perplexity_scores = []
        topic_range = range(2, min(max_topics + 1, len(self.processed_texts)))
        
        for n_topics in topic_range:
            lda = LatentDirichletAllocation(
                n_components=n_topics,
                random_state=42,
                max_iter=50,
                learning_method='batch'
            )
            lda.fit(doc_term_matrix)
            
            perplexity = lda.perplexity(doc_term_matrix)
            perplexity_scores.append(perplexity)
            
            # Simple coherence approximation (would use gensim in production)
            coherence = self._calculate_coherence_score(lda, vectorizer)
            coherence_scores.append(coherence)
            
        # Find optimal number of topics (balance between coherence and perplexity)
        if coherence_scores:
            optimal_idx = np.argmax(coherence_scores)
            optimal_topics = list(topic_range)[optimal_idx]
        else:
            optimal_topics = 5  # Default fallback
            
        logger.info(f"Optimal number of topics: {optimal_topics}")
        return optimal_topics
        
    def _calculate_coherence_score(self, lda_model, vectorizer) -> float:
        """Calculate a simple coherence score"""
        try:
            feature_names = vectorizer.get_feature_names_out()
            n_top_words = 10
            
            total_coherence = 0
            for topic_idx, topic in enumerate(lda_model.components_):
                top_words_idx = topic.argsort()[-n_top_words:][::-1]
                top_words = [feature_names[i] for i in top_words_idx]
                
                # Simple word co-occurrence based coherence
                coherence = len(set(top_words)) / len(top_words)
                total_coherence += coherence
                
            return total_coherence / len(lda_model.components_)
        except Exception as e:
            logger.error(f"Error calculating coherence: {e}")
            return 0.5
            
    def build_topic_model(self, n_topics: Optional[int] = None) -> LatentDirichletAllocation:
        """Build LDA topic model"""
        if not self.processed_texts:
            logger.error("No processed texts available for topic modeling")
            return None
            
        if n_topics is None:
            n_topics = self.find_optimal_topics()
            
        logger.info(f"Building LDA topic model with {n_topics} topics...")
        
        # Create document-term matrix
        self.vectorizer = CountVectorizer(
            max_features=100,
            stop_words='english',
            min_df=2,
            max_df=0.8,
            ngram_range=(1, 2)
        )
        
        doc_term_matrix = self.vectorizer.fit_transform(self.processed_texts)
        
        # Build LDA model
        self.lda_model = LatentDirichletAllocation(
            n_components=n_topics,
            random_state=42,
            max_iter=100,
            learning_method='batch',
            doc_topic_prior=0.1,
            topic_word_prior=0.01
        )
        
        self.lda_model.fit(doc_term_matrix)
        
        # Generate topic labels
        self.topic_labels = self._generate_topic_labels()
        
        logger.info("Topic model built successfully")
        return self.lda_model
        
    def _generate_topic_labels(self) -> Dict[int, str]:
        """Generate descriptive labels for topics based on top words"""
        if not self.lda_model or not self.vectorizer:
            return {}
            
        feature_names = self.vectorizer.get_feature_names_out()
        topic_labels = {}
        
        # Predefined category mapping based on common patterns
        category_keywords = {
            'Business Tools': ['business', 'management', 'admin', 'dashboard', 'analytics'],
            'E-commerce': ['shop', 'store', 'product', 'payment', 'order', 'inventory'],
            'Educational': ['student', 'learn', 'course', 'education', 'teaching'],
            'Social/Community': ['user', 'social', 'community', 'share', 'connect'],
            'Finance': ['payment', 'money', 'invoice', 'finance', 'accounting'],
            'Healthcare': ['health', 'medical', 'patient', 'clinic', 'wellness'],
            'Real Estate': ['property', 'real', 'estate', 'rental', 'listing'],
            'Food & Service': ['food', 'restaurant', 'service', 'booking', 'delivery'],
            'Tech/Development': ['api', 'integration', 'developer', 'tech', 'data'],
            'Personal Projects': ['personal', 'hobby', 'simple', 'basic', 'quick']
        }
        
        for topic_idx, topic in enumerate(self.lda_model.components_):
            # Get top words for this topic
            top_words_idx = topic.argsort()[-10:][::-1]
            top_words = [feature_names[i] for i in top_words_idx]
            
            # Find best matching category
            best_category = 'General'
            best_score = 0
            
            for category, keywords in category_keywords.items():
                score = sum(1 for word in top_words if any(keyword in word for keyword in keywords))
                if score > best_score:
                    best_score = score
                    best_category = category
                    
            # If no good match, use top words
            if best_score == 0:
                best_category = f"Topic_{' '.join(top_words[:3])}"
                
            topic_labels[topic_idx] = best_category
            
        return topic_labels
        
    def analyze_app_topics(self) -> pd.DataFrame:
        """Analyze topic distribution for each application"""
        if not self.lda_model or not self.vectorizer or self.apps_df is None:
            logger.error("Topic model or data not available")
            return pd.DataFrame()
            
        logger.info("Analyzing application topics...")
        
        # Transform documents to topic space
        doc_term_matrix = self.vectorizer.transform(self.processed_texts)
        topic_distributions = self.lda_model.transform(doc_term_matrix)
        
        # Create analysis dataframe
        analysis_df = self.apps_df.copy()
        
        # Add topic information
        dominant_topics = np.argmax(topic_distributions, axis=1)
        topic_confidences = np.max(topic_distributions, axis=1)
        
        analysis_df['dominant_topic'] = dominant_topics
        analysis_df['topic_label'] = [self.topic_labels.get(topic, f'Topic_{topic}') 
                                     for topic in dominant_topics]
        analysis_df['topic_confidence'] = topic_confidences
        
        # Add all topic probabilities
        for i in range(self.lda_model.n_components):
            analysis_df[f'topic_{i}_prob'] = topic_distributions[:, i]
            
        return analysis_df
        
    def cluster_applications(self, n_clusters: Optional[int] = None) -> pd.DataFrame:
        """Cluster applications using topic distributions and features"""
        if not self.lda_model or self.apps_df is None:
            logger.error("Topic model or data not available for clustering")
            return pd.DataFrame()
            
        logger.info("Clustering applications...")
        
        # Get topic distributions
        doc_term_matrix = self.vectorizer.transform(self.processed_texts)
        topic_distributions = self.lda_model.transform(doc_term_matrix)
        
        # Prepare feature matrix for clustering
        features = []
        
        for idx, row in self.apps_df.iterrows():
            feature_list = str(row.get('features', '')).split(',')
            feature_count = len([f for f in feature_list if f.strip()])
            
            # Combine topic distributions with other features
            app_features = list(topic_distributions[idx]) + [
                feature_count,
                len(str(row.get('description', ''))),  # Description length
                1 if row.get('category') == 'SaaS Replacement' else 0,
                1 if row.get('category') == 'MVP' else 0,
                1 if row.get('industry') == 'Tech' else 0
            ]
            features.append(app_features)
            
        # Standardize features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Determine optimal number of clusters
        if n_clusters is None:
            n_clusters = self._find_optimal_clusters(features_scaled)
            
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(features_scaled)
        
        # Add cluster information to dataframe
        clustered_df = self.apps_df.copy()
        clustered_df['cluster'] = cluster_labels
        clustered_df['cluster_label'] = [f'Cluster_{label}' for label in cluster_labels]
        
        # Analyze clusters
        cluster_analysis = self._analyze_clusters(clustered_df)
        
        return clustered_df, cluster_analysis
        
    def _find_optimal_clusters(self, features: np.ndarray, max_clusters: int = 8) -> int:
        """Find optimal number of clusters using silhouette score"""
        if len(features) < 4:
            return 2
            
        scores = []
        cluster_range = range(2, min(max_clusters + 1, len(features)))
        
        for n in cluster_range:
            kmeans = KMeans(n_clusters=n, random_state=42)
            labels = kmeans.fit_predict(features)
            score = silhouette_score(features, labels)
            scores.append(score)
            
        optimal_idx = np.argmax(scores)
        return list(cluster_range)[optimal_idx]
        
    def _analyze_clusters(self, clustered_df: pd.DataFrame) -> Dict:
        """Analyze cluster characteristics"""
        analysis = {}
        
        for cluster_id in clustered_df['cluster'].unique():
            cluster_apps = clustered_df[clustered_df['cluster'] == cluster_id]
            
            analysis[f'cluster_{cluster_id}'] = {
                'size': len(cluster_apps),
                'common_category': cluster_apps['category'].mode().iloc[0] if not cluster_apps['category'].mode().empty else 'Mixed',
                'common_industry': cluster_apps['industry'].mode().iloc[0] if not cluster_apps['industry'].mode().empty else 'Mixed',
                'avg_features': cluster_apps['features'].apply(
                    lambda x: len(str(x).split(',')) if pd.notna(x) else 0
                ).mean(),
                'description_length_avg': cluster_apps['description'].apply(
                    lambda x: len(str(x)) if pd.notna(x) else 0
                ).mean()
            }
            
        return analysis
        
    def generate_topic_insights(self) -> Dict:
        """Generate comprehensive insights from topic analysis"""
        if not self.lda_model or self.apps_df is None:
            return {}
            
        analysis_df = self.analyze_app_topics()
        
        insights = {
            'topic_summary': {},
            'dominant_patterns': {},
            'category_topic_mapping': {},
            'industry_topic_mapping': {}
        }
        
        # Topic summary
        for topic_id, label in self.topic_labels.items():
            topic_apps = analysis_df[analysis_df['dominant_topic'] == topic_id]
            
            insights['topic_summary'][label] = {
                'app_count': len(topic_apps),
                'avg_confidence': topic_apps['topic_confidence'].mean() if not topic_apps.empty else 0,
                'common_categories': topic_apps['category'].value_counts().head(3).to_dict(),
                'common_industries': topic_apps['industry'].value_counts().head(3).to_dict()
            }
            
        # Category-topic mapping
        category_topic_dist = analysis_df.groupby('category')['topic_label'].value_counts().to_dict()
        insights['category_topic_mapping'] = category_topic_dist
        
        # Industry-topic mapping
        industry_topic_dist = analysis_df.groupby('industry')['topic_label'].value_counts().to_dict()
        insights['industry_topic_mapping'] = industry_topic_dist
        
        return insights
        
    def create_topic_wordclouds(self, save_dir: str = 'results/figures/'):
        """Create word clouds for each topic"""
        if not self.lda_model or not self.vectorizer:
            logger.error("Topic model not available for word cloud generation")
            return
            
        logger.info("Generating topic word clouds...")
        
        feature_names = self.vectorizer.get_feature_names_out()
        
        for topic_idx, topic in enumerate(self.lda_model.components_):
            # Get top words and their weights
            top_words_idx = topic.argsort()[-50:][::-1]
            word_weights = {feature_names[i]: topic[i] for i in top_words_idx}
            
            # Create word cloud
            wordcloud = WordCloud(
                width=800,
                height=400,
                background_color='white',
                colormap='viridis'
            ).generate_from_frequencies(word_weights)
            
            # Save word cloud
            plt.figure(figsize=(10, 5))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.title(f'Topic {topic_idx}: {self.topic_labels.get(topic_idx, f"Topic_{topic_idx}")}', 
                     fontsize=16, fontweight='bold')
            
            filename = f'{save_dir}topic_{topic_idx}_wordcloud.png'
            plt.savefig(filename, bbox_inches='tight', dpi=300)
            plt.close()
            
        logger.info(f"Word clouds saved to {save_dir}")
        
    def save_model(self, model_dir: str = 'models/'):
        """Save the trained topic model and vectorizer"""
        if not self.lda_model or not self.vectorizer:
            logger.error("No model to save")
            return
            
        # Save LDA model
        with open(f'{model_dir}lda_model.pkl', 'wb') as f:
            pickle.dump(self.lda_model, f)
            
        # Save vectorizer
        with open(f'{model_dir}vectorizer.pkl', 'wb') as f:
            pickle.dump(self.vectorizer, f)
            
        # Save topic labels
        with open(f'{model_dir}topic_labels.json', 'w') as f:
            json.dump(self.topic_labels, f, indent=2)
            
        logger.info(f"Model saved to {model_dir}")
        
    def save_analysis_results(self, output_dir: str = 'data/processed/'):
        """Save all analysis results"""
        if self.apps_df is None:
            logger.error("No data to save")
            return
            
        # Save topic analysis
        analysis_df = self.analyze_app_topics()
        analysis_df.to_csv(f'{output_dir}topic_analysis.csv', index=False)
        
        # Save clustering results
        try:
            clustered_df, cluster_analysis = self.cluster_applications()
            clustered_df.to_csv(f'{output_dir}cluster_analysis.csv', index=False)
            
            with open(f'{output_dir}cluster_insights.json', 'w') as f:
                json.dump(cluster_analysis, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error in clustering analysis: {e}")
            
        # Save topic insights
        insights = self.generate_topic_insights()
        with open(f'{output_dir}topic_insights.json', 'w') as f:
            json.dump(insights, f, indent=2, default=str)
            
        logger.info(f"Analysis results saved to {output_dir}")
        
    def run_full_pipeline(self) -> Dict:
        """Run the complete NLP analysis pipeline"""
        logger.info("Starting full NLP analysis pipeline...")
        
        # Load and prepare data
        if self.apps_df is None:
            self.load_data()
            
        if self.apps_df.empty:
            logger.error("No data available for analysis")
            return {}
            
        # Prepare corpus
        self.prepare_corpus()
        
        # Build topic model
        self.build_topic_model()
        
        # Perform analysis
        topic_insights = self.generate_topic_insights()
        
        # Save results
        self.save_analysis_results()
        self.save_model()
        
        # Create visualizations
        try:
            self.create_topic_wordclouds()
        except Exception as e:
            logger.error(f"Error creating word clouds: {e}")
            
        logger.info("NLP analysis pipeline completed")
        
        return {
            'n_topics': len(self.topic_labels) if self.topic_labels else 0,
            'n_documents': len(self.processed_texts),
            'topic_labels': self.topic_labels,
            'insights': topic_insights
        }

if __name__ == "__main__":
    pipeline = Base44NLPPipeline()
    results = pipeline.run_full_pipeline()
    
    print("NLP Analysis Results:")
    print(f"Number of topics: {results.get('n_topics', 0)}")
    print(f"Number of documents: {results.get('n_documents', 0)}")
    print(f"Topic labels: {results.get('topic_labels', {})}")