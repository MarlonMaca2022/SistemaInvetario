@echo off
REM QUICK START - Sistema de Inventarios con Movimientos
REM Para Windows

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   InventarioPRO v2.1 - Sistema de Inventarios         ║
echo ║   Con Control de Movimientos y Early Return Pattern    ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Verificar si estamos en la carpeta correcta
if not exist "index.html" (
    echo ❌ Error: Debes ejecutar este script desde la carpeta 'SistemaInventarios'
    pause
    exit /b 1
)

echo 📁 Archivos disponibles:
echo   ✅ js/productManager.js      (620 líneas - Gestión de productos)
echo   ✅ js/movementManager.js     (700 líneas - Movimientos NEW⭐)
echo   ✅ js/auth.js                (438 líneas - Autenticación)
echo   ✅ index.html                (708 líneas - Interfaz)
echo.

echo 📚 Documentación:
echo   📖 CRUD_PRODUCTOS.md         - Guía de ProductManager
echo   📖 MOVIMIENTOS.md            - Guía de MovementManager
echo   📖 SISTEMA_COMPLETO.md       - Arquitectura e integración
echo   📖 IMPLEMENTACION_MOVIMIENTOS.md - Detalles técnicos
echo.

echo 🧪 Demos interactivos:
echo   🎮 demo-crud.html            - CRUD de productos
echo   🎮 demo-movements.html       - Movimientos de inventario
echo.

echo ═══════════════════════════════════════════════════════════
echo.
echo 🪟 Sistema: Windows
echo.
echo Para servir los archivos:
echo.
echo Opción 1: Con Python
echo   python -m http.server 8000
echo.
echo Opción 2: Con Node.js
echo   npx http-server -p 8000
echo.
echo Opción 3: Directamente con Python (este script)
echo   Presiona ENTER para iniciar...
echo.

set /p dummy=

REM Intentar con Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python encontrado, iniciando servidor...
    echo.
    echo 🌐 Abre en navegador: http://localhost:8000
    echo 📱 Para demos: http://localhost:8000/demo-movements.html
    echo.
    echo Presiona CTRL+C para detener el servidor
    echo.
    python -m http.server 8000
    exit /b 0
)

REM Intentar con Node
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js encontrado, iniciando servidor...
    echo.
    echo 🌐 Abre en navegador: http://localhost:8000
    echo 📱 Para demos: http://localhost:8000/demo-movements.html
    echo.
    echo Presiona CTRL+C para detener el servidor
    echo.
    npx http-server -p 8000
    exit /b 0
)

REM Si no encuentra nada
echo ❌ No se encontró Python ni Node.js
echo.
echo Instala uno de estos:
echo   • Python: https://python.org
echo   • Node.js: https://nodejs.org
echo.
echo O usa manualmente:
echo   1. Abre https://github.com/lwwl/http-server-windows
echo   2. O usa VS Code con la extensión "Live Server"
echo.
pause
exit /b 1
