<<<<<<< Updated upstream
# Real-Time Meta Lead Ads PoC

A proof-of-concept application that receives Meta Lead Ads webhook events and sends newly created leads to a React Native application in real time.

## Architecture

The application follows this flow:

1. A test lead is created using the Meta Lead Ads Testing Tool.
2. Meta sends a `leadgen` webhook event to the FastAPI backend.
3. The backend extracts the `leadgen_id` from the webhook payload.
4. FastAPI calls the Meta Graph API using the lead ID.
5. The Graph API returns the lead details.
6. The backend normalizes the Meta response into a simpler structure.
7. The normalized lead is broadcast to connected clients through WebSocket.
8. The React Native application receives the lead and updates the UI automatically.

## Backend Stack

- Python
- FastAPI
- HTTPX
- WebSocket
- Meta Graph API

## Lead Format

Meta returns lead data in a structure containing `field_data`.

The backend converts it into a simpler object:

```json
{
  "id": "lead_id",
  "created_time": "timestamp",
  "email": "example@email.com",
  "full_name": "Example User"
}
=======
# Real-Time Meta Lead Ads PoC

A proof-of-concept application that receives Meta Lead Ads webhook events and sends newly created leads to a React Native application in real time.

## Architecture

The application follows this flow:

1. A test lead is created using the Meta Lead Ads Testing Tool.
2. Meta sends a `leadgen` webhook event to the FastAPI backend.
3. The backend extracts the `leadgen_id` from the webhook payload.
4. FastAPI calls the Meta Graph API using the lead ID.
5. The Graph API returns the lead details.
6. The backend normalizes the Meta response into a simpler structure.
7. The normalized lead is broadcast to connected clients through WebSocket.
8. The React Native application receives the lead and updates the UI automatically.

## Backend Stack

- Python
- FastAPI
- HTTPX
- WebSocket
- Meta Graph API

## Lead Format

Meta returns lead data in a structure containing `field_data`.

The backend converts it into a simpler object:

```json
{
  "id": "lead_id",
  "created_time": "timestamp",
  "email": "example@email.com",
  "full_name": "Example User"
}
>>>>>>> Stashed changes
