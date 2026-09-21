#!/bin/bash
# Poll for completion of A.log, B.log, C.log. Append a heartbeat line
# to /tmp/wait.log every 15s so the orchestrator can see liveness, and
# emit a final /tmp/wait.done file once all three have end_epoch.
D=/home/user/test-me/.sleep-probe
rm -f /tmp/wait.log /tmp/wait.done
echo "waiter started at $(date -u +%Y-%m-%dT%H:%M:%S.%NZ)" > /tmp/wait.log
last_heartbeat=0
while true; do
  now=$(date +%s)
  if (( now - last_heartbeat >= 15 )); then
    echo "heartbeat $(date -u +%Y-%m-%dT%H:%M:%S.%NZ): $(ps -o etime= -p 2065,2073,2081 2>/dev/null | tr '\n' ' ')" >> /tmp/wait.log
    last_heartbeat=$now
  fi
  done_count=0
  for t in A B C; do
    if grep -q "^end_epoch=" "$D/$t.log" 2>/dev/null; then
      done_count=$((done_count+1))
    fi
  done
  if (( done_count == 3 )); then
    echo "all 3 done at $(date -u +%Y-%m-%dT%H:%M:%S.%NZ)" >> /tmp/wait.log
    date -u +%Y-%m-%dT%H:%M:%S.%NZ > /tmp/wait.done
    exit 0
  fi
  sleep 1
done
