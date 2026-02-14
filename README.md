# 📦 Sistema de Gestión de Inventarios Profesional (Frontend)

**Versión:** 1.0.0  
**Tipo:** Frontend JavaScript Vanilla (sin backend)  
**Licencia:** MIT  
**Autor:** Arquitecto de Software Senior

---

## 📋 Descripción General

Sistema completo de gestión de inventarios desarrollado con **JavaScript Vanilla**, sin dependencias externas ni backend. Ideal para aplicaciones empresariales pequeñas y medianas que requieren:

- ✅ Gestión de productos y categorías
- ✅ Control de inventario en tiempo real
- ✅ Registro de movimientos (entradas/salidas)
- ✅ Análisis y reportes
- ✅ Persistencia de datos en localStorage
- ✅ Interfaz responsive y moderna
- ✅ Exportación/importación de datos

---

## 🏗️ Arquitectura del Sistema

### Capas Arquitectónicas

```
┌─────────────────────────────────────┐
│   PRESENTACIÓN (UI Layer)           │ ← HTML + CSS + DOM
├─────────────────────────────────────┤
│   LÓGICA (Business Logic Layer)     │ ← UIManager + DataManager
├─────────────────────────────────────┤
│   DATOS (Data Layer)                │ ← StorageManager + Cache
├─────────────────────────────────────┤
│   PERSISTENCIA (Storage Layer)      │ ← localStorage
└─────────────────────────────────────┘
```

### Módulos Principales

| Módulo | Responsabilidad |
|--------|-----------------|
| `app.js` | Inicialización y coordinación global |
| `data.js` | Gestión de datos (CRUD) |
| `ui.js` | Gestión de interfaz y eventos |
| `storage.js` | Persistencia y caché |
| `styles.css` | Estilos y diseño |
| `responsive.css` | Diseño responsive |

---

## 📁 Estructura de Carpetas

```
SistemaInventarios/
├── index.html              # Punto de entrada HTML
├── css/
│   ├── styles.css          # Estilos principales
│   └── responsive.css      # Estilos responsive
├── js/
│   ├── app.js              # Aplicación principal
│   ├── data.js             # Gestión de datos
│   ├── ui.js               # Gestión de UI
│   └── storage.js          # Gestión de almacenamiento
├── data/
│   ├── SCHEMA.json         # Esquema de datos documentado
│   ├── categorias.json     # Datos de categorías
│   ├── productos.json      # Datos de productos
│   └── movimientos.json    # Datos de movimientos
├── assets/
│   └── icons/              # Iconografía (futuro)
└── README.md               # Este archivo
```

---

## 📊 Esquemas de Datos

### 1. CATEGORÍA

```json
{
  "id": "CAT-001",
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos en general",
  "icono": "🖥️",
  "color": "#FF6B6B",
  "activa": true,
  "fechaCreacion": "2026-02-14T10:30:00Z",
  "modificadoEn": "2026-02-14T10:30:00Z"
}
```

**Propiedades:**
- `id`: Identificador único (formato: CAT-XXX)
- `nombre`: Nombre único de la categoría (3-50 caracteres)
- `descripcion`: Descripción opcional (hasta 500 caracteres)
- `icono`: Emoji o icono visual
- `color`: Color hexadecimal para identificación
- `activa`: Indica si la categoría está activa
- `fechaCreacion`: Timestamp ISO8601 (auto-generado)
- `modificadoEn`: Timestamp ISO8601 (auto-generado)

---

### 2. PRODUCTO

```json
{
  "id": "PROD-001",
  "codigo": "SKU-12345",
  "nombre": "Laptop Dell XPS 15",
  "descripcion": "Laptop de alta gama para profesionales",
  "categoriaId": "CAT-001",
  "precio": {
    "precioCompra": 800.00,
    "precioVenta": 1200.00,
    "moneda": "USD"
  },
  "inventario": {
    "cantidad": 25,
    "minimo": 5,
    "maximo": 100,
    "ubicacion": "Almacén A - Pasillo 3"
  },
  "especificaciones": {
    "marca": "Dell",
    "modelo": "XPS15-2024",
    "especificacionesTecnicas": "Intel i7, 16GB RAM, 512GB SSD"
  },
  "estado": "ACTIVO",
  "imagen": "laptop-dell-xps15.jpg",
  "fechaCreacion": "2026-02-14T10:30:00Z",
  "modificadoEn": "2026-02-14T10:30:00Z"
}
```

**Propiedades:**
- `id`: Identificador único (PROD-XXX)
- `codigo`: SKU único del producto
- `nombre`: Nombre comercial (3-100 caracteres)
- `descripcion`: Descripción detallada
- `categoriaId`: Referencia a categoría (relación 1:N)
- `precio`: Objeto con precioCompra, precioVenta, moneda
- `inventario`: Objeto con cantidad, minimo, maximo, ubicación
- `especificaciones`: Características técnicas, marca, modelo
- `estado`: ACTIVO, INACTIVO, DESCONTINUADO
- `imagen`: Referencia a archivo de imagen

