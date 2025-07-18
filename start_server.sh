#!/bin/bash
cd server
export PORT=8082
node index.js &
echo "Server started on port 8082"
