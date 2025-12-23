# 🔒 Sistema de Protección de Audio - Zonorax

## 📋 Descripción

Este sistema implementa múltiples capas de seguridad para proteger los archivos de audio de descargas no autorizadas.

## 🛡️ Capas de Protección Implementadas

### 1. **Tokens Temporales de Streaming**
- Cada reproducción genera un token único
- Los tokens expiran después de 1 hora
- Validación de IP para prevenir compartir tokens
- Los tokens se almacenan en memoria (usar Redis en producción)

### 2. **Ofuscación del Source**
- El elemento `<audio>` no muestra la URL real
- Uso de Blob URLs temporales
- Las URLs se revocan automáticamente después de usar

### 3. **Prevención de DevTools**
- Detecta cuando se abren las herramientas de desarrollador
- Bloquea atajos de teclado (F12, Ctrl+Shift+I, etc.)
- Previene click derecho en el reproductor
- Deshabilita controles nativos de descarga

### 4. **Protección del DOM**
- Previene arrastrar elementos de audio
- Bloquea selección de texto en elementos sensibles
- Oculta atributos `src` del audio

## 📦 Archivos Creados

1. **`routes/audio-stream.js`** - Backend para tokens y streaming
2. **`public/js/audio-protection.js`** - Protección del cliente

## 🚀 Instrucciones de Implementación

### Paso 1: Registrar la ruta en el servidor

Edita `server.js` y agrega:

```javascript
const audioStreamRoutes = require('./routes/audio-stream');
app.use('/api/audio', audioStreamRoutes);
```

### Paso 2: Agregar el script de protección al HTML

Edita `public/index.html` y agrega antes del cierre de `</body>`:

```html
<script src="/js/audio-protection.js"></script>
```

### Paso 3: Modificar la función playSong

Edita `public/js/app.js` y modifica la función `playSong`:

```javascript
async function playSong(index) {
    if (currentPlaylist.length === 0) return;

    currentSongIndex = index;
    const song = currentPlaylist[currentSongIndex];

    playerCover.src = song.cover_image || '/images/placeholder-cover.jpg';
    playerSongTitle.textContent = song.title;
    playerArtist.textContent = song.artist_name || 'Artista Desconocido';

    window.currentArtistId = song.artist_id;
    window.currentSongId = song.id;

    updateSongSidebar(song);
    updateLikeButtonState();

    // 🔒 PROTECCIÓN: Usar token temporal en lugar de URL directa
    try {
        const protectedUrl = await window.audioProtection.loadProtectedAudio(song.id);
        audioPlayer.src = protectedUrl;
        audioPlayer.play();
    } catch (error) {
        console.error('Error loading protected audio:', error);
        alert('Error al cargar el audio');
        return;
    }

    fetch(`${API_BASE_URL}/songs/${song.id}/play`, { method: 'POST' });
}
```

## ⚙️ Configuración Adicional (Opcional)

### Usar Redis para Tokens (Producción)

Para producción, reemplaza el `Map` en `audio-stream.js` con Redis:

```javascript
const redis = require('redis');
const client = redis.createClient();

// Guardar token
await client.setex(`stream:${token}`, 3600, JSON.stringify(tokenData));

// Obtener token
const data = await client.get(`stream:${token}`);
```

### Configurar Cloudflare R2 con URLs Firmadas

Si usas Cloudflare R2, puedes generar URLs firmadas:

```javascript
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const signedUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hora
});
```

## 🎯 Nivel de Protección

### ✅ Protege contra:
- ✅ Usuarios casuales que intentan descargar
- ✅ Click derecho → "Guardar audio como..."
- ✅ Inspección básica del DOM
- ✅ Copiar URL del source directamente
- ✅ Compartir enlaces de audio

### ⚠️ NO protege contra:
- ❌ Usuarios técnicos avanzados con herramientas especializadas
- ❌ Grabación de pantalla/audio del sistema
- ❌ Interceptación de tráfico de red con proxies
- ❌ Modificación del código JavaScript del cliente

## 💡 Recomendaciones Adicionales

1. **Watermarking de Audio**: Agregar marcas de agua inaudibles
2. **DRM**: Implementar Encrypted Media Extensions (EME)
3. **Rate Limiting**: Limitar reproducciones por usuario/IP
4. **Monitoreo**: Registrar intentos sospechosos de descarga
5. **HTTPS**: Siempre usar HTTPS en producción
6. **CDN**: Usar CDN con protección anti-hotlinking

## 🔐 Mejores Prácticas

```javascript
// ✅ BUENO: URL con token temporal
audioPlayer.src = '/api/audio/stream/abc123token';

// ❌ MALO: URL directa visible
audioPlayer.src = 'https://r2.cloudflare.com/song.mp3';
```

## 📊 Impacto en el Rendimiento

- **Tokens**: Mínimo (~1ms por generación)
- **Blob URLs**: Moderado (depende del tamaño del archivo)
- **DevTools Detection**: Mínimo (~1ms cada segundo)

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las rutas estén registradas
2. Revisa la consola del navegador
3. Verifica que el token no haya expirado
4. Asegúrate de que el usuario esté autenticado

## 📝 Notas Importantes

- Los tokens expiran después de 1 hora
- Cada reproducción requiere un nuevo token
- Los Blob URLs se limpian automáticamente
- La protección de DevTools puede afectar el desarrollo

## 🔄 Actualizaciones Futuras

- [ ] Implementar Redis para tokens
- [ ] Agregar watermarking de audio
- [ ] Implementar DRM con EME
- [ ] Agregar analytics de intentos de descarga
- [ ] Implementar rate limiting por IP

---

**Recuerda**: Ningún sistema es 100% seguro, pero estas medidas dificultan significativamente la descarga no autorizada para usuarios casuales.
