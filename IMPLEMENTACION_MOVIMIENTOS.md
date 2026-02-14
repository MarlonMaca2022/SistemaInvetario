# MovementManager - Sistema de Movimientos de Inventario

## 🚀 Resumen Ejecutivo

Se ha implementado un **sistema completo de gestión de movimientos de inventario** con:

- ✅ **MovementManager.js** - Módulo principal (700+ líneas)
- ✅ **Validaciones Early Return** - Patrón de seguridad crítica
- ✅ **Integración automática** - Con ProductManager
- ✅ **Historial completo** - Auditoría de todas las operaciones
- ✅ **Reportes y análisis** - Estadísticas detalladas
- ✅ **Demo interactivo** - demo-movements.html

---

## 📋 Archivos Creados/Modificados

### Nuevos Archivos
| Archivo | Descripción |
|---------|-------------|
| `js/movementManager.js` | Módulo principal de movimientos (700 líneas) |
| `MOVIMIENTOS.md` | Documentación completa con ejemplos |
| `demo-movements.html` | Demo interactivo en navegador |

### Archivos Modificados
| Archivo | Cambio |
|---------|--------|
| `index.html` | Agregado: `<script src="js/movementManager.js"></script>` |

---

## 🎯 Funcionalidad Principal

### 1. **Registrar Entrada** (Compra, Devolución, etc)
```javascript
movementManager.registrarEntrada({
    productoId: 'PROD-001',
    cantidad: 100,
    razon: 'COMPRA_PROVEEDOR',
    usuario: 'gerente_almacen',
    referencia: { factura: 'FAC-2024-001' }
});
```

### 2. **Registrar Salida** (Venta, Merma, etc)
```javascript
movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 5,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor_juan'
    // ↑ Valida stock AUTOMÁTICAMENTE con Early Return
});
```

### 3. **Registrar Ajuste**
```javascript
movementManager.registrarAjuste({
    productoId: 'PROD-001',
    cantidad: -3,  // Negativo = salida
    usuario: 'supervisor',
    motivo: '3 unidades dañadas'
});
```

---

## 🔴 Early Return Pattern

### ¿Qué es?
El **Early Return** es una técnica de validación que **detiene la ejecución inmediatamente** cuando encuentra un error, en lugar de anidar condicionales:

### ❌ Mal (Anidado)
```javascript
if (productoId) {
    if (producto) {
        if (cantidad > 0) {
            if (stock >= cantidad) {
                // procesar...
            }
        }
    }
}
```

### ✅ Bien (Early Return)
```javascript
// Early Return 1
if (!productoId) throw new Error('...');

// Early Return 2
if (!producto) throw new Error('...');

// Early Return 3
if (cantidad <= 0) throw new Error('...');

// 🔴 VALIDACIÓN CRÍTICA: Stock
if (stock < cantidad) throw new Error('Stock insuficiente');

// Todas pasaron, procesar
procesarMovimiento();
```

### Ventajas
✅ **Código más limpio** - Vertical, no anidado  
✅ **Más seguro** - Detiene antes de procesar  
✅ **Fácil de mantener** - Validaciones claras  
✅ **Mejor rendimiento** - No valida innecesariamente  

---

## 📊 Validaciones Implementadas

### En `registrarEntrada()`
```
1. ¿Existe productoId?
2. ¿Existe el producto?
3. ¿Cantidad > 0?
4. ¿Razón válida?
5. ¿Usuario especificado?
✅ Procesar
```

### En `registrarSalida()` (CRÍTICA)
```
1. ¿Existe productoId?
2. ¿Existe el producto?
3. ¿Cantidad > 0?
4. 🔴 ¿HAY STOCK DISPONIBLE? ← CRÍTICA
5. ¿Razón válida?
6. ¿Usuario especificado?
✅ Procesar
```

---

## 🔗 Integración con ProductManager

El **MovementManager** se integra automáticamente:

```
registrarSalida(PROD-001, 5)
    ↓
Valida stock (Early Return)
    ↓
ProductManager.actualizarStockProducto(PROD-001, -5)
    ↓
Stock se resta automáticamente
    ↓
Movimiento se registra
    ↓
Auditoría se crea
    ↓
localStorage se actualiza
```

---

## 📈 Ejemplos de Uso

