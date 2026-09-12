@echo off
where npm >nul 2>nul
if %errorlevel% neq 0 (
    set "PATH=C:\Users\avksr\AppData\Local\OpenAI\Codex\runtimes\cua_node\e7fe122ad3cbcd58\bin;%PATH%"
)
echo Starting VoiceKhata Local Development Server...
npm run dev
