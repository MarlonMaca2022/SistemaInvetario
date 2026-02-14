/**
 * MOVEMENT MANAGER - Gestión de Movimientos de Inventario
 * 
 * Sistema completo para registrar y controlar movimientos de stock
 * Características:
 * - Entradas (compras, devoluciones, ajustes)
 * - Salidas (ventas, merma, muestras)
 * - Validación con Early Return
 * - Historial completo con auditoría
 * - Integración automática con ProductManager
 * - Reportes y análisis
 */

class MovementManager {
    constructor(productManager = null) {
        this.productManager = productManager || (typeof productManager !== 'undefined' ? productManager : null);
        this.STORAGE_KEY = 'movimientosData';
        this.movimientos = [];
        this.auditLog = [];
        
        // Tipos de movimiento válidos
        this.TIPOS = {
            ENTRADA: 'ENTRADA',
            SALIDA: 'SALIDA'
        };

        // Razones válidas para entradas
        this.RAZONES_ENTRADA = [
            'COMPRA_PROVEEDOR',
            'DEVOLUCION_CLIENTE',
            'AJUSTE_INVENTARIO',
            'TRANSFERENCIA_ENTRADA',
            'RECEPCION_INICIAL',
            'REPARACION_COMPLETADA'
        ];

        // Razones válidas para salidas
        this.RAZONES_SALIDA = [
            'VENTA_CLIENTE',
            'DEVOLUCION_PROVEEDOR',
            'AJUSTE_INVENTARIO',
            'TRANSFERENCIA_SALIDA',
            'MERMA_DETERIORO',
            'MUESTRA_COMERCIAL',
            'ROBO_PERDIDA',
            'EXPIRACION_VENCIMIENTO'
        ];

        this.cargar();
    }

    /**
     * CARGA Y PERSISTENCIA
     */

    /**
     * Carga los movimientos desde localStorage
     */
    cargar() {
        try {
            const datos = localStorage.getItem(this.STORAGE_KEY);
            if (datos) {
                const parseados = JSON.parse(datos);
                this.movimientos = parseados.movimientos || [];
                this.auditLog = parseados.auditLog || [];
                console.log(`✓ ${this.movimientos.length} movimientos cargados`);
            } else {
                this.movimientos = [];
                this.auditLog = [];
            }
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            this.movimientos = [];
            this.auditLog = [];
        }
    }

    /**
     * Guarda los movimientos en localStorage
     */
    guardar() {
        try {
            const datos = {
                movimientos: this.movimientos,
                auditLog: this.auditLog,
                ultimaActualizacion: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(datos));
        } catch (error) {
            console.error('Error al guardar movimientos:', error);
        }
    }

    /**
     * REGISTRO DE MOVIMIENTOS CON EARLY RETURN
     */

