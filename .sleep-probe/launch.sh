#!/bin/bash
# Launch three independent sleep-120 probes. Each probe is detached into its
# own session so it survives the parent shell exiting. PIDs and timing are
# recorded into .sleep-probe/{tag}.{pid,log}.
set -u
D=/home/user/test-me/.sleep-probe
mkdir -p "$D"
rm -f $D/*.log $D/*.pid

launch_one() {
  local tag=$1
  local logf="$D/${tag}.log"
  local pidf="$D/${tag}.pid"
  setsid bash -c "
    start=\$(date +%s.%N)
    echo \"start_epoch=\$start\" > '$logf'
    date -u +'start_utc=%Y-%m-%dT%H:%M:%S.%NZ' >> '$logf'
    sleep 120
    rc=\$?
    end=\$(date +%s.%N)
    echo \"end_epoch=\$end\" >> '$logf'
    date -u +'end_utc=%Y-%m-%dT%H:%M:%S.%NZ' >> '$logf'
    awk -v s=\"\$start\" -v e=\"\$end\" 'BEGIN{printf \"elapsed_seconds=%.4f\\n\", e-s}' >> '$logf'
    echo \"sleep_exit_code=\$rc\" >> '$logf'
    echo \"wrapper_pid=\$\$\" >> '$logf'
  " </dev/null >/dev/null 2>&1 &
  local setsid_pid=$!
  # Give it a moment to fork the setsid child, then capture the sleep PID via ps
  sleep 0.15
  # The setsid process forked the inner bash; the inner bash is what exec'd sleep.
  # Capture the inner bash's PID by walking the children.
  inner=$(pgrep -P "$setsid_pid" -f "sleep 120" || true)
  if [ -z "$inner" ]; then
    # Try finding any child of setsid
    inner=$(pgrep -P "$setsid_pid" || true)
  fi
  {
    echo "setsid_pid=$setsid_pid"
    echo "inner_pid=$inner"
    echo "wrapper_pid=$$"
    date -u +"launched_utc=%Y-%m-%dT%H:%M:%S.%NZ"
  } > "$pidf"
}

launch_one A
launch_one B
launch_one C
sleep 0.3
echo "Launched. Listing:"
ls -la "$D"
echo "--- PIDs ---"
for t in A B C; do echo "[$t]"; cat "$D/$t.pid"; done
echo "--- Logs (initial) ---"
for t in A B C; do echo "[$t]"; cat "$D/$t.log" 2>/dev/null || echo "(no log yet)"; done
echo "--- ps (sleep 120) ---"
ps -eo pid,ppid,sid,stat,etime,cmd | awk 'NR==1 || /sleep 120/'
