if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    $env:PATH = "C:\Users\avksr\AppData\Local\OpenAI\Codex\runtimes\cua_node\6f12e0ef1c6e5061\bin;" + $env:PATH
}
Write-Host "Starting VoiceKhata Local Development Server..." -ForegroundColor Green
npm run dev
