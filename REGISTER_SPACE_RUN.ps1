
# Register Space Run game

# Step 1: Register developer user
Write-Host "Step 1: Registering developer user..." -ForegroundColor Yellow
$registerBody = @{
    username = "spacerundeveloper"
    email = "spacerundeveloper@acearena.com"
    password = "SpaceRun123!"
    role = "developer"
} | ConvertTo-Json

try {
    $registerResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
        -Method Post `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody `
        -ErrorAction Stop
    
    $registerData = $registerResp.Content | ConvertFrom-Json
    Write-Host "✅ Developer user created" -ForegroundColor Green
} catch {
    Write-Host "⚠️ User may already exist, continuing..." -ForegroundColor Yellow
}

# Step 2: Login as developer
Write-Host "Step 2: Logging in as developer..." -ForegroundColor Yellow
$loginBody = @{
    email = "spacerundeveloper@acearena.com"
    password = "SpaceRun123!"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody

$loginData = $loginResp.Content | ConvertFrom-Json
$jwtToken = $loginData.data.token

Write-Host "✅ Developer logged in" -ForegroundColor Green

# Step 3: Create Space Run game
Write-Host "Step 3: Creating Space Run game record..." -ForegroundColor Yellow
$gameBody = @{
    title = "Space Run"
    description = "A high-octane arcade runner game. Navigate through procedurally generated neon obstacles with physics-based gameplay. Built with React and Three.js for smooth web-based action."
    tags = @("action", "arcade", "runner", "web", "indie")
    price = 0
    fileUrl = "http://localhost:3000/games/space-run"
} | ConvertTo-Json

$gameResp = Invoke-WebRequest -Uri "http://localhost:5000/api/games" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $jwtToken"
    } `
    -Body $gameBody `
    -ErrorAction Stop

$gameData = $gameResp.Content | ConvertFrom-Json

Write-Host "✅ Space Run game created!" -ForegroundColor Green
Write-Host "   Title: $($gameData.data.title)" -ForegroundColor Cyan
Write-Host "   ID: $($gameData.data.id)" -ForegroundColor Cyan

# Step 4: Verify games list
Write-Host "Step 4: Verifying games in database..." -ForegroundColor Yellow
$gamesResp = Invoke-WebRequest -Uri "http://localhost:5000/api/games" -Method Get
$gamesData = $gamesResp.Content | ConvertFrom-Json
$games = $gamesData.data

Write-Host "✅ Total games in database: $($games.Count)" -ForegroundColor Green
Write-Host "Games:" -ForegroundColor Cyan
$games | Select-Object title | ForEach-Object { Write-Host "   - $($_.title)" -ForegroundColor Cyan }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Space Run successfully registered!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