### Ejemplo 1: Proceso de Venta Completo
```javascript
// 1. Crear producto
const laptop = productManager.crearProducto({
    nombre: 'Laptop HP 15',
    codigo: 'HP-001',
    categoriaId: 'CAT-001',
    precioVenta: 1200,
    cantidad: 20
});
// Stock: 20

// 2. Cliente compra 3
const venta = movementManager.registrarSalida({
    productoId: laptop.id,
    cantidad: 3,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor_juan',
    referencia: { ticket: 'TKT-001' }
});
// Stock: 17 (automático)
// Movimiento MOV-00001 registrado
// Auditoría actualizada

// 3. Ver historial
const historial = movementManager.obtenerHistorialStock(laptop.id);
// [{ tipo: 'VENTA_CLIENTE', cantidad: 3, stockResultante: 17, ... }]
```

### Ejemplo 2: Manejo de Error (Early Return)
```javascript
// Intentar vender más de lo disponible
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 30,  // Stock = 17
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
} catch (error) {
    console.error(error.message);
    // "Stock insuficiente. Disponible: 17, Solicitado: 30"
    // ↑ Early Return: se detiene AQUÍ
}
```

### Ejemplo 3: Devolución de Cliente
```javascript
// Cliente devuelve 2 laptops
const devolucion = movementManager.registrarEntrada({
    productoId: laptop.id,
    cantidad: 2,
    razon: 'DEVOLUCION_CLIENTE',
    usuario: 'servicio_cliente',
    referencia: { ticketVenta: 'TKT-001' }
});
// Stock sube: 17 + 2 = 19
```

---

## 📚 Tipos de Movimiento

### ENTRADAS (Agregar stock)
- `COMPRA_PROVEEDOR` - Compra a proveedor
- `DEVOLUCION_CLIENTE` - Devolución del cliente
- `AJUSTE_INVENTARIO` - Ajuste manual +
- `TRANSFERENCIA_ENTRADA` - Recibe de otra sucursal
- `RECEPCION_INICIAL` - Inventario inicial
- `REPARACION_COMPLETADA` - Producto reparado

### SALIDAS (Restar stock)
- `VENTA_CLIENTE` - Venta a cliente
- `DEVOLUCION_PROVEEDOR` - Devolución al proveedor
- `AJUSTE_INVENTARIO` - Ajuste manual -
- `TRANSFERENCIA_SALIDA` - Envía a otra sucursal
- `MERMA_DETERIORO` - Producto dañado
- `MUESTRA_COMERCIAL` - Muestra gratuita
- `ROBO_PERDIDA` - Pérdida o robo
- `EXPIRACION_VENCIMIENTO` - Producto vencido

---

## 📊 Análisis y Reportes

### Estadísticas Generales
```javascript
const stats = movementManager.obtenerEstadisticas();
// {
//   totalMovimientos: 47,
//   totalEntradas: 12,
//   totalSalidas: 35,
//   unidadesEntradas: 500,
//   unidadesSalidas: 285,
//   balanceNeto: 215,
//   razonesEntrada: { 'COMPRA_PROVEEDOR': 450, ... },
//   razonesSalida: { 'VENTA_CLIENTE': 250, ... },
//   usuariosActivos: ['gerente', 'vendedor', ...],
//   periodoCobertura: { desde: '...', hasta: '...' }
// }
```

### Historial de Producto
```javascript
const historial = movementManager.obtenerHistorialStock('PROD-001');
// [{
//   fecha: '2024-02-14T10:45:00Z',
//   tipo: 'VENTA_CLIENTE',
//   cantidad: 5,
//   stockResultante: 95,
//   cambio: -5
// }, ...]
```

### Reporte por Período
```javascript
const reporte = movementManager.generarReportePeriodo(
    new Date('2024-02-01'),
    new Date('2024-02-14')
);
// {
//   totalMovimientos: 35,
//   unidadesEntradas: 150,
//   unidadesSalidas: 120,
//   porProducto: { ... },
//   porRazon: { ... }
// }
```

### Top Productos
```javascript
const top = movementManager.obtenerProductosMasMovidos(10);
// [{ productoId, totalEntradas, totalSalidas, totalMovimientos }, ...]
```

---

## 🔍 Verificación de Consistencia

```javascript
// Verificar que los movimientos coincidan con el stock actual
const consistencia = movementManager.verificarConsistenciaStock('PROD-001');
// {
//   productoId: 'PROD-001',
//   stockActual: 215,
//   stockCalculadoDesdeMovimientos: 215,
//   diferencia: 0,
//   esConsistente: true,
//   totalMovimientos: 47
// }
```

---

## 🔐 Auditoría

Todas las operaciones se registran automáticamente:

```javascript
// Obtener registro de auditoría
const auditLog = movementManager.obtenerAuditLog();
// [{
//   timestamp: '2024-02-14T10:45:30.456Z',
//   accion: 'SALIDA_REGISTRADA',
//   usuario: 'vendedor_juan',
//   detalles: { id: 'MOV-00002', ... },
//   ip: 'local'
// }, ...]

// Filtrar por usuario
const auditPorUsuario = movementManager.obtenerAuditLog({
    usuario: 'gerente_almacen'
});
```

