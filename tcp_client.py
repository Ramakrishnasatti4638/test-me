#!/usr/bin/env python3
"""
TCP Client - Connects to TCP server and sends messages
"""
import socket

def tcp_client():
    # Create a TCP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    host = '127.0.0.1'
    port = 5000
    
    try:
        # Connect to server
        print(f"[TCP Client] Connecting to {host}:{port}...")
        client_socket.connect((host, port))
        print("[TCP Client] Connected!\n")
        
        messages = [
            "Hello, TCP Server!",
            "This is a reliable connection",
            "Every message will arrive in order",
            "Goodbye!"
        ]
        
        for msg in messages:
            # Send message
            print(f"[TCP Client] Sending: {msg}")
            client_socket.send(msg.encode('utf-8'))
            
            # Receive response
            response = client_socket.recv(1024).decode('utf-8')
            print(f"[TCP Client] Received: {response}\n")
            
    except Exception as e:
        print(f"[TCP Client] Error: {e}")
    finally:
        client_socket.close()
        print("[TCP Client] Connection closed")

if __name__ == "__main__":
    tcp_client()
