#!/bin/bash

# Run Memory Chaos Tests Forever
# Runs until you press Ctrl+C

echo "========================================="
echo "Memory Endurance Tests - CONTINUOUS MODE"
echo "========================================="
echo ""
echo "Running memory endurance tests continuously..."
echo "Press Ctrl+C to stop"
echo ""

RUN_COUNT=0

while true; do
  RUN_COUNT=$((RUN_COUNT + 1))
  
  echo ""
  echo "========================================="
  echo "RUN #$RUN_COUNT - $(date)"
  echo "========================================="
  echo ""
  
  # Run the memory endurance tests
  npm run test:memory
  
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Run #$RUN_COUNT PASSED"
  else
    echo ""
    echo "❌ Run #$RUN_COUNT FAILED (exit code: $EXIT_CODE)"
  fi
  
  echo ""
  echo "Completed $RUN_COUNT run(s). Starting next run in 3 seconds..."
  sleep 3
done
