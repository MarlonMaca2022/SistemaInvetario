/**
 * APLICACIÓN PRINCIPAL - SISTEMA DE GESTIÓN DE INVENTARIOS
 * Versión: 1.0.0
 * Arquitectura: Frontend JavaScript Vanilla (sin backend)
 */

class InventarioApp {
    constructor() {
        this.version = '1.0.0';
        this.appName = 'InventarioPRO';
        this.isDevelopment = true;
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        console.clear();
        console.log(`%c${this.appName} v${this.version}`, 'color: #2563eb; font-size: 16px; font-weight: bold;');
        console.log('Iniciando sistema de gestión de inventarios...\n');

        try {
            // ⭐ VERIFICAR AUTENTICACIÓN PRIMERO
            console.log('%c[AUTH] Verificando autenticación...', 'color: #f59e0b; font-weight: bold;');
            const sesionActiva = authManager.estaAutenticado();
            
            if (!sesionActiva) {
                console.log('%c[AUTH] Sin sesión activa. Mostrar pantalla de login.', 'color: #f59e0b;');
                this.mostrarPantallaLogin();
                return; // No continuar con inicialización
            }

            // ✓ Usuario autenticado, continuar con inicialización
            const usuarioActual = authManager.obtenerInfoSesion();
            console.log(`%c[AUTH] ✓ Sesión activa: ${usuarioActual.nombre} (${usuarioActual.rol})`, 'color: #10b981; font-weight: bold;');

            // Cargar datos
            await this.loadData();

            // Iniciar UI Manager
            await this.initializeUI();

            // ⭐ APLICAR RESTRICCIONES VISUALES SEGÚN ROL
            authManager.aplicarRestriccionesVisuales();

            // Configurar eventos globales
            this.setupGlobalEvents();

            // Log de éxito
            console.log(`%c✓ Aplicación inicializada correctamente`, 'color: #10b981; font-weight: bold;');
            console.log(`Usuarios registrados: ${dataManager.movimientos.length > 0 ? 'Sí' : 'No'}`);
            console.log(`Productos en inventario: ${dataManager.productos.length}`);
            console.log(`Movimientos registrados: ${dataManager.movimientos.length}\n`);
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Carga los datos iniciales
     */
    async loadData() {
        return new Promise((resolve) => {
            // DataManager se inicializa automáticamente
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    /**
     * Inicializa el gestor de UI
     */
    async initializeUI() {
        return new Promise((resolve) => {
            // UIManager se inicializa automáticamente
            setTimeout(() => {
                resolve();
            }, 100);
        });
    }

    /**
     * Configura eventos globales
     */
    setupGlobalEvents() {
        // Cambio de tamaño de ventana
        window.addEventListener('resize', this.handleWindowResize.bind(this));

        // Antes de salir (advertencia sobre cambios no guardados)
        window.addEventListener('beforeunload', (e) => {
            if (sessionManager.get('cambiosSinGuardar')) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Detección de cambios en otros tabs
        window.addEventListener('storage', this.handleStorageChange.bind(this));

        // Atajos de teclado
        this.setupKeyboardShortcuts();
    }

    /**
     * Manejo de cambios en el tamaño de la ventana
     */
    handleWindowResize() {
        const width = window.innerWidth;
        sessionManager.set('windowWidth', width);

        // Ajustar layouts responsivos
        if (width > 768) {
            document.querySelector('.sidebar')?.classList.remove('active');
        }
    }

    /**
     * Detección de cambios en localStorage (múltiples tabs)
     */
    handleStorageChange(event) {
        if (event.key === 'inventarioData') {
            console.log('Cambios detectados desde otro tab, recargando datos...');
            dataManager.init().then(() => {
                uiManager.loadDashboard();
            });
        }
    }

    /**
     * Atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Guardar (aunque los datos se guardan automáticamente)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                uiManager.showToast('✓ Datos guardados automáticamente', 'success');
            }

            // Ctrl/Cmd + E: Exportar
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                uiManager.exportarDatos();
            }

            // Ctrl/Cmd + I: Importar
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                uiManager.importarDatos();
            }

            // ESC: Cerrar modales abiertos
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }

    /**
     * Manejo de errores de inicialización
     */
    handleInitError(error) {
        const errorContainer = document.querySelector('.content') || document.body;
        errorContainer.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h1>❌ Error de Inicialización</h1>
                <p>No se pudo inicializar la aplicación correctamente.</p>
                <p style="color: #ef4444; margin-top: 20px;">Error: ${error.message}</p>
                <button onclick="location.reload()" class="btn-primary" style="margin-top: 20px;">
                    Recargar Página
                </button>
            </div>
        `;
    }

    /**
     * Muestra la pantalla de login
     * Se ejecuta cuando no hay sesión autenticada
     */
    mostrarPantallaLogin() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.style.display = 'none';
            }
            
            console.log('%c[AUTH] Pantalla de login mostrada', 'color: #3b82f6;');
            
            // Foco automático en campo de usuario
            const inputUsername = document.getElementById('loginUsername');
            if (inputUsername) {
                setTimeout(() => inputUsername.focus(), 300);
            }
        }
    }

    /**
     * FUNCIONES DE UTILIDAD
     */

    /**
     * Obiene información del diagnóstico del sistema
     */
    getDiagnostics() {
        return {
            app: {
                nombre: this.appName,
                version: this.version,
                desarrollo: this.isDevelopment
            },
            datos: {
                productos: dataManager.productos.length,
                categorias: dataManager.categorias.length,
                movimientos: dataManager.movimientos.length
            },
            almacenamiento: {
                items: storageManager.getAllKeys().length,
                tamaño: storageManager.getSize(),
                tamaño_MB: (storageManager.getSize() / 1024 / 1024).toFixed(2)
            },
            sesion: sessionManager.getSessionInfo(),
            navegador: {
                userAgent: navigator.userAgent,
                ventana: {
                    ancho: window.innerWidth,
                    alto: window.innerHeight
                }
            },
            horario: {
                local: new Date().toString(),
                iso: new Date().toISOString()
            }
        };
    }

    /**
     * Genera un reporte de estado del sistema
     */
    generateStatusReport() {
        const diag = this.getDiagnostics();
        const stats = dataManager.obtenerEstadisticas();

        return {
            timestamp: new Date().toISOString(),
            estado: 'operativo',
            diagnosticos: diag,
            estadisticas: stats,
            advertencias: this.getSystemWarnings(),
            recomendaciones: this.getSystemRecommendations()
        };
    }

    /**
     * Obtiene advertencias del sistema
     */
    getSystemWarnings() {
        const advertencias = [];
        const stats = dataManager.obtenerEstadisticas();

        if (stats.productosSinStock > 0) {
            advertencias.push(`⚠️ ${stats.productosSinStock} producto(s) sin stock`);
        }

        if (stats.productosBajoStock > 0) {
            advertencias.push(`⚠️ ${stats.productosBajoStock} producto(s) con stock bajo`);
        }

        if (storageManager.getSize() > 5000000) { // 5MB
            advertencias.push('⚠️ Almacenamiento local casi lleno');
        }

        if (dataManager.movimientos.length > 10000) {
            advertencias.push('⚠️ Muchos movimientos en el sistema, considere limpiar datos antiguos');
        }

        return advertencias;
    }

    /**
     * Obtiene recomendaciones del sistema
     */
    getSystemRecommendations() {
        const recomendaciones = [];

        if (dataManager.productos.length === 0) {
            recomendaciones.push('📌 Agregue sus primeros productos para comenzar a usar el sistema');
        }

        if (dataManager.categorias.length < 5) {
            recomendaciones.push('📌 Considere crear más categorías para mejor organización');
        }

        if (dataManager.movimientos.length < 10) {
            recomendaciones.push('📌 Comience a registrar movimientos para mantener un historial preciso');
        }

        return recomendaciones;
    }

    /**
     * Exporta diagnósticos a JSON
     */
    exportDiagnostics() {
        const report = this.generateStatusReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_sistema_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        console.log('Reporte exportado');
    }

    /**
     * Limpia datos antiguos (más de X días)
     */
    cleanOldData(diasAntiguedad = 90) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

        const movimientosAntiguos = dataManager.movimientos.filter(m =>
            new Date(m.fechaMovimiento) < fechaLimite
        );

        if (movimientosAntiguos.length > 0) {
            if (confirm(`Se eliminarán ${movimientosAntiguos.length} movimientos con más de ${diasAntiguedad} días. ¿Continuar?`)) {
                dataManager.movimientos = dataManager.movimientos.filter(m =>
                    new Date(m.fechaMovimiento) >= fechaLimite
                );
                dataManager.guardar();
                uiManager.showToast(`Se eliminaron ${movimientosAntiguos.length} movimientos antiguos`, 'success');
                return true;
            }
        } else {
            uiManager.showToast('No hay movimientos antiguos para limpiar', 'info');
        }
        return false;
    }

    /**
     * Valida la integridad de los datos
     */
    validateDataIntegrity() {
        const errors = [];

        // Verificar referencias válidas
        dataManager.productos.forEach(prod => {
            if (!dataManager.categorias.find(c => c.id === prod.categoriaId)) {
                errors.push(`Producto "${prod.nombre}" referencia a categoría inexistente`);
            }
        });

        dataManager.movimientos.forEach(mov => {
            if (!dataManager.productos.find(p => p.id === mov.productoId)) {
                errors.push(`Movimiento "${mov.id}" referencia a producto inexistente`);
            }
        });

        // Verificar códigos únicos
        const codigos = dataManager.productos.map(p => p.codigo);
        const codigosDuplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
        if (codigosDuplicados.length > 0) {
            errors.push(`Códigos duplicados encontrados: ${codigosDuplicados.join(', ')}`);
        }

        return {
            valido: errors.length === 0,
            errores: errors
        };
    }

    /**
     * Modo demo - Agrega datos de ejemplo
     */
    runDemoMode() {
        console.log('Iniciando modo demo...');
        if (dataManager.productos.length > 0) {
            alert('Ya hay datos en el sistema. Reinicie para usar modo demo.');
            return;
        }

        // Crear categorías de ejemplo
        const categorias = [
            { nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos', icono: '🖥️', color: '#FF6B6B' },
            { nombre: 'Accesorios', descripcion: 'Accesorios varios', icono: '⚙️', color: '#4ECDC4' },
            { nombre: 'Consumibles', descripcion: 'Artículos consumibles', icono: '📦', color: '#FFE66D' }
        ];

        categorias.forEach(cat => dataManager.crearCategoria(cat));

        // Crear productos de ejemplo
        const productos = [
            {
                nombre: 'Laptop HP',
                codigo: 'SKU-001',
                categoriaId: 'CAT-001',
                precioCompra: 500,
                precioVenta: 800,
                cantidad: 10,
                minimo: 2
            },
            {
                nombre: 'Mouse Inalámbrico',
                codigo: 'SKU-002',
                categoriaId: 'CAT-002',
                precioCompra: 15,
                precioVenta: 25,
                cantidad: 50,
                minimo: 10
            },
            {
                nombre: 'Papel A4 (Resma)',
                codigo: 'SKU-003',
                categoriaId: 'CAT-003',
                precioCompra: 5,
                precioVenta: 8,
                cantidad: 100,
                minimo: 20
            }
        ];

        productos.forEach(prod => dataManager.crearProducto(prod));

        console.log('✓ Modo demo activo - Datos de ejemplo agregados');
        uiManager.showToast('Modo demo activado con datos de ejemplo', 'success');
        location.reload();
    }
}

/**
 * INICIALIZAR APLICACIÓN
 */
const app = new InventarioApp();

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

/**
 * FUNCIONES GLOBALES DE CONSOLA ÚTILES
 */
window.inventario = {
    app: app,
    data: dataManager,
    storage: storageManager,
    session: sessionManager,
    ui: uiManager,

    // Atajos útiles
    diagnostics: () => app.getDiagnostics(),
    status: () => app.generateStatusReport(),
    export: () => app.exportDiagnostics(),
    validate: () => app.validateDataIntegrity(),
    demo: () => app.runDemoMode(),
    clean: (dias) => app.cleanOldData(dias),

    // Información
    help: () => {
        console.log(`
%cInventarioPRO - Funciones Disponibles
%c
app.diagnostics()    - Obtener diagnósticos del sistema
app.status()         - Obtener reporte de estado
app.export()         - Exportar reporte
app.validate()       - Validar integridad de datos
app.demo()           - Activar modo demostración
app.clean(días)      - Limpiar datos antiguos

dataManager.obtenerEstadisticas()
dataManager.exportarJSON()
dataManager.importarJSON(json)
dataManager.obtenerProductosBajoStock()

storageManager.getInfo()
storageManager.exportToJSON()
storageManager.clear()

uiManager.showToast(mensaje, tipo)
uiManager.loadDashboard()
        `, 'color: #2563eb; font-weight: bold; font-size: 14px;', 'color: #64748b; font-family: monospace;');
    }
};

console.log('%cEscribe "inventario.help()" para ver funciones disponibles', 'color: #3b82f6; font-weight: bold;');
