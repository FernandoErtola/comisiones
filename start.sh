#!/bin/bash

# ==========================================
# START SCRIPT - MACOS
# Calculadora Comisiones Full Stack
# ==========================================

clear

echo ""
echo "🚀 Iniciando proyecto Full Stack..."
echo ""

# ==========================================
# VERIFICAR NODE
# ==========================================

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no está instalado"
  echo ""
  echo "Instálalo desde:"
  echo "https://nodejs.org"
  echo ""
  exit 1
fi

echo "✅ Node detectado: $(node -v)"
echo "✅ NPM detectado : $(npm -v)"
echo ""

# ==========================================
# VERIFICAR ESTRUCTURA
# ==========================================

if [ ! -d "backend" ]; then
  echo "❌ No existe carpeta backend"
  echo "Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

if [ ! -d "frontend" ]; then
  echo "❌ No existe carpeta frontend"
  echo "Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

echo "✅ Estructura del proyecto OK"
echo ""

# ==========================================
# LIBERAR PUERTOS
# ==========================================

echo "🧹 Liberando puertos..."

PORT3000=$(lsof -ti:3000)
if [ ! -z "$PORT3000" ]; then
  kill -9 $PORT3000 2>/dev/null
  echo "✅ Puerto 3000 liberado"
else
  echo "✅ Puerto 3000 disponible"
fi

PORT5173=$(lsof -ti:5173)
if [ ! -z "$PORT5173" ]; then
  kill -9 $PORT5173 2>/dev/null
  echo "✅ Puerto 5173 liberado"
else
  echo "✅ Puerto 5173 disponible"
fi

echo ""

# ==========================================
# BACKEND
# ==========================================

echo "📦 Iniciando Backend..."

cd backend || exit 1

if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependencias backend..."
  npm install
fi

echo "🚀 Ejecutando backend..."

npm run dev > backend.log 2>&1 &

BACK_PID=$!

sleep 4

if ps -p $BACK_PID > /dev/null; then
  echo "✅ Backend iniciado correctamente"
  echo "🆔 PID Backend: $BACK_PID"
else
  echo "❌ Error iniciando backend"
  echo ""
  echo "📄 Últimas líneas del log:"
  echo "--------------------------------"
  tail -20 backend.log
  echo "--------------------------------"
  exit 1
fi

cd ..

echo ""

# ==========================================
# FRONTEND
# ==========================================

echo "🎨 Iniciando Frontend..."

cd frontend || exit 1

if [ ! -d "node_modules" ]; then
  echo "📥 Instalando dependencias frontend..."
  npm install
fi

echo "🚀 Ejecutando frontend..."

npm run dev > frontend.log 2>&1 &

FRONT_PID=$!

sleep 4

if ps -p $FRONT_PID > /dev/null; then
  echo "✅ Frontend iniciado correctamente"
  echo "🆔 PID Frontend: $FRONT_PID"
else
  echo "❌ Error iniciando frontend"
  echo ""
  echo "📄 Últimas líneas del log:"
  echo "--------------------------------"
  tail -20 frontend.log
  echo "--------------------------------"
  exit 1
fi

cd ..

echo ""

# ==========================================
# ABRIR NAVEGADOR
# ==========================================

echo "🌐 Abriendo navegador..."

sleep 2

open http://localhost:5173

echo ""

# ==========================================
# INFO FINAL
# ==========================================

echo "✅ Proyecto levantado correctamente"
echo ""
echo "=========================================="
echo "🌐 Frontend:"
echo "http://localhost:5173"
echo ""
echo "🔧 Backend:"
echo "http://localhost:3000"
echo "=========================================="
echo ""
echo "📄 Logs:"
echo "backend/backend.log"
echo "frontend/frontend.log"
echo ""
echo "🛑 Para detener TODO:"
echo "killall node"
echo ""