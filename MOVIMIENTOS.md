# Gestor de Movimientos de Inventario - MovementManager

## Descripción

El módulo **MovementManager** implementa un sistema completo de registro y control de movimientos de inventario con:

✅ **Validación con Early Return Pattern**  
✅ **Control automático de stock**  
✅ **Historial completo de movimientos**  
✅ **Auditoría de todas las operaciones**  
✅ **Reportes y análisis**  
✅ **Integración automática con ProductManager**  

---

## Arquitectura y Validaciones

### Early Return Pattern

El Early Return Pattern es una técnica de validación que **detiene la ejecución tan pronto como encuentra un error**. Esto simplifica el código y mejora la legibilidad:

```javascript
// ❌ SIN Early Return (Anidado)
function registrarSalida(datos) {
    if (datos.productoId) {
        const producto = obtenerProducto(datos.productoId);
        if (producto) {
            if (datos.cantidad > 0) {
                if (producto.stock >= datos.cantidad) {
                    // ... procesar
                } else {
                    throw new Error('Stock insuficiente');
                }
            } else {
                throw new Error('Cantidad inválida');
            }
        } else {
            throw new Error('Producto no encontrado');
        }
    } else {
        throw new Error('Producto requerido');
    }
}

// ✅ CON Early Return (Vertical)
function registrarSalida(datos) {
    // Validaciones tempranas - salen inmediatamente
    if (!datos.productoId) throw new Error('Producto requerido');
    if (!producto) throw new Error('Producto no encontrado');
    if (datos.cantidad <= 0) throw new Error('Cantidad inválida');
    
    // 🔴 VALIDACIÓN CRÍTICA: Stock disponible
    if (producto.stock < datos.cantidad) {
        throw new Error(`Stock insuficiente: ${producto.stock}`);
    }
    
    // Todas las validaciones pasaron
    // ... procesar movimiento
}
```

### Validaciones en registrarSalida()

El flujo de validación en **registrarSalida** sigue el Early Return pattern:

```
1. ¿Existe productoId?              ↓ NO → Error
2. ¿Existe el producto?              ↓ NO → Error
3. ¿Cantidad > 0?                    ↓ NO → Error
4. 🔴 ¿Hay stock suficiente?        ↓ NO → Error (CRÍTICA)
5. ¿Razón válida?                    ↓ NO → Error
6. ¿Usuario especificado?            ↓ NO → Error
7. ✅ TODAS LAS VALIDACIONES OK → Procesar
```

---

## Tipos de Movimiento

### ENTRADA (Agregar Stock)

```javascript
const tiposEntrada = [
    'COMPRA_PROVEEDOR',        // Compra a un proveedor
    'DEVOLUCION_CLIENTE',       // Cliente devuelve producto
    'AJUSTE_INVENTARIO',        // Ajuste manual de stock
    'TRANSFERENCIA_ENTRADA',    // Recibe stock de otra sucursal
    'RECEPCION_INICIAL',        // Inventario inicial
    'REPARACION_COMPLETADA'     // Producto reparado listo para vender
];
```

### SALIDA (Reducir Stock)

```javascript
const tiposSalida = [
    'VENTA_CLIENTE',            // Venta a cliente
    'DEVOLUCION_PROVEEDOR',     // Devoción al proveedor
    'AJUSTE_INVENTARIO',        // Ajuste manual
    'TRANSFERENCIA_SALIDA',     // Envía a otra sucursal
    'MERMA_DETERIORO',          // Producto dañado
    'MUESTRA_COMERCIAL',        // Muestra gratuita
    'ROBO_PERDIDA',             // Pérdida o robo
    'EXPIRACION_VENCIMIENTO'    // Producto vencido
];
```

---

## Uso Básico

### 1. Registrar una ENTRADA de Compra

```javascript
// Recibir 100 laptops de un proveedor
const entrada = movementManager.registrarEntrada({
    productoId: 'PROD-001',
    cantidad: 100,
    razon: 'COMPRA_PROVEEDOR',
    usuario: 'gerente_almacen',
    referencia: {
        factura: 'FAC-2024-001',
        proveedor: 'Tech Solutions Inc',
        montoTotal: 45000
    },
    detalles: 'Laptop HP 15 modelo 2024'
});

// Resultado:
// {
//   id: 'MOV-00001',
//   tipo: 'ENTRADA',
//   productoId: 'PROD-001',
//   cantidad: 100,
//   razon: 'COMPRA_PROVEEDOR',
//   usuario: 'gerente_almacen',
//   fecha: '2024-02-14T10:30:45.123Z',
//   estado: 'COMPLETADO',
//   referencia: { factura: 'FAC-2024-001', ... }
// }
```

### 2. Registrar una SALIDA de Venta

