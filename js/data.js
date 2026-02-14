/**
 * MÓDULO DE GESTIÓN DE DATOS
 * Gestiona operaciones CRUD para categorías, productos y movimientos
 * Estructura: Arquitectura de datos sin backend
 */

class DataManager {
    constructor() {
        this.categorias = [];
        this.productos = [];
        this.movimientos = [];
        this.usuarioActual = 'sistema@inventario.com';
        this.init();
    }

    /**
     * Inicializa los datos desde localStorage o ficheros JSON
     */
    async init() {
        try {
            // Cargar datos del localStorage si existen
            const datosGuardados = localStorage.getItem('inventarioData');
            if (datosGuardados) {
                const datos = JSON.parse(datosGuardados);
                this.categorias = datos.categorias || [];
                this.productos = datos.productos || [];
                this.movimientos = datos.movimientos || [];
                console.log('✓ Datos cargados desde localStorage');
            } else {
                // Sino, cargar datos de ejemplo
                await this.cargarDatosEjemplo();
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.crearDatosDefault();
        }
    }

    /**
     * Carga datos de ejemplo desde archivos JSON
     */
    async cargarDatosEjemplo() {
        try {
            const [resCateg, resProds, resMov] = await Promise.all([
                fetch('data/categorias.json'),
                fetch('data/productos.json'),
                fetch('data/movimientos.json')
            ]);

            this.categorias = await resCateg.json();
            this.productos = await resProds.json();
            this.movimientos = await resMov.json();

            this.guardar();
            console.log('✓ Datos de ejemplo cargados correctamente');
        } catch (error) {
            console.warn('No se pudo cargar archivos JSON, usando datos por defecto:', error);
            this.crearDatosDefault();
        }
    }

    /**
     * Crea datos mínimos por defecto
     */
    crearDatosDefault() {
        this.categorias = [
            {
                id: 'CAT-001',
                nombre: 'Electrónica',
                descripcion: 'Equipos electrónicos',
                icono: '🖥️',
                color: '#FF6B6B',
                activa: true,
                fechaCreacion: new Date().toISOString(),
                modificadoEn: new Date().toISOString()
            }
        ];
        this.productos = [];
        this.movimientos = [];
        this.guardar();
    }

    /**
     * GESTIÓN DE CATEGORÍAS
     */

    obtenerCategorias() {
        return [...this.categorias];
    }

    crearCategoria(datos) {
        const id = 'CAT-' + String(this.categorias.length + 1).padStart(3, '0');
        const nuevaCategoria = {
            id,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            icono: datos.icono || '📂',
            color: datos.color || '#4ECDC4',
            activa: true,
            fechaCreacion: new Date().toISOString(),
            modificadoEn: new Date().toISOString()
        };

        this.categorias.push(nuevaCategoria);
        this.guardar();
        return nuevaCategoria;
    }

    actualizarCategoria(id, datos) {
        const indice = this.categorias.findIndex(c => c.id === id);
        if (indice === -1) throw new Error('Categoría no encontrada');

        this.categorias[indice] = {
            ...this.categorias[indice],
            ...datos,
            modificadoEn: new Date().toISOString()
        };
        this.guardar();
        return this.categorias[indice];
    }

    eliminarCategoria(id) {
        const indice = this.categorias.findIndex(c => c.id === id);
        if (indice === -1) throw new Error('Categoría no encontrada');

        // Verificar que no haya productos asociados
        if (this.productos.some(p => p.categoriaId === id)) {
            throw new Error('No se puede eliminar: existen productos en esta categoría');
        }

        this.categorias.splice(indice, 1);
        this.guardar();
    }

    obtenerCategoriasPorProductos() {
        return this.categorias.map(cat => ({
            ...cat,
            totalProductos: this.productos.filter(p => p.categoriaId === cat.id).length
        }));
    }

    /**
     * GESTIÓN DE PRODUCTOS
     */

    obtenerProductos() {
        return [...this.productos];
    }

    obtenerProductosPorCategoria(categoriaId) {
        return this.productos.filter(p => p.categoriaId === categoriaId);
    }

    crearProducto(datos) {
        // Validaciones
        if (this.productos.some(p => p.codigo === datos.codigo)) {
            throw new Error('El código SKU ya existe');
        }

        const id = 'PROD-' + String(this.productos.length + 1).padStart(3, '0');
        const nuevoProducto = {
            id,
            codigo: datos.codigo,
            nombre: datos.nombre,
            descripcion: datos.descripcion || '',
            categoriaId: datos.categoriaId,
            precio: {
                precioCompra: parseFloat(datos.precioCompra),
                precioVenta: parseFloat(datos.precioVenta),
                moneda: 'USD'
            },
            inventario: {
                cantidad: parseInt(datos.cantidad) || 0,
                minimo: parseInt(datos.minimo) || 5,
                maximo: parseInt(datos.maximo) || 100,
                ubicacion: datos.ubicacion || 'Almacén General'
            },
            especificaciones: datos.especificaciones || {},
            estado: 'ACTIVO',
            imagen: datos.imagen || null,
            fechaCreacion: new Date().toISOString(),
            modificadoEn: new Date().toISOString()
        };

        this.productos.push(nuevoProducto);
        this.guardar();
        return nuevoProducto;
    }

    actualizarProducto(id, datos) {
        const indice = this.productos.findIndex(p => p.id === id);
        if (indice === -1) throw new Error('Producto no encontrado');

        // Validar código único si se actualiza
        if (datos.codigo && datos.codigo !== this.productos[indice].codigo) {
            if (this.productos.some(p => p.codigo === datos.codigo)) {
                throw new Error('El código SKU ya existe');
            }
        }

        this.productos[indice] = {
            ...this.productos[indice],
            ...datos,
            precio: datos.precio ? { ...this.productos[indice].precio, ...datos.precio } : this.productos[indice].precio,
            inventario: datos.inventario ? { ...this.productos[indice].inventario, ...datos.inventario } : this.productos[indice].inventario,
            modificadoEn: new Date().toISOString()
        };

        this.guardar();
        return this.productos[indice];
    }

    actualizarStockProducto(productoId, cantidad) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) throw new Error('Producto no encontrado');

