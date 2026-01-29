from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, patients, qr, doctors
from app.core.websocket import profile_manager
from app.core.security import decode_token


# Create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="MediConnect API - Healthcare Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/")
async def root():
    return {
        "message": "Welcome to MediConnect API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# WebSocket endpoint for real-time profile updates
@app.websocket("/ws/profile/{user_id}")
async def websocket_profile(
    websocket: WebSocket,
    user_id: str,
    token: str = Query(...)
):
    """
    WebSocket endpoint for real-time profile updates.
    
    Connect with: ws://host/ws/profile/{user_id}?token={access_token}
    """
    # Verify token
    try:
        payload = decode_token(token)
        if payload is None or payload.get("sub") != user_id:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return
    
    await profile_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, wait for messages (ping/pong)
            await websocket.receive_text()
    except WebSocketDisconnect:
        profile_manager.disconnect(websocket, user_id)


# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(qr.router, prefix="/api/v1")
app.include_router(doctors.router, prefix="/api/v1")