```javascript
// Vender 5 laptops a un cliente
const salida = movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 5,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor_juan',
    referencia: {
        ticket: 'TKT-2024-5847',
        cliente: 'Empresa XYZ',
        monto: 4750
    }
});

// Si no hay stock:
// Error: Stock insuficiente. Disponible: 3, Solicitado: 5

// Resultado si hay stock:
// {
//   id: 'MOV-00002',
//   tipo: 'SALIDA',
//   productoId: 'PROD-001',
//   cantidad: 5,
//   razon: 'VENTA_CLIENTE',
//   usuario: 'vendedor_juan',
//   fecha: '2024-02-14T10:45:30.456Z',
//   estado: 'COMPLETADO'
// }
```

### 3. Registrar un AJUSTE Manual

```javascript
// Ajustar stock (+ o -)
const ajuste = movementManager.registrarAjuste({
    productoId: 'PROD-001',
    cantidad: -3,  // Restar 3 unidades (merma encontrada)
    usuario: 'supervisor_almacen',
    motivo: 'Verificación física encontró 3 unidades dañadas'
});
```

---

## Validaciones y Early Return

### Ejemplo: Intento de venta sin stock

```javascript
// Simulamos caso de error
const producto = productManager.obtenerProductoPorId('PROD-001');
console.log(`Stock actual: ${producto.inventario.cantidad}`); // 2 unidades

// Intentamos vender 5
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 5,
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
} catch (error) {
    console.error(error.message);
    // "Stock insuficiente. Disponible: 2, Solicitado: 5"
    // ↑ Early Return: se detiene EN ESTA VALIDACIÓN
}
```

### Ejemplo: Validaciones secuenciales

```javascript
// Test 1: Sin producto
try {
    movementManager.registrarSalida({
        // productoId: '???'  ← Falta
        cantidad: 1,
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
} catch (error) {
    console.log(error.message); // "El ID del producto es requerido"
}

// Test 2: Cantidad inválida
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 0,  // ← Inválido
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
} catch (error) {
    console.log(error.message); // "La cantidad debe ser mayor a 0"
}

// Test 3: Razón inválida
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 5,
        razon: 'RAZON_INEXISTENTE',  // ← Inválida
        usuario: 'vendedor'
    });
} catch (error) {
    console.log(error.message); 
    // "Razón inválida. Válidas: VENTA_CLIENTE, DEVOLUCION_PROVEEDOR, ..."
}

// Test 4: Stock insuficiente (validación crítica)
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 100,
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
} catch (error) {
    console.log(error.message); 
    // "Stock insuficiente. Disponible: 2, Solicitado: 100"
}
```

---

## Consultas de Movimientos

### Obtener todos los movimientos

```javascript
// Todos los movimientos
const todosLos = movementManager.obtenerMovimientos();

// Solo entradas
const entradas = movementManager.obtenerMovimientos({ tipo: 'ENTRADA' });

// Solo salidas
const salidas = movementManager.obtenerMovimientos({ tipo: 'SALIDA' });

// De un producto específico
const movimientosProducto = movementManager.obtenerMovimientosPorProducto('PROD-001');

// De los últimos 7 días
const recientes = movementManager.obtenerMovimientosRecientes(7);

// Con filtros múltiples
const filtrados = movementManager.obtenerMovimientos({
    tipo: 'VENTA_CLIENTE',
    productoId: 'PROD-001',
    desde: new Date('2024-02-01'),
    hasta: new Date('2024-02-14')
});
```

### Historial de stock

```javascript
// Obtener historial completo del stock de un producto
const historial = movementManager.obtenerHistorialStock('PROD-001');

// Resultado:
// [
//   {
//     fecha: '2024-02-14T10:45:00Z',
//     tipo: 'SALIDA',
//     cantidad: 5,
//     razon: 'VENTA_CLIENTE',
//     stockResultante: 95,
//     cambio: -5
//   },
//   {
//     fecha: '2024-02-14T10:30:00Z',
//     tipo: 'ENTRADA',
//     cantidad: 100,
//     razon: 'COMPRA_PROVEEDOR',
//     stockResultante: 100,
//     cambio: +100
//   }
// ]
```

### Movimiento por ID

```javascript
const movimiento = movementManager.obtenerMovimientoPorId('MOV-00001');
```

---

## Análisis y Reportes

### Estadísticas Generales

