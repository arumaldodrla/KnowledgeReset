"""
Knowledge Reset Crawler - Embeddings Generator
Generates vector embeddings for document content using OpenAI.
"""

import os
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Model for embeddings (1536 dimensions)
EMBEDDING_MODEL = "text-embedding-3-small"


def generate_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for the given text.
    
    Args:
        text: The text to embed (will be truncated if too long)
        
    Returns:
        List of 1536 floats representing the embedding
    """
    # Truncate text if too long (max ~8000 tokens for embedding model)
    # Rough estimate: 4 chars per token
    max_chars = 30000
    if len(text) > max_chars:
        text = text[:max_chars]
    
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    
    return response.data[0].embedding


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in a single API call.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List of embeddings (each is a list of 1536 floats)
    """
    # Truncate each text
    max_chars = 30000
    truncated_texts = [t[:max_chars] if len(t) > max_chars else t for t in texts]
    
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=truncated_texts
    )
    
    # Sort by index to maintain order
    embeddings = [None] * len(texts)
    for item in response.data:
        embeddings[item.index] = item.embedding
    
    return embeddings