---

## 🧪 Demo Interactivo

### Acceder a la Demo
1. **Abre en navegador**: `demo-movements.html`
2. **Haz clic en "Iniciar"** para crear producto de prueba
3. **Ejecuta operaciones**:
   - ✅ Entrada: Compra, Devolución
   - ✅ Salida: Venta, Merma
   - ✅ Tests: Sin stock, Razón inválida
   - ✅ Análisis: Estadísticas, Historial

### Botones Disponibles
- **Compra Proveedor** - Simula entrada de compra
- **Devolución Cliente** - Simula entrada de devolución
- **Venta Cliente** - Simula salida de venta
- **Merma** - Simula salida por deterioro
- **Venta Sin Stock** - Test de validación (error esperado)
- **Razón Inválida** - Test de validación (error esperado)
- **Estadísticas** - Ver resumen de movimientos
- **Historial** - Ver transacciones del producto

---

## ⚙️ Métodos Principales

| Método | Descripción |
|--------|-------------|
| `registrarEntrada(datos)` | Registra entrada de stock |
| `registrarSalida(datos)` | Registra salida (valida stock) |
| `registrarAjuste(datos)` | Ajuste manual (+/-) |
| `obtenerMovimientos(filtros)` | Obtiene con filtros |
| `obtenerHistorialStock(id)` | Historial de un producto |
| `obtenerEstadisticas()` | Estadísticas generales |
| `generarReportePeriodo(inicio, fin)` | Reporte de período |
| `obtenerProductosMasMovidos(n)` | Top N productos |
| `verificarConsistenciaStock(id)` | Valida consistencia |
| `obtenerAuditLog(filtros)` | Registro de auditoría |
| `exportarJSON()` | Exporta datos |

---

## 💾 Persistencia

✅ **Todos los movimientos se guardan en localStorage**

```javascript
// Datos guardados en:
localStorage.movimientosData

// Estructura:
{
    "movimientos": [...],
    "auditLog": [...],
    "ultimaActualizacion": "2024-02-14T..."
}

// Se cargan automáticamente al inicializar
```

---

## 🔒 Seguridad y Validaciones

### Early Return Detiene
1. ❌ Productos inexistentes
2. ❌ Cantidades inválidas
3. ❌ Razones no válidas
4. 🔴 **STOCK INSUFICIENTE** (Crítica)
5. ❌ Usuario no especificado

### Ejemplos de Errores Capturados
```javascript
// El ID del producto es requerido
// El producto no existe
// La cantidad debe ser mayor a 0
// Stock insuficiente. Disponible: X, Solicitado: Y
// Razón inválida. Válidas: ...
// El usuario es requerido
```

---

## 📝 Documentación Adicional

Para documentación completa, consulta:
- **[MOVIMIENTOS.md](MOVIMIENTOS.md)** - Guía detallada con ejemplos
- **[CRUD_PRODUCTOS.md](CRUD_PRODUCTOS.md)** - ProductManager (productos)
- **[demo-movements.html](demo-movements.html)** - Demo interactivo

---

## 🚀 Uso Rápido

### Paso 1: Crear Producto
```javascript
const producto = productManager.crearProducto({
    nombre: 'Producto A',
    codigo: 'SKU-001',
    categoriaId: 'CAT-001',
    cantidad: 100
});
```

### Paso 2: Registrar Movimiento
```javascript
try {
    const mov = movementManager.registrarSalida({
        productoId: producto.id,
        cantidad: 5,
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
    console.log('✓ Movimiento registrado');
} catch (error) {
    console.error('❌', error.message);
}
```

### Paso 3: Consultar
```javascript
const historial = movementManager.obtenerHistorialStock(producto.id);
const stats = movementManager.obtenerEstadisticas();
```

---

## ✅ Checklist de Funcionalidades

- [x] Validaciones con Early Return
- [x] Registrar entradas (COMPRA, DEVOLUCIÓN, AJUSTE +)
- [x] Registrar salidas (VENTA, MERMA, AJUSTE -)
- [x] Integración automática con ProductManager
- [x] Actualización automática de stock
- [x] Historial completo de movimientos
- [x] Auditoría de operaciones
- [x] Reportes y estadísticas
- [x] Verificación de consistencia
- [x] Exportar datos a JSON
- [x] Persistencia en localStorage
- [x] Demo interactivo

---

**Creado**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Producción  
**Early Return**: ✅ Implementado  
**Integraciones**: ProductManager ✅