---

### 3. MOVIMIENTO

```json
{
  "id": "MOV-001",
  "tipo": "ENTRADA",
  "productoId": "PROD-001",
  "cantidad": 10,
  "fechaMovimiento": "2026-02-14T14:30:00Z",
  "razon": "COMPRA_PROVEEDOR",
  "detalles": {
    "proveedorOrdenId": "POR-0001",
    "numeroComprobante": "FAC-2026-001",
    "costo": 8000.00
  },
  "usuario": "juan.perez@empresa.com",
  "notas": "Compra a proveedor autorizado",
  "estado": "COMPLETADO",
  "geoLocalizacion": {
    "almacen": "Almacén Principal",
    "ubicacion": "Pasillo 3 - Estante A"
  }
}
```

**Tipos de Movimiento:**
- `ENTRADA`: Aumento de stock
- `SALIDA`: Disminución de stock

**Razones de Entrada:**
- COMPRA_PROVEEDOR
- DEVOLUCION_CLIENTE
- AJUSTE_INVENTARIO
- TRANSFERENCIA_ENTRADA
- RECEPCION_INICIAL

**Razones de Salida:**
- VENTA_CLIENTE
- DEVOLUCION_PROVEEDOR
- AJUSTE_INVENTARIO
- TRANSFERENCIA_SALIDA
- MERMA_DETERIORO
- MUESTRA_COMERCIAL

---

## 🚀 Cómo Usar

### 1. Instalación

```bash
# No requiere instalación de dependencias
# Solo abre index.html en un navegador moderno
```

### 2. Primer Inicio

- Se crearán datos de ejemplo automáticamente
- Los datos se guardan en `localStorage` del navegador
- Acceso desde consola: `inventario.help()`

### 3. Funcionalidades Principales

#### Dashboard
- Resumen de estadísticas
- Alertas de stock bajo
- Movimientos recientes

#### Productos
- Crear, editar, eliminar productos
- Búsqueda y filtrado
- Gestión de precios y stock

#### Categorías
- Organización de productos
- Colores e iconos personalizables
- Vista en grid

#### Movimientos
- Registro de entradas/salidas
- Historial completo
- Trazabilidad por usuario y fecha

#### Reportes
- Stock por categoría
- Movimientos por período
- Análisis de rentabilidad

---

## 🛠️ Referencia de Clases

### DataManager

```javascript
const dm = dataManager;

// Categorías
dm.obtenerCategorias()
dm.crearCategoria(datos)
dm.actualizarCategoria(id, datos)
dm.eliminarCategoria(id)

// Productos
dm.obtenerProductos()
dm.crearProducto(datos)
dm.actualizarProducto(id, datos)
dm.actualizarStockProducto(id, cantidad)
dm.eliminarProducto(id)
dm.obtenerProductosBajoStock()

// Movimientos
dm.obtenerMovimientos()
dm.crearMovimiento(datos)
dm.obtenerMovimientosRecientes(días)

// Análisis
dm.obtenerEstadisticas()
dm.calcularValorInventario()
dm.generarReporteStock()
dm.generarReporteMovimientos(inicio, fin)

// Persistencia
dm.guardar()
dm.exportarJSON()
dm.importarJSON(json)
```

### UIManager

```javascript
const ui = uiManager;

// Navegación
ui.navigateToSection(sección)
ui.showSection(nombre)

// Carga de secciones
ui.loadDashboard()
ui.loadProductos()
ui.loadCategorias()
ui.loadMovimientos()
ui.loadReportes()

// Interacción
ui.openModal(id)
ui.closeModal(id)
ui.showToast(mensaje, tipo)
ui.exportarDatos()
ui.importarDatos()
```

### StorageManager

```javascript
const sm = storageManager;

sm.set(clave, valor)
sm.get(clave, defecto)
sm.exists(clave)
sm.remove(clave)
sm.clear()
sm.getAllKeys()
sm.getSize()
sm.getInfo()
sm.exportToJSON()
sm.importFromJSON(json)
```

---

## 💾 Persistencia y Sincronización

### localStorage

Todos los datos se guardan automáticamente en `localStorage` bajo la clave `inventarioData`:

```javascript
// Estructura almacenada
{
  "categorias": [...],
  "productos": [...],
  "movimientos": [...],
  "ultimaActualizacion": "2026-02-14T14:30:00Z"
}
```

### Sincronización Multi-Tab

El sistema detecta automáticamente cambios en otros tabs del navegador usando eventos `storage`.