    /**
     * Registra una entrada (COMPRA, DEVOLUCION, AJUSTE +)
     * Early Return: Valida todos los requisitos antes de procesara
     * 
     * @param {Object} datos - Datos del movimiento
     * @param {string} datos.productoId - ID del producto
     * @param {number} datos.cantidad - Cantidad a agregar
     * @param {string} datos.razon - Razón de la entrada
     * @param {string} datos.usuario - Usuario que realiza el movimiento
     * @param {string} datos.detalles - Detalles adicionales (opcional)
     * @param {Object} datos.referencia - Referencia externa (factura, etc)
     * @returns {Object} Movimiento registrado
     * @throws {Error} Si viola alguna validación
     */
    registrarEntrada(datos) {
        // EARLY RETURN: Validación de producto
        if (!datos.productoId) {
            throw new Error('El ID del producto es requerido');
        }

        // EARLY RETURN: Validación de producto existente
        if (this.productManager && !this.productManager.obtenerProductoPorId(datos.productoId)) {
            throw new Error(`Producto con ID "${datos.productoId}" no existe`);
        }

        // EARLY RETURN: Validación de cantidad
        if (!datos.cantidad || parseInt(datos.cantidad) <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        // EARLY RETURN: Validación de razón
        if (!datos.razon || !this.RAZONES_ENTRADA.includes(datos.razon)) {
            throw new Error(`Razón inválida. Válidas: ${this.RAZONES_ENTRADA.join(', ')}`);
        }

        // EARLY RETURN: Validación de usuario
        if (!datos.usuario) {
            throw new Error('El usuario es requerido');
        }

        // Todas las validaciones pasaron, proceder con el registro
        const movimiento = this._crearMovimiento('ENTRADA', datos);
        
        // Actualizar stock en ProductManager
        if (this.productManager) {
            this.productManager.actualizarStockProducto(
                datos.productoId,
                parseInt(datos.cantidad),
                datos.razon
            );
        }

        this.movimientos.push(movimiento);
        this._registrarAudit('ENTRADA_REGISTRADA', movimiento, datos.usuario);
        this.guardar();

        console.log(`✓ Entrada registrada: ${datos.cantidad} unidades`);
        return movimiento;
    }

    /**
     * Registra una salida (VENTA, MERMA, DEVOLUCION, etc)
     * Early Return: Valida cantidad disponible PRIMERO
     * 
     * @param {Object} datos - Datos del movimiento
     * @param {string} datos.productoId - ID del producto
     * @param {number} datos.cantidad - Cantidad a restar
     * @param {string} datos.razon - Razón de la salida
     * @param {string} datos.usuario - Usuario que realiza el movimiento
     * @param {string} datos.detalles - Detalles adicionales (opcional)
     * @returns {Object} Movimiento registrado
     * @throws {Error} Si no hay stock suficiente o violación de validación
     */
    registrarSalida(datos) {
        // EARLY RETURN: Validación de producto
        if (!datos.productoId) {
            throw new Error('El ID del producto es requerido');
        }

        // EARLY RETURN: Obtener producto
        const producto = this.productManager?.obtenerProductoPorId(datos.productoId);
        if (this.productManager && !producto) {
            throw new Error(`Producto con ID "${datos.productoId}" no existe`);
        }

        // EARLY RETURN: Validación de cantidad
        if (!datos.cantidad || parseInt(datos.cantidad) <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        const cantidadSolicitada = parseInt(datos.cantidad);

        // 🔴 EARLY RETURN CRÍTICO: Verificar stock disponible PRIMERO
        // Esta es la validación más importante - sin stock no procede nada
        if (this.productManager && producto.inventario.cantidad < cantidadSolicitada) {
            throw new Error(
                `Stock insuficiente. ` +
                `Disponible: ${producto.inventario.cantidad}, ` +
                `Solicitado: ${cantidadSolicitada}`
            );
        }

        // EARLY RETURN: Validación de razón
        if (!datos.razon || !this.RAZONES_SALIDA.includes(datos.razon)) {
            throw new Error(`Razón inválida. Válidas: ${this.RAZONES_SALIDA.join(', ')}`);
        }

        // EARLY RETURN: Validación de usuario
        if (!datos.usuario) {
            throw new Error('El usuario es requerido');
        }

        // Todas las validaciones pasaron, proceder con la salida
        const movimiento = this._crearMovimiento('SALIDA', datos);

        // Actualizar stock (restar cantidad)
        if (this.productManager) {
            this.productManager.actualizarStockProducto(
                datos.productoId,
                -cantidadSolicitada,
                datos.razon
            );
        }

        this.movimientos.push(movimiento);
        this._registrarAudit('SALIDA_REGISTRADA', movimiento, datos.usuario);
        this.guardar();

        console.log(`✓ Salida registrada: ${datos.cantidad} unidades`);
        return movimiento;
    }

    /**
     * Registra un ajuste manual de inventario (puede ser + o -)
     * 
     * @param {Object} datos - Datos del ajuste
     * @param {string} datos.productoId - ID del producto
     * @param {number} datos.cantidad - Cantidad de ajuste (+/-)
     * @param {string} datos.usuario - Usuario que realiza el ajuste
     * @param {string} datos.motivo - Motivo del ajuste
     * @returns {Object} Movimiento registrado
     */
    registrarAjuste(datos) {
        // Determinar si es entrada o salida según el signo
        const cantidad = Math.abs(parseInt(datos.cantidad));
        const esEntrada = parseInt(datos.cantidad) >= 0;

        const movimientoData = {
            productoId: datos.productoId,
            cantidad: cantidad,
            usuario: datos.usuario,
            razon: 'AJUSTE_INVENTARIO',
            referencia: {
                tipo: 'AJUSTE_MANUAL',
                motivo: datos.motivo || 'Ajuste manual sin especificar'
            }
        };

        if (esEntrada) {
            return this.registrarEntrada(movimientoData);
        } else {
            return this.registrarSalida(movimientoData);
        }
    }

    /**
     * CONSULTA DE MOVIMENTOS
     */

    /**
     * Obtiene todos los movimientos
     * @param {Object} filtros - Filtros opcionales
     * @param {string} filtros.tipo - Filtro por tipo (ENTRADA/SALIDA)
     * @param {string} filtros.productoId - Filtro por producto
     * @param {Date} filtros.desde - Filtro por fecha inicial
     * @param {Date} filtros.hasta - Filtro por fecha final
     * @returns {Array} Movimientos filtrados
     */
    obtenerMovimientos(filtros = {}) {
        let resultados = [...this.movimientos];

        // Filtro por tipo
        if (filtros.tipo) {
            resultados = resultados.filter(m => m.tipo === filtros.tipo);
        }

        // Filtro por producto
        if (filtros.productoId) {
            resultados = resultados.filter(m => m.productoId === filtros.productoId);
        }

        // Filtro por fecha
        if (filtros.desde) {
            const desde = new Date(filtros.desde);
            resultados = resultados.filter(m => new Date(m.fecha) >= desde);
        }

        if (filtros.hasta) {
            const hasta = new Date(filtros.hasta);
            resultados = resultados.filter(m => new Date(m.fecha) <= hasta);
        }

        return resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    /**
     * Obtiene un movimiento por ID
     * @param {string} id - ID del movimiento
     * @returns {Object|null} Movimiento encontrado
     */
    obtenerMovimientoPorId(id) {
        return this.movimientos.find(m => m.id === id) || null;
    }

    /**
     * Obtiene todos los movimientos de un producto
     * @param {string} productoId - ID del producto
     * @returns {Array} Movimientos del producto
     */
    obtenerMovimientosPorProducto(productoId) {
        return this.obtenerMovimientos({ productoId });
    }

    /**
     * Obtiene movimientos recientes
     * @param {number} dias - Número de días a retroceder
     * @returns {Array} Movimientos de los últimos N días
     */
    obtenerMovimientosRecientes(dias = 7) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - dias);
        return this.obtenerMovimientos({ desde: fecha });
    }

    /**
     * Obtiene el historial de stock de un producto
     * @param {string} productoId - ID del producto
     * @returns {Array} Historial ordenado cronológicamente
     */
    obtenerHistorialStock(productoId) {
        const movimientos = this.obtenerMovimientosPorProducto(productoId);
        let stockAcumulado = 0;

        return movimientos.reverse().map(m => {
            const cambio = m.tipo === 'ENTRADA' ? m.cantidad : -m.cantidad;
            stockAcumulado += cambio;

            return {
                id: m.id,
                fecha: m.fecha,
                tipo: m.tipo,
                cantidad: m.cantidad,
                razon: m.razon,
                usuario: m.usuario,
                stockResultante: stockAcumulado,
                cambio: cambio
            };
        });
    }

    /**
     * ANÁLISIS Y REPORTES
     */

    /**
     * Obtiene estadísticas de movimientos
     * @returns {Object} Estadísticas
     */
    obtenerEstadisticas() {
        const entradas = this.obtenerMovimientos({ tipo: 'ENTRADA' });
        const salidas = this.obtenerMovimientos({ tipo: 'SALIDA' });

        const totalEntradas = entradas.reduce((sum, m) => sum + m.cantidad, 0);
        const totalSalidas = salidas.reduce((sum, m) => sum + m.cantidad, 0);

        // Razones más comunes
        const razonesEntrada = {};
        const razonesSalida = {};

        entradas.forEach(m => {
            razonesEntrada[m.razon] = (razonesEntrada[m.razon] || 0) + m.cantidad;
        });

        salidas.forEach(m => {
            razonesSalida[m.razon] = (razonesSalida[m.razon] || 0) + m.cantidad;
        });

        return {
            totalMovimientos: this.movimientos.length,
            totalEntradas: entradas.length,
            totalSalidas: salidas.length,
            unidadesEntradas: totalEntradas,
            unidadesSalidas: totalSalidas,
            balanceNeto: totalEntradas - totalSalidas,
            ultimoMovimiento: this.movimientos[this.movimientos.length - 1] || null,
            razonesEntrada: razonesEntrada,
            razonesSalida: razonesSalida,
            usuariosActivos: this._obtenerUsuariosActivos(),
            periodoCobertura: {
                desde: this._obtenerFechaMinima(),
                hasta: new Date().toISOString()
            }
        };
    }

    /**
     * Genera un reporte de movimientos por período
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Object} Reporte
     */
    generarReportePeriodo(fechaInicio, fechaFin) {
        const movimientos = this.obtenerMovimientos({
            desde: fechaInicio,
            hasta: fechaFin
        });

        const porProducto = {};
        const porRazon = {};

        movimientos.forEach(m => {
            // Agrupar por producto
            if (!porProducto[m.productoId]) {
                porProducto[m.productoId] = {
                    entradas: 0,
                    salidas: 0,
                    movimientos: 0
                };
            }
            if (m.tipo === 'ENTRADA') {
                porProducto[m.productoId].entradas += m.cantidad;
            } else {
                porProducto[m.productoId].salidas += m.cantidad;
            }
            porProducto[m.productoId].movimientos++;

            // Agrupar por razón
            if (!porRazon[m.razon]) {
                porRazon[m.razon] = {
                    cantidad: 0,
                    movimientos: 0,
                    tipo: m.tipo
                };
            }
            porRazon[m.razon].cantidad += m.cantidad;
            porRazon[m.razon].movimientos++;
        });

        return {
            periodo: {
                desde: fechaInicio.toISOString(),
                hasta: fechaFin.toISOString()
            },
            totalMovimientos: movimientos.length,
            unidadesEntradas: movimientos
                .filter(m => m.tipo === 'ENTRADA')
                .reduce((sum, m) => sum + m.cantidad, 0),
            unidadesSalidas: movimientos
                .filter(m => m.tipo === 'SALIDA')
                .reduce((sum, m) => sum + m.cantidad, 0),
            porProducto,
            porRazon
        };
    }

    /**
     * Obtiene productos con más movimientos (más vendidos/comprados)
     * @param {number} limite - Número de productos a retornar
     * @returns {Array} Top productos
     */
    obtenerProductosMasMovidos(limite = 10) {
        const movimientos = {};

        this.movimientos.forEach(m => {
            if (!movimientos[m.productoId]) {
                movimientos[m.productoId] = {
                    productoId: m.productoId,
                    totalEntradas: 0,
                    totalSalidas: 0,
                    totalMovimientos: 0
                };
            }
            if (m.tipo === 'ENTRADA') {
                movimientos[m.productoId].totalEntradas += m.cantidad;
            } else {
                movimientos[m.productoId].totalSalidas += m.cantidad;
            }
            movimientos[m.productoId].totalMovimientos++;
        });

        return Object.values(movimientos)
            .sort((a, b) => b.totalMovimientos - a.totalMovimientos)
            .slice(0, limite);
    }

    /**
     * Verifica la consistencia entre movimientos y stock actual
     * @param {string} productoId - ID del producto
     * @returns {Object} Resultado de la verificación
     */
    verificarConsistenciaStock(productoId) {
        const producto = this.productManager?.obtenerProductoPorId(productoId);
        if (!producto) {
            throw new Error('Producto no encontrado');
        }

        const movimientos = this.obtenerMovimientosPorProducto(productoId);
        let stockCalculado = 0;

        movimientos.reverse().forEach(m => {
            if (m.tipo === 'ENTRADA') {
                stockCalculado += m.cantidad;
            } else {
                stockCalculado -= m.cantidad;
            }
        });

        const esConsistente = stockCalculado === producto.inventario.cantidad;

        return {
            productoId,
            stockActual: producto.inventario.cantidad,
            stockCalculadoDesdeMovimientos: stockCalculado,
            diferencia: producto.inventario.cantidad - stockCalculado,
            esConsistente,
            totalMovimientos: movimientos.length,
            ultimoMovimiento: movimientos[0] || null
        };
    }

    /**
     * AUDITORÍA
     */

    /**
     * Obtiene el registro de auditoría
     * @param {Object} filtros - Filtros opcionales
     * @returns {Array} Registro de auditoría
     */
    obtenerAuditLog(filtros = {}) {
        let resultados = [...this.auditLog];

        if (filtros.usuario) {
            resultados = resultados.filter(a => a.usuario === filtros.usuario);
        }

        if (filtros.accion) {
            resultados = resultados.filter(a => a.accion === filtros.accion);
        }

        if (filtros.desde) {
            const desde = new Date(filtros.desde);
            resultados = resultados.filter(a => new Date(a.timestamp) >= desde);
        }

        return resultados.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Exporta los movimientos a JSON
     * @returns {string} JSON formateado
     */
    exportarJSON() {
        return JSON.stringify({
            metadata: {
                fecha: new Date().toISOString(),
                totalMovimientos: this.movimientos.length,
                versión: '1.0'
            },
            movimientos: this.movimientos,
            auditLog: this.auditLog
        }, null, 2);
    }

    /**
     * MÉTODOS PRIVADOS/INTERNOS
     */

    /**
     * Crea un objeto de movimiento con estructura completa
     * @private
     */
    _crearMovimiento(tipo, datos) {
        const id = 'MOV-' + String(this.movimientos.length + 1).padStart(5, '0');
        
        return {
            id,
            tipo,
            productoId: datos.productoId,
            cantidad: parseInt(datos.cantidad),
            razon: datos.razon,
            usuario: datos.usuario,
            fecha: new Date().toISOString(),
            detalles: datos.detalles || '',
            referencia: datos.referencia || {},
            estado: 'COMPLETADO'
        };
    }

    /**
     * Registra una acción en el log de auditoría
     * @private
     */
    _registrarAudit(accion, datos, usuario) {
        this.auditLog.push({
            timestamp: new Date().toISOString(),
            accion,
            usuario,
            detalles: datos,
            ip: 'local' // Se podría obtener del servidor
        });
    }

    /**
     * Obtiene lista de usuarios activos
     * @private
     */
    _obtenerUsuariosActivos() {
        const usuarios = new Set();
        this.movimientos.forEach(m => usuarios.add(m.usuario));
        return Array.from(usuarios);
    }

    /**
     * Obtiene la fecha mínima de movimientos
     * @private
     */
    _obtenerFechaMinima() {
        if (this.movimientos.length === 0) return new Date().toISOString();
        const fechas = this.movimientos.map(m => new Date(m.fecha));
        return new Date(Math.min(...fechas)).toISOString();
    }
}

// Instancia global del MovementManager
const movementManager = new MovementManager(productManager);
