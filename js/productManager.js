/**
 * PRODUCTO MANAGER - CRUD de Productos con Persistencia
 * Gestiona todas las operaciones CRUD de productos con almacenamiento en localStorage
 * 
 * Funcionalidades:
 * - Crear productos con validación
 * - Leer/obtener productos (todos o filtrados)
 * - Actualizar productos y su inventario
 * - Eliminar productos (soft delete si tienen movimientos)
 * - Persistencia automática en localStorage
 */

class ProductManager {
    constructor() {
        this.STORAGE_KEY = 'inventarioData';
        this.productos = [];
        this.movimientos = [];
        this.cargar();
    }

    /**
     * CARGAR Y GUARDAR - Persistencia en localStorage
     */

    /**
     * Carga los productos desde localStorage
     */
    cargar() {
        try {
            const datos = localStorage.getItem(this.STORAGE_KEY);
            if (datos) {
                const parseados = JSON.parse(datos);
                this.productos = parseados.productos || [];
                this.movimientos = parseados.movimientos || [];
                console.log(`✓ ${this.productos.length} productos cargados desde localStorage`);
            } else {
                this.productos = [];
                this.movimientos = [];
                console.log('ℹ No hay datos previos, iniciando con lista vacía');
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.productos = [];
            this.movimientos = [];
        }
    }

    /**
     * Guarda los productos en localStorage
     */
    guardar() {
        try {
            const datos = {
                productos: this.productos,
                movimientos: this.movimientos,
                ultimaActualizacion: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(datos));
            console.log('✓ Datos guardados en localStorage');
        } catch (error) {
            console.error('Error al guardar datos:', error);
            throw new Error('No se pudieron guardar los datos');
        }
    }

    /**
     * CREATE - Crear nuevo producto
     */

    /**
     * Crea un nuevo producto con validaciones
     * @param {Object} datos - Datos del producto
     * @param {string} datos.nombre - Nombre del producto (requerido)
     * @param {string} datos.codigo - Código SKU único (requerido)
     * @param {string} datos.categoriaId - ID de la categoría (requerido)
     * @param {string} datos.descripcion - Descripción del producto
     * @param {number} datos.precioCompra - Precio de compra
     * @param {number} datos.precioVenta - Precio de venta
     * @param {number} datos.cantidad - Cantidad en inventario
     * @param {number} datos.minimo - Stock mínimo
     * @param {number} datos.maximo - Stock máximo
     * @param {string} datos.ubicacion - Ubicación en almacén
     * @returns {Object} Producto creado con ID generado
     * @throws {Error} Si el SKU ya existe o faltan datos requeridos
     */
    crearProducto(datos) {
        // Validar campos requeridos
        if (!datos.nombre || !datos.codigo || !datos.categoriaId) {
            throw new Error('Faltan campos requeridos: nombre, código y categoría');
        }

        // Validar que el código SKU sea único
        if (this.productos.some(p => p.codigo === datos.codigo)) {
            throw new Error(`El código SKU "${datos.codigo}" ya está en uso`);
        }

        // Validar que los precios sean válidos
        const precioCompra = parseFloat(datos.precioCompra) || 0;
        const precioVenta = parseFloat(datos.precioVenta) || 0;

        if (precioVenta < precioCompra && precioVenta > 0) {
            console.warn('⚠ El precio de venta es menor que el de compra');
        }

        // Generar ID único
        const id = this.generarId();

        // Crear objeto del producto
        const nuevoProducto = {
            id,
            codigo: datos.codigo.trim(),
            nombre: datos.nombre.trim(),
            descripcion: (datos.descripcion || '').trim(),
            categoriaId: datos.categoriaId,
            precio: {
                precioCompra: precioCompra,
                precioVenta: precioVenta,
                moneda: 'USD',
                margen: precioCompra > 0 ? ((precioVenta - precioCompra) / precioCompra * 100).toFixed(2) : 0
            },
            inventario: {
                cantidad: parseInt(datos.cantidad) || 0,
                minimo: parseInt(datos.minimo) || 5,
                maximo: parseInt(datos.maximo) || 100,
                ubicacion: (datos.ubicacion || 'Almacén General').trim(),
                últimaActualizacion: new Date().toISOString()
            },
            especificaciones: datos.especificaciones || {},
            estado: 'ACTIVO',
            imagen: datos.imagen || null,
            fechaCreacion: new Date().toISOString(),
            modificadoEn: new Date().toISOString()
        };

        this.productos.push(nuevoProducto);
        this.guardar();

        console.log(`✓ Producto creado: ${nuevoProducto.nombre} (${nuevoProducto.id})`);
        return nuevoProducto;
    }

    /**
     * READ - Obtener/Leer productos
     */

    /**
     * Obtiene todos los productos activos
     * @param {boolean} incluirInactivos - Si incluir productos inactivos
     * @returns {Array} Array de productos
     */
    obtenerProductos(incluirInactivos = false) {
        if (incluirInactivos) {
            return [...this.productos];
        }
        return this.productos.filter(p => p.estado === 'ACTIVO');
    }

    /**
     * Obtiene un producto por ID
     * @param {string} id - ID del producto
     * @returns {Object|null} Producto encontrado o null
     */
    obtenerProductoPorId(id) {
        const producto = this.productos.find(p => p.id === id);
        return producto ? { ...producto } : null;
    }

    /**
     * Obtiene un producto por código SKU
     * @param {string} codigo - Código SKU
     * @returns {Object|null} Producto encontrado o null
     */
    obtenerProductoPorCodigo(codigo) {
        const producto = this.productos.find(p => p.codigo === codigo);
        return producto ? { ...producto } : null;
    }

    /**
     * Obtiene productos filtrados por categoría
     * @param {string} categoriaId - ID de la categoría
     * @returns {Array} Productos de esa categoría
     */
    obtenerProductosPorCategoria(categoriaId) {
        return this.productos.filter(p => 
            p.categoriaId === categoriaId && p.estado === 'ACTIVO'
        );
    }

    /**
     * Obtiene productos que están bajo stock mínimo
     * @returns {Array} Productos bajo stock
     */
    obtenerProductosBajoStock() {
        return this.productos.filter(p => 
            p.estado === 'ACTIVO' && 
            p.inventario.cantidad <= p.inventario.minimo
        );
    }

    /**
     * Obtiene productos sin stock
     * @returns {Array} Productos con cantidad 0
     */
    obtenerProductosSinStock() {
        return this.productos.filter(p => 
            p.estado === 'ACTIVO' && 
            p.inventario.cantidad === 0
        );
    }

    /**
     * Busca productos por nombre o código
     * @param {string} término - Término de búsqueda
     * @returns {Array} Productos que coinciden
     */
    buscarProductos(término) {
        const busqueda = término.toLowerCase();
        return this.productos.filter(p =>
            p.estado === 'ACTIVO' && (
                p.nombre.toLowerCase().includes(busqueda) ||
                p.codigo.toLowerCase().includes(busqueda) ||
                p.descripcion.toLowerCase().includes(busqueda)
            )
        );
    }

    /**
     * UPDATE - Actualizar productos
     */

    /**
     * Actualiza los datos de un producto
     * @param {string} id - ID del producto a actualizar
     * @param {Object} datos - Datos a actualizar (parcial o completo)
     * @returns {Object} Producto actualizado
     * @throws {Error} Si el producto no existe o hay error de validación
     */
    actualizarProducto(id, datos) {
        const indice = this.productos.findIndex(p => p.id === id);
        if (indice === -1) {
            throw new Error(`Producto con ID "${id}" no encontrado`);
        }

        const productoActual = this.productos[indice];

        // Si se actualiza el código, validar unicidad
        if (datos.codigo && datos.codigo !== productoActual.codigo) {
            if (this.productos.some(p => p.codigo === datos.codigo && p.id !== id)) {
                throw new Error(`El código SKU "${datos.codigo}" ya está en uso`);
            }
        }

        // Actualizar campos básicos
        if (datos.nombre) productoActual.nombre = datos.nombre.trim();
        if (datos.codigo) productoActual.codigo = datos.codigo.trim();
        if (datos.descripcion !== undefined) productoActual.descripcion = datos.descripcion.trim();
        if (datos.categoriaId) productoActual.categoriaId = datos.categoriaId;
        if (datos.imagen !== undefined) productoActual.imagen = datos.imagen;
        if (datos.especificaciones) {
            productoActual.especificaciones = { ...productoActual.especificaciones, ...datos.especificaciones };
        }

        // Actualizar precio con validación
        if (datos.precioCompra !== undefined || datos.precioVenta !== undefined) {
            const precioCompra = datos.precioCompra !== undefined ? 
                parseFloat(datos.precioCompra) : productoActual.precio.precioCompra;
            const precioVenta = datos.precioVenta !== undefined ? 
                parseFloat(datos.precioVenta) : productoActual.precio.precioVenta;

            if (precioVenta < precioCompra && precioVenta > 0) {
                console.warn('⚠ El precio de venta es menor que el de compra');
            }

            productoActual.precio = {
                ...productoActual.precio,
                precioCompra,
                precioVenta,
                margen: precioCompra > 0 ? ((precioVenta - precioCompra) / precioCompra * 100).toFixed(2) : 0
            };
        }

        // Actualizar inventario
        if (datos.inventario) {
            productoActual.inventario = {
                ...productoActual.inventario,
                ...datos.inventario,
                últimaActualizacion: new Date().toISOString()
            };
        }

        // Actualizar timestamp
        productoActual.modificadoEn = new Date().toISOString();

        this.guardar();
        console.log(`✓ Producto actualizado: ${productoActual.nombre}`);
        return { ...productoActual };
    }

    /**
     * Actualiza la cantidad en inventario de un producto
     * @param {string} productoId - ID del producto
     * @param {number} cantidad - Cantidad a sumar/restar (puede ser negativo)
     * @param {string} razon - Razón del movimiento (opcional)
     * @returns {Object} Producto actualizado
     * @throws {Error} Si no hay suficiente stock para una salida
     */
    actualizarStockProducto(productoId, cantidad, razon = 'AJUSTE_INVENTARIO') {
        const producto = this.obtenerProductoPorId(productoId);
        if (!producto) {
            throw new Error(`Producto con ID "${productoId}" no encontrado`);
        }

        // Calcular nueva cantidad
        const nuevaCantidad = producto.inventario.cantidad + cantidad;

        // Validar que no sea negativo
        if (nuevaCantidad < 0) {
            throw new Error(`Stock insuficiente. Disponible: ${producto.inventario.cantidad}, Solicitado: ${Math.abs(cantidad)}`);
        }

        // Actualizar inventario
        return this.actualizarProducto(productoId, {
            inventario: {
                cantidad: nuevaCantidad
            }
        });
    }

    /**
     * Activa un producto inactivo
     * @param {string} id - ID del producto
     * @returns {Object} Producto reactivado
     */
    activarProducto(id) {
        const producto = this.obtenerProductoPorId(id);
        if (!producto) throw new Error('Producto no encontrado');
        return this.actualizarProducto(id, { estado: 'ACTIVO' });
    }

    /**
     * DELETE - Eliminar/Archivar productos
     */

    /**
     * Elimina (soft delete) o desactiva un producto
     * Si tiene movimientos, solo lo marca como inactivo
     * Si no tiene movimientos, lo elimina completamente
     * @param {string} id - ID del producto a eliminar
     * @returns {Object} Resultado de la operación
     * @throws {Error} Si el producto no existe
     */
    eliminarProducto(id) {
        const indice = this.productos.findIndex(p => p.id === id);
        if (indice === -1) {
            throw new Error(`Producto con ID "${id}" no encontrado`);
        }

        const producto = this.productos[indice];
        const tieneMovimientos = this.movimientos.some(m => m.productoId === id);

        if (tieneMovimientos) {
            // Soft delete: marcar como inactivo en lugar de eliminar
            producto.estado = 'INACTIVO';
            producto.modificadoEn = new Date().toISOString();
            this.guardar();
            console.log(`✓ Producto marcado como inactivo: ${producto.nombre}`);
            return {
                éxito: true,
                mensaje: `Producto archivado (contiene movimientos de inventario)`,
                producto: { ...producto }
            };
        } else {
            // Eliminación permanente si no hay movimientos
            this.productos.splice(indice, 1);
            this.guardar();
            console.log(`✓ Producto eliminado: ${producto.nombre}`);
            return {
                éxito: true,
                mensaje: 'Producto eliminado permanentemente',
                productoId: id
            };
        }
    }

    /**
     * Elimina un producto permanentemente (solo si no tiene movimientos)
     * @param {string} id - ID del producto
     * @returns {boolean} True si se eliminó
     * @throws {Error} Si tiene movimientos asociados
     */
    eliminarProductoPermanente(id) {
        const tieneMovimientos = this.movimientos.some(m => m.productoId === id);
        if (tieneMovimientos) {
            throw new Error('No se puede eliminar: el producto tiene movimientos de inventario registrados');
        }
        return this.eliminarProducto(id).éxito;
    }

    /**
     * UTILIDADES Y ANÁLISIS
     */

    /**
     * Obtiene estadísticas de los productos
     * @returns {Object} Objeto con estadísticas
     */
    obtenerEstadísticas() {
        const productosActivos = this.productos.filter(p => p.estado === 'ACTIVO');
        const totalValor = productosActivos.reduce((sum, p) => 
            sum + (p.precio.precioVenta * p.inventario.cantidad), 0
        );
        const totalItems = productosActivos.reduce((sum, p) => sum + p.inventario.cantidad, 0);

        return {
            totalProductos: this.productos.length,
            productosActivos: productosActivos.length,
            productosInactivos: this.productos.filter(p => p.estado === 'INACTIVO').length,
            totalItems: totalItems,
            valorInventario: totalValor,
            productosMásValioso: productosActivos
                .sort((a, b) => (b.precio.precioVenta * b.inventario.cantidad) - (a.precio.precioVenta * a.inventario.cantidad))
                .slice(0, 5),
            productosBajoStock: this.obtenerProductosBajoStock().length,
            productosSinStock: this.obtenerProductosSinStock().length,
            margenPromedio: this.calcularMargenPromedio()
        };
    }

    /**
     * Calcula el margen de ganancia promedio
     * @returns {number} Margen promedio en porcentaje
     */
    calcularMargenPromedio() {
        const productosConMargen = this.productos.filter(p => p.precio.margen);
        if (productosConMargen.length === 0) return 0;
        
        const sumaMargen = productosConMargen.reduce((sum, p) => sum + parseFloat(p.precio.margen), 0);
        return (sumaMargen / productosConMargen.length).toFixed(2);
    }

    /**
     * Obtiene el valor total del inventario
     * @returns {number} Valor total
     */
    obtenerValorInventario() {
        return this.productos.reduce((total, p) => 
            total + (p.precio.precioVenta * p.inventario.cantidad), 0
        ).toFixed(2);
    }

    /**
     * Genera un reporte de productos por categoría
     * @returns {Object} Reporte agrupado por categoría
     */
    generarReporteCategoria() {
        const reporte = {};
        this.productos.forEach(p => {
            if (!reporte[p.categoriaId]) {
                reporte[p.categoriaId] = {
                    total: 0,
                    cantidad: 0,
                    valor: 0,
                    productos: []
                };
            }
            reporte[p.categoriaId].total++;
            reporte[p.categoriaId].cantidad += p.inventario.cantidad;
            reporte[p.categoriaId].valor += p.precio.precioVenta * p.inventario.cantidad;
            reporte[p.categoriaId].productos.push(p.nombre);
        });
        return reporte;
    }

    /**
     * Exporta los productos a JSON
     * @returns {string} JSON de productos
     */
    exportarJSON() {
        return JSON.stringify({
            metadata: {
                fecha: new Date().toISOString(),
                totalProductos: this.productos.length,
                versión: '1.0'
            },
            productos: this.productos
        }, null, 2);
    }

    /**
     * Importa productos desde JSON
     * @param {string} json - String JSON de productos
     * @param {boolean} reemplazar - Si reemplazar datos existentes
     * @throws {Error} Si el JSON es inválido
     */
    importarJSON(json, reemplazar = false) {
        try {
            const datos = JSON.parse(json);
            if (!Array.isArray(datos.productos)) {
                throw new Error('Formato inválido: se espera un array de productos');
            }

            if (reemplazar) {
                this.productos = datos.productos;
            } else {
                this.productos = [...this.productos, ...datos.productos];
            }

            this.guardar();
            console.log(`✓ ${datos.productos.length} productos importados`);
            return { éxito: true, cantidad: datos.productos.length };
        } catch (error) {
            throw new Error(`Error al importar JSON: ${error.message}`);
        }
    }

    /**
     * UTILIDADES PRIVADAS
     */

    /**
     * Genera un ID único para producto
     * @returns {string} ID en formato PROD-###
     */
    generarId() {
        const maxId = Math.max(
            0,
            ...this.productos
                .map(p => parseInt(p.id.replace('PROD-', '')))
                .filter(n => !isNaN(n))
        );
        return `PROD-${String(maxId + 1).padStart(3, '0')}`;
    }

    /**
     * Limpia todos los datos (para testing)
     */
    limpiar() {
        this.productos = [];
        this.movimientos = [];
        this.guardar();
        console.log('✓ Datos limpiados');
    }

    /**
     * Obtiene un resumen rápido del estado del inventario
     * @returns {Object} Resumen
     */
    obtenerResumen() {
        return {
            totalProductos: this.obtenerProductos().length,
            totalVenta: this.obtenerValorInventario(),
            productosBajoStock: this.obtenerProductosBajoStock().length,
            sinStock: this.obtenerProductosSinStock().length,
            margenPromedio: this.calcularMargenPromedio() + '%'
        };
    }
}

// Instancia global del ProductManager
const productManager = new ProductManager();
