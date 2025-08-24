
import React, { useEffect } from 'react';

const Seo = ({ title, description, keywords, imageUrl, jsonLdSchema }) => {
  useEffect(() => {
    // Set document title
    if (title) {
      document.title = title;
    }

    // Set meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Set meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Open Graph tags
    const setMetaProperty = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    if (title) {
      setMetaProperty('og:title', title);
      setMetaProperty('og:site_name', 'Prompt Crafter');
    }
    if (description) {
      setMetaProperty('og:description', description);
    }
    setMetaProperty('og:type', 'website');
    setMetaProperty('og:url', window.location.href);
    if (imageUrl) {
      setMetaProperty('og:image', imageUrl);
    }
    setMetaProperty('og:locale', 'he_IL');
    setMetaProperty('og:locale:alternate', 'en_US');

    // Twitter Card tags
    const setTwitterMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setTwitterMeta('twitter:card', 'summary_large_image');
    if (title) setTwitterMeta('twitter:title', title);
    if (description) setTwitterMeta('twitter:description', description);
    if (imageUrl) {
      setTwitterMeta('twitter:image', imageUrl);
    }

    // Additional SEO meta tags
    const setMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('googlebot', 'index, follow');
    setMeta('bingbot', 'index, follow');
    setMeta('language', 'Hebrew');
    setMeta('author', 'BASE 44');
    setMeta('generator', 'BASE 44 Platform');
    setMeta('theme-color', '#6366f1');
    
    // Canonical URL
    const setCanonical = () => {
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.setAttribute('rel', 'canonical');
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.setAttribute('href', window.location.href);
    };
    setCanonical();
    
    // Manage JSON-LD script
    const scriptId = 'json-ld-schema';
    let scriptTag = document.getElementById(scriptId);
    if (jsonLdSchema) {
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = scriptId;
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        // Add current URL to the schema dynamically
        scriptTag.innerHTML = JSON.stringify({
            ...jsonLdSchema,
            url: window.location.href
        });
    } else if (scriptTag) {
        // Clean up if no schema is provided on subsequent renders
        scriptTag.remove();
    }

  }, [title, description, keywords, imageUrl, jsonLdSchema]);

  // This component doesn't render anything to the DOM itself
  return null; 
};

export default Seo;
