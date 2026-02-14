/**
 * MÓDULO DE AUTENTICACIÓN Y AUTORIZACIÓN
 * Sistema simulado de login y gestión de roles
 * Versión: 1.0.0
 * 
 * Esta clase maneja:
 * - Autenticación de usuarios (simulada sin backend)
 * - Gestión de roles (Admin, Empleado)
 * - Permisos por rol
 * - Persistencia de sesión en localStorage
 * - Protección de vistas según permisos
 */

class AuthManager {
    /**
     * CONFIGURACIÓN DE USUARIOS Y ROLES
     * En producción, esto vendría de un backend
     */
    static USUARIOS = {
        admin: {
            id: 'user_001',
            username: 'admin',
            password: 'admin123', // Simulado - nunca guardar en cliente en producción
            nombre: 'Administrador',
            email: 'admin@inventario.com',
            rol: 'ADMINISTRADOR',
            avatar: '👨‍💼'
        },
        empleado: {
            id: 'user_002',
            username: 'empleado',
            password: 'emp123',
            nombre: 'Juan Pérez',
            email: 'juan@inventario.com',
            rol: 'EMPLEADO',
            avatar: '👨‍💻'
        }
    };

    /**
     * DEFINICIÓN DE PERMISOS POR ROL
     * Cada rol tiene permisos específicos
     */
    static PERMISOS = {
        ADMINISTRADOR: {
            // Productos
            ver_productos: true,
            crear_producto: true,
            editar_producto: true,
            eliminar_producto: true,
            exportar_productos: true,

            // Categorías
            ver_categorias: true,
            crear_categoria: true,
            editar_categoria: true,
            eliminar_categoria: true,

            // Movimientos
            registrar_movimiento: true,
            ver_movimientos: true,
            editar_movimiento: false,
            eliminar_movimiento: false,

            // Reportes
            ver_reportes: true,
            exportar_reportes: true,

            // Datos
            exportar_datos: true,
            importar_datos: true,

            // Configuración
            ver_configuracion: true,
            cambiar_rol_usuario: true
        },
        EMPLEADO: {
            // Productos
            ver_productos: true,
            crear_producto: false,
            editar_producto: false,
            eliminar_producto: false, // ⚠️ RESTRICCIÓN CRÍTICA
            exportar_productos: false,

            // Categorías
            ver_categorias: true,
            crear_categoria: false,
            editar_categoria: false,
            eliminar_categoria: false,

            // Movimientos
            registrar_movimiento: true, // Puede registrar entradas/salidas
            ver_movimientos: true,
            editar_movimiento: false,
            eliminar_movimiento: false,

            // Reportes
            ver_reportes: true,
            exportar_reportes: false,

            // Datos
            exportar_datos: false,
            importar_datos: false,

            // Configuración
            ver_configuracion: false,
            cambiar_rol_usuario: false
        }
    };

    constructor() {
        this.usuarioActual = null;
        this.token = null;
        this.init();
    }

    /**
     * Inicializa el gestor de autenticación
     * Verifica si hay sesión activa en localStorage
     */
    init() {
        const sesion = this.obtenerSesion();
        if (sesion && sesion.usuarioId) {
            this.usuarioActual = sesion.usuarioData;
            this.token = sesion.token;
            console.log(`%c✓ Sesión recuperada: ${this.usuarioActual.nombre}`, 'color: #10b981; font-weight: bold;');
            return true;
        }
        console.log('%c⚠️ No hay sesión activa', 'color: #f59e0b; font-weight: bold;');
        return false;
    }

