@echo off
rem Manual/test launch only. Claude Desktop starts this automatically once
rem setup.cmd has run once - you normally never need to double-click this.
"%~dp0node\node.exe" "%~dp0server.mjs"
