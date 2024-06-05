#!/bin/bash

# curl http://localhost:80/test
# - should output -
# This is a test endpoint.

export STR=$(docker exec supspace-client curl http://nginx:80/test)
export SUB='This is a test endpoint'
if [[ "$STR" != *"$SUB"* ]]; then
  echo 'Integration test failed!'
  echo 'App output = ' $STR
  exit 1 # integration test failed
fi

echo 'Integration test passed. The app returned: ' $STR