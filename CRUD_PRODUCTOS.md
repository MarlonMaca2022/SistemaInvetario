# CRUD de Productos - ProductManager

## Overview

El módulo **ProductManager** proporciona un sistema completo de CRUD (Create, Read, Update, Delete) para productos con persistencia automática en **localStorage**. 

✅ **Todas las operaciones guardan automáticamente los datos**  
✅ **Validaciones integradas (SKU único, precios, stock)**  
✅ **Cálculo automático de márgenes de ganancia**  
✅ **Búsqueda y filtrado de productos**  
✅ **Reportes y análisis**  

---

## Uso Básico

### 1. CREATE - Crear un Nuevo Producto

```javascript
// Crear un producto simple
const producto = productManager.crearProducto({
    nombre: 'Laptop Dell XPS 13',
    codigo: 'SKU-001',
    categoriaId: 'CAT-001',
    descripcion: 'Laptop ultradelgada de 13 pulgadas',
    precioCompra: 600,
    precioVenta: 950,
    cantidad: 10,
    minimo: 5,      // Se alertará cuando caiga a este nivel
    maximo: 50,     // Límite máximo de stock
    ubicacion: 'Almacén A'
});

console.log(producto);
// {
//   id: 'PROD-001',
//   codigo: 'SKU-001',
//   nombre: 'Laptop Dell XPS 13',
//   precio: {
//     precioCompra: 600,
//     precioVenta: 950,
//     moneda: 'USD',
//     margen: 58.33  // Calculo automático
//   },
//   inventario: { cantidad: 10, minimo: 5, maximo: 50, ... },
//   estado: 'ACTIVO',
//   fechaCreacion: '2024-01-15T10:30:45.123Z',
//   ...
// }
```

**Parámetros Requeridos:**
- `nombre` - Nombre del producto
- `codigo` - SKU único (no puede repetirse)
- `categoriaId` - ID de categoría

**Parámetros Opcionales:**
- `descripcion` - Descripción del producto
- `precioCompra` - Precio de costo (por defecto 0)
- `precioVenta` - Precio de venta (por defecto 0)
- `cantidad` - Stock inicial (por defecto 0)
- `minimo` - Stock mínimo (por defecto 5)
- `maximo` - Stock máximo (por defecto 100)
- `ubicacion` - Ubicación en almacén (por defecto "Almacén General")
- `imagen` - URL de imagen del producto (opcional)
- `especificaciones` - Objeto con características adicionales (opcional)

---

### 2. READ - Obtener Productos

```javascript
// Obtener todos los productos activos
const productos = productManager.obtenerProductos();

// Incluir también los productos inactivos
const todos = productManager.obtenerProductos(true);

// Obtener un producto específico por ID
const producto = productManager.obtenerProductoPorId('PROD-001');

// Obtener por código SKU
const producto = productManager.obtenerProductoPorCodigo('SKU-001');

// Filtrar por categoría
const laptops = productManager.obtenerProductosPorCategoria('CAT-001');

// Obtener productos bajo stock
const bajoStock = productManager.obtenerProductosBajoStock();

// Obtener sin stock
const sinStock = productManager.obtenerProductosSinStock();

// Búsqueda por nombre, código o descripción
const resultados = productManager.buscarProductos('Laptop');
// Busca en: nombre, código y descripción
```

---

### 3. UPDATE - Actualizar Productos

```javascript
// Actualizar datos básicos
const actualizado = productManager.actualizarProducto('PROD-001', {
    nombre: 'Laptop Dell XPS 13 Plus',
    precioVenta: 1000
});

// Actualizar inventario (incrementar/decrementar stock)
const producto = productManager.actualizarStockProducto('PROD-001', -5);
// -5 = reduce 5 unidades
// +3 = suma 3 unidades

// Actualizar solo el precio
productManager.actualizarProducto('PROD-001', {
    precioCompra: 580,
    precioVenta: 950
});

// Reactivar un producto inactivo
productManager.activarProducto('PROD-001');
```

---

### 4. DELETE - Eliminar Productos

