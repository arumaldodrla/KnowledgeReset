"""
Knowledge Reset Crawler - Embeddings Generator
Generates vector embeddings for document content using Google Gemini.
Using gemini-embedding-001 (state-of-the-art, launched mid-2025).
"""

import os
from typing import List
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize Google Generative AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Model for embeddings - newer generation model (mid-2025)
# Supports up to 3072 dimensions, but we use 1536 for indexing compatibility
EMBEDDING_MODEL = "models/gemini-embedding-001"
OUTPUT_DIMENSIONS = 1536  # Optimized for accuracy and indexing support


def normalize_embedding(embedding: List[float]) -> List[float]:
    """
    Normalize embeddings for accurate semantic similarity.
    Required for dimensions other than 3072 (which are pre-normalized).
    
    Args:
        embedding: Raw embedding vector
        
    Returns:
        Normalized embedding vector
    """
    embedding_array = np.array(embedding)
    norm = np.linalg.norm(embedding_array)
    if norm == 0:
        return embedding
    return (embedding_array / norm).tolist()


def generate_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for the given text using Google Gemini.
    
    Args:
        text: The text to embed (will be truncated if too long)
        
    Returns:
        List of 768 floats representing the normalized embedding
    """
    # Truncate text if too long (Gemini supports up to 2048 tokens)
    max_chars = 8000  # Conservative estimate: ~4 chars per token
    if len(text) > max_chars:
        text = text[:max_chars]
    
    print(f"DEBUG: Generating Gemini embedding for text ({len(text)} chars)")
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",  # Optimized for document indexing
            output_dimensionality=OUTPUT_DIMENSIONS
        )
        
        # Normalize for accurate cosine similarity (required for non-3072 dimensions)
        embedding = normalize_embedding(result['embedding'])
        
        print(f"DEBUG: Gemini embedding generation finished ({len(embedding)} dims)")
        return embedding
    except Exception as e:
        print(f"DEBUG: Gemini embedding generation failed: {str(e)}")
        raise e


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    
    Note: Processing individually for now. Could optimize with batch API later.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List of embeddings (each is a list of 768 floats)
    """
    embeddings = []
    max_chars = 8000
    
    for i, text in enumerate(texts):
        truncated_text = text[:max_chars] if len(text) > max_chars else text
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=truncated_text,
                task_type="retrieval_document",
                output_dimensionality=OUTPUT_DIMENSIONS
            )
            # Normalize each embedding
            embedding = normalize_embedding(result['embedding'])
            embeddings.append(embedding)
            print(f"DEBUG: Batch embedding {i+1}/{len(texts)} completed")
        except Exception as e:
            print(f"DEBUG: Batch embedding {i+1} failed: {str(e)}")
            # Append None to maintain index alignment
            embeddings.append(None)
    
    return embeddings
