from fastapi import WebSocket, WebSocketDisconnect

from app.core.aunthefication import authenticate_user, create_access_token, get_student_id

import json


class WebSocketsHelper:
    active_connections: dict[str, WebSocket] = {}

    @classmethod
    async def login(cls, websocket: WebSocket):
        student_id = None
        try:
            await websocket.accept()
            data = await websocket.receive_text()
            payload = json.loads(data)

            student_id = await authenticate_user(
                email=payload["email"],
                password=payload["password"]
            )

            if not student_id:
                await websocket.send_text("error")
                await websocket.close()
                return

            cls.active_connections[str(student_id)] = websocket

            access_token = create_access_token(data={"student_id": student_id})
            response = {"access_token": access_token, "student_id": student_id}
            await websocket.send_text(json.dumps(response))

            while True:
                try:
                    data = await websocket.receive_text()
                    print(f"Received from {student_id}: {data}")
                except WebSocketDisconnect:
                    print(f"{student_id} disconnected")
                    cls.disconnect(str(student_id))
                    break
        except WebSocketDisconnect:
            if student_id:
                cls.disconnect(str(student_id))
                print(f"{student_id} disconnected")
            else:
                print("Disconnected before auth")

    @classmethod
    async def connect(cls, websocket: WebSocket):
        try:
            await websocket.accept()
            data = await websocket.receive_text()
            payload = json.loads(data)

            student_id = get_student_id(
                token=payload["access_token"]
            )

            if not student_id:
                try:
                    await websocket.send_text("error")
                except RuntimeError:
                    pass
                await websocket.close()
                return

            cls.active_connections[str(student_id)] = websocket

            while True:
                try:
                    data = await websocket.receive_text()
                    print(f"Received from {student_id}: {data}")
                except WebSocketDisconnect:
                    print(f"{student_id} disconnected")
                    cls.disconnect(str(student_id))
                    break
                except Exception as e:
                    print(f"Error on socket {student_id}: {e}")
                    break

        except WebSocketDisconnect:
            if student_id:
                cls.disconnect(str(student_id))
                print(f"{student_id} disconnected")
            else:
                print("Disconnected before auth")

    @classmethod
    def disconnect(cls, student_id: str):
        cls.active_connections.pop(student_id, None)

    def is_active(self, user_id: str) -> bool:
        return user_id in self.active_connections

    async def send_personal_message(self, user_id: str, message: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)

    async def broadcast_to_users(self, user_ids: list[str], message: str):
        for user_id in user_ids:
            if self.is_active(user_id):
                try:
                    await self.send_personal_message(user_id, message)
                except Exception as e:
                    print(f"Error sending to {user_id}: {e}")


websockets_helper = WebSocketsHelper()
