/**
 * DEBUG SCRIPT - Ejecutar en consola del navegador
 * Copia y pega esto en la consola para debuggear el login
 */

console.log('%c=== DEBUG DE LOGIN ===', 'color: #2563eb; font-size: 14px; font-weight: bold;');

// 1. Verificar que los elementos existen
console.log('\n1️⃣ Elementos del DOM:');
const formLogin = document.getElementById('formLogin');
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const btnSubmit = formLogin?.querySelector('button[type="submit"]');

console.log('  - formLogin:', formLogin ? '✅' : '❌');
console.log('  - loginScreen:', loginScreen ? '✅' : '❌');
console.log('  - dashboard:', dashboard ? '✅' : '❌');
console.log('  - btnSubmit:', btnSubmit ? '✅' : '❌');

if (loginScreen) {
    console.log('  - loginScreen display:', loginScreen.style.display || 'not set');
    console.log('  - loginScreen visible:', getComputedStyle(loginScreen).display);
}

if (dashboard) {
    console.log('  - dashboard display:', dashboard.style.display || 'not set');
}

// 2. Verificar authManager
console.log('\n2️⃣ AuthManager:');
console.log('  - authManager existe:', typeof authManager !== 'undefined' ? '✅' : '❌');
console.log('  - authManager.login:', typeof authManager?.login === 'function' ? '✅' : '❌');
console.log('  - Autenticado:', authManager?.estaAutenticado() ? '✅ Sí' : '❌ No');

// 3. Verificar UIManager
console.log('\n3️⃣ UIManager:');
console.log('  - uiManager existe:', typeof uiManager !== 'undefined' ? '✅' : '❌');
console.log('  - handleLoginSubmit:', typeof uiManager?.handleLoginSubmit === 'function' ? '✅' : '❌');
console.log('  - Listeners registrados:', formLogin?._hasListeners ? '✅' : '⚠️ No verificado');

// 4. Probar login directamente
console.log('\n4️⃣ Prueba de login directo:');
try {
    const result = authManager.login('admin', 'admin123');
    console.log('  Resultado:', result);
    if (result.success) {
        console.log('  ✅ Login funcionó');
        console.log('  Usuario:', authManager.obtenerInfoSesion().nombre);
        authManager.logout();
        console.log('  Logout completado');
    }
} catch(err) {
    console.error('  ❌ Error:', err.message);
}

// 5. Simular submit del formulario
console.log('\n5️⃣ Simulando submit del formulario:');
if (formLogin) {
    // Llenar el formulario
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    if (usernameInput && passwordInput) {
        usernameInput.value = 'admin';
        passwordInput.value = 'admin123';
        console.log('  Campos llenados: ✅');
        
        console.log('  Despachando evento submit...');
        formLogin.dispatchEvent(new Event('submit', { bubbles: true }));
    }
}

console.log('\n💡 Si el login funcionó, verás cambios en la UI en 500ms');
console.log('%c=== FIN DEL DEBUG ===\n', 'color: #2563eb; font-size: 14px; font-weight: bold;');
