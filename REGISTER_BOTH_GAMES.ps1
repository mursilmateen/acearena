
# Register Falling Crown and Space Run games

$email = "gamesdeveloper_$(Get-Random)@acearenade.com"
$password = "GamesLaunch123!"
$username = "gamedev_$(Get-Random)"

Write-Host "Registering developer and creating games..." -ForegroundColor Yellow
Write-Host ""

# Register
$reg = @{username=$username;email=$email;password=$password;role="developer"} | ConvertTo-Json
$regResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $reg -SkipHttpErrorCheck

Write-Host "Developer registered: $email" -ForegroundColor Green

# Login
$login = @{email=$email;password=$password} | ConvertTo-Json
$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $login
$token = ($loginResp.Content | ConvertFrom-Json).data.token

Write-Host "Logged in successfully" -ForegroundColor Green
Write-Host ""

# Create Falling Crown
Write-Host "Creating Falling Crown..." -ForegroundColor Yellow
$fc = @{
    title="Falling Crown"
    description="An action-packed adventure game. Navigate a medieval kingdom, solve puzzles, defeat enemies, and uncover the mystery of the falling crown. Built with Godot, playable in-browser."
    tags=@("action","adventure","puzzle","godot","web")
    price=0
    fileUrl="http://localhost:3000/games/falling-crown"
} | ConvertTo-Json

$fcResp = Invoke-WebRequest -Uri "http://localhost:5000/api/games" -Method Post -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $token"} -Body $fc -SkipHttpErrorCheck
$fcData = ($fcResp.Content | ConvertFrom-Json).data

Write-Host "✅ Falling Crown created!" -ForegroundColor Green
Write-Host "   ID: $($fcData.id)" -ForegroundColor Cyan
Write-Host "   Title: $($fcData.title)" -ForegroundColor Cyan

# Create Space Run
Write-Host ""
Write-Host "Creating Space Run..." -ForegroundColor Yellow
$sr = @{
    title="Space Run"
    description="A high-octane arcade runner through neon-filled space. Navigate endless procedurally generated obstacles with physics-based gameplay and power-ups. Built with React and Three.js for smooth web action."
    tags=@("action","arcade","runner","react","web")
    price=0
    fileUrl="http://localhost:3000/games/space-run"
} | ConvertTo-Json

$srResp = Invoke-WebRequest -Uri "http://localhost:5000/api/games" -Method Post -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $token"} -Body $sr -SkipHttpErrorCheck
$srData = ($srResp.Content | ConvertFrom-Json).data

Write-Host "✅ Space Run created!" -ForegroundColor Green
Write-Host "   ID: $($srData.id)" -ForegroundColor Cyan
Write-Host "   Title: $($srData.title)" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Both games registered!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "Verifying games in database..." -ForegroundColor Yellow
$games = (Invoke-WebRequest -Uri "http://localhost:5000/api/games" -Method Get).Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object title

Write-Host "Games in database:" -ForegroundColor Green
$games | Select-Object -ExpandProperty title | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }

Write-Host ""
Write-Host "Launch config is set to:" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_LIVE_GAME_TITLES=Falling Crown,Space Run" -ForegroundColor Cyan