```javascript
// Eliminar/Archivar un producto
const resultado = productManager.eliminarProducto('PROD-001');
// {
//   éxito: true,
//   mensaje: "Producto marcado como inactivo...",
//   producto: {...}
// }

// Si el producto tiene movimientos de inventario:
// - Lo marca como INACTIVO (soft delete)
// Si no tiene movimientos:
// - Lo elimina permanentemente

// Eliminar solo si no hay movimientos
try {
    productManager.eliminarProductoPermanente('PROD-001');
} catch (error) {
    console.log(error.message); // "No se puede eliminar: el producto tiene movimientos..."
}
```

---

## Validaciones Integradas

El ProductManager valida automáticamente:

```javascript
// ❌ Error: Código SKU duplicado
productManager.crearProducto({
    nombre: 'Nuevo Producto',
    codigo: 'SKU-001',  // Ya existe
    categoriaId: 'CAT-001'
});
// Error: El código SKU "SKU-001" ya está en uso

// ❌ Error: Faltan campos requeridos
productManager.crearProducto({
    nombre: 'Producto sin Categoría'
    // Falta codigo y categoriaId
});
// Error: Faltan campos requeridos: nombre, código y categoría

// ⚠️ Advertencia: Precio de venta menor que compra
productManager.crearProducto({
    nombre: 'Producto con Pérdida',
    codigo: 'SKU-NO-GANANCIA',
    categoriaId: 'CAT-001',
    precioCompra: 100,
    precioVenta: 80  // ← Menor al costo
});
// Advertencia: El precio de venta es menor que el de compra

// ❌ Error: Stock insuficiente
productManager.actualizarStockProducto('PROD-001', -500);
// Si el producto tiene menos de 500 unidades
// Error: Stock insuficiente. Disponible: 20, Solicitado: 500
```

---

## Análisis y Reportes

```javascript
// Obtener estadísticas completas
const stats = productManager.obtenerEstadísticas();
// {
//   totalProductos: 15,
//   productosActivos: 12,
//   productosInactivos: 3,
//   totalItems: 450,  // Total de unidades en stock
//   valorInventario: 45000,  // Valor total en USD
//   productosMásValioso: [...],  // Top 5 productos más costosos
//   productosBajoStock: 3,
//   productosSinStock: 1,
//   margenPromedio: 45.23  // % de ganancia promedio
// }

// Resumen rápido
const resumen = productManager.obtenerResumen();
// {
//   totalProductos: 12,
//   totalVenta: 45000,
//   productosBajoStock: 3,
//   sinStock: 1,
//   margenPromedio: '45.23%'
// }

// Valor total del inventario
const valor = productManager.obtenerValorInventario();
// 45000.00

// Margen de ganancia promedio
const margen = productManager.calcularMargenPromedio();
// 45.23

// Reporte agrupado por categoría
const reportePorCategoria = productManager.generarReporteCategoria();
// {
//   'CAT-001': {
//     total: 5,
//     cantidad: 50,
//     valor: 10000,
//     productos: ['Laptop', 'Monitor', 'Teclado', ...]
//   },
//   'CAT-002': { ... }
// }
```

---

## Exportar e Importar Datos

```javascript
// Exportar a JSON
const json = productManager.exportarJSON();
// Retorna un string JSON formateado

// Guardar en archivo (en el navegador)
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'productos-backup.json';
link.click();

// Importar desde JSON
const jsonString = '{"metadata":{...}, "productos":[...]}';
const resultado = productManager.importarJSON(jsonString, false);
// false = agregar a los existentes
// true = reemplazar todos los productos
// { éxito: true, cantidad: 10 }
```

---

## Ejemplos Prácticos

### Ejemplo 1: Sistema de Carrito de Compras

```javascript
// Crear productos
const laptop = productManager.crearProducto({
    nombre: 'Laptop HP 15',
    codigo: 'HP-001',
    categoriaId: 'CAT-001',
    precioVenta: 800,
    cantidad: 50
});

// Procesar venta (disminuir stock)
try {
    productManager.actualizarStockProducto(laptop.id, -2);
    console.log('✓ Venta procesada: -2 unidades');
} catch (error) {
    console.error('❌ No hay stock suficiente');
}

// Verificar stock actual
const productoActual = productManager.obtenerProductoPorId(laptop.id);
console.log(`Stock: ${productoActual.inventario.cantidad}`);  // 48
```

