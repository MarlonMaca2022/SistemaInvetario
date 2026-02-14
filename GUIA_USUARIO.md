# InventarioPRO - Sistema de Gestión de Inventarios (v2.0.0 Tailwind CSS)

## 📱 Vista Rápida

**InventarioPRO** es una aplicación web moderna de **gestión de inventarios** 100% frontend, construida con **JavaScript Vanilla** y diseñada con **Tailwind CSS**.

### Características Principales
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de productosategorías
- ✅ Control de movimientos de inventario (Entrada/Salida)
- ✅ Reportes y análisis
- ✅ Exportación/Importación de datos
- ✅ Responsive design (funciona en móvil, tablet y desktop)
- ✅ Almacenamiento local (LocalStorage)
- ✅ Sin backend requerido

---

## 🚀 Inicio Rápido

### 1. Abrir la Aplicación
```bash
# Opción 1: Abrir directamente en el navegador
file:///ruta/a/SistemaInventarios/index.html

# Opción 2: Usar servidor local (recomendado)
cd SistemaInventarios
python -m http.server 8000
# Luego abrir: http://localhost:8000
```

### 2. Funcionalidades Principales

#### **Dashboard** (Pantalla de Inicio)
- Visualiza estadísticas clave:
  - Total de productos
  - Cantidad de categorías
  - Valor del inventario
  - Movimientos del día
- Ve alertas de productos con stock bajo
- Revisa últimos movimientos registrados

#### **Gestión de Productos**
- Crear nuevo producto con:
  - Nombre, SKU, categoría
  - Precios (compra y venta)
  - Stock inicial y mínimo
  - Descripción
- Filtrar por categoría, estado o nombre
- Editar o eliminar productos existentes

#### **Gestión de Categorías**
- Crear categorías por cómodo
- Asignar emoji/icono
- Definir color característico
- Ver cantidad de productos por categoría

#### **Movimientos**
- Registrar entradas y salidas
- Seleccionar razón del movimiento
- Agregar notas
- Ver historial completo

#### **Reportes**
- Stock por categoría
- Historial de movimientos
- Análisis de rentabilidad (próximamente)

---

## 💾 Datos y Almacenamiento

### Dónde se Guardan los Datos
Los datos se guardan automáticamente en **LocalStorage** del navegador. No se pierde información al cerrar.

### Exportar Datos
```
Menú Lateral → Exportar Datos
```
Descargará un archivo JSON con todos tus datos.

### Importar Datos
```
Menú Lateral → Importar Datos
```
Sube un archivo JSON exportado anteriormente.

---

## 🎨 Interfaz de Usuario

### Estructura
```
┌─────────────────────────────────────────┐
│ Header (Logo, navegación, usuario)      │
├────────┬────────────────────────────────┤
│Sidebar │ Contenido Principal             │
│ (Menu) │ (Dashboard/Productos/etc)       │
│        │                                 │
│        │                                 │
└────────┴────────────────────────────────┘
```

