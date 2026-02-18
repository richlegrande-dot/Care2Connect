@echo off
cd /d "c:\Users\richl\Care2system\backend"
echo Running amount_v2 experiment...
npx tsx eval/v1_5/runners/run_v1_5.js --dataset core30 --experiment amount_v2
echo Experiment complete.