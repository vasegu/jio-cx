"""Unified OpenTelemetry tracing for LiveKit + LangGraph.

Both LiveKit agents and LangGraph emit OTel spans. This module sets up
a single TracerProvider that exports to Langfuse (and optionally GCP
Cloud Trace), so the entire voice pipeline shows up in one trace:

    LiveKit audio → Sarvam STT → LangGraph router → tool calls → Sarvam TTS

Usage:
    from tracing import setup_tracing
    setup_tracing()  # call once at startup, before creating agents

Env vars:
    LANGFUSE_PUBLIC_KEY     (required for Langfuse)
    LANGFUSE_SECRET_KEY     (required for Langfuse)
    LANGFUSE_HOST           (default: https://cloud.langfuse.com)
    OTEL_EXPORTER           langfuse | gcp | console | none (default: langfuse)
"""

import os
import logging

log = logging.getLogger("jio-tracing")


def setup_tracing():
    """Initialize OpenTelemetry with the configured exporter.

    Call this once at startup. Both LiveKit and LangGraph will
    automatically pick up the global TracerProvider.
    """
    exporter_type = os.getenv("OTEL_EXPORTER", "langfuse").lower()

    if exporter_type == "none":
        log.info("Tracing disabled (OTEL_EXPORTER=none)")
        return

    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
    from opentelemetry.sdk.resources import Resource
    from opentelemetry import trace

    resource = Resource.create({
        "service.name": "jio-voice-agent",
        "service.version": "0.1.0",
        "deployment.environment": os.getenv("ENVIRONMENT", "dev"),
    })

    provider = TracerProvider(resource=resource)

    if exporter_type == "langfuse":
        try:
            from langfuse.opentelemetry import LangfuseSpanExporter
            exporter = LangfuseSpanExporter()
            provider.add_span_processor(BatchSpanProcessor(exporter))
            log.info(f"Tracing: Langfuse ({os.getenv('LANGFUSE_HOST', 'cloud.langfuse.com')})")
        except ImportError:
            log.warning("langfuse not installed, falling back to console exporter")
            provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        except Exception as e:
            log.warning(f"Langfuse init failed ({e}), falling back to console")
            provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

    elif exporter_type == "gcp":
        try:
            from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
            exporter = CloudTraceSpanExporter()
            provider.add_span_processor(BatchSpanProcessor(exporter))
            log.info("Tracing: GCP Cloud Trace")
        except ImportError:
            log.warning("Cloud Trace exporter not installed, falling back to console")
            provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))

    elif exporter_type == "console":
        provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
        log.info("Tracing: console (stdout)")

    else:
        log.warning(f"Unknown OTEL_EXPORTER={exporter_type}, disabling tracing")
        return

    trace.set_tracer_provider(provider)
    log.info("OpenTelemetry TracerProvider configured")