    /**
     * Realiza login simulado
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {object} { success: boolean, mensaje: string }
     */
    login(username, password) {
        console.log(`\n%cIntentando login: ${username}`, 'color: #3b82f6; font-weight: bold;');

        // Validar que usuario exista
        const usuario = Object.values(AuthManager.USUARIOS).find(
            u => u.username === username
        );

        if (!usuario) {
            console.error('❌ Usuario no encontrado');
            return {
                success: false,
                mensaje: 'Usuario no encontrado'
            };
        }

        // Validar contraseña
        if (usuario.password !== password) {
            console.error('❌ Contraseña incorrecta');
            return {
                success: false,
                mensaje: 'Contraseña incorrecta'
            };
        }

        // Autenticación exitosa
        this.usuarioActual = {
            id: usuario.id,
            username: usuario.username,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            avatar: usuario.avatar
        };

        // Generar token simulado
        this.token = this.generarToken();

        // Guardar sesión en localStorage
        this.guardarSesion();

        console.log(`%c✓ Login exitoso: ${this.usuarioActual.nombre} (${this.usuarioActual.rol})`, 
            'color: #10b981; font-weight: bold;');

        return {
            success: true,
            mensaje: 'Login exitoso',
            usuario: this.usuarioActual
        };
    }

    /**
     * Realiza logout
     */
    logout() {
        console.log(`%c🚪 Logout: ${this.usuarioActual?.nombre}`, 'color: #ef4444; font-weight: bold;');
        
        this.usuarioActual = null;
        this.token = null;
        
        // Limpiar localStorage
        localStorage.removeItem('auth_sesion');
        localStorage.removeItem('auth_token');

        return {
            success: true,
            mensaje: 'Sesión cerrada correctamente'
        };
    }

