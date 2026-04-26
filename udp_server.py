#!/usr/bin/env python3
"""
UDP Server - Fast, connectionless communication
"""
import socket

def udp_server():
    # Create a UDP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    host = '127.0.0.1'
    port = 5001
    
    # Bind to address
    server_socket.bind((host, port))
    
    print(f"[UDP Server] Listening on {host}:{port}")
    print("[UDP Server] Waiting for messages...\n")
    
    while True:
        # Receive data (no connection needed)
        data, address = server_socket.recvfrom(1024)
        
        message = data.decode('utf-8')
        print(f"[UDP Server] Received from {address}: {message}")
        
        # Send response back
        response = f"Echo: {message}"
        server_socket.sendto(response.encode('utf-8'), address)
        print(f"[UDP Server] Sent to {address}: {response}\n")

if __name__ == "__main__":
    udp_server()
