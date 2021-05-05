@echo off
:loop
node .\server.js
timeout /t 10
goto loop