### Exportación/Importación

```javascript
// Exportar
const json = dataManager.exportarJSON();

// Importar
dataManager.importarJSON(jsonString);
```

---

## 🎨 Estilos y Temas

### Variables CSS

```css
:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --sidebar-width: 250px;
  --navbar-height: 70px;
}
```

### Breakpoints Responsive

| Pantalla | Ancho |
|----------|-------|
| Móvil | < 480px |
| Tablet | 768px |
| Desktop | > 1200px |

---

## 🔒 Validaciones y Seguridad

### Validaciones de Negocio

- ✅ Stock no puede ser negativo
- ✅ Precio de venta > precio de compra
- ✅ Códigos de producto únicos
- ✅ Categorías válidas para productos
- ✅ Cantidades positivas en movimientos

### Integridad de Datos

```javascript
// Validar integridad
const resultado = app.validateDataIntegrity();
```

---

## 🐛 Debugging y Consola

### Funciones Disponibles en Consola

```javascript
inventario.diagnostics()   // Diagnóstico del sistema
inventario.status()        // Reporte de estado
inventario.validate()      // Validar integridad
inventario.export()        // Exportar reporte
inventario.demo()          // Modo demostración
inventario.help()          // Mostrar ayuda
```

### Logs Automáticos

La aplicación registra automáticamente:
- Inicializaciones
- Errores críticos
- Operaciones CRUD
- Cambios en datos

---

## 📈 Estadísticas y Reportes

### Estadísticas Disponibles

```json
{
  "totalProductos": 6,
  "productosActivos": 5,
  "totalCategorias": 5,
  "valorInventario": 45000.00,
  "movimientosHoy": 3,
  "productosBajoStock": 2,
  "productosSinStock": 0
}
```

### Reportes Generables

- Reporte de Stock por Categoría
- Movimientos por Período
- Análisis de Rentabilidad
- Exportación a JSON

---

## 🔧 Casos de Uso Comunes

### 1. Crear Producto

```javascript
dataManager.crearProducto({
  nombre: 'Laptop HP',
  codigo: 'SKU-001',
  categoriaId: 'CAT-001',
  precioCompra: 500,
  precioVenta: 800,
  cantidad: 10,
  minimo: 2
});
```

### 2. Registrar Entrada

```javascript
dataManager.crearMovimiento({
  tipo: 'ENTRADA',
  productoId: 'PROD-001',
  cantidad: 10,
  razon: 'COMPRA_PROVEEDOR',
  notas: 'Compra a proveedor X'
});
```

### 3. Registrar Salida

```javascript
dataManager.crearMovimiento({
  tipo: 'SALIDA',
  productoId: 'PROD-001',
  cantidad: 2,
  razon: 'VENTA_CLIENTE',
  notas: 'Venta a cliente Y'
});
```

### 4. Obtener Reportes

```javascript
const reporte = dataManager.generarReporteStock();
const movsPeriodo = dataManager.generarReporteMovimientos(
  new Date('2026-01-01'),
  new Date('2026-02-14')
);
```

---

## 📱 Características Responsive

- ✅ Mobile-first design
- ✅ Adapta a tablets y desktops
- ✅ Sidebar colapsable
- ✅ Tablas con scroll horizontal
- ✅ Menú responsive
- ✅ Touch-friendly buttons

---

## ⚡ Rendimiento

### Optimizaciones

- Caché en memoria para consultas frecuentes
- localStorage para persistencia sin servidor
- Índices locales para búsquedas rápidas
- Carga lazy de datos

### Tamaño

- JavaScript: ~50KB (minificado)
- CSS: ~30KB
- Total sin datos: ~80KB

---

## 🚨 Limitaciones Conocidas

- **No hay backend**: Datos almacenados solo en el navegador
- **localStorage**: Limitado a ~5-10MB por navegador
- **Sin sincronización cloud**: No se sincroniza entre dispositivos
- **Sin autenticación**: No hay control de usuarios
- **Sin encriptación**: Datos no encriptados en localStorage

---

## 🔮 Mejoras Futuras

- [ ] Integración con backend (Node.js/Express)
- [ ] Autenticación y autorización
- [ ] Generación de PDF/Excel
- [ ] Gráficos interactivos
- [ ] Notificaciones push
- [ ] Sincronización en la nube
- [ ] Offline-first PWA
- [ ] Búsqueda avanzada con filtros

---

## 📝 Licencia

MIT License - Completamente libre para uso comercial y personal

---

## 👨‍💼 Contacto y Soporte

Para preguntas y soporte, consulte la documentación en [SCHEMA.json](data/SCHEMA.json)

---

**Desarrollado con ❤️ por Arquitecto de Software Senior**  
**Versión 1.0.0 - Febrero 2026**