        producto.inventario.cantidad = Math.max(0, producto.inventario.cantidad + cantidad);
        producto.modificadoEn = new Date().toISOString();
        this.guardar();
        return producto;
    }

    eliminarProducto(id) {
        const indice = this.productos.findIndex(p => p.id === id);
        if (indice === -1) throw new Error('Producto no encontrado');

        // Solo permitir eliminar si no hay movimientos asociados
        if (this.movimientos.some(m => m.productoId === id)) {
            // Mejor marcar como inactivo que eliminar
            this.productos[indice].estado = 'INACTIVO';
            this.guardar();
            return;
        }

        this.productos.splice(indice, 1);
        this.guardar();
    }

    /**
     * GESTIÓN DE MOVIMIENTOS
     */

    obtenerMovimientos() {
        return [...this.movimientos];
    }

    obtenerMovimientosPorProducto(productoId) {
        return this.movimientos.filter(m => m.productoId === productoId);
    }

    obtenerMovimientosRecientes(dias = 7) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - dias);
        return this.movimientos.filter(m => new Date(m.fechaMovimiento) >= fecha);
    }

    crearMovimiento(datos) {
        const producto = this.productos.find(p => p.id === datos.productoId);
        if (!producto) throw new Error('Producto no encontrado');

        // Validar que la razón corresponda al tipo
        const razonesEntrada = ['COMPRA_PROVEEDOR', 'DEVOLUCION_CLIENTE', 'AJUSTE_INVENTARIO', 'TRANSFERENCIA_ENTRADA', 'RECEPCION_INICIAL'];
        const razonesSalida = ['VENTA_CLIENTE', 'DEVOLUCION_PROVEEDOR', 'AJUSTE_INVENTARIO', 'TRANSFERENCIA_SALIDA', 'MERMA_DETERIORO', 'MUESTRA_COMERCIAL'];

        if (datos.tipo === 'ENTRADA' && !razonesEntrada.includes(datos.razon)) {
            throw new Error('Razón inválida para entrada');
        }
        if (datos.tipo === 'SALIDA' && !razonesSalida.includes(datos.razon)) {
            throw new Error('Razón inválida para salida');
        }

        // Validar que hay suficiente stock para salidas
        if (datos.tipo === 'SALIDA' && producto.inventario.cantidad < datos.cantidad) {
            throw new Error('Stock insuficiente');
        }

        const id = 'MOV-' + String(this.movimientos.length + 1).padStart(3, '0');
        const nuevoMovimiento = {
            id,
            tipo: datos.tipo,
            productoId: datos.productoId,
            cantidad: parseInt(datos.cantidad),
            fechaMovimiento: datos.fechaMovimiento || new Date().toISOString(),
            razon: datos.razon,
            detalles: datos.detalles || {},
            usuario: datos.usuario || this.usuarioActual,
            notas: datos.notas || '',
            estado: 'COMPLETADO',
            geoLocalizacion: datos.geoLocalizacion || { almacen: 'Principal', ubicacion: 'General' }
        };

        // Actualizar stock
        const cantidad = datos.tipo === 'ENTRADA' ? datos.cantidad : -datos.cantidad;
        this.actualizarStockProducto(datos.productoId, cantidad);

        // Registrar movimiento
        this.movimientos.push(nuevoMovimiento);
        this.guardar();
        return nuevoMovimiento;
    }

    /**
     * ANÁLISIS Y REPORTES
     */

    obtenerEstadisticas() {
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

        return {
            totalProductos: this.productos.length,
            productosActivos: this.productos.filter(p => p.estado === 'ACTIVO').length,
            totalCategorias: this.categorias.length,
            valorInventario: this.calcularValorInventario(),
            movimientosHoy: this.movimientos.filter(m => new Date(m.fechaMovimiento) >= hoy).length,
            productosBajoStock: this.obtenerProductosBajoStock().length,
            productosSinStock: this.productos.filter(p => p.inventario.cantidad === 0).length
        };
    }

    calcularValorInventario() {
        return this.productos.reduce((total, prod) => {
            return total + (prod.precio.precioVenta * prod.inventario.cantidad);
        }, 0);
    }

    obtenerProductosBajoStock() {
        return this.productos.filter(p => p.inventario.cantidad <= p.inventario.minimo);
    }

    obtenerMovimientosPorTipo(tipo) {
        return this.movimientos.filter(m => m.tipo === tipo);
    }

    generarReporteStock() {
        const reporte = {};
        this.categorias.forEach(cat => {
            const productos = this.obtenerProductosPorCategoria(cat.id);
            reporte[cat.nombre] = {
                totalProductos: productos.length,
                cantidadTotal: productos.reduce((sum, p) => sum + p.inventario.cantidad, 0),
                valorTotal: productos.reduce((sum, p) => sum + (p.precio.precioVenta * p.inventario.cantidad), 0),
                productos: productos
            };
        });
        return reporte;
    }

    generarReporteMovimientos(fechaInicio, fechaFin) {
        return this.movimientos.filter(m => {
            const fecha = new Date(m.fechaMovimiento);
            return fecha >= fechaInicio && fecha <= fechaFin;
        }).reduce((acc, mov) => {
            acc[mov.tipo] = (acc[mov.tipo] || 0) + mov.cantidad;
            return acc;
        }, {});
    }

    /**
     * PERSISTENCIA
     */

    guardar() {
        const datos = {
            categorias: this.categorias,
            productos: this.productos,
            movimientos: this.movimientos,
            ultimaActualizacion: new Date().toISOString()
        };
        localStorage.setItem('inventarioData', JSON.stringify(datos));
    }

    exportarJSON() {
        return JSON.stringify({
            metadata: {
                version: '1.0',
                exportDate: new Date().toISOString(),
                totalProductos: this.productos.length,
                totalMovimientos: this.movimientos.length
            },
            categorias: this.categorias,
            productos: this.productos,
            movimientos: this.movimientos
        }, null, 2);
    }

    importarJSON(jsonData) {
        try {
            const datos = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            this.categorias = datos.categorias || [];
            this.productos = datos.productos || [];
            this.movimientos = datos.movimientos || [];
            this.guardar();
            return true;
        } catch (error) {
            console.error('Error al importar JSON:', error);
            throw new Error('Formato de JSON inválido');
        }
    }

    reiniciarDatos() {
        if (confirm('¿Estás seguro de que quieres reiniciar todos los datos? Esta acción no se puede deshacer.')) {
            this.categorias = [];
            this.productos = [];
            this.movimientos = [];
            localStorage.removeItem('inventarioData');
            this.crearDatosDefault();
            return true;
        }
        return false;
    }

    /**
     * UTILIDADES
     */

    obtenerNombreCategoria(categoriaId) {
        const categoria = this.categorias.find(c => c.id === categoriaId);
        return categoria ? categoria.nombre : 'N/A';
    }

    obtenerNombreProducto(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        return producto ? producto.nombre : 'N/A';
    }

    buscarProductos(termino) {
        const termino_min = termino.toLowerCase();
        return this.productos.filter(p =>
            p.nombre.toLowerCase().includes(termino_min) ||
            p.codigo.toLowerCase().includes(termino_min) ||
            p.descripcion.toLowerCase().includes(termino_min)
        );
    }

    obtenerProductosPorEstado(estado) {
        return this.productos.filter(p => p.estado === estado);
    }
}

// Instancia global del DataManager
const dataManager = new DataManager();
