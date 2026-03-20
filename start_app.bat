@echo off
echo ==========================================
echo Iniciando Projeto VINDIMA - Analise de Entregas
echo ==========================================

echo Iniciando Backend...
cd backend
start cmd /k "npm start"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend...
cd ..\frontend
start cmd /k "npm run dev"

echo Aplicacao iniciada!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
pause
