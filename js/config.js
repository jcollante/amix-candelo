// Ajusta estos valores para tu edición del juego.
const CONFIG = {
  eventTitle: "Amig@ Candel@",
  eventSubtitle:
    "Escribe tu nombre antes de que acabe la cuenta regresiva y descubre a quién te tocará de amig@ secret@. \nLos regalos serán entregados después de la asamblea. Max. 15€ por regalo.",

  // Fecha y hora en las que se cierra el registro y se abre el sorteo.
  // Formato ISO 8601 con zona horaria explícita (evita ambigüedades entre husos horarios).
  countdownTarget: "2026-10-03T00:00:00+02:00",

  // Clave compartida con el grupo. Es solo un filtro suave contra desconocidos
  // con el enlace, no una medida de seguridad real.
  passcode: "2026",

  // Rellena esto con los datos de tu proyecto de Firebase (ver README.md).
  firebase: {
    apiKey: "AIzaSyDtXSTC7p09sjiBkdrPaCTMP41eP2aHzdM",
    authDomain: "amigo-secreto-2173f.firebaseapp.com",
    databaseURL: "https://amigo-secreto-2173f-default-rtdb.firebaseio.com",
    projectId: "amigo-secreto-2173f",
    storageBucket: "amigo-secreto-2173f.firebasestorage.app",
    messagingSenderId: "452208318640",
    appId: "1:452208318640:web:d8760f98615c2bdc948375",
  },
};
