# 🏗️ ARQUITECTURA TÉCNICA Y PATRONES DE DISEÑO

## 1. PATRONES DE ARQUITECTURA

### 1.1 Arquitectura por Capas

```
┌────────────────────────────────────────────┐
│     CAPA DE PRESENTACIÓN                   │
│  (HTML, CSS, DOM, Eventos del Navegador)   │
│     Módulo: UIManager                      │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│  CAPA DE LÓGICA DE NEGOCIO                 │
│  (Reglas de Inventario, Validaciones)      │
│     Módulo: DataManager                    │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│   CAPA DE DATOS Y PERSISTENCIA             │
│  (localStorage, Caché, Indices)            │
│   Módulos: StorageManager, SessionManager  │
└────────────────────────────────────────────┘
```

**Ventajas:**
- Separación de responsabilidades clara
- Fácil mantenimiento y testing
- Reaprovechar código en diferentes capas
- Escalabilidad sin refactoring mayor

### 1.2 Patrón MVC Ligero

Aunque no es MVC tradicional, la arquitectura sigue principios similares:

```
MODEL (Datos)          → DataManager
VIEW  (Presentación)   → HTML + CSS + UIManager
CONTROLLER (Lógica)   → UIManager + DataManager
```

---

## 2. PATRONES DE DISEÑO UTILIZADOS

### 2.1 Singleton Pattern
```javascript
// Instancias globales únicas
const dataManager = new DataManager();      // Una sola instancia
const uiManager = new UIManager();          // Una sola instancia
const storageManager = new StorageManager(); // Una sola instancia
```

### 2.2 Observer Pattern
```javascript
// Observers de cambios:
window.addEventListener('storage', handler);      // Cambios en otros tabs
document.addEventListener('DOMContentLoaded', ..); // Ready del DOM
document.querySelectorAll('.nav-link').forEach(el => {
    el.addEventListener('change', handler);       // Cambios en UI
});
```

### 2.3 Repository Pattern
```javascript
// DataManager actúa como repository
dataManager.obtenerProductos()     // Read
dataManager.crearProducto()        // Create
dataManager.actualizarProducto()   // Update
dataManager.eliminarProducto()     // Delete
```

### 2.4 Factory Pattern
```javascript
// Métodos factory en DataManager
dataManager.crearCategoria(datos)   // Crea con ID auto-generado
dataManager.crearProducto(datos)    // Crea con validaciones
dataManager.crearMovimiento(datos)  // Crea con lógica compleja
```

### 2.5 Strategy Pattern
```javascript
// Diferentes estrategias de movimiento
if (tipo === 'ENTRADA') {
    // Estrategia: aumentar stock
} else if (tipo === 'SALIDA') {
    // Estrategia: disminuir stock
}
```

### 2.6 State Pattern
```javascript
// Estados de elementos
page-section.active      // Sección visible
modal.active             // Modal visible
sidebar.active           // Sidebar visible en móvil
```

---

## 3. FLUJO DE DATOS

### 3.1 Creación de Producto

```
Usuario Input (HTML Form)
        ↓
UIManager.handleFormProducto()
        ↓
dataManager.crearProducto(datos)
        ↓
Validaciones de negocio
        ↓
DataManager guarda en array
        ↓
storageManager.guardar() → localStorage
        ↓
UIManager renderiza tabla
        ↓
Notificación al usuario
```

### 3.2 Registro de Movimiento

```
Usuario Input (Formulario)
        ↓
UIManager.handleFormMovimiento()
        ↓
dataManager.crearMovimiento(datos)
        ↓
Validar stock, razones, referencias
        ↓
Actualizar stock del producto
        ↓
Guardar movimiento
        ↓
Persistir en localStorage
        ↓
Renderizar historial
        ↓
Actualizar estadísticas
```

---

## 4. CICLO DE VIDA DE DATOS

### Estado Dato: Producto

```
CREACIÓN
   ↓
dataManager.crearProducto()
   ↓
Genera ID único
   ↓
Valida unicidad de código
   ↓
Agrega timestamps
   ↓
Almacena en array
   ↓
Persiste en localStorage
        ↓
        ├─ LECTURA
        │   ↓
        │   dataManager.obtenerProductos()
        │   dataManager.obtenerProductosPorCategoria()
        │   dataManager.buscarProductos()
        │
        ├─ ACTUALIZACIÓN
        │   ↓
        │   dataManager.actualizarProducto()
        │   dataManager.actualizarStockProducto()
        │
        └─ ELIMINACIÓN
            ↓
            dataManager.eliminarProducto()
                Valida que no hay movimientos
            ↓
            Elimina de array
            ↓
            Persiste cambio
```

---

## 5. GESTIÓN DE ESTADO

### Estado Global de la Aplicación

