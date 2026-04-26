#!/usr/bin/env python3
"""
UDP Client - Sends messages to UDP server (no connection needed)
"""
import socket
import time

def udp_client():
    # Create a UDP socket
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    
    # Set timeout for receiving
    client_socket.settimeout(2.0)
    
    host = '127.0.0.1'
    port = 5001
    
    print(f"[UDP Client] Sending to {host}:{port}")
    print("[UDP Client] No connection needed!\n")
    
    messages = [
        "Hello, UDP Server!",
        "This is connectionless",
        "Fast but not guaranteed",
        "Goodbye!"
    ]
    
    for msg in messages:
        try:
            # Send message (no connection required)
            print(f"[UDP Client] Sending: {msg}")
            client_socket.sendto(msg.encode('utf-8'), (host, port))
            
            # Try to receive response
            data, server = client_socket.recvfrom(1024)
            response = data.decode('utf-8')
            print(f"[UDP Client] Received: {response}\n")
            
            time.sleep(0.5)
            
        except socket.timeout:
            print(f"[UDP Client] Timeout - No response received (this can happen with UDP!)\n")
        except Exception as e:
            print(f"[UDP Client] Error: {e}\n")
    
    client_socket.close()
    print("[UDP Client] Done")

if __name__ == "__main__":
    udp_client()
