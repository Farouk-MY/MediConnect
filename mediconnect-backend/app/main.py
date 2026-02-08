from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, patients, qr, doctors, appointments, availability, absences
from app.core.websocket import profile_manager, schedule_manager
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
    token: str = Query(None)
):
    """
    WebSocket endpoint for real-time profile updates.
    
    Connect with: ws://host/ws/profile/{user_id}?token={access_token}
    """
    # Must accept the connection first before we can send close codes
    await websocket.accept()
    
    # Verify token
    try:
        if not token:
            await websocket.close(code=4001, reason="Token required")
            return
            
        payload = decode_token(token)
        if payload is None:
            await websocket.close(code=4001, reason="Invalid token")
            return
            
        if payload.get("sub") != user_id:
            await websocket.close(code=4001, reason="Token mismatch")
            return
            
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    # Token valid, register connection
    await profile_manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, wait for messages (ping/pong)
            data = await websocket.receive_text()
            # Echo back for ping-pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        profile_manager.disconnect(websocket, user_id)


# WebSocket endpoint for real-time schedule updates
@app.websocket("/ws/schedule/{doctor_id}")
async def websocket_schedule(
    websocket: WebSocket,
    doctor_id: str,
    token: str = Query(None)
):
    """
    WebSocket endpoint for real-time schedule updates.
    
    Connect with: ws://host/ws/schedule/{doctor_id}?token={access_token}
    
    Events:
    - schedule_update: Weekly schedule changed
    - absence_update: Absence created/updated/cancelled
    - appointment_update: Appointment status changed
    """
    await websocket.accept()
    
    # Verify token
    try:
        if not token:
            await websocket.close(code=4001, reason="Token required")
            return
            
        payload = decode_token(token)
        if payload is None:
            await websocket.close(code=4001, reason="Invalid token")
            return
            
    except Exception as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    # Register connection
    await schedule_manager.connect_doctor(websocket, doctor_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        schedule_manager.disconnect_doctor(websocket, doctor_id)


# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(qr.router, prefix="/api/v1")
app.include_router(doctors.router, prefix="/api/v1")
app.include_router(appointments.router, prefix="/api/v1")
app.include_router(availability.router, prefix="/api/v1")
app.include_router(availability.public_router, prefix="/api/v1")
app.include_router(absences.router, prefix="/api/v1")


