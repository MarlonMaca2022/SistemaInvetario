# 📋 GUÍA DE INICIO RÁPIDO

## ✅ Paso 1: Verificar Archivos

Asegúrate de que tienes esta estructura:

```
SistemaInventarios/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── ui.js
│   └── storage.js
└── data/
    ├── SCHEMA.json
    ├── categorias.json
    ├── productos.json
    └── movimientos.json
```

## 🚀 Paso 2: Iniciar la Aplicación

### Opción A: Abrir directamente en el navegador

1. Haz clic derecho en `index.html`
2. Selecciona "Abrir con" → Tu navegador favorito
3. ¡Listo! La aplicación debería cargar

### Opción B: Usar un servidor local (recomendado)

**Con Python 3:**
```bash
cd SistemaInventarios
python -m http.server 8000
# Luego abre http://localhost:8000 en tu navegador
```

**Con Node.js (http-server):**
```bash
npm install -g http-server
cd SistemaInventarios
http-server
# Ingresa http://localhost:8080 en tu navegador
```

**Con Live Server en VS Code:**
1. Abre la carpeta en VS Code
2. Instala la extensión "Live Server"
3. Haz clic derecho en `index.html`
4. Selecciona "Open with Live Server"

## 📊 Paso 3: Explorar Datos de Ejemplo

Al cargar la aplicación por primera vez:

- ✅ Se crearán 5 categorías automáticamente
- ✅ Se agregarán 6 productos de ejemplo
- ✅ Habrá 6 movimientos registrados

**Datos de ejemplo:**
- Categorías: Electrónica, Accesorios, Muebles, Software, Consumibles
- Productos: Laptop, Monitor, Teclado, Papel, Silla, Adobe CC
- Movimientos: Compras, ventas, ajustes

## 🎮 Paso 4: Prueba las Funciones

### 1. Dashboard
- Visualiza estadísticas generales
- Ve alertas de bajo stock
- Revisa movimientos recientes

### 2. Gestión de Productos
- Haz clic en "+ Nuevo Producto"
- Completa el formulario
- Busca y filtra productos
- Edita o elimina como necesites

### 3. Gestión de Categorías
- Ver todas las categorías en grid
- Crear nuevas categorías
- Personaliza colores e iconos
- Editar o eliminar

### 4. Registrar Movimientos
- Selecciona tipo (Entrada/Salida)
- Elige producto y cantidad
- Indica razón del movimiento
- Agrega notas (opcional)
- ¡Se actualiza el stock automáticamente!

### 5. Consulta Reportes
- Ve stock por categoría
- Analiza movimientos
- Estudia rentabilidad

## 💾 Paso 5: Trabajar con Datos

### Exportar Datos
1. En el sidebar, haz clic en "Exportar Datos"
2. Se descargará un archivo JSON
3. Guarda como backup

### Importar Datos
1. En el sidebar, haz clic en "Importar Datos"
2. Selecciona un archivo JSON previamente exportado
3. Los datos se importarán automáticamente

### Atajos de Teclado
- **Ctrl+S**: Mostrar confirmación de guardado
- **Ctrl+E**: Exportar datos
- **Ctrl+I**: Importar datos
- **ESC**: Cerrar modales abiertos

## 🔍 Paso 6: Funciones de Consola (Desarrollador)

Abre la consola del navegador (F12 → Consola) y usa:

```javascript
// Ver diagnósticos del sistema
inventario.diagnostics()

// Ver estado completo
inventario.status()

// Validar integridad de datos
inventario.validate()

// Exportar reporte de sistema
inventario.export()

// Activar modo demo
inventario.demo()

// Limpiar datos antiguos (90 días)
inventario.clean(90)

// Ver ayuda
inventario.help()
```

## ⚙️ Paso 7: Personalización

### Cambiar Colores
Edita las variables CSS en `css/styles.css`:

```css
:root {
    --primary: #2563eb;        /* Color principal */
    --success: #10b981;        /* Color de éxito */
    --warning: #f59e0b;        /* Color de advertencia */
    --danger: #ef4444;         /* Color de error */
}
```

### Cambiar Nombre de la Aplicación
En `index.html`, línea 6:
```html
<title>Sistema de Gestión de Inventarios | Dashboard</title>
```

En `js/app.js`, línea 20:
```javascript
this.appName = 'InventarioPRO';
```

## 🐛 Paso 8: Troubleshooting

### Problema: "No se cargan los datos de ejemplo"
**Solución:** 
- Asegúrate de que los archivos JSON están en la carpeta `data/`
- Abre la consola (F12) y busca errores
- Intenta usar `inventario.demo()` para generar datos

### Problema: "Los datos se pierden al cerrar el navegador"
**Solución:**
- Los datos se guardan en localStorage automáticamente
- Si limpias el caché del navegador, perderás los datos
- Exporta regularmente como backup

### Problema: "Errores CORS al cargar archivos JSON"
**Solución:**
- Usa un servidor local en lugar de abrir el archivo directamente
- Ver opciones en "Paso 2"

### Problema: "localStorage lleno"
**Solución:**
- Limpia datos antiguos: `inventario.clean(90)`
- Exporta y borra los datos anteriores
- Importa solo los datos necesarios

## 📱 Paso 9: Usar en Móvil

La aplicación es totalmente responsive:

1. Accede desde tu dispositivo móvil
2. La interfaz se adapta automáticamente
3. El sidebar se colapsa en móviles
4. Los botones están optimizados para touch

**URL en móvil:**
- Si usas en local: `http://[IP-de-tu-PC]:8000`
- Ejemplo: `http://192.168.1.100:8000`

## 🎯 Paso 10: Próximos Pasos

Después de familiarizarte con la aplicación:

1. ✅ Crea tus propias categorías
2. ✅ Agrega tus productos reales
3. ✅ Comienza a registrar movimientos
4. ✅ Monitorea reportes regularmente
5. ✅ Exporta datos como backup mensual

## 📖 Documentación Completa

Para información detallada:
- Consulta [README.md](README.md)
- Revisa [SCHEMA.json](data/SCHEMA.json) para estructura de datos
- Lee comentarios en el código (bien documentado)

## 🚨 Notas Importantes

⚠️ **Limitaciones:**
- Los datos se guardan solo en este navegador
- Si limpias el caché, perderás los datos
- No hay sincronización con otros dispositivos
- Sin backend o base de datos en servidor

💡 **Recomendaciones:**
- Haz backups regulares (exporta JSON)
- No uses para datos críticos sin backup
- Usa la misma máquina/navegador para acceder
- Revisa la consola si hay problemas

## ✉️ Ayuda Adicional

Si encuentras problemas:

1. Abre la consola del navegador (F12)
2. Busca mensajes de error
3. Copia el error y búscalo en Google
4. Intenta las soluciones en "Troubleshooting" arriba

---

**¡Felicidades! Tu Sistema de Gestión de Inventarios está listo para usar. 🎉**

---

*Última actualización: Febrero 2026*
*Versión: 1.0.0*