```javascript
const stats = movementManager.obtenerEstadisticas();

// {
//   totalMovimientos: 47,
//   totalEntradas: 12,           // 12 movimientos de entrada
//   totalSalidas: 35,            // 35 movimientos de salida
//   unidadesEntradas: 500,       // 500 unidades agregadas
//   unidadesSalidas: 285,        // 285 unidades restadas
//   balanceNeto: 215,            // 500 - 285 = 215 netas
//   ultimoMovimiento: { ... },
//   razonesEntrada: {
//     'COMPRA_PROVEEDOR': 450,
//     'DEVOLUCION_CLIENTE': 50
//   },
//   razonesSalida: {
//     'VENTA_CLIENTE': 250,
//     'MERMA_DETERIORO': 20,
//     'MUESTRA_COMERCIAL': 15
//   },
//   usuariosActivos: ['gerente_almacen', 'vendedor_juan', 'supervisor'],
//   periodoCobertura: {
//     desde: '2024-01-15T...',
//     hasta: '2024-02-14T...'
//   }
// }
```

### Reporte por Período

```javascript
const reporte = movementManager.generarReportePeriodo(
    new Date('2024-02-01'),
    new Date('2024-02-14')
);

// {
//   periodo: { desde: '...', hasta: '...' },
//   totalMovimientos: 35,
//   unidadesEntradas: 150,
//   unidadesSalidas: 120,
//   porProducto: {
//     'PROD-001': {
//       entradas: 100,
//       salidas: 50,
//       movimientos: 3
//     },
//     'PROD-002': { ... }
//   },
//   porRazon: {
//     'VENTA_CLIENTE': {
//       cantidad: 85,
//       movimientos: 15,
//       tipo: 'SALIDA'
//     }
//   }
// }
```

### Productos Más Movidos

```javascript
// Top 10 productos con más movimientos
const topProductos = movementManager.obtenerProductosMasMovidos(10);

// [
//   {
//     productoId: 'PROD-001',
//     totalEntradas: 500,
//     totalSalidas: 285,
//     totalMovimientos: 47
//   },
//   { ... }
// ]
```

### Verificación de Consistencia

```javascript
// Verificar que los movimientos coincidan con el stock actual
const consistencia = movementManager.verificarConsistenciaStock('PROD-001');

// {
//   productoId: 'PROD-001',
//   stockActual: 215,
//   stockCalculadoDesdeMovimientos: 215,
//   diferencia: 0,
//   esConsistente: true,
//   totalMovimientos: 47,
//   ultimoMovimiento: { ... }
// }

// Si hay inconsistencia (diferencia):
// {
//   productoId: 'PROD-001',
//   stockActual: 215,
//   stockCalculadoDesdeMovimientos: 212,
//   diferencia: 3,  // ← Diferencia detectable
//   esConsistente: false,
//   totalMovimientos: 47
// }
```

---

## Auditoría

### Registro de Auditoría

Todos los movimientos se registran automáticamente en el audit log:

```javascript
// Obtener registro de auditoría
const auditLog = movementManager.obtenerAuditLog();

// Con filtros
const auditPorUsuario = movementManager.obtenerAuditLog({
    usuario: 'gerente_almacen'
});

const auditPorAccion = movementManager.obtenerAuditLog({
    accion: 'SALIDA_REGISTRADA'
});

// Resultado:
// [
//   {
//     timestamp: '2024-02-14T10:45:30.456Z',
//     accion: 'SALIDA_REGISTRADA',
//     usuario: 'vendedor_juan',
//     detalles: { id: 'MOV-00002', ... },
//     ip: 'local'
//   }
// ]
```

---

## Integración con ProductManager

El **MovementManager** se integra automáticamente con **ProductManager** para:

1. **Validar existencia de producto** antes de registrar movimiento
2. **Actualizar stock automáticamente** al registrar entrada/salida
3. **Prevenir salidas sin stock** (validación crítica)

```javascript
// El MovementManager recibe la instancia de ProductManager
const movementManager = new MovementManager(productManager);

// Flujo automático:
// registrarSalida() 
//   ↓ Valida stock en ProductManager
//   ↓ Verifica disponibilidad
//   ↓ Si OK: actualiza ProductManager.actualizarStockProducto()
//   ↓ Registra movimiento
//   ↓ Guarda en localStorage
```

---

## Ejemplos Prácticos

### Ejemplo 1: Simulación de Venta Completa

```javascript
// 1. Crear producto
const laptop = productManager.crearProducto({
    nombre: 'Laptop Dell XPS',
    codigo: 'DELL-XPS-001',
    categoriaId: 'CAT-001',
    precioVenta: 1200,
    cantidad: 50
});

console.log(`✓ Producto creado. Stock: ${laptop.inventario.cantidad}`);
// ✓ Producto creado. Stock: 50

// 2. Cliente entra y compra 3
const venta = movementManager.registrarSalida({
    productoId: laptop.id,
    cantidad: 3,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor_maria',
    referencia: {
        ticket: 'TKT-001',
        cliente: 'Juan Pérez',
        monto: 3600
    }
});

console.log(`✓ Venta registrada. Movimiento: ${venta.id}`);
// ✓ Venta registrada. Movimiento: MOV-00001

// 3. Verificar stock actualizado
const actualizado = productManager.obtenerProductoPorId(laptop.id);
console.log(`Stock actual: ${actualizado.inventario.cantidad}`);
// Stock actual: 47

// 4. Ver historial
const historial = movementManager.obtenerHistorialStock(laptop.id);
console.log(historial);
// [{
//   fecha: '2024-02-14...',
//   tipo: 'VENTA_CLIENTE',
//   cantidad: 3,
//   stockResultante: 47,
//   cambio: -3
// }]
```

