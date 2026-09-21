# Amigo Secreto

Página estática para organizar un sorteo de amigo secreto con un grupo de amigos.
Sin backend propio: es HTML/CSS/JS plano, usando Firebase Realtime Database como
almacenamiento compartido, pensada para publicarse en GitHub Pages.

## Cómo funciona

1. **Registro**: cada persona entra con la clave del grupo, escribe su nombre y
   apellido, y queda en la lista visible para todos.
2. **Cuenta regresiva**: al llegar la fecha configurada, el registro se cierra.
3. **Sorteo**: el primer navegador que carga la página después de esa fecha
   calcula un único reparto para todo el grupo (un ciclo aleatorio: A le regala
   a B, B le regala a C, ..., el último le regala a A). Esto garantiza que
   nadie se saca a sí mismo y que el sorteo es válido sin importar el orden en
   que la gente entre a revelarlo.
4. **Revelación**: cada persona elige su nombre y presiona "Descubre tu amigo
   secreto". Ve una animación tipo ruleta y luego el nombre de su amigo
   secreto ya predeterminado. Una vez revelado, no se puede volver a mostrar.

## Configuración del evento

Todo lo editable está en [js/config.js](js/config.js):

- `eventTitle` / `eventSubtitle`: textos del encabezado.
- `countdownTarget`: fecha y hora (ISO 8601 con zona horaria) en la que se
  cierra el registro y se abre el sorteo.
- `passcode`: clave compartida con el grupo (filtro suave, no es seguridad
  real — cualquiera que la sepa puede anotarse).
- `firebase`: credenciales de tu proyecto de Firebase (ver abajo).

## Configurar Firebase (una sola vez)

1. Entra a [console.firebase.google.com](https://console.firebase.google.com)
   con tu cuenta de Google y crea un proyecto nuevo (gratis).
2. En el menú lateral, ve a **Build → Realtime Database** y créala. Elige
   empezar en **modo de prueba** (reglas abiertas) para simplificar.
3. En **Configuración del proyecto → General**, baja hasta "Tus apps", crea
   una app web (ícono `</>`), y copia el objeto `firebaseConfig` que te
   entrega.
4. Pega esos valores en `js/config.js`, dentro de `firebase: { ... }`.
5. En la pestaña **Reglas** de Realtime Database, puedes dejar las reglas
   abiertas (modo de prueba) o usar estas, que solo validan la forma de los
   datos sin requerir autenticación (la clave del grupo se valida en el
   navegador, no aquí):

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   Esto es intencionalmente simple: no hay usuarios ni contraseñas reales en
   Firebase, solo la clave compartida como filtro en la interfaz. Si más
   adelante quieres seguridad real, el siguiente paso sería añadir Firebase
   Authentication (anónima) y condicionar las reglas a `auth != null`.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y sube este proyecto.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. GitHub te da una URL pública (`https://tu-usuario.github.io/tu-repo/`) —
   compártela con el grupo junto con la clave.

## Estructura del proyecto

```
amigo_secreto/
├── index.html
├── css/style.css
├── js/
│   ├── config.js        ← editas la fecha, la clave y las llaves de Firebase
│   ├── firebase-init.js
│   └── app.js
├── img/Logo-CC-RGB.jpg
└── README.md
```

No hay dependencias que instalar ni paso de build: basta con abrir
`index.html` en un navegador (o publicarlo tal cual) una vez que
`js/config.js` tenga tus llaves reales de Firebase.