### Ejemplo 2: Alertas de Stock Bajo

```javascript
// Obtener productos con bajo stock
const productosAlerta = productManager.obtenerProductosBajoStock();

productosAlerta.forEach(producto => {
    const porcentaje = (producto.inventario.cantidad / producto.inventario.minimo * 100).toFixed(0);
    console.warn(`⚠️ ${producto.nombre}: ${producto.inventario.cantidad} unidades (${porcentaje}% del mínimo)`);
});
```

### Ejemplo 3: Búsqueda y Filtrado

```javascript
// Usuario busca "laptop"
const resultados = productManager.buscarProductos('laptop');

resultados.forEach(producto => {
    console.log(`
        ${producto.nombre}
        Código: ${producto.codigo}
        Precio: $${producto.precio.precioVenta}
        Stock: ${producto.inventario.cantidad}
        Margen: ${producto.precio.margen}%
    `);
});
```

### Ejemplo 4: Actualizar múltiples campos

```javascript
productManager.actualizarProducto('PROD-001', {
    nombre: 'Laptop Dell XPS 15 Plus',
    descripcion: 'Modelo actualizado 2024',
    precioCompra: 700,
    precioVenta: 1100,
    inventario: {
        minimo: 3,
        maximo: 30
    }
});
```

---

## Integración con UI

```javascript
// Formulario HTML para crear producto
document.getElementById('formProducto').addEventListener('submit', (e) => {
    e.preventDefault();

    try {
        const nuevoProducto = productManager.crearProducto({
            nombre: document.getElementById('nombre').value,
            codigo: document.getElementById('codigo').value,
            categoriaId: document.getElementById('categoria').value,
            precioCompra: document.getElementById('precioCompra').value,
            precioVenta: document.getElementById('precioVenta').value,
            cantidad: document.getElementById('cantidad').value,
            minimo: document.getElementById('minimo').value
        });

        // Mostrar éxito
        mostrarToast(`✓ ${nuevoProducto.nombre} creado exitosamente`, 'success');
        document.getElementById('formProducto').reset();
        actualizarTablaProductos();

    } catch (error) {
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
});

// Función para actualizar tabla de productos
function actualizarTablaProductos() {
    const productos = productManager.obtenerProductos();
    const tbody = document.getElementById('tablaProductosBody');
    
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>$${p.precio.precioVenta}</td>
            <td>${p.inventario.cantidad}</td>
            <td>
                <button onclick="editarProducto('${p.id}')">Editar</button>
                <button onclick="eliminarProducto('${p.id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Llamar al cargar la página
actualizarTablaProductos();
```

---

## Estructura de Datos del Producto

```javascript
{
    id: 'PROD-001',                    // ID único generado automáticamente
    codigo: 'SKU-001',                 // Código único del producto
    nombre: 'Laptop Dell XPS 13',      // Nombre del producto
    descripcion: 'Laptop ultradelgada',// Descripción
    categoriaId: 'CAT-001',            // ID de categoría
    precio: {
        precioCompra: 600,             // Precio de costo
        precioVenta: 950,              // Precio de venta
        moneda: 'USD',                 // Moneda
        margen: 58.33                  // Margen de ganancia %
    },
    inventario: {
        cantidad: 10,                  // Cantidad actual
        minimo: 5,                     // Stock mínimo
        maximo: 50,                    // Stock máximo
        ubicacion: 'Almacén A',        // Ubicación física
        últimaActualizacion: '2024-01-15T...'
    },
    especificaciones: {                // Datos adicionales flexibles
        procesador: 'Intel i7',
        memoria: '16GB DDR5',
        almacenamiento: '512GB SSD'
    },
    estado: 'ACTIVO',                  // 'ACTIVO' o 'INACTIVO'
    imagen: 'https://...',             // URL de imagen (opcional)
    fechaCreacion: '2024-01-15T10:30:45.123Z',
    modificadoEn: '2024-01-15T10:30:45.123Z'
}
```

