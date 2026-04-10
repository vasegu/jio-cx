"""RAG search tool - queries Vertex AI RAG corpus for Jio knowledge base."""

import json
import vertexai
from vertexai import rag

# RAG corpus in europe-west1 (different region from model in us-central1)
RAG_CORPUS = "projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952"

# Init vertexai for RAG (europe-west1)
vertexai.init(project="jiobuddy-492811", location="europe-west1")


def jio_knowledge_search(query: str) -> str:
    """Search the Jio knowledge base for information about broadband plans,
    pricing, OTT bundles, troubleshooting steps, billing, support channels,
    and FAQs. Works with Hindi, Hinglish, and English queries.

    ALWAYS use this tool before answering any factual question about Jio.
    Do not guess plan details, prices, or troubleshooting steps.

    Args:
        query: the question or topic to search for, in any language

    Returns:
        relevant information from the Jio knowledge base
    """
    response = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=RAG_CORPUS)],
        text=query,
        similarity_top_k=5,
        vector_distance_threshold=0.5,
    )

    if not response.contexts or not response.contexts.contexts:
        return json.dumps({"results": [], "message": "No relevant information found in knowledge base."})

    results = []
    for ctx in response.contexts.contexts:
        results.append({
            "text": ctx.text[:500] if ctx.text else "",
            "score": round(ctx.score, 3) if ctx.score else None,
            "source": ctx.source_uri.split("/")[-1] if ctx.source_uri else "unknown",
        })

    return json.dumps({"results": results, "count": len(results)}, indent=2)