```javascript
// Datos persistentes (localStorage)
dataManager.categorias[]
dataManager.productos[]
dataManager.movimientos[]

// Datos de sesión (en memoria)
sessionManager.sessionId
sessionManager.sessionData

// Caché temporal
cacheManager.cache    // Expires automáticamente

// UI State (DOM)
currentSection        // Sección visible actual
openModals            // Cuáles están abiertos
sidebarOpen           // Sidebar visible/oculto
```

---

## 6. FLUJO DE VALIDACIÓN

### Validación de Creación de Producto

```
Entrada: { nombre, codigo, categoriaId, precioCompra, ... }
        ↓
┌─────────────────────────────────────────┐
│ VALIDACIONES                            │
├─────────────────────────────────────────┤
│ ✓ nombre: 3-100 caracteres              │
│ ✓ codigo: único en el sistema           │
│ ✓ categoriaId: existente                │
│ ✓ precioVenta > precioCompra            │
│ ✓ cantidad >= 0                         │
│ ✓ minimo >= 0                           │
└─────────────────────────────────────────┘
        ↓
   ¿Todo válido?
   /          \
  SÍ          NO
  ↓           ↓
CREAR      THROW ERROR
        ↓
    showToast()
```

---

## 7. ÍNDICES Y BÚSQUEDA

### Estrategia de Búsqueda

```javascript
// Búsqueda simple (O(n))
dataManager.buscarProductos(termino)
    → Recorre todos los productos
    → Compara nombre, código, descripción
    → Retorna matches

// Búsqueda por categoría (O(1))
dataManager.obtenerProductosPorCategoria(id)
    → Array.filter() por categoriaId
    → Retorna coincidencias

// Índice para referencias
dbIndex.crearIndice('categoriaId', 'nombre')
    → Busca rápida por relación
```

---

## 8. MANEJO DE ERRORES

### Estrategia de Errores

```javascript
// Nivel de aplicación
try {
    dataManager.crearProducto(datos);
} catch (error) {
    // Errores esperados de negocio
    uiManager.showToast('Error: ' + error.message, 'error');
    console.error(error);
}

// Nivel de validación
if (!categoria) throw new Error('Categoría no encontrada');
if (cantidad < 0) throw new Error('Cantidad debe ser positiva');

// Recuperación automática
dataManager.init()  // Reintentos al cargar datos
```

---

## 9. RENDIMIENTO Y OPTIMIZACIONES

### Optimizaciones Implementadas

```
1. CACHÉ EN MEMORIA
   ↓
   cacheManager.set(clave, valor, ttl)
   ↓
   Reduce búsquedas repetidas

2. ÍNDICES LOCALES
   ↓
   dbIndex para referencias rápidas
   ↓
   O(m) en lugar de O(n)

3. LAZY LOADING
   ↓
   Datos se cargan cuando se necesitan
   ↓
   No precarga todo

4. EVENT DELEGATION
   ↓
   Un listener para múltiples elementos
   ↓
   Menos memory footprint

5. BATCH OPERATIONS
   ↓
   Múltiples cambios = un guardado
   ↓
   Menos writes a localStorage
```

---

## 10. SEGURIDAD Y VALIDACIÓN

### Capas de Validación

```
ENTRADA
   ↓
┌─────────────────────────────────────┐
│ Validación de Formato               │
│ - Tipo de dato correcto             │
│ - Longitud correcta                 │
│ - Formato válido (email, fecha)     │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ Validación de Negocio               │
│ - Códigos únicos                    │
│ - Precios válidos                   │
│ - Stock consistente                 │
│ - Referencias válidas               │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ Validación de Integridad            │
│ - Integridad referencial            │
│ - Consistencia de datos             │
│ - Auditoría de cambios              │
└─────────────────────────────────────┘
   ↓
PROCESAMIENTO
```

---

## 11. EXTENSIBILIDAD

### Cómo Extender el Sistema

#### Agregar Nueva Sección

```javascript
// 1. Agregar al HTML (index.html)
<section id="nuevaSeccion" class="page-section">...</section>

// 2. Crear método en UIManager
loadNuevaSeccion() {
    // Lógica de renderizado
}

// 3. Agregar navigación
document.querySelector('[data-section="nuevaSeccion"]')
    .addEventListener('click', () => uiManager.showSection('nuevaSeccion'));

// 4. Agregar al switch en showSection()
case 'nuevaSeccion':
    this.loadNuevaSeccion();
    break;
```

#### Agregar Nueva Entidad

```javascript
// 1. Definir en data.js (DataManager)
class DataManager {
    this.nuevaEntidad = [];
    
    obtenerNuevaEntidad() { ... }
    crearNuevaEntidad() { ... }
    // etc
}

// 2. Usar en UI (ui.js)
const entidades = dataManager.obtenerNuevaEntidad();

// 3. Persistir automáticamente
// (el método guardar() ya incluye la nueva entidad)
```

---

## 12. TESTING (Manual)

### Casos de Prueba Básicos

