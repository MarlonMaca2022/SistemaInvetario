/**
 * MÓDULO DE GESTIÓN DE INTERFAZ DE USUARIO
 * Maneja eventos, renderizado dinámico y interacciones del usuario
 */

class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false; // Rastrear si UIManager ya fue completamente inicializado
    }

    /**
     * Inicializa el gestor de UI
     * Se debe llamar DOPO que el DOM esté completamente cargado
     */
    init() {
        // ⭐ SIEMPRE registrar los event listeners de autenticación
        // (Esto debe ocurrir incluso si el usuario no está autenticado)
        this.bindAuthEventListeners();

        // Verificar que el usuario esté autenticado antes de continuar con otros elementos
        if (!authManager.estaAutenticado()) {
            console.log('%c[UI] Sin autenticación, esperando login...', 'color: #f59e0b;');
            return;
        }

        console.log('%c[UI] ✓ Autenticación verificada, inicializando UI...', 'color: #10b981;');
        this.bindNavigation();
        this.bindEventListeners();
        this.loadDashboard();
        this.updateUserDisplay();
        this.isInitialized = true;
    }

    /**
     * AUTENTICACIÓN - Maneja eventos de login, logout y permisos
     */
    bindAuthEventListeners() {
        console.log('%c[AUTH] Registrando event listeners de autenticación...', 'color: #3b82f6;');
        
        // ⭐ FORMULARIO DE LOGIN
        const formLogin = document.getElementById('formLogin');
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => this.handleLoginSubmit(e));
            console.log('%c[AUTH] ✅ Formulario de login registrado', 'color: #10b981;');
        } else {
            console.warn('%c[AUTH] ⚠️ Formulario #formLogin no encontrado en el DOM', 'color: #f59e0b;');
        }

        // ⭐ BOTONES DE USUARIO DEMO
        const demoButtons = document.querySelectorAll('.demo-user');
        if (demoButtons.length > 0) {
            demoButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.handleDemoUserClick(e));
            });
            console.log(`%c[AUTH] ✅ ${demoButtons.length} botones demo registrados`, 'color: #10b981;');
        } else {
            console.warn('%c[AUTH] ⚠️ Botones .demo-user no encontrados en el DOM', 'color: #f59e0b;');
        }

        // ⭐ BOTÓN LOGOUT
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => this.handleLogout(e));
            console.log('%c[AUTH] ✅ Botón logout registrado', 'color: #10b981;');
        }

        // ⭐ BOTÓN VER PERMISOS
        const btnPermisos = document.getElementById('btnPermisos');
        if (btnPermisos) {
            btnPermisos.addEventListener('click', (e) => this.mostrarPermisos(e));
            console.log('%c[AUTH] ✅ Botón permisos registrado', 'color: #10b981;');
        }

        // ⭐ CERRAR MODAL DE PERMISOS
        const btnCerrarPermisos = document.querySelector('#modalPermisos .close');
        if (btnCerrarPermisos) {
            btnCerrarPermisos.addEventListener('click', () => {
                document.getElementById('modalPermisos').classList.add('hidden');
            });
        }
        
        console.log('%c[AUTH] Event listeners listos', 'color: #10b981;');
    }

    /**
     * Maneja el envío del formulario de login
     */
    handleLoginSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const btnSubmit = e.target.querySelector('button[type="submit"]');

        if (!username || !password) {
            this.showToast('Por favor, complete usuario y contraseña', 'error');
            return;
        }

        // Deshabilitar botón durante el login
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
        }

        // Simular delay de autenticación
        setTimeout(() => {
            try {
                console.log('%c[AUTH] Iniciando login...', 'color: #f59e0b;');
                
                const resultado = authManager.login(username, password);
                console.log('%c[AUTH] Resultado login:', 'color: #f59e0b;', resultado);

                if (resultado.success) {
                    try {
                        console.log('%c[AUTH] Login exitoso, obteniendo info...', 'color: #10b981;');
                        const infoUsuario = authManager.obtenerInfoSesion();
                        console.log('%c[AUTH] Info usuario:', 'color: #10b981;', infoUsuario);
                        
                        // Limpiar formulario
                        e.target.reset();

                        // Actualizar UI
                        console.log('%c[AUTH] Actualizando display...', 'color: #10b981;');
                        this.updateUserDisplay();
                        
                        console.log('%c[AUTH] Aplicando restricciones...', 'color: #10b981;');
                        authManager.aplicarRestriccionesVisuales();

                        // Ocultar login, mostrar app
                        console.log('%c[AUTH] Ocultando pantalla de login...', 'color: #10b981;');
                        this.ocultarPantallaLogin();

                        // Mostrar toast
                        const nombreUsuario = infoUsuario.usuario?.nombre || 'Usuario';
                        this.showToast(`¡Bienvenido ${nombreUsuario}!`, 'success');
                        console.log('%c[AUTH] ✓ Todo completado exitosamente', 'color: #10b981; font-weight: bold;');

                    } catch (err) {
                        console.error('%c[AUTH ERROR] Error procesando login:', 'color: #ef4444;', err);
                        this.showToast('Error al procesar autenticación: ' + err.message, 'error');
                    }
                } else {
                    console.log(`%c[AUTH] Login fallido: ${resultado.mensaje}`, 'color: #ef4444;');
                    this.showToast(resultado.mensaje, 'error');
                    
                    // Enfocar campo de usuario para reintento
                    document.getElementById('loginUsername').focus();
                    document.getElementById('loginUsername').select();
                }
            } catch (err) {
                console.error('%c[AUTH FATAL ERROR]', 'color: #ef4444;', err);
                this.showToast('Error fatal: ' + err.message, 'error');
            } finally {
                // Reactivar botón en cualquier caso
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Iniciar Sesión';
                }
            }
        }, 500);
    }

    /**
     * Oculta la pantalla de login y muestra el dashboard
     * Se ejecuta después de autenticación exitosa
     */
    ocultarPantallaLogin() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
            const dashboard = document.getElementById('dashboard');
            if (dashboard) {
                dashboard.style.display = 'block';
            }
            
            // Re-inicializar UI si aún no estaba hecho
            if (!this.isInitialized) {
                this.bindNavigation();
                this.bindEventListeners();
                this.loadDashboard();
                this.isInitialized = true;
            }
            
            console.log('%c[UI] Pantalla de login ocultada, dashboard activado', 'color: #10b981;');
        }
    }

    /**
     * Maneja clicks en botones de usuario demo
     */
    handleDemoUserClick(e) {
        e.preventDefault();
        const btn = e.target.closest('.demo-user');
        
        if (!btn) return;

        const userKey = btn.dataset.user; // 'admin' o 'empleado'
        const usuario = authManager.USUARIOS[userKey];

        if (!usuario) {
            this.showToast('Usuario demo no encontrado', 'error');
            return;
        }

        // Rellenar campos
        document.getElementById('loginUsername').value = usuario.username;
        document.getElementById('loginPassword').value = usuario.password;

        // Mostrar feedback visual
        this.showToast(`Credenciales cargadas: ${usuario.username}`, 'info');

        // Auto-submit después de llenar
        setTimeout(() => {
            document.getElementById('formLogin').submit();
        }, 300);
    }

    /**
     * Maneja logout del usuario
     */
    handleLogout(e) {
        e.preventDefault();

        // Confirmación
        if (!confirm('¿Desea cerrar sesión?')) {
            return;
        }

        const sesion = authManager.obtenerInfoSesion();
        const nombreUsuario = sesion.usuario?.nombre || 'Usuario';
        authManager.logout();

        console.log(`%c[AUTH] ✓ Logout: ${nombreUsuario}`, 'color: #10b981; font-weight: bold;');

        // Mostrar mensaje y recargar
        this.showToast('Sesión cerrada correctamente', 'info');
        
        // Mostrar pantalla de login nuevamente
        setTimeout(() => {
            location.reload(); // Recargar para limpiar estado completamente
        }, 1000);
    }

    /**
     * Muestra modal con permisos del usuario actual
     */
    mostrarPermisos(e) {
        e.preventDefault();

        const sesion = authManager.obtenerInfoSesion();
        const usuario = sesion.usuario;
        const permisos = authManager.PERMISOS[sesion.rol];

        // Actualizar rol en modal
        document.getElementById('permisoRol').innerHTML = `
            <span class="px-3 py-1 rounded-full text-sm font-medium ${usuario.rol === 'ADMINISTRADOR' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                ${usuario.rol === 'ADMINISTRADOR' ? '👑 Administrador' : '👤 Empleado'}
            </span>
        `;

        // Construir lista de permisos
        let html = '<div class="space-y-2">';
        for (const [permiso, tiene] of Object.entries(permisos)) {
            const icon = tiene ? '✅' : '❌';
            const label = this.formatearNombrePermiso(permiso);
            const clase = tiene ? 'text-green-700' : 'text-gray-500';
            
            html += `
                <div class="flex items-center gap-3 p-2 rounded ${tiene ? 'bg-green-50' : 'bg-gray-50'}">
                    <span class="text-lg">${icon}</span>
                    <span class="${clase} font-medium">${label}</span>
                </div>
            `;
        }
        html += '</div>';

        document.getElementById('permisosList').innerHTML = html;

        // Mostrar modal
        document.getElementById('modalPermisos').classList.remove('hidden');
        
        console.log(`%c[AUTH] Permisos mostrados para: ${usuario.nombre}`, 'color: #3b82f6;');
    }

    /**
     * Formatea el nombre de un permiso para mejor legibilidad
     */
    formatearNombrePermiso(permiso) {
        const labels = {
            'crear_producto': 'Crear Productos',
            'editar_producto': 'Editar Productos',
            'eliminar_producto': 'Eliminar Productos',
            'crear_categoria': 'Crear Categorías',
            'editar_categoria': 'Editar Categorías',
            'eliminar_categoria': 'Eliminar Categorías',
            'registrar_movimiento': 'Registrar Movimientos',
            'editar_movimiento': 'Editar Movimientos',
            'eliminar_movimiento': 'Eliminar Movimientos',
            'ver_reportes': 'Ver Reportes',
            'exportar_datos': 'Exportar Datos',
            'importar_datos': 'Importar Datos',
            'ver_permisos': 'Ver Permisos'
        };
        return labels[permiso] || permiso.replace(/_/g, ' ').toUpperCase();
    }

    /**
     * Actualiza la información del usuario en el header
     */
    updateUserDisplay() {
        const sesion = authManager.obtenerInfoSesion();

        if (!sesion || !sesion.usuario) {
            console.log('%c[UI] No hay usuario para mostrar', 'color: #f59e0b;');
            return;
        }

        // Extraer datos del usuario
        const usuario = sesion.usuario;

        // Avatar con inicial
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const emoji = usuario.rol === 'ADMINISTRADOR' ? '👑' : '👤';
            avatar.textContent = emoji;
        }

        // Nombre del usuario
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = usuario.nombre;
        }

        // Role badge
        const userRole = document.getElementById('userRole');
        if (userRole) {
            const rolClass = usuario.rol === 'ADMINISTRADOR' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800';
            userRole.className = `px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${rolClass}`;
            userRole.textContent = usuario.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Empleado';
        }

        // Información en dropdown
        const userNameInfo = document.getElementById('userNameInfo');
        if (userNameInfo) {
            userNameInfo.textContent = usuario.nombre;
        }

        const userEmailInfo = document.getElementById('userEmailInfo');
        if (userEmailInfo) {
            userEmailInfo.textContent = usuario.email || 'usuario@inventariopro.local';
        }

        const userRolInfo = document.getElementById('userRolInfo');
        if (userRolInfo) {
            userRolInfo.textContent = usuario.rol === 'ADMINISTRADOR' ? 'Administrador del Sistema' : 'Empleado';
        }

        console.log(`%c[UI] Información de usuario actualizada: ${usuario.nombre}`, 'color: #3b82f6;');
    }

    /**
     * NAVEGACIÓN
     */
    bindNavigation() {
        // Links del navbar
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e, link));
        });

        // Toggle sidebar en móvil
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('hidden');
            });
        }
    }

    navigateToSection(e, element) {
        e.preventDefault();
        const sectionName = element.dataset.section;

        if (!sectionName) return;

        // Actualizar clases activas en navbar
        document.querySelectorAll('a[data-section]').forEach(el => {
            el.classList.remove('text-blue-600');
            el.classList.add('text-gray-700');
        });
        element.classList.remove('text-gray-700');
        element.classList.add('text-blue-600');

        // Actualizar sidebar active
        document.querySelectorAll('.sidebar-link').forEach(el => {
            el.classList.remove('active', 'bg-blue-50', 'text-blue-600');
            el.classList.add('text-gray-700');
        });
        const sidebarLink = document.querySelector(`.sidebar-link[data-section="${sectionName}"]`);
        if (sidebarLink) {
            sidebarLink.classList.add('active', 'bg-blue-50', 'text-blue-600');
        }

        // Mostrar sección
        this.showSection(sectionName);

        // Cerrar sidebar en móvil
        if (window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.add('hidden');
        }
    }

    showSection(sectionName) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });

        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.remove('hidden');
            this.currentSection = sectionName;

            // Cargar contenido según sección
            switch (sectionName) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'productos':
                    this.loadProductos();
                    break;
                case 'categorias':
                    this.loadCategorias();
                    break;
                case 'movimientos':
                    this.loadMovimientos();
                    break;
                case 'reportes':
                    this.loadReportes();
                    break;
            }
        }
    }

    /**
     * DASHBOARD
     */
    loadDashboard() {
        const stats = dataManager.obtenerEstadisticas();
        document.getElementById('statProductos').textContent = stats.totalProductos;
        document.getElementById('statCategorias').textContent = stats.totalCategorias;
        document.getElementById('statValor').textContent = '$' + stats.valorInventario.toFixed(2);
        document.getElementById('statMovimientos').textContent = stats.movimientosHoy;

        this.renderAlertas();
        this.renderMovimientosRecientes();
    }

    renderAlertas() {
        const container = document.getElementById('alertasContainer');
        const productosBajo = dataManager.obtenerProductosBajoStock();

        if (productosBajo.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-green-600"><i class="fas fa-check-circle text-2xl mb-2"></i><p class="mt-2">✓ Todos los productos tienen stock adecuado</p></div>';
            return;
        }

        let html = '';
        productosBajo.forEach(producto => {
            const pctStock = ((producto.inventario.cantidad / producto.inventario.minimo) * 100).toFixed(0);
            const alertColor = pctStock < 25 ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50';
            const textColor = pctStock < 25 ? 'text-red-700' : 'text-yellow-700';
            
            html += `
                <div class="border-l-4 ${alertColor} p-4 rounded-r">
                    <p class="font-semibold ${textColor}">${producto.nombre}</p>
                    <p class="text-sm ${textColor} mt-1">SKU: ${producto.codigo}</p>
                    <p class="text-sm ${textColor} mt-1">Stock actual: ${producto.inventario.cantidad} unidades (${pctStock}% del mínimo)</p>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderMovimientosRecientes() {
        const container = document.getElementById('movimientosRecientesContainer');
        const movimientos = dataManager.obtenerMovimientos().slice(-5);

        if (movimientos.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-8">Sin movimientos registrados</p>';
            return;
        }

        let html = '';
        movimientos.reverse().forEach(mov => {
            const tipo = mov.tipo === 'ENTRADA' ? '📥' : '📤';
            const tipoLabel = mov.tipo === 'ENTRADA' ? 'Entrada' : 'Salida';
            const tipoClass = mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const fecha = new Date(mov.fechaMovimiento).toLocaleDateString('es-ES');
            const producto = dataManager.obtenerNombreProducto(mov.productoId);

            html += `
                <div class="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <div class="flex-1">
                        <p class="font-medium text-gray-900">${producto}</p>
                        <p class="text-xs text-gray-500">${fecha}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${tipo}</span>
                        <span class="px-2 py-1 rounded text-xs font-medium ${tipoClass}">${mov.cantidad} u.</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    /**
     * PRODUCTOS
     */
    loadProductos() {
        this.renderProductosTable();
        this.updateCategoriaFilter();
    }

    renderProductosTable(productos = null) {
        if (!productos) {
            productos = dataManager.obtenerProductos();
        }

        const tbody = document.getElementById('productosTbody');

        if (productos.length === 0) {
            tbody.innerHTML = '<tr class="border-b"><td colspan="8" class="px-6 py-8 text-center text-gray-500">No hay productos registrados</td></tr>';
            return;
        }

        let html = '';
        productos.forEach(prod => {
            const categoria = dataManager.obtenerNombreCategoria(prod.categoriaId);
            let badgeClass = 'status-active';
            if (prod.estado === 'INACTIVO') badgeClass = 'status-warning';
            if (prod.estado === 'DESCONTINUADO') badgeClass = 'status-danger';
            
            const isLowStock = prod.inventario.cantidad < prod.inventario.minimo;
            const stockClass = isLowStock ? 'text-red-600 font-semibold' : 'text-gray-900';

            html += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-6 py-3 font-medium text-gray-900">${prod.id.substring(0, 6)}</td>
                    <td class="px-6 py-3 font-mono text-sm text-gray-600">${prod.codigo}</td>
                    <td class="px-6 py-3 text-gray-900">${prod.nombre}</td>
                    <td class="px-6 py-3 text-gray-600">${categoria}</td>
                    <td class="px-6 py-3 font-semibold text-blue-600">$${prod.precio.precioVenta.toFixed(2)}</td>
                    <td class="px-6 py-3 ${stockClass}">${prod.inventario.cantidad}</td>
                    <td class="px-6 py-3">
                        <span class="status-badge ${badgeClass}">${prod.estado}</span>
                    </td>
                    <td class="px-6 py-3 text-sm">
                        <button class="text-blue-600 hover:text-blue-700 mr-3" onclick="uiManager.editarProducto('${prod.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-700" onclick="uiManager.eliminarProducto('${prod.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    updateCategoriaFilter() {
        const select = document.getElementById('filterCategoria');
        const categorias = dataManager.obtenerCategorias();

        let html = '<option value="">Todas las categorías</option>';
        categorias.forEach(cat => {
            html += `<option value="${cat.id}">${cat.nombre}</option>`;
        });
        select.innerHTML = html;

        // Agregar listeners
        select.removeEventListener('change', this.handlerFiltros);
        const searchInput = document.getElementById('searchProductos');
        const filterEstado = document.getElementById('filterEstado');

        const handlerFiltros = () => {
            let productos = dataManager.obtenerProductos();
            const termino = searchInput.value.toLowerCase();
            const categoria = select.value;
            const estado = filterEstado.value;

            if (termino) {
                productos = productos.filter(p =>
                    p.nombre.toLowerCase().includes(termino) ||
                    p.codigo.toLowerCase().includes(termino)
                );
            }

            if (categoria) {
                productos = productos.filter(p => p.categoriaId === categoria);
            }

            if (estado) {
                productos = productos.filter(p => p.estado === estado);
            }

            this.renderProductosTable(productos);
        };

        this.handlerFiltros = handlerFiltros;
        searchInput.addEventListener('change', handlerFiltros);
        select.addEventListener('change', handlerFiltros);
        filterEstado.addEventListener('change', handlerFiltros);
    }

    editarProducto(productoId) {
        const producto = dataManager.productos.find(p => p.id === productoId);
        if (!producto) return;

        // Poblar formulario con datos existentes
        document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoCodigo').value = producto.codigo;
        document.getElementById('productoCategoria').value = producto.categoriaId;
        document.getElementById('productoPrecioCompra').value = producto.precio.precioCompra;
        document.getElementById('productoPrecioVenta').value = producto.precio.precioVenta;
        document.getElementById('productoCantidad').value = producto.inventario.cantidad;
        document.getElementById('productoMinimo').value = producto.inventario.minimo;
        document.getElementById('productoDescripcion').value = producto.descripcion;

        // Marcar el formulario para actualización
        document.getElementById('formProducto').dataset.productoId = productoId;

        this.openModal('modalProducto');
    }

    eliminarProducto(productoId) {
        if (confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                dataManager.eliminarProducto(productoId);
                this.showToast('Producto eliminado correctamente', 'success');
                this.loadProductos();
            } catch (error) {
                this.showToast('Error: ' + error.message, 'error');
            }
        }
    }

    /**
     * CATEGORÍAS
     */
    loadCategorias() {
        this.renderCategoriasGrid();
    }

    renderCategoriasGrid() {
        const container = document.getElementById('categoriasContainer');
        const categorias = dataManager.obtenerCategoriasPorProductos();

        if (categorias.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-12">No hay categorías registradas</p>';
            return;
        }

        let html = '';
        categorias.forEach(cat => {
            html += `
                <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-t-4" style="border-top-color: ${cat.color};">
                    <div class="text-4xl mb-4">${cat.icono}</div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1">${cat.nombre}</h3>
                    <p class="text-sm text-gray-600 mb-4">${cat.totalProductos} productos</p>
                    <p class="text-xs text-gray-500 mb-4 line-clamp-2">${cat.descripcion || 'Sin descripción'}</p>
                    <div class="flex gap-2">
                        <button class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded text-sm transition" onclick="uiManager.editarCategoria('${cat.id}')">
                            <i class="fas fa-edit mr-1"></i> Editar
                        </button>
                        <button class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded text-sm transition" onclick="uiManager.eliminarCategoria('${cat.id}')">
                            <i class="fas fa-trash mr-1"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    editarCategoria(categoriaId) {
        const categoria = dataManager.categorias.find(c => c.id === categoriaId);
        if (!categoria) return;

        document.getElementById('categoriaNombre').value = categoria.nombre;
        document.getElementById('categoriaColor').value = categoria.color;
        document.getElementById('categoriaIcono').value = categoria.icono;
        document.getElementById('categoriaDescripcion').value = categoria.descripcion;
        document.getElementById('formCategoria').dataset.categoriaId = categoriaId;

        this.openModal('modalCategoria');
    }

    eliminarCategoria(categoriaId) {
        if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
            try {
                dataManager.eliminarCategoria(categoriaId);
                this.showToast('Categoría eliminada correctamente', 'success');
                this.loadCategorias();
            } catch (error) {
                this.showToast('Error: ' + error.message, 'error');
            }
        }
    }

    /**
     * MOVIMIENTOS
     */
    loadMovimientos() {
        this.populateProductosSelect();
        this.renderMovimientosHistorial();
    }

    populateProductosSelect() {
        const select = document.getElementById('productoMovimiento');
        const productos = dataManager.obtenerProductos();

        let html = '<option value="">Selecciona un producto</option>';
        productos.forEach(prod => {
            html += `<option value="${prod.id}">${prod.nombre} (Stock: ${prod.inventario.cantidad})</option>`;
        });
        select.innerHTML = html;
    }

    updateRazones() {
        const tipoSelect = document.getElementById('tipoMovimiento');
        const razonSelect = document.getElementById('razonMovimiento');
        const tipo = tipoSelect.value;

        let razones = [];
        if (tipo === 'ENTRADA') {
            razones = ['COMPRA_PROVEEDOR', 'DEVOLUCION_CLIENTE', 'AJUSTE_INVENTARIO', 'TRANSFERENCIA_ENTRADA', 'RECEPCION_INICIAL'];
        } else if (tipo === 'SALIDA') {
            razones = ['VENTA_CLIENTE', 'DEVOLUCION_PROVEEDOR', 'AJUSTE_INVENTARIO', 'TRANSFERENCIA_SALIDA', 'MERMA_DETERIORO', 'MUESTRA_COMERCIAL'];
        }

        let html = '<option value="">Selecciona razón</option>';
        razones.forEach(razon => {
            const label = razon.replace(/_/g, ' ');
            html += `<option value="${razon}">${label}</option>`;
        });
        razonSelect.innerHTML = html;
    }

    renderMovimientosHistorial() {
        const tbody = document.getElementById('movimientosTbody');
        const movimientos = dataManager.obtenerMovimientos();

        if (movimientos.length === 0) {
            tbody.innerHTML = '<tr class="border-b"><td colspan="8" class="px-6 py-8 text-center text-gray-500">Sin movimientos registrados</td></tr>';
            return;
        }

        let html = '';
        movimientos.slice().reverse().forEach(mov => {
            const tipoClass = mov.tipo === 'ENTRADA' ? 'status-active' : 'status-danger';
            const tipo = mov.tipo === 'ENTRADA' ? '📥 Entrada' : '📤 Salida';
            const fecha = new Date(mov.fechaMovimiento).toLocaleDateString('es-ES');
            const producto = dataManager.obtenerNombreProducto(mov.productoId);
            const razonLabel = mov.razon.replace(/_/g, ' ');

            html += `
                <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-6 py-3 text-sm font-mono text-gray-600">${mov.id.substring(0, 6)}</td>
                    <td class="px-6 py-3">
                        <span class="status-badge ${tipoClass}">${tipo}</span>
                    </td>
                    <td class="px-6 py-3 font-medium text-gray-900">${producto}</td>
                    <td class="px-6 py-3 font-semibold text-blue-600">${mov.cantidad}</td>
                    <td class="px-6 py-3 text-gray-600">${fecha}</td>
                    <td class="px-6 py-3 text-sm text-gray-600">${razonLabel}</td>
                    <td class="px-6 py-3 text-gray-600">${mov.usuario}</td>
                    <td class="px-6 py-3">
                        <span class="status-badge status-active">${mov.estado}</span>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    /**
     * REPORTES
     */
    loadReportes() {
        this.loadReporteStock();
    }

    loadReporteStock() {
        const container = document.getElementById('reporteStockContainer');
        const reporte = dataManager.generarReporteStock();

        if (Object.keys(reporte).length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-12">Sin datos disponibles</p>';
            return;
        }

        let html = '<div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-100"><tr><th class="px-4 py-2 text-left font-semibold">Categoría</th><th class="px-4 py-2 text-left font-semibold">Productos</th><th class="px-4 py-2 text-left font-semibold">Cantidad Total</th><th class="px-4 py-2 text-left font-semibold">Valor Total</th></tr></thead><tbody>';

        Object.entries(reporte).forEach(([categoria, datos]) => {
            html += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3 font-semibold text-gray-900">${categoria}</td>
                    <td class="px-4 py-3 text-gray-600">${datos.totalProductos}</td>
                    <td class="px-4 py-3 text-gray-600">${datos.cantidadTotal} unidades</td>
                    <td class="px-4 py-3 font-semibold text-blue-600">$${datos.valorTotal.toFixed(2)}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    /**
     * MODALES
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * NOTIFICACIONES
     */
    showToast(mensaje, tipo = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = mensaje;
        
        // Determinar color según tipo
        let bgColor = 'bg-blue-500';
        if (tipo === 'success') bgColor = 'bg-green-500';
        if (tipo === 'error') bgColor = 'bg-red-500';
        if (tipo === 'warning') bgColor = 'bg-yellow-500';
        
        toast.className = `fixed bottom-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50 ${bgColor}`;

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    /**
     * EVENT LISTENERS
     */
    bindEventListeners() {
        // Botones principales
        document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
            document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
            document.getElementById('formProducto').reset();
            document.getElementById('formProducto').removeAttribute('data-producto-id');
            this.openModal('modalProducto');
        });

        document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => {
            document.getElementById('formCategoria').reset();
            document.getElementById('formCategoria').removeAttribute('data-categoria-id');
            this.openModal('modalCategoria');
        });

        // Cerrar modales con botón close
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.fixed');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Cerrar modal al hacer click en el fondo
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('fixed') && e.target.classList.contains('bg-black')) {
                e.target.classList.add('hidden');
            }
        });

        // Formularios
        document.getElementById('formProducto')?.addEventListener('submit', (e) => this.handleFormProducto(e));
        document.getElementById('formCategoria')?.addEventListener('submit', (e) => this.handleFormCategoria(e));
        document.getElementById('formMovimiento')?.addEventListener('submit', (e) => this.handleFormMovimiento(e));

        // Select de tipo de movimiento
        document.getElementById('tipoMovimiento')?.addEventListener('change', () => this.updateRazones());

        // Exportar/Importar
        document.getElementById('btnExport')?.addEventListener('click', () => this.exportarDatos());
        document.getElementById('btnImport')?.addEventListener('click', () => this.importarDatos());

        // Tabs de reportes
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });

        // Botones de reporte
        document.getElementById('btnReportePDF')?.addEventListener('click', () => this.generarReportePDF());
        document.getElementById('btnReporteExcel')?.addEventListener('click', () => this.generarReporteExcel());
    }

    handleFormProducto(e) {
        e.preventDefault();
        const productoId = e.target.dataset.productoId;

        try {
            const datos = {
                nombre: document.getElementById('productoNombre').value,
                codigo: document.getElementById('productoCodigo').value,
                categoriaId: document.getElementById('productoCategoria').value,
                precioCompra: document.getElementById('productoPrecioCompra').value,
                precioVenta: document.getElementById('productoPrecioVenta').value,
                cantidad: document.getElementById('productoCantidad').value,
                minimo: document.getElementById('productoMinimo').value,
                descripcion: document.getElementById('productoDescripcion').value
            };

            if (productoId) {
                dataManager.actualizarProducto(productoId, datos);
                this.showToast('Producto actualizado correctamente', 'success');
            } else {
                dataManager.crearProducto(datos);
                this.showToast('Producto creado correctamente', 'success');
            }

            this.closeModal('modalProducto');
            this.loadProductos();
        } catch (error) {
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    handleFormCategoria(e) {
        e.preventDefault();
        const categoriaId = e.target.dataset.categoriaId;

        try {
            const datos = {
                nombre: document.getElementById('categoriaNombre').value,
                descripcion: document.getElementById('categoriaDescripcion').value,
                color: document.getElementById('categoriaColor').value,
                icono: document.getElementById('categoriaIcono').value
            };

            if (categoriaId) {
                dataManager.actualizarCategoria(categoriaId, datos);
                this.showToast('Categoría actualizada correctamente', 'success');
            } else {
                dataManager.crearCategoria(datos);
                this.showToast('Categoría creada correctamente', 'success');
            }

            this.closeModal('modalCategoria');
            this.loadCategorias();
        } catch (error) {
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    handleFormMovimiento(e) {
        e.preventDefault();

        try {
            const datos = {
                tipo: document.getElementById('tipoMovimiento').value,
                productoId: document.getElementById('productoMovimiento').value,
                cantidad: parseInt(document.getElementById('cantidadMovimiento').value),
                razon: document.getElementById('razonMovimiento').value,
                notas: document.getElementById('notasMovimiento').value
            };

            dataManager.crearMovimiento(datos);
            this.showToast('Movimiento registrado correctamente', 'success');
            e.target.reset();
            this.loadMovimientos();
        } catch (error) {
            this.showToast('Error: ' + error.message, 'error');
        }
    }

    switchTab(button) {
        // Remover active de todos
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600');
            btn.classList.add('border-transparent', 'text-gray-700');
        });
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

        // Agregar active al seleccionado
        button.classList.remove('border-transparent', 'text-gray-700');
        button.classList.add('text-blue-600', 'border-blue-600');
        
        const tabName = button.dataset.tab;
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }
    }

    exportarDatos() {
        const datos = dataManager.exportarJSON();
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        this.showToast('Datos exportados correctamente', 'success');
    }

    importarDatos() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    dataManager.importarJSON(event.target.result);
                    this.showToast('Datos importados correctamente', 'success');
                    this.loadDashboard();
                } catch (error) {
                    this.showToast('Error al importar: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    generarReportePDF() {
        this.showToast('Función de PDF en desarrollo...', 'info');
    }

    generarReporteExcel() {
        this.showToast('Función de Excel en desarrollo...', 'info');
    }
}

// Instancia global del UIManager (SIN inicialización automática)
const uiManager = new UIManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('%c[UI] DOM listo, inicializando UIManager...', 'color: #3b82f6;');
    uiManager.init();
});