---

## Métodos Disponibles

| Método | Descripción | Retorna |
|--------|-------------|---------|
| `crearProducto(datos)` | Crea un nuevo producto | Objeto producto |
| `obtenerProductos(incluirInactivos)` | Obtiene todos los productos | Array de productos |
| `obtenerProductoPorId(id)` | Obtiene un producto por ID | Objeto producto \| null |
| `obtenerProductoPorCodigo(codigo)` | Obtiene por SKU | Objeto producto \| null |
| `obtenerProductosPorCategoria(id)` | Filtro por categoría | Array de productos |
| `obtenerProductosBajoStock()` | Productos bajo stock mínimo | Array |
| `obtenerProductosSinStock()` | Productos sin stock | Array |
| `buscarProductos(término)` | Búsqueda por nombre/código | Array |
| `actualizarProducto(id, datos)` | Actualiza un producto | Objeto producto |
| `actualizarStockProducto(id, cantidad)` | Suma/resta stock | Objeto producto |
| `activarProducto(id)` | Reactiva un producto | Objeto producto |
| `eliminarProducto(id)` | Elimina/archiva producto | Objeto resultado |
| `eliminarProductoPermanente(id)` | Eliminación permanente | Boolean |
| `obtenerEstadísticas()` | Estadísticas completas | Objeto estadísticas |
| `ObtenerResumen()` | Resumen rápido | Objeto resumen |
| `obtenerValorInventario()` | Valor total | Number |
| `calcularMargenPromedio()` | Margen promedio % | Number |
| `generarReporteCategoria()` | Reporte por categoría | Object |
| `exportarJSON()` | Exporta a JSON | String |
| `importarJSON(json, reemplazar)` | Importa desde JSON | Objeto resultado |

---

## Manejo de Errores

```javascript
try {
    const producto = productManager.crearProducto({
        nombre: 'Producto',
        codigo: 'SKU-EXISTENTE',  // ← Error
        categoriaId: 'CAT-001'
    });
} catch (error) {
    console.error(`Error: ${error.message}`);
    // "Error: El código SKU "SKU-EXISTENTE" ya está en uso"
}

// Validación segura
const producto = productManager.obtenerProductoPorId('PROD-999');
if (!producto) {
    console.log('Producto no encontrado');
}
```

---

## Persistencia en localStorage

✅ **Todos los cambios se guardan automáticamente en localStorage**

```javascript
// Los datos se guardan aquí:
localStorage.inventarioData

// Estructura guardada:
{
    "productos": [...],
    "movimientos": [...],
    "ultimaActualizacion": "2024-01-15T10:30:45.123Z"
}

// Los datos persisten incluso después de cerrar el navegador
// Se cargan automáticamente al inicializar ProductManager
```

---

## Testing/Desarrollo

```javascript
// Limpiar todos los datos (solo para testing)
productManager.limpiar();

// Ver datos en consola
console.table(productManager.obtenerProductos());

// Verificar estado actual
console.log(productManager.obtenerResumen());
```

---

## Notas Importantes

⚠️ **Soft Delete vs Hard Delete**
- Si un producto tiene **movimientos de inventario asociados**, se marca como **INACTIVO** (conservando el historial)
- Si NO tiene movimientos, se **elimina completamente** del sistema
- Usar `eliminarProductoPermanente()` solo cuando no hay dependencias

🔒 **Validaciones Automáticas**
- SKU debe ser únicos
- Los precios se convierten automáticamente a número
- El margen de ganancia se calcula automáticamente
- El stock no puede ser negativo

📊 **Cálculos Automáticos**
- Margen de ganancia: `(precioVenta - precioCompra) / precioCompra * 100`
- Valor del inventario: suma de `(precioVenta × cantidad)` para cada producto
- Margen promedio: promedio de márgenes de todos los productos

🚀 **Performance**
- El búsqueda es eficiente con `.filter()` y `.find()`
- localStorage puede almacenar hasta 5-10 MB
- Para aplicaciones grandes, considerar base de datos en backend

---

**Creado**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Producción