```javascript
// En la consola del navegador (F12 → Console)

// Test 1: Crear categoría
dataManager.crearCategoria({
    nombre: 'Test',
    descripcion: 'Prueba',
    icono: '✓',
    color: '#000'
});

// Test 2: Crear producto
dataManager.crearProducto({
    nombre: 'Test Prod',
    codigo: 'TEST-001',
    categoriaId: 'CAT-001',
    precioCompra: 100,
    precioVenta: 150,
    cantidad: 10
});

// Test 3: Movimiento
dataManager.crearMovimiento({
    tipo: 'ENTRADA',
    productoId: 'PROD-001',
    cantidad: 5,
    razon: 'COMPRA_PROVEEDOR'
});

// Test 4: Verificar persistencia
location.reload();  // Recarga página
// Datos siguen disponibles

// Test 5: Validar integridad
app.validateDataIntegrity();
```

---

## 13. FLUJO DE SINCRONIZACIÓN MULTI-TAB

```
TAB A (Principal)          TAB B (Secundaria)
   │                            │
   ├─ Cambia datos              │
   │                            │
   ├─ localStorage.setItem()    │
   │           ↓                │
   │      (evento storage)      │
   │           ←────────────────┤
   │                    TAB B recibe evento
   │                            ├─ Recarga datos
   │                            ├─ Actualiza UI
   │                            └─ Resincroniza
```

---

## 14. DIAGRAMA DE CLASES

```
┌─────────────────────┐
│   InventarioApp     │
├─────────────────────┤
│ init()              │
│ getDiagnostics()    │
│ validateDataIntegrity()
│ generateStatusReport()
└─────────────────────┘
          ↓
        Usa:
          ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  DataManager     │  │  UIManager       │  │ StorageManager   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ +categorias[]    │  │ +currentSection  │  │ +prefix          │
│ +productos[]     │  │ +bindNavigation()│  │ +set()           │
│ +movimientos[]   │  │ +loadDashboard() │  │ +get()           │
│                  │  │ +showToast()     │  │ +clear()         │
│ +crearProducto() │  │ +openModal()     │  │ +exportToJSON()  │
│ +obtenerStats()  │  │ +renderTabla()   │  │ +importFromJSON()│
│ +guardar()       │  │ +handleForm()    │  └──────────────────┘
└──────────────────┘  └──────────────────┘
```

---

## 15. DOCUMENTO DE DECISIONES ARQUITECTÓNICAS

### ADR-001: Usar JavaScript Vanilla

**Decisión:** No usar frameworks (React, Vue, Angular)

**Razones:**
- ✓ Sin dependencias externas
- ✓ Menor tamaño de código
- ✓ Control total
- ✓ Compatible con navegadores antiguos

**Trade-offs:**
- ✗ Más código manual
- ✗ Sin hot reload
- ✗ Menos ecosistema

---

### ADR-002: localStorage para Persistencia

**Decisión:** Usar localStorage en lugar de backend

**Razones:**
- ✓ Sin servidor requerido
- ✓ Datos disponibles offline
- ✓ Gratis y sin hosting
- ✓ Rápido para operaciones locales

**Trade-offs:**
- ✗ Limitado a ~5-10MB
- ✗ No sincroniza entre dispositivos
- ✗ Sin seguridad real
- ✗ Pierde datos si caché se limpia

---

### ADR-003: Una Sola Instancia por Gestor

**Decisión:** Usar patrón Singleton para gestores

**Razones:**
- ✓ Estado consistente
- ✓ Acceso global fácil
- ✓ Evita duplicados

**Trade-offs:**
- ✗ Testing más difícil
- ✗ Acoplamiento global

---

## 16. MÉTRICAS Y KPIs

### Tamaño del Código

| Archivo | Líneas | Tamaño |
|---------|--------|--------|
| app.js | ~350 | ~12KB |
| data.js | ~450 | ~15KB |
| ui.js | ~550 | ~18KB |
| storage.js | ~250 | ~8KB |
| styles.css | ~700 | ~22KB |
| responsive.css | ~400 | ~12KB |
| **TOTAL** | **~2700** | **~87KB** |

### Complejidad

| Métrica | Valor |
|---------|-------|
| Nº de Clases | 5 |
| Nº de Métodos | 60+ |
| Nº de Funciones | 100+ |
| Máx Complejidad Ciclomática | 8 |

---

## 17. CONCLUSIÓN

Esta arquitectura proporciona:

✅ **Escalabilidad:** Fácil agregar nuevas funcionalidades  
✅ **Mantenibilidad:** Código organizado y comentado  
✅ **Rendimiento:** Optimizaciones clave implementadas  
✅ **Robustez:** Validaciones y manejo de errores  
✅ **Flexibilidad:** Preparado para backend futuro  

---

*Documentación Técnica - Sistema de Gestión de Inventarios v1.0*
