# 🎯 MovementManager - Referencia Rápida

## Instalación

✅ **Ya está instalado**: El archivo `js/movementManager.js` ya está incluido en `index.html`

```html
<script src="js/movementManager.js"></script>
```

---

## Uso Básico (3 líneas)

### Registrar Entrada (Compra)
```javascript
movementManager.registrarEntrada({
    productoId: 'PROD-001',
    cantidad: 100,
    razon: 'COMPRA_PROVEEDOR',
    usuario: 'gerente'
});
```

### Registrar Salida (Venta) ⭐ Con Early Return
```javascript
movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 5,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor'
    // ↑ Valida stock automáticamente
});
```

---

## Early Return Pattern

**Si no hay stock suficiente:**
```javascript
// Intento de venta
movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 100,  // Stock disponible: 20
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor'
});

// ❌ RESULTADO:
// Error: "Stock insuficiente. Disponible: 20, Solicitado: 100"
// (se detiene AQUÍ con Early Return)
```

---

## Ejemplos Prácticos

### 1. Venta Completa
```javascript
// 1. Crear producto
const laptop = productManager.crearProducto({
    nombre: 'Laptop HP 15',
    codigo: 'HP-001',
    categoriaId: 'CAT-001',
    precioVenta: 1200,
    cantidad: 50
});

// 2. Cliente compra 3
const venta = movementManager.registrarSalida({
    productoId: laptop.id,
    cantidad: 3,
    razon: 'VENTA_CLIENTE',
    usuario: 'vendedor_juan',
    referencia: { ticket: 'TKT-001' }
});

// 3. Stock actualizado automáticamente: 50 → 47

// 4. Ver movimiento
const historial = movementManager.obtenerHistorialStock(laptop.id);
// [{ tipo: 'VENTA_CLIENTE', cantidad: 3, stockResultante: 47 }]
```

### 2. Manejo de Errores
```javascript
try {
    movementManager.registrarSalida({
        productoId: 'PROD-001',
        cantidad: 100,
        razon: 'VENTA_CLIENTE',
        usuario: 'vendedor'
    });
    console.log('✓ Venta procesada');
} catch (error) {
    console.error('❌', error.message);
    // Mostrar error al usuario
    // Sugerir cantidad menor
}
```

---

## Métodos Principales

| Método | Uso |
|--------|-----|
| `registrarEntrada(datos)` | Agregar stock |
| `registrarSalida(datos)` | Restar stock (valida disponibilidad) |
| `registrarAjuste(datos)` | Ajuste manual (+/-) |
| `obtenerMovimientos(filtros)` | Listar movimientos |
| `obtenerHistorialStock(id)` | Historial de un producto |
| `obtenerEstadisticas()` | Resumen de movimientos |
| `verificarConsistenciaStock(id)` | Validar consistencia stock |
| `obtenerAuditLog()` | Ver auditoría |

---

## Validaciones Automáticas

Todas estas se validan automáticamente con **Early Return**:

✅ Producto existe  
✅ Cantidad > 0  
✅ Razón válida  
🔴 **Stock disponible** (CRÍTICA)  
✅ Usuario especificado  

---

## Tipos de Movimiento

### Razones de ENTRADA
- `COMPRA_PROVEEDOR`
- `DEVOLUCION_CLIENTE`
- `AJUSTE_INVENTARIO`
- `TRANSFERENCIA_ENTRADA`
- `RECEPCION_INICIAL`
- `REPARACION_COMPLETADA`

### Razones de SALIDA  
- `VENTA_CLIENTE`
- `DEVOLUCION_PROVEEDOR`
- `AJUSTE_INVENTARIO`
- `TRANSFERENCIA_SALIDA`
- `MERMA_DETERIORO`
- `MUESTRA_COMERCIAL`
- `ROBO_PERDIDA`
- `EXPIRACION_VENCIMIENTO`

---

## Integración Automática

El **MovementManager** actualiza **ProductManager** automáticamente:

```
registrarSalida(productoId, 5)
    ↓
Valida stock
    ↓
productManager.actualizarStockProducto(productoId, -5)
    ↓
Stock se resta: 50 → 45
    ↓
localStorage se actualiza
```

---

## Persistencia

✅ Todo se guarda automáticamente en `localStorage`

```javascript
// Acceso directo (no recomendado)
const datos = JSON.parse(localStorage.movimientosData);
console.log(datos.movimientos);  // Array de movimientos
console.log(datos.auditLog);     // Array de auditoría
```

---

## Testing

### Con la Demo
1. Abre `demo-movements.html` en navegador
2. Haz clic en "Iniciar"
3. Prueba los botones:
   - Compra Proveedor
   - Venta Cliente
   - Venta Sin Stock (prueba Early Return)
   - Ver Estadísticas

### En Consola (F12)
```javascript
// Crear producto
const p = productManager.crearProducto({
    nombre: 'Test', codigo: 'TEST-001',
    categoriaId: 'CAT-001', cantidad: 10
});

// Vender
movementManager.registrarSalida({
    productoId: p.id, cantidad: 3,
    razon: 'VENTA_CLIENTE', usuario: 'admin'
});

// Verificar
console.table(movementManager.obtenerMovimientos());
```

---

## Errores Comunes

### ❌ "El ID del producto es requerido"
**Fix**: Proporciona `productoId`
```javascript
// Mal
movementManager.registrarSalida({ cantidad: 5, ... });

// Bien
movementManager.registrarSalida({ 
    productoId: 'PROD-001', 
    cantidad: 5, 
    ... 
});
```

### ❌ "Stock insuficiente"
**Fix**: Reduce la cantidad o agrega más stock
```javascript
// Mal: Stock = 3, solicitado = 5
movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 5,  // ❌ Muy alto
    ...
});

// Bien
movementManager.registrarSalida({
    productoId: 'PROD-001',
    cantidad: 2,  // ✅ Dentro del disponible
    ...
});
```

### ❌ "Razón inválida"
**Fix**: Usa uno de los valores válidos
```javascript
// Mal
movementManager.registrarSalida({
    razon: 'RAZON_RANDOM'  // ❌
});

// Bien
movementManager.registrarSalida({
    razon: 'VENTA_CLIENTE'  // ✅
});
```

---

## Documentación Completa

Para más detalles, consulta:
- **MOVIMIENTOS.md** - Guía detallada completa
- **SISTEMA_COMPLETO.md** - Arquitectura e integración
- **demo-movements.html** - Demo interactivo

---

## Resumen

| Feature | Estado |
|---------|--------|
| Registrar Entradas | ✅ |
| Registrar Salidas | ✅ |
| Early Return Pattern | ✅ |
| Validar Stock | ✅ |
| Historial | ✅ |
| Auditoría | ✅ |
| Reportes | ✅ |
| localStorage | ✅ |
| Integración ProductManager | ✅ |

---

**Versión**: 1.0  
**Estado**: ✅ Producción  
**Patrón**: Early Return  
**Última actualización**: 2024-02-14
