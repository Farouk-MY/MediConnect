"""
WebSocket Connection Manager for Real-Time Updates
Handles WebSocket connections and broadcasts profile updates to connected clients.
"""

from typing import Dict, Set
from fastapi import WebSocket
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time profile updates."""
    
    def __init__(self):
        # Maps user_id to set of active WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Register an already-accepted WebSocket connection for a user."""
        # Note: websocket.accept() is called in main.py before authentication
        if user_id not in self._connections:
            self._connections[user_id] = set()
        self._connections[user_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection for a user."""
        if user_id in self._connections:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                del self._connections[user_id]
    
    async def broadcast_to_user(self, user_id: str, data: dict):
        """Send data to all connections for a specific user."""
        if user_id not in self._connections:
            return
        
        disconnected = set()
        for websocket in self._connections[user_id]:
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.add(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            self._connections[user_id].discard(ws)


# Global instance
profile_manager = ConnectionManager()
