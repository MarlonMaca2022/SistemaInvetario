/**
 * MÓDULO DE GESTIÓN DE ALMACENAMIENTO
 * Maneja persistencia de datos en localStorage
 */

class StorageManager {
    constructor() {
        this.prefix = 'inventario_';
        this.versionKey = 'version';
        this.currentVersion = '1.0';
        this.initStorage();
    }

    /**
     * Inicializa el almacenamiento
     */
    initStorage() {
        try {
            // Verificar que localStorage está disponible
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            console.log('✓ localStorage disponible');
        } catch (e) {
            console.warn('⚠ localStorage no disponible, usando almacenamiento en memoria');
        }
    }

    /**
     * Almacena un valor
     */
    set(clave, valor) {
        try {
            const datos = JSON.stringify({
                valor: valor,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(this.prefix + clave, datos);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    /**
     * Obtiene un valor almacenado
     */
    get(clave, defaultValue = null) {
        try {
            const datos = localStorage.getItem(this.prefix + clave);
            if (!datos) return defaultValue;
            return JSON.parse(datos).valor;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Verifica si existe una clave
     */
    exists(clave) {
        return localStorage.getItem(this.prefix + clave) !== null;
    }

    /**
     * Elimina un valor
     */
    remove(clave) {
        try {
            localStorage.removeItem(this.prefix + clave);
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
        }
    }

    /**
     * Limpia todo el almacenamiento
     */
    clear() {
        try {
            const claves = Object.keys(localStorage);
            claves.forEach(clave => {
                if (clave.startsWith(this.prefix)) {
                    localStorage.removeItem(clave);
                }
            });
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
        }
    }

    /**
     * Obtiene todas las claves almacenadas
     */
    getAllKeys() {
        const claves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(this.prefix)) {
                claves.push(clave.replace(this.prefix, ''));
            }
        }
        return claves;
    }

    /**
     * Obtiene el tamaño del almacenamiento en bytes
     */
    getSize() {
        let size = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(this.prefix)) {
                size += localStorage.getItem(clave).length;
            }
        }
        return size;
    }

    /**
     * Exporta datos a JSON
     */
    exportToJSON() {
        const datos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave.startsWith(this.prefix)) {
                datos[clave.replace(this.prefix, '')] = this.get(clave.replace(this.prefix, ''));
            }
        }
        return JSON.stringify(datos, null, 2);
    }

    /**
     * Importa datos desde JSON
     */
    importFromJSON(jsonString) {
        try {
            const datos = JSON.parse(jsonString);
            Object.entries(datos).forEach(([clave, valor]) => {
                this.set(clave, valor);
            });
            return true;
        } catch (error) {
            console.error('Error al importar datos:', error);
            throw new Error('Formato JSON inválido');
        }
    }

    /**
     * Obtiene información del almacenamiento
     */
    getInfo() {
        return {
            items: this.getAllKeys().length,
            sizeBytes: this.getSize(),
            sizeMB: (this.getSize() / 1024 / 1024).toFixed(2),
            version: this.get(this.prefix + this.versionKey, 'desconocida')
        };
    }
}

/**
 * CLASE DE CACHÉ CON EXPIRACIÓN
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
    }

    set(clave, valor, ttlMs = 3600000) { // 1 hora por defecto
        this.cache.set(clave, {
            valor: valor,
            expiracion: Date.now() + ttlMs
        });
    }

    get(clave) {
        const item = this.cache.get(clave);
        if (!item) return null;

        // Verificar si ha expirado
        if (Date.now() > item.expiracion) {
            this.cache.delete(clave);
            return null;
        }

        return item.valor;
    }

    clear() {
        this.cache.clear();
    }

    remove(clave) {
        this.cache.delete(clave);
    }

    limpiarExpirados() {
        const ahora = Date.now();
        for (let [clave, item] of this.cache) {
            if (ahora > item.expiracion) {
                this.cache.delete(clave);
            }
        }
    }
}

/**
 * GESTOR DE SESIÓN
 */
class SessionManager {
    constructor() {
        this.sessionData = {};
        this.sessionId = this.generarSessionId();
        this.inicioSesion = new Date();
    }

    generarSessionId() {
        return 'SES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    set(clave, valor) {
        this.sessionData[clave] = {
            valor: valor,
            timestamp: new Date()
        };
    }

    get(clave, defaultValue = null) {
        const item = this.sessionData[clave];
        return item ? item.valor : defaultValue;
    }

    remove(clave) {
        delete this.sessionData[clave];
    }

    clear() {
        this.sessionData = {};
    }

    getSessionInfo() {
        const ahora = new Date();
        const duracion = ahora - this.inicioSesion;

        return {
            sessionId: this.sessionId,
            inicioSesion: this.inicioSesion.toISOString(),
            duracion: {
                minutos: Math.floor(duracion / 60000),
                segundos: Math.floor((duracion % 60000) / 1000)
            },
            datosMantidos: Object.keys(this.sessionData).length
        };
    }
}

/**
 * ÍNDICE DE BASE DE DATOS LOCAL
 */
class LocalDBIndex {
    constructor() {
        this.indices = {};
    }

    crearIndice(nombre, campo) {
        this.indices[nombre] = {
            campo: campo,
            valores: {}
        };
    }

    agregarAlIndice(nombre, id, valor) {
        if (!this.indices[nombre]) return;

        if (!this.indices[nombre].valores[valor]) {
            this.indices[nombre].valores[valor] = [];
        }
        if (!this.indices[nombre].valores[valor].includes(id)) {
            this.indices[nombre].valores[valor].push(id);
        }
    }

    buscarPorIndice(nombre, valor) {
        if (!this.indices[nombre]) return [];
        return this.indices[nombre].valores[valor] || [];
    }

    limpiarIndice(nombre) {
        if (this.indices[nombre]) {
            this.indices[nombre].valores = {};
        }
    }
}

// Instancias globales
const storageManager = new StorageManager();
const cacheManager = new CacheManager();
const sessionManager = new SessionManager();
const dbIndex = new LocalDBIndex();
