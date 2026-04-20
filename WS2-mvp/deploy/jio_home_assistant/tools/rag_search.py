"""RAG search tool - queries Vertex AI RAG corpus for Jio knowledge base.

Uses lazy init to avoid conflicting with Agent Engine's own vertexai.init().
"""

import json

RAG_CORPUS = "projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952"
_rag_initialized = False


def _ensure_rag_init():
    """Lazy init - only runs once, doesn't conflict with Agent Engine."""
    global _rag_initialized
    if not _rag_initialized:
        import vertexai
        vertexai.init(project="jiobuddy-492811", location="europe-west1")
        _rag_initialized = True


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
    _ensure_rag_init()
    from vertexai import rag

    response = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=RAG_CORPUS)],
        text=query,
        rag_retrieval_config=rag.RagRetrievalConfig(top_k=5),
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
