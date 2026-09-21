// Ajusta estos valores para tu edición del juego.
const CONFIG = {
  eventTitle: "Amigo Secreto",
  eventSubtitle: "Escribe tu nombre antes de que acabe la cuenta regresiva y descubre a quién le tocará consentir.",

  // Fecha y hora en las que se cierra el registro y se abre el sorteo.
  // Formato ISO 8601 con zona horaria explícita (evita ambigüedades entre husos horarios).
  countdownTarget: "2026-09-26T00:00:00+02:00",

  // Clave compartida con el grupo. Es solo un filtro suave contra desconocidos
  // con el enlace, no una medida de seguridad real.
  passcode: "2026",

  // Rellena esto con los datos de tu proyecto de Firebase (ver README.md).
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