### Ejemplo 2: Gestión de Merma

```javascript
// Se encontró que 2 laptops están dañadas
const merma = movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 2,
    razon: 'MERMA_DETERIORO',
    usuario: 'supervisor_almacen',
    detalles: 'Unidades dañadas por fallo de voltaje'
});

// Stock se reduce automáticamente
// Registro de auditoría se crea automáticamente
// Historial de movimientos registra el evento
```

### Ejemplo 3: Devolución de Cliente

```javascript
// Cliente devuelve 1 laptop defectuosa
const devolucion = movementManager.registrarEntrada({
    productoId: 'PROD-001',
    cantidad: 1,
    razon: 'DEVOLUCION_CLIENTE',
    usuario: 'servicio_cliente',
    referencia: {
        ticketVenta: 'TKT-001',
        razonDevolucion: 'No enciende después de 2 semanas'
    }
});

// Stock se incrementa automáticamente
// Ahora el producto vuelve a estar disponible para vender
```

---

## Manejo de Errores

```javascript
// Función con manejo de errores robusto
function procesarVenta(productoId, cantidad, usuario) {
    try {
        const movimiento = movementManager.registrarSalida({
            productoId,
            cantidad,
            razon: 'VENTA_CLIENTE',
            usuario
        });

        console.log(`✓ Venta completada: ${movimiento.id}`);
        return movimiento;

    } catch (error) {
        // Early Return + manejo específico
        if (error.message.includes('Stock insuficiente')) {
            console.error(`❌ No hay stock. ${error.message}`);
            // Mostrar aviso al cliente
            // Sugerir esperar o cambiar producto
        } else if (error.message.includes('no existe')) {
            console.error(`❌ Producto no encontrado`);
            // Mostrar error de sistema
        } else {
            console.error(`❌ Error inesperado: ${error.message}`);
        }
        return null;
    }
}

// Uso
procesarVenta('PROD-001', 5, 'vendedor_juan');
```

---

## Métodos de la Clase

| Método | Descripción |
|--------|-------------|
| `registrarEntrada(datos)` | Registra entrada de stock |
| `registrarSalida(datos)` | Registra salida de stock (con validación de disponibilidad) |
| `registrarAjuste(datos)` | Registra ajuste manual (+/-) |
| `obtenerMovimientos(filtros)` | Obtiene movimientos con filtros opcionales |
| `obtenerMovimientoPorId(id)` | Obtiene un movimiento específico |
| `obtenerMovimientosPorProducto(id)` | Obtiene todos los movimientos de un producto |
| `obtenerMovimientosRecientes(dias)` | Obtiene movimientos de los últimos N días |
| `obtenerHistorialStock(id)` | Obtiene historial de stock de un producto |
| `obtenerEstadisticas()` | Estadísticas generales de movimientos |
| `generarReportePeriodo(inicio, fin)` | Reporte de período específico |
| `obtenerProductosMasMovidos(límite)` | Top productos más movidos |
| `verificarConsistenciaStock(id)` | Verifica consistencia de stock |
| `obtenerAuditLog(filtros)` | Obtiene registro de auditoría |
| `exportarJSON()` | Exporta datos a JSON |

---

## Persistencia

✅ **Todos los movimientos se guardan automáticamente en localStorage**

```javascript
// Datos guardados en:
localStorage.movimientosData

// Estructura:
{
    "movimientos": [...],
    "auditLog": [...],
    "ultimaActualizacion": "2024-02-14T..."
}
```

---

## Notas de Implementación

🔴 **Validación Crítica: Stock Insuficiente**
- Es la validación más importante
- Se ejecuta DESPUÉS de validaciones básicas
- Evita vender más de lo disponible
- Early Return: detiene todo si falla

🟢 **Early Return Pattern**
- Validaciones simples primero
- Validación crítica en el medio
- Lógica de negocio después
- Código más legible y mantenible

💾 **Persistencia Automática**
- Cada movimiento se guarda en localStorage
- El historial persiste entre sesiones
- Auditoría registra toda acción

🔗 **Integración ProductManager**
- MovementManager actualiza automáticamente el stock
- Mantiene sincronización entre módulos
- Valida existencia de producto antes de movimiento

---

**Creado**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Producción
