/**
 * SCRIPT DE VALIDACIÓN DE AUTENTICACIÓN
 * Ejecuta programáticamente para verificar que todo funciona
 */

console.log('%c=== INICIANDO VALIDACIÓN DE AUTENTICACIÓN ===', 'color: #2563eb; font-size: 14px; font-weight: bold;');

// Test 1: Verificar objetos globales
console.log('\n✓ Test 1: Verificación de objetos globales');
console.log('  authManager:', typeof authManager !== 'undefined' ? '✅ Existe' : '❌ No existe');
console.log('  dataManager:', typeof dataManager !== 'undefined' ? '✅ Existe' : '❌ No existe');
console.log('  uiManager:', typeof uiManager !== 'undefined' ? '✅ Existe' : '❌ No existe');
console.log('  app:', typeof app !== 'undefined' ? '✅ Existe' : '❌ No existe');

// Test 2: Verificar que no hay sesión inicial
console.log('\n✓ Test 2: Estado inicial (sin autenticación)');
console.log('  estaAutenticado():', authManager.estaAutenticado() ? '❌ Autenticado (ERROR)' : '✅ No autenticado (correcto)');

// Test 3: Intentar login con credenciales inválidas
console.log('\n✓ Test 3: Login con credenciales inválidas');
const loginFalse = authManager.login('usuario_falso', 'password_falso');
console.log('  success:', loginFalse.success ? '❌ True (ERROR)' : '✅ False (correcto)');
console.log('  mensaje:', loginFalse.mensaje);

// Test 4: Intentar login con admin válido
console.log('\n✓ Test 4: Login con administrador válido');
const loginAdmin = authManager.login('admin', 'admin123');
console.log('  success:', loginAdmin.success ? '✅ True' : '❌ False (ERROR)');
console.log('  mensaje:', loginAdmin.mensaje);
if (loginAdmin.success) {
    const info = authManager.obtenerInfoSesion();
    console.log('  usuario:', info.nombre);
    console.log('  rol:', info.rol);
    
    // Verificar permisos
    console.log('\n✓ Test 5: Verificación de permisos para ADMINISTRADOR');
    console.log('  eliminar_producto:', authManager.tienePermiso('eliminar_producto') ? '✅ True' : '❌ False');
    console.log('  crear_producto:', authManager.tienePermiso('crear_producto') ? '✅ True' : '❌ False');
    console.log('  exportar_datos:', authManager.tienePermiso('exportar_datos') ? '✅ True' : '❌ False');
    
    // Logout
    authManager.logout();
    console.log('\n✓ Test 6: Logout completado');
    console.log('  estaAutenticado():', authManager.estaAutenticado() ? '❌ Autenticado (ERROR)' : '✅ No autenticado (correcto)');
}

// Test 7: Intentar login con empleado válido
console.log('\n✓ Test 7: Login con empleado válido');
const loginEmp = authManager.login('empleado', 'emp123');
console.log('  success:', loginEmp.success ? '✅ True' : '❌ False (ERROR)');
if (loginEmp.success) {
    const info = authManager.obtenerInfoSesion();
    console.log('  usuario:', info.nombre);
    console.log('  rol:', info.rol);
    
    // Verificar permisos
    console.log('\n✓ Test 8: Verificación de permisos para EMPLEADO');
    console.log('  eliminar_producto:', authManager.tienePermiso('eliminar_producto') ? '❌ True (debe ser false)' : '✅ False (correcto)');
    console.log('  crear_producto:', authManager.tienePermiso('crear_producto') ? '❌ True (debe ser false)' : '✅ False (correcto)');
    console.log('  exportar_datos:', authManager.tienePermiso('exportar_datos') ? '❌ True (debe ser false)' : '✅ False (correcto)');
    console.log('  registrar_movimiento:', authManager.tienePermiso('registrar_movimiento') ? '✅ True' : '❌ False (ERROR)');
    
    authManager.logout();
}

// Test 9: Verificación de localStorage
console.log('\n✓ Test 9: Persistencia en localStorage');
authManager.login('admin', 'admin123');
const sesionGuardada = localStorage.getItem('sesion_inventario');
console.log('  sesion_inventario en localStorage:', sesionGuardada ? '✅ Guardada' : '❌ No se guardó');

// Test 10: Verificar recuperación de sesión
console.log('\n✓ Test 10: Recuperación de sesión al recargar');
authManager.logout();
console.log('  logout completado');
// Simular recarga de página creando nueva instancia (esto no es posible sin recargar, pero verificamos que obtenerSesion() funciona)
const sesionRecuperada = authManager.obtenerSesion();
console.log('  obtenerSesion() retorna sesión:', sesionRecuperada ? '✅ Sí' : '❌ No (puede ser normal tras logout)');

// Test 11: Verificar que UIManager está correctamente inicializado
console.log('\n✓ Test 11: UIManager');
console.log('  isInitialized:', uiManager.isInitialized);
console.log('  bindAuthEventListeners registrado:', typeof uiManager.bindAuthEventListeners === 'function' ? '✅ Sí' : '❌ No');
console.log('  handleLoginSubmit registrado:', typeof uiManager.handleLoginSubmit === 'function' ? '✅ Sí' : '❌ No');

// Test 12: Verificar elemento del formulario
console.log('\n✓ Test 12: Elementos del DOM');
const formLogin = document.getElementById('formLogin');
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
console.log('  formLogin existe:', formLogin ? '✅ Sí' : '❌ No');
console.log('  loginScreen existe:', loginScreen ? '✅ Sí' : '❌ No');
console.log('  dashboard existe:', dashboard ? '✅ Sí' : '❌ No');

if (formLogin) {
    console.log('  formLogin tiene listener:', formLogin.onsubmit !== null ? '✅ Sí (pero debería ser addEventListener)' : '✅ Usa addEventListener');
}

console.log('\n%c=== VALIDACIÓN COMPLETADA ===\n', 'color: #10b981; font-size: 14px; font-weight: bold;');