### Colores
- **Azul** (#3b82f6) - Acciones principales
- **Verde** (#10b981) - Éxito, stocks positivos
- **Rojo** (#dc2626) - Peligro, stock bajo
- **Amarillo** (#f59e0b) - Advertencia
- **Gris** (#6b7280) - Información neutral

### Iconos
Se usan iconos de Font Awesome 6.4.0:
- 📦 Productos
- 📂 Categorías
- ↔️ Movimientos
- 📊 Reportes
- etc.

---

## 🛠️ Estructura Técnica

### Arquitectura
```
JavaScript Vanilla (Sin frameworks)
   ↓
MVC-light Architecture
   ├── Data Layer (data.js)
   ├── Storage Layer (storage.js)
   ├── UI Layer (ui.js)
   └── App Orchestrator (app.js)
   ↓
HTML5 + Tailwind CSS
```

### Archivos Principales
- **index.html** - Interfaz principal (refactorizado con Tailwind)
- **js/data.js** - Lógica de datos y CRUD
- **js/ui.js** - Gestión de interfaz
- **js/storage.js** - Persistencia de datos
- **js/app.js** - Inicialización

### Datos JSON
```
data/
├── categorias.json    - Categorías de ejemplo
├── productos.json     - Productos de ejemplo
├── movimientos.json   - Movimientos de ejemplo
└── SCHEMA.json        - Definición de esquemas
```

---

## 📊 Esquema de Datos

### Producto
```json
{
  "id": "prod_001",
  "codigo": "SKU-001",
  "nombre": "Laptop Dell",
  "descripcion": "Laptop profesional",
  "categoriaId": "cat_001",
  "precio": {
    "precioCompra": 800.00,
    "precioVenta": 1200.00
  },
  "inventario": {
    "cantidad": 15,
    "minimo": 5
  },
  "estado": "ACTIVO",
  "timestamps": {
    "creadoEn": "2024-01-01T10:00:00Z",
    "actualizadoEn": "2024-01-15T14:30:00Z"
  }
}
```

### Categoría
```json
{
  "id": "cat_001",
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos",
  "icono": "💻",
  "color": "#3b82f6",
  "activa": true,
  "timestamps": {
    "creadoEn": "2024-01-01T10:00:00Z",
    "actualizadoEn": "2024-01-15T14:30:00Z"
  }
}
```

### Movimiento
```json
{
  "id": "mov_001",
  "tipo": "ENTRADA",
  "productoId": "prod_001",
  "cantidad": 10,
  "razon": "COMPRA_PROVEEDOR",
  "usuario": "admin",
  "notas": "Compra al proveedor ABC",
  "estado": "COMPLETADO",
  "fechaMovimiento": "2024-01-15T10:00:00Z",
  "detalles": {}
}
```

---

## 🔒 Seguridad

### Consideraciones
- ✅ Datos almacenados localmente (no se envían al servidor)
- ✅ Validación de datos en cliente
- ✅ Confirmaciones para acciones destructivas
- ⚠️ Para producción: implementar backend con autenticación

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (1280px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

### Conexión
- ✅ En línea (recomendado para experiencia completa)
- ⚠️ Sin conexión (funciona, pero sin gravatar/CDN)

---

## 🎯 Casos de Uso

### Pequeño Negocio
Perfecto para tiendas, kioscos o pequeños almacenes que necesitan controlar:
- Stock de productos
- Entrada/Salida de mercancía
- Reportes simples

### Inventario Personal
Ideal para tener control de colecciones:
- Libros
- Películas
- Accesorios
- Herramientas

### Educación
Excelente para:
- Proyectos escolares
- Hackatones
- Portfolios de desarrolladores

---

## 🐛 Solución de Problemas

### Los datos no se guardan
**Solución:** Asegúrate que LocalStorage esté habilitado en el navegador.

### La aplicación ve lenta
**Solución:** Intenta limpiar el caché del navegador o usar incógnito.

### Los estilos no cargan
**Solución:** Asegúrate de tener conexión a internet (Tailwind se carga via CDN).

### Los modales no abren
**Solución:** Abre la consola (F12) y busca errores de JavaScript.

---

## 📚 Documentación Completa

- **ARQUITECTURA.md** - Detalles técnicos profundos
- **INICIO_RAPIDO.md** - Tutorial paso a paso
- **TAILWIND_MIGRATION.md** - Cambios en v2.0.0

---

## 🤝 Contribución y Mejoras

### Ideas para Mejorar
- [ ] Sincronización cloud (Firebase)
- [ ] Modo oscuro
- [ ] Múltiples usuarios
- [ ] Fotografías de productos
- [ ] Códigos de barras QR
- [ ] Búsqueda avanzada
- [ ] Gráficos estadísticos
- [ ] Exportación a PDF/Excel
- [ ] API REST backend
- [ ] App móvil nativa

---

## 📄 Licencia

Este proyecto es de código abierto y gratuito para uso personal y educativo.

---

## ℹ️ Información Técnica

**Versión:** 2.0.0  
**Framework:** Tailwind CSS v3  
**JavaScript:** ES6+ Vanilla  
**Almacenamiento:** LocalStorage  
**Requisitos:** Navegador moderno  
**Peso:** ~150KB (sin dependencias backend)

---

## 📞 Contacto/Soporte

Para reportar issues o sugerencias, revisar los archivos de documentación incluidos.

---

**⚡ Creado con ❤️ para simplificar la gestión de inventarios**

Última actualización: Enero 2024

