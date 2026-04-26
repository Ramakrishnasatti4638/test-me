#!/usr/bin/env python3
"""
TCP Server - Reliable, connection-oriented communication
"""
import socket

def tcp_server():
    # Create a TCP socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    host = '127.0.0.1'
    port = 5000
    
    # Bind and listen
    server_socket.bind((host, port))
    server_socket.listen(5)
    
    print(f"[TCP Server] Listening on {host}:{port}")
    print("[TCP Server] Waiting for connections...\n")
    
    while True:
        # Accept connection
        client_socket, address = server_socket.accept()
        print(f"[TCP Server] Connection established with {address}")
        
        try:
            while True:
                # Receive data
                data = client_socket.recv(1024)
                
                if not data:
                    break
                
                message = data.decode('utf-8')
                print(f"[TCP Server] Received: {message}")
                
                # Send response back
                response = f"Echo: {message}"
                client_socket.send(response.encode('utf-8'))
                print(f"[TCP Server] Sent: {response}\n")
                
        except Exception as e:
            print(f"[TCP Server] Error: {e}")
        finally:
            client_socket.close()
            print(f"[TCP Server] Connection closed with {address}\n")

if __name__ == "__main__":
    tcp_server()
