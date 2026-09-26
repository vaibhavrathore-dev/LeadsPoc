import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI,WebSocket,Query,HTTPException,WebSocketDisconnect,Response,Request
from fastapi.responses import PlainTextResponse

load_dotenv()

app = FastAPI()

META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN")
META_PAGE_ACCESS_TOKEN = os.getenv("META_PAGE_ACCESS_TOKEN")

class Connection:
    def __init__(self):
        self.active_connections = []
    async def add_client(self,websocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def remove_client(self,websocket):
        self.active_connections.remove(websocket)
    async def broadcast(self,data):
        for connection in self.active_connections:
            await connection.send_json(data)

manager = Connection()

@app.get("/")
def get_health():
    return {
        "message" : "we are gonna do it"
    }
@app.post("/webhook")
async def get_id(request : Request):
    try:
     payload = await request.json()
     lead_id = None
     for entry in payload["entry"]:
        for change in entry["changes"]:
            if change["field"] == "leadgen":
             value = change["value"]
             lead_id = value["leadgen_id"]
        
     if lead_id is None:
               return {
                  "message" : "Leadgen_id Does'nt exist"
               }
     print("LEAD ID:", lead_id)
  
     lead = await fetch_details(lead_id)

     print(f"Lead_details: {lead}")
     normal = normalize(lead)
     await manager.broadcast(normal)
     print(normal)
     return normal
     
    
    except TypeError as e:
     print("TYPE ERROR:", repr(e))
     return {"message": "TypeError error occured"}

    except KeyError as e:
     print("KEY ERROR:", repr(e))
     return {"message": "KeyError error occured"}

    except httpx.HTTPStatusError as e:
     print("META STATUS:", e.response.status_code)
     print("META RESPONSE:", e.response.text)
     return {"message": "Meta Graph API failed"}

    except Exception as e:
     print("GENERAL ERROR:", type(e).__name__, str(e))
     return {"message": "Something went wrong"}

@app.get("/webhook")
def meta_verification(hub_mode : str = Query(None,alias="hub.mode"),
                      hub_verify_token : str = Query(None,alias="hub.verify_token"),
                      hub_challenge : str = Query(None,alias="hub.challenge")):
    if hub_mode == "subscribe" and hub_verify_token == META_VERIFY_TOKEN:
        return PlainTextResponse(hub_challenge)
    raise HTTPException(
        status_code=403,
        detail="Invalid token"
    )

    
async def fetch_details(lead_id):
    url = f"https://graph.facebook.com/v26.0/{lead_id}"
    params = {
        "fields" : "id,created_time,field_data",
        "access_token" : META_PAGE_ACCESS_TOKEN
    }
    async with httpx.AsyncClient() as client:
        response =  await client.get(url=url,params=params)
        response.raise_for_status()
        data = response.json()
        return data

def normalize(lead):
    normal  = {
        "id" : lead["id"],
        "created_time" : lead["created_time"]
    } 

    for field in lead["field_data"]:
        name = field["name"]
        values = field["values"][0]
        normal[name] =  values


    return normal

@app.websocket("/ws")
async def websocket_connect(websocket : WebSocket):
    await manager.add_client(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.remove_client(websocket)