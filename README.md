# 🏪 Sistema Punto de Venta - Chile

Sistema POS completo con control de inventario, proveedores, usuarios y tickets de venta.
Configurado con IVA 19% para el mercado chileno.

---

## 🚀 Opción 1: Subir a Vercel (GRATIS - Recomendado)

### Paso 1: Crear cuenta en Vercel
1. Ve a **https://vercel.com**
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (necesitas cuenta en GitHub, también gratis)

### Paso 2: Subir el código a GitHub
1. Ve a **https://github.com** y crea una cuenta si no tienes
2. Haz clic en **"+"** arriba a la derecha → **"New repository"**
3. Ponle nombre: `pos-sistema-ventas`
4. Déjalo como **Public**
5. Haz clic en **"Create repository"**
6. Sube todos los archivos de esta carpeta al repositorio
   - Puedes arrastrar los archivos directamente en la página de GitHub

### Paso 3: Conectar con Vercel
1. En **Vercel**, haz clic en **"Add New" → "Project"**
2. Selecciona tu repositorio `pos-sistema-ventas`
3. Framework Preset: selecciona **Vite**
4. Haz clic en **"Deploy"**
5. ¡Listo! En ~1 minuto tendrás tu URL tipo: `pos-sistema-ventas.vercel.app`

---

## 🚀 Opción 2: Subir a Netlify (GRATIS)

### Método rápido (sin GitHub):
1. Ve a **https://app.netlify.com/drop**
2. Primero construye el proyecto localmente (ver sección "Desarrollo Local")
3. Arrastra la carpeta `dist` a la página de Netlify
4. ¡Listo! Te da una URL automáticamente

---

## 💻 Desarrollo Local (para probar antes de subir)

### Requisitos
- **Node.js** (versión 18 o superior): descárgalo de https://nodejs.org

### Pasos
```bash
# 1. Abre la terminal (Terminal en Mac / CMD en Windows)

# 2. Ve a la carpeta del proyecto
cd pos-web

# 3. Instala las dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm run dev
```

Se abrirá en **http://localhost:5173**

### Para construir la versión de producción:
```bash
npm run build
```
Esto genera la carpeta `dist/` lista para subir a cualquier hosting.

---

## 🔐 Credenciales de Prueba

| Usuario   | Contraseña | Rol         |
|-----------|------------|-------------|
| admin     | admin123   | Administrador |
| vendedor  | venta123   | Vendedor    |

---

## 📋 Funcionalidades

- **Punto de Venta**: Búsqueda rápida, categorías, carrito con IVA 19%
- **Ticket de Venta**: Formato boleta chilena, imprimible
- **Inventario**: Control de stock con alertas de stock bajo
- **Proveedores**: Registro con RUT, contacto y dirección
- **Usuarios**: Roles Admin y Vendedor con permisos diferenciados
- **Historial**: Registro completo de ventas con reimprimir ticket
- **Métodos de Pago**: Efectivo (con cálculo de vuelto), Débito, Crédito, Transferencia

---

## ⚙️ Notas Técnicas

- Los datos se guardan en **localStorage** del navegador
- Compatible con **Mac, Windows y Linux**
- Funciona en **Chrome, Firefox, Edge y Safari**
- Se puede instalar como **PWA** (app en el escritorio) desde el navegador
- No requiere base de datos externa ni servidor backend
