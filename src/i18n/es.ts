import type { ToolContent } from './types';

// Español. Transcreación basada en el vocabulario que se usa realmente en torno a
// visores HAR y análisis de red, no traducción literal. Sin palabras publicitarias
// (fácil / rápido / perfecto…); la privacidad se explica de forma estructural, no
// como promesa. Español pan-regional (España y Latinoamérica), registro «tú».

export const es: ToolContent = {
  htmlLang: 'es',

  meta: {
    title: 'HAR Viewer — Inspecciona capturas de red de DevTools en tu navegador | runlocally',
    description:
      'Inspecciona un archivo .har (HTTP Archive) exportado de las DevTools: lista de solicitudes, cronología de tiempos, cabeceras/cuerpos/cookies. Marca valores que parecen tokens o cookies de sesión. El archivo se lee en tu dispositivo y nunca se sube. Código abierto, funciona sin conexión.',
    ogTitle: 'HAR Viewer — Inspecciona capturas de red de DevTools, sin subir nada',
    ogDescription:
      'Abre un archivo .har en tu navegador: lista de solicitudes, cronología y avisos de tokens o cookies de sesión. No se sube nada. Código abierto, funciona sin conexión.',
  },

  hero: {
    h1: 'HAR Viewer',
    tagline:
      'Inspecciona una captura .har de las DevTools en tu navegador — lista de solicitudes, cronología de tiempos y avisos de valores que parecen tokens o cookies de sesión. No se sube nada.',
  },

  intro: {
    h2: 'Inspecciona archivos HAR en tu navegador',
    paras: [
      'Un archivo .har (HTTP Archive) es la captura de red que exportan las DevTools de tu navegador: cada solicitud y respuesta, con cabeceras, tiempos, cookies y cuerpos. Esta herramienta lo abre y muestra una lista de solicitudes con desplazamiento, un desglose de tiempos por solicitud, y el detalle completo de cabeceras/cuerpo de lo que hagas clic.',
      'Una captura HAR es también uno de los archivos más sensibles que puede generar un navegador: puede contener cookies de sesión activas, tokens Bearer y claves de API, tal como se enviaron. Esto no es hipotético: en la brecha de 2023 en el sistema de soporte de Okta, un atacante usó un token de sesión capturado dentro de un archivo HAR que un cliente había subido a un caso de soporte. Al cargar el archivo, esta herramienta revisa cabeceras, parámetros de consulta y cookies en busca de valores con forma de secreto habitual, y marca las solicitudes que los contienen, para que veas qué vas a compartir antes de compartirlo.',
    ],
  },

  privacy: {
    h2: 'Por qué tu archivo no sale de tu dispositivo',
    lead: 'Aquí la privacidad es estructural, no una promesa. No hay un paso de subida porque no hay ningún servidor al que enviar el archivo — algo que aquí importa más que en la mayoría de herramientas, porque un archivo HAR puede llevar los mismos tokens de sesión que buscaría un atacante:',
    points: [
      'El archivo se lee y se analiza por completo en tu navegador.',
      'La página se sirve como archivos estáticos y no envía ninguna petición con tus datos.',
      'El código es abierto y cualquiera puede leerlo (MIT).',
      'Funciona sin conexión, algo que solo es posible porque nada sale del dispositivo.',
    ],
    note: 'Si quieres comprobarlo tú mismo, abre el panel de Red de tu navegador mientras abres un archivo: ninguna petición lleva su contenido.',
    sourceLinkText: 'Leer el código fuente.',
  },

  howto: {
    h2: 'Cómo se usa',
    steps: [
      {
        h3: 'Abre un archivo',
        p: 'Haz clic para elegir un archivo .har exportado desde las DevTools de tu navegador (panel de Red → Exportar HAR), o suéltalo en cualquier parte de la página. El archivo se lee localmente.',
      },
      {
        h3: 'Revisa la lista de solicitudes',
        p: 'Método, URL, estado, tipo, tamaño y tiempo de cada solicitud, con una pequeña barra de cronología por fila. Un icono de aviso marca cualquier solicitud cuyas cabeceras, parámetros de consulta o cookies parezcan contener un token o un secreto.',
      },
      {
        h3: 'Abre una solicitud para ver el detalle',
        p: 'Consulta las cabeceras completas de solicitud/respuesta, los parámetros de consulta, las cookies y los cuerpos formateados. Los valores marcados se resaltan en su sitio, nunca se ocultan, así que ves exactamente qué se envió.',
      },
    ],
  },

  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Se sube mi archivo HAR a algún sitio?',
      a: 'No. El archivo se lee y se analiza por completo en tu navegador. No hay ningún componente de servidor, así que su contenido —incluido cualquier dato sensible que lleve— no tiene forma de salir del dispositivo. El código es abierto y puedes confirmarlo en el panel de Red de tu navegador.',
    },
    {
      q: '¿Qué significa el icono de aviso?',
      a: 'Significa que las cabeceras, los parámetros de consulta o las cookies de esa solicitud contienen un valor con la forma de un secreto habitual: un token Authorization: Bearer, un JWT (empieza por eyJ, tres segmentos separados por puntos), una clave de acceso de AWS (AKIA...), un token de GitHub (ghp_/gho_...), una clave de API con prefijo sk-, un parámetro de consulta llamado api_key/access_token/token, o simplemente la presencia de una cabecera Cookie/Set-Cookie.',
    },
    {
      q: '¿Oculta o censura los valores marcados?',
      a: 'No, a propósito. El objetivo es la visibilidad local: ver qué contiene tu propia captura antes de decidir si la compartes con alguien. Los valores marcados se resaltan en la vista de detalle, no se enmascaran.',
    },
    {
      q: '¿También revisa los cuerpos de solicitud y respuesta?',
      a: 'En esta versión, no. La detección se limita a los valores de las cabeceras, los valores de los parámetros de consulta y los valores de las cookies. Los cuerpos también pueden contener secretos, pero revisarlos es un problema más grande que se deja para una versión futura.',
    },
    {
      q: '¿Puede quitar los tokens y exportar un HAR limpio?',
      a: 'No: esto es un visor, y limpiar o censurar archivos HAR a propósito es un trabajo distinto, con sus propias implicaciones. Si necesitas eso, Cloudflare publica un sanitizador de HAR de código abierto, del lado del cliente, creado específicamente para esa tarea.',
    },
    {
      q: '¿Qué muestra la barra de cronología?',
      a: 'Las fases blocked/DNS/connect/send/wait/receive de cada solicitud (de los timings del HAR), dibujadas como una barra apilada y medidas contra la duración total de la captura: una solicitud que ocupó una gran parte de la sesión muestra una barra larga, y una rápida muestra una barra corta.',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Sí. Es una PWA. Tras la primera visita queda guardada en la caché, de modo que se abre sin conexión a la red. También puedes instalarla en tu pantalla de inicio.',
    },
  ],

  footer: {
    openSourceLabel: 'Código abierto (MIT)',
    partOf: 'parte de',
    brandTail: '— pequeñas herramientas que funcionan localmente en tu dispositivo.',
    colophon:
      'Creado y mantenido por Geppetto. Parte del código se escribe con ayuda de IA; la revisión y las decisiones son del responsable del proyecto.',
    securityText: 'Seguridad',
  },

  related: {
    h2: 'Herramientas relacionadas',
    blogLinkText: 'Leer las notas técnicas',
  },
};