    /**
     * Genera un token simulado
     * En producción sería JWT del servidor
     */
    generarToken() {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId: this.usuarioActual.id,
            username: this.usuarioActual.username,
            rol: this.usuarioActual.rol,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
        }));
        const signature = btoa('fake_signature_' + Date.now());

        return `${header}.${payload}.${signature}`;
    }

    /**
     * Guarda la sesión en localStorage
     */
    guardarSesion() {
        const sesion = {
            usuarioId: this.usuarioActual.id,
            usuarioData: this.usuarioActual,
            token: this.token,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        localStorage.setItem('auth_sesion', JSON.stringify(sesion));
        localStorage.setItem('auth_token', this.token);
    }

    /**
     * Obtiene la sesión del localStorage
     */
    obtenerSesion() {
        try {
            const sesion = localStorage.getItem('auth_sesion');
            return sesion ? JSON.parse(sesion) : null;
        } catch (error) {
            console.error('Error al obtener sesión:', error);
            return null;
        }
    }

    /**
     * Retorna el usuario actual autenticado
     */
    obtenerUsuarioActual() {
        return this.usuarioActual;
    }

    /**
     * Retorna el rol del usuario actual
     */
    obtenerRol() {
        return this.usuarioActual?.rol || null;
    }

    /**
     * Retorna si el usuario está autenticado
     */
    estaAutenticado() {
        return this.usuarioActual !== null && this.token !== null;
    }

    /**
     * Comprueba si el usuario tiene un permiso específico
     * @param {string} permiso - Nombre del permiso a verificar
     * @returns {boolean}
     */
    tienePermiso(permiso) {
        if (!this.usuarioActual) {
            console.warn(`⚠️ Usuario no autenticado - acceso denegado a: ${permiso}`);
            return false;
        }

        const rolPermiso = AuthManager.PERMISOS[this.usuarioActual.rol];
        const tiene = rolPermiso && rolPermiso[permiso] === true;

        if (!tiene) {
            console.warn(`⚠️ Permiso denegado [${this.usuarioActual.rol}]: ${permiso}`);
        }

        return tiene;
    }

    /**
     * Verifica si el usuario es administrador
     */
    esAdmin() {
        return this.usuarioActual?.rol === 'ADMINISTRADOR';
    }

    /**
     * Verifica si el usuario es empleado
     */
    esEmpleado() {
        return this.usuarioActual?.rol === 'EMPLEADO';
    }

    /**
     * Obtiene la lista de usuarios disponibles para login
     * Útil para demostración
     */
    static obtenerUsuariosDemo() {
        return Object.entries(AuthManager.USUARIOS).map(([key, user]) => ({
            username: user.username,
            password: user.password,
            nombre: user.nombre,
            rol: user.rol,
            avatar: user.avatar
        }));
    }

    /**
     * Protege una función verificando permisos
     * @param {string} permiso - Permiso requerido
     * @param {function} callback - Función a ejecutar si tiene permiso
     */
    conPermiso(permiso, callback) {
        if (this.tienePermiso(permiso)) {
            return callback();
        } else {
            console.error(`❌ Acceso denegado: ${permiso}`);
            return null;
        }
    }

    /**
     * Aplica restricciones visuales en la interfaz
     * Oculta/muestra elementos según los permisos del usuario
     */
    aplicarRestriccionesVisuales() {
        console.log(`%c🔐 Aplicando restricciones para rol: ${this.obtenerRol()}`, 'color: #8b5cf6;');

        // RESTRICCIÓN: Botones de eliminar
        if (!this.tienePermiso('eliminar_producto')) {
            document.querySelectorAll('button[onclick*="eliminarProducto"]').forEach(btn => {
                btn.style.display = 'none';
                btn.disabled = true;
            });
            console.log('  ✓ Botones de eliminar productos ocultados');
        }

        if (!this.tienePermiso('eliminar_categoria')) {
            document.querySelectorAll('button[onclick*="eliminarCategoria"]').forEach(btn => {
                btn.style.display = 'none';
                btn.disabled = true;
            });
            console.log('  ✓ Botones de eliminar categorías ocultados');
        }

        // RESTRICCIÓN: Crear productos
        if (!this.tienePermiso('crear_producto')) {
            const btnNuevoProducto = document.getElementById('btnNuevoProducto');
            if (btnNuevoProducto) {
                btnNuevoProducto.style.display = 'none';
                console.log('  ✓ Botón "Nuevo Producto" ocultado');
            }
        }

        // RESTRICCIÓN: Crear categorías
        if (!this.tienePermiso('crear_categoria')) {
            const btnNuevaCategoria = document.getElementById('btnNuevaCategoria');
            if (btnNuevaCategoria) {
                btnNuevaCategoria.style.display = 'none';
                console.log('  ✓ Botón "Nueva Categoría" ocultado');
            }
        }

        // RESTRICCIÓN: Exportar datos
        if (!this.tienePermiso('exportar_datos')) {
            const btnExport = document.getElementById('btnExport');
            if (btnExport) {
                btnExport.style.display = 'none';
                console.log('  ✓ Botón "Exportar Datos" ocultado');
            }
        }

        // RESTRICCIÓN: Importar datos
        if (!this.tienePermiso('importar_datos')) {
            const btnImport = document.getElementById('btnImport');
            if (btnImport) {
                btnImport.style.display = 'none';
                console.log('  ✓ Botón "Importar Datos" ocultado');
            }
        }

        // RESTRICCIÓN: Reportes
        if (!this.tienePermiso('ver_reportes')) {
            const reporteSection = document.getElementById('reportes');
            if (reporteSection) {
                reporteSection.style.display = 'none';
                // Ocultar link en sidebar
                document.querySelector('a[data-section="reportes"]')?.remove();
                console.log('  ✓ Sección "Reportes" ocultada');
            }
        }

        console.log('%c✓ Restricciones visuales aplicadas', 'color: #10b981;');
    }

    /**
     * Obtiene información de sesión para debug
     */
    obtenerInfoSesion() {
        if (!this.estaAutenticado()) {
            return { autenticado: false };
        }

        return {
            autenticado: true,
            usuario: this.usuarioActual,
            rol: this.obtenerRol(),
            token: this.token?.substring(0, 20) + '...',
            permisos: AuthManager.PERMISOS[this.obtenerRol()]
        };
    }
}

/**
 * Crear instancia global del AuthManager
 * Disponible como: authManager en cualquier parte del código
 */
const authManager = new AuthManager();

console.log('%c📦 Módulo: auth.js cargado', 'color: #06b6d4; font-weight: bold;');