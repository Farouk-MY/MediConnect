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


class ScheduleConnectionManager:
    """Manages WebSocket connections for real-time schedule updates."""
    
    def __init__(self):
        # Maps doctor_id to set of active WebSocket connections
        self._doctor_connections: Dict[str, Set[WebSocket]] = {}
        # Maps patient_id to set of active WebSocket connections (for receiving schedule updates)
        self._patient_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect_doctor(self, websocket: WebSocket, doctor_id: str):
        """Register a WebSocket connection for a doctor."""
        if doctor_id not in self._doctor_connections:
            self._doctor_connections[doctor_id] = set()
        self._doctor_connections[doctor_id].add(websocket)
    
    def disconnect_doctor(self, websocket: WebSocket, doctor_id: str):
        """Remove a WebSocket connection for a doctor."""
        if doctor_id in self._doctor_connections:
            self._doctor_connections[doctor_id].discard(websocket)
            if not self._doctor_connections[doctor_id]:
                del self._doctor_connections[doctor_id]
    
    async def connect_patient(self, websocket: WebSocket, patient_id: str):
        """Register a WebSocket connection for a patient."""
        if patient_id not in self._patient_connections:
            self._patient_connections[patient_id] = set()
        self._patient_connections[patient_id].add(websocket)
    
    def disconnect_patient(self, websocket: WebSocket, patient_id: str):
        """Remove a WebSocket connection for a patient."""
        if patient_id in self._patient_connections:
            self._patient_connections[patient_id].discard(websocket)
            if not self._patient_connections[patient_id]:
                del self._patient_connections[patient_id]
    
    async def broadcast_to_doctor(self, doctor_id: str, data: dict):
        """Send schedule update to a specific doctor."""
        if doctor_id not in self._doctor_connections:
            return
        
        disconnected = set()
        for websocket in self._doctor_connections[doctor_id]:
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.add(websocket)
        
        for ws in disconnected:
            self._doctor_connections[doctor_id].discard(ws)
    
    async def broadcast_to_patients(self, patient_ids: list, data: dict):
        """Send schedule update to multiple patients."""
        for patient_id in patient_ids:
            if patient_id not in self._patient_connections:
                continue
            
            disconnected = set()
            for websocket in self._patient_connections[patient_id]:
                try:
                    await websocket.send_json(data)
                except Exception:
                    disconnected.add(websocket)
            
            for ws in disconnected:
                self._patient_connections[patient_id].discard(ws)
    
    async def broadcast_schedule_update(self, doctor_id: str, event_type: str, event_data: dict):
        """Broadcast a schedule update event."""
        data = {
            "type": "schedule_update",
            "event": event_type,
            "doctor_id": doctor_id,
            "data": event_data
        }
        await self.broadcast_to_doctor(doctor_id, data)
    
    async def broadcast_absence_event(self, doctor_id: str, event_type: str, absence_data: dict, affected_patient_ids: list = None):
        """Broadcast an absence event to doctor and affected patients."""
        data = {
            "type": "absence_update",
            "event": event_type,
            "doctor_id": doctor_id,
            "data": absence_data
        }
        
        # Notify doctor
        await self.broadcast_to_doctor(doctor_id, data)
        
        # Notify affected patients
        if affected_patient_ids:
            await self.broadcast_to_patients(affected_patient_ids, data)


# Global instances
profile_manager = ConnectionManager()
schedule_manager = ScheduleConnectionManager()

