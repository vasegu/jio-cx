# GCP Setup - Working Commands

Reference for the jiobuddy-492811 project. Saves time on auth/API issues.

## Project Details

| Key | Value |
|-----|-------|
| Project ID | jiobuddy-492811 |
| Project Number | 896447499660 |
| gcloud account | vascoe123@gmail.com |
| RAG region | europe-west1 (us-central1 blocked for new Spanner projects) |
| Model region | us-central1 (models work here) |
| RAG Corpus ID | 2305843009213693952 |
| GCS bucket | gs://jio-cx-corpus-eu/ |

## Auth - What Works Where

### API Key (in .env)
- **Works for:** model inference (generateContent, Live API)
- **Does NOT work for:** data management APIs (RAG corpus, file import, GCS)
- **Endpoint:** `aiplatform.googleapis.com` only (key is restricted)
- **NOT** `generativelanguage.googleapis.com` (blocked on this key)

### OAuth / gcloud auth
- **Works for:** everything (RAG, GCS, all Vertex AI APIs)
- **How:** `TOKEN=$(gcloud auth print-access-token)`
- **Use for:** all curl commands to Vertex AI management APIs

### ADK .env file
```
GOOGLE_GENAI_USE_VERTEXAI=TRUE
GOOGLE_CLOUD_PROJECT=jiobuddy-492811
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_API_KEY=<your-api-key>
```

ADK uses the API key for model calls. For RAG retrieval tool, it may need gcloud auth - TBD.

## Models Available

| Model | Works | Endpoint | Use |
|-------|-------|----------|-----|
| gemini-2.5-flash | yes | us-central1 | text chat, sub-agents |
| gemini-2.5-flash-lite | yes | us-central1 | lighter text tasks |
| gemini-live-2.5-flash-native-audio | yes | us-central1 | voice mode (Live API only, no text) |
| gemini-2.0-flash | NO | - | not on this project |

### Test a model
```bash
curl -s "https://us-central1-aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -X POST -H "Content-Type: application/json" \
  -d '{"contents":[{"role":"user","parts":[{"text":"hello"}]}]}'
```

## RAG Corpus

### Why europe-west1
us-central1, us-east1, and us-east4 require allowlisting for Spanner mode on new projects. europe-west1 works without allowlisting.

### Corpus details
- Full path: `projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952`
- Embedding model: `text-embedding-005` (auto-configured)
- Backend: `ragManagedDb` with `knn`

### List corpora
```bash
TOKEN=$(gcloud auth print-access-token)
curl -s "https://europe-west1-aiplatform.googleapis.com/v1/projects/896447499660/locations/europe-west1/ragCorpora" \
  -H "Authorization: Bearer $TOKEN"
```

### Import files from GCS
```bash
TOKEN=$(gcloud auth print-access-token)
CORPUS="projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952"

curl -s -X POST \
  "https://europe-west1-aiplatform.googleapis.com/v1/${CORPUS}/ragFiles:import" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "import_rag_files_config": {
      "gcs_source": {
        "uris": ["gs://jio-cx-corpus-eu/"]
      }
    }
  }'
```

Note: chunking config fields (`rag_file_chunking_config`, `chunk_size`, `chunk_overlap`) are NOT valid on the v1 REST API. Use defaults or configure via Python SDK.

### Check import operation
```bash
TOKEN=$(gcloud auth print-access-token)
curl -s "https://europe-west1-aiplatform.googleapis.com/v1/projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952/operations/OPERATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### List imported files
```bash
TOKEN=$(gcloud auth print-access-token)
curl -s "https://europe-west1-aiplatform.googleapis.com/v1/projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952/ragFiles" \
  -H "Authorization: Bearer $TOKEN"
```

### Query the corpus (test retrieval)
```bash
TOKEN=$(gcloud auth print-access-token)
curl -s -X POST \
  "https://europe-west1-aiplatform.googleapis.com/v1/projects/896447499660/locations/europe-west1:retrieveContexts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vertex_rag_store": {
      "rag_resources": [{
        "rag_corpus": "projects/896447499660/locations/europe-west1/ragCorpora/2305843009213693952"
      }],
      "similarity_top_k": 5,
      "vector_distance_threshold": 0.5
    },
    "query": {
      "text": "mera wifi slow hai"
    }
  }'
```

## GCS Bucket

### Upload corpus files
```bash
gsutil -m cp -r /path/to/corpus/* gs://jio-cx-corpus-eu/
```

### List bucket
```bash
gsutil ls -r gs://jio-cx-corpus-eu/
```

## Enabled APIs

```bash
gcloud services enable aiplatform.googleapis.com --project=jiobuddy-492811
gcloud services enable generativelanguage.googleapis.com --project=jiobuddy-492811
gcloud services enable storage.googleapis.com --project=jiobuddy-492811
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "gemini-2.5-flash is not supported in the live api" | Using text model with Audio button | Switch to `gemini-live-2.5-flash-native-audio` |
| "not supported in the streamGenerateContent API" | Using live model with text input | Switch to `gemini-2.5-flash` for text |
| "Spanner mode restricted to allowlisted projects" | RAG in us-central1 | Use europe-west1 for RAG corpus |
| "API_KEY_SERVICE_BLOCKED" | Key restricted to aiplatform only | Use gcloud auth for non-model APIs, or edit key restrictions |
| "database disk image is malformed" | Corrupted ADK session SQLite | `rm -rf jio_home_assistant/.adk` and restart |
| "CREDENTIALS_MISSING" on RAG APIs | API key doesn't work for data mgmt | Use `gcloud auth print-access-token` instead |
| 404 on model | Wrong region or model not on project | Check model availability with curl test |

## ADK Commands

```bash
# Start web UI
cd /Users/v.eguren/Documents/GitHub/jio-cx/WS2-mvp/agent
source .venv/bin/activate
adk web --port 8081

# Clean restart (if session DB corrupts)
rm -rf jio_home_assistant/.adk
adk web --port 8081

# Test agent via Python (no web UI needed)
python -c "
from dotenv import load_dotenv; load_dotenv()
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from jio_home_assistant import root_agent
import asyncio

async def test():
    ss = InMemorySessionService()
    runner = Runner(agent=root_agent, app_name='test', session_service=ss)
    session = await ss.create_session(app_name='test', user_id='u1')
    content = types.Content(role='user', parts=[types.Part(text='which plan has Netflix?')])
    async for event in runner.run_async(user_id='u1', session_id=session.id, new_message=content):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text: print(f'[{event.author}]: {part.text[:300]}')
asyncio.run(test())
"
```
