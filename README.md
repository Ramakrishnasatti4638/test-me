# TCP vs UDP Demo

Simple Python examples demonstrating the difference between TCP and UDP protocols.

## Files

- `tcp_server.py` - TCP server (reliable, connection-oriented)
- `tcp_client.py` - TCP client
- `udp_server.py` - UDP server (fast, connectionless)
- `udp_client.py` - UDP client

## How to Run

### TCP Demo

**Terminal 1** - Start TCP server:
```bash
python3 tcp_server.py
```

**Terminal 2** - Run TCP client:
```bash
python3 tcp_client.py
```

### UDP Demo

**Terminal 1** - Start UDP server:
```bash
python3 udp_server.py
```

**Terminal 2** - Run UDP client:
```bash
python3 udp_client.py
```

## Key Differences You'll See

### TCP
- ✅ Connection established before data transfer
- ✅ Guaranteed delivery and order
- ✅ Server knows when client disconnects
- ⏱️ Slightly more overhead

### UDP
- ✅ No connection setup - just send data
- ✅ Faster, less overhead
- ⚠️ No delivery guarantees
- ⚠️ Messages can be lost or arrive out of order

## Ports Used

- TCP: `localhost:5000`
- UDP: `localhost:5001`

## Experiment

Try these to see the differences:
1. Stop the server mid-transmission - TCP will error, UDP won't notice
2. Send many messages quickly - TCP maintains order, UDP might not
3. Compare the connection setup - TCP has handshake, UDP doesn't
