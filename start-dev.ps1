if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    $env:PATH = "C:\Users\avksr\AppData\Local\OpenAI\Codex\runtimes\cua_node\e7fe122ad3cbcd58\bin;" + $env:PATH
}
Write-Host "Starting VoiceKhata Local Development Server..." -ForegroundColor Green
npm run dev
