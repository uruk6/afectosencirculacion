// DATOS REALES AGREGADOS de la cartografía del cuerpo (Resultados · bloque cualitativo).
// Fuente: informes 01 a 07 de "Análisis resultados" (codificación cerrada el 08/11/2026).
// NO enviar a Antigravity. Se copia a prototipo/js/temas.js después de que Gemini construya con datos de ejemplo.
// Sin identificadores de video, sin nombres de codificadores y sin citas literales sin verificar.

window.BASE_VIDEOS = { total: 160, tiktok: 73, instagram: 87 };

window.TEMAS = [
  {
    id: 'ojos',
    slug: 'economias-afectivas',
    region: 'Ojos',
    x: 78,
    y: 8,
    nombre: 'Economías afectivas',
    pregunta: '¿Para quién mostramos el afecto?',
    encontramos: 'En 40 de los 160 videos (25 %) el afecto se muestra para que alguien lo mire. En unos, la pareja aparece como prueba de que quien publica vale (25 videos). En otros, el dolor se cuenta o se actúa con producción: luz, música, rótulos (15 videos). Casi nunca ocurren juntos: coinciden en un solo video. Y casi nadie cuestiona esa lógica desde adentro: lo hace un solo video.',
    significa: 'La mirada de otras personas es parte de cómo se prueba un vínculo y también de cómo se vende el dolor.',
    limites: 'La validación se revisó a fondo solo en los videos de uno de los codificadores. El dolor «actuado» describe la representación curada del malestar, no lo que vivieron las personas que aparecen.',
    hipotesis: null,
    total: { videos: 40, tiktok: 25, instagram: 15 },
    formas: [
      { etiqueta: 'Mostrar la pareja para que te reconozcan', videos: 25, tiktok: 12, instagram: 13 },
      { etiqueta: 'Dolor producido para ser mirado', videos: 15, tiktok: 12, instagram: 3 },
      { etiqueta: 'Cuestionar los estándares de las redes', videos: 1, tiktok: 1, instagram: 0 }
    ],
    diferencia: {
      tipo: 'real',
      texto: 'El dolor producido para ser mirado es casi de TikTok (12 de 15 videos). Mostrar la pareja para que la reconozcan se reparte parejo (12 y 13 videos) y cambia según quién codificó, así que no afirmamos un efecto de plataforma.'
    },
    encuesta: {
      texto: 'En la encuesta, la autenticidad fue lo más valorado de las cuentas que siguen (29,4 %) y TikTok se vio como más espontáneo (41,2 %). En los videos, lo más parecido a la espontaneidad, el dolor expuesto, está sobre todo en TikTok, pero también está producido.',
      enlace: 'cuantitativos.html#percepcion',
      enlaceTexto: 'Ver cómo se perciben las plataformas'
    },
    extra: null,
    citas: []
  },
  {
    id: 'rostro',
    slug: 'estetizacion-del-yo',
    region: 'Rostro',
    x: 50,
    y: 15,
    nombre: 'Estetización del yo',
    pregunta: '¿Qué cara le ponemos a lo cotidiano?',
    encontramos: 'En 73 de los 160 videos (46 %) la pareja se muestra en versión mejorada. Lo más común no es el cuerpo, sino lo cotidiano convertido en escena: un gesto de rutina contado como si fuera una película (50 videos). Le sigue el lugar como prueba de éxito, a menudo con viajes y lujo (23), y mucho menos el cuerpo como objeto de mirada (13).',
    significa: 'La estética dominante se parece menos a la belleza corporal que a lo cotidiano narrado y a los lugares de éxito: la pareja aparece como protagonista de su propia historia.',
    limites: 'Qué tan pronto se considera que algo es «escena» cambia según quién codifica, así que la cifra de lo cotidiano como escena es una aproximación.',
    hipotesis: null,
    total: { videos: 73, tiktok: 36, instagram: 37 },
    formas: [
      { etiqueta: 'Lo cotidiano contado como escena', videos: 50, tiktok: 26, instagram: 24 },
      { etiqueta: 'El lugar como prueba de éxito', videos: 23, tiktok: 11, instagram: 12 },
      { etiqueta: 'El cuerpo como objeto de mirada', videos: 13, tiktok: 7, instagram: 6 }
    ],
    diferencia: {
      tipo: 'ninguna',
      texto: 'No vemos una diferencia entre plataformas: 36 de los 73 videos de TikTok y 37 de los 87 de Instagram llevan alguna de estas marcas.'
    },
    encuesta: {
      texto: 'En la encuesta, la estetización del yo, que pregunta cuánto planeas y gestionas lo que publicas de tu vida afectiva, tuvo una de las puntuaciones más bajas (2,07 de 5). Aun así, el 63,2 % está de acuerdo o muy de acuerdo con que en Instagram hay más presión por publicar contenido que se vea «perfecto».',
      enlace: 'cuantitativos.html#sentir',
      enlaceTexto: 'Ver qué presión decimos sentir'
    },
    extra: null,
    citas: []
  },
  {
    id: 'pecho',
    slug: 'sujeto-productivamente-feliz',
    region: 'Pecho',
    x: 50,
    y: 40,
    nombre: 'Sujeto productivamente feliz',
    pregunta: '¿Una pareja feliz es una pareja que «rinde»?',
    encontramos: 'En 64 de los 160 videos (40 %) aparece algún rasgo de la felicidad como rendimiento. Lo más común es la pareja como logro: una meta alcanzada, una elección acertada o un proyecto que funciona (44 videos, 28 %). Enseñar a mejorarse es menos frecuente (21) y la positividad obligatoria casi no aparece (3). La felicidad se exhibe como resultado, más que como consejo.',
    significa: 'El «sujeto productivamente feliz» de estos videos no es el gurú que enseña ni quien repite «elige ser feliz», sino quien muestra que su pareja funciona.',
    limites: 'La frecuencia de «la pareja como logro» depende de quién codifica: unos aplican un criterio más estricto y otros más amplio. Con este tema no podemos afirmar que una plataforma lo muestre más que la otra.',
    hipotesis: 'Quizá estas lógicas se perciben poco porque llegan naturalizadas dentro de un formato de entretenimiento. Es una hipótesis, no un resultado.',
    total: { videos: 64, tiktok: 29, instagram: 35 },
    formas: [
      { etiqueta: 'La pareja como logro', videos: 44, tiktok: 17, instagram: 27 },
      { etiqueta: 'Enseñar a mejorarse', videos: 21, tiktok: 12, instagram: 9 },
      { etiqueta: 'Positividad sin grietas', videos: 3, tiktok: 1, instagram: 2 }
    ],
    diferencia: {
      tipo: 'artefacto',
      texto: 'La pareja como logro parece más frecuente en Instagram (27 videos frente a 17), pero esa diferencia viene de quiénes codificaron cada plataforma: con el mismo codificador, aparece casi igual en las dos (30 % en TikTok y 29 % en Instagram).'
    },
    encuesta: {
      texto: 'En la encuesta, «sujeto productivamente feliz» fue la dimensión con la puntuación más baja (1,85 de 5; escala poco precisa, se lee con cautela). Pocas personas sienten presión por aplicar de inmediato los consejos de relaciones (2,10 de 5). Compararse con las parejas que se siguen se asocia con menor satisfacción afectiva.',
      enlace: 'cuantitativos.html#sentir',
      enlaceTexto: 'Ver cómo nos sentimos después'
    },
    extra: null,
    citas: []
  },
  {
    id: 'pulso',
    slug: 'logicas-de-plataforma',
    region: 'Pulso',
    x: 50,
    y: 60,
    nombre: 'Lógicas de plataforma',
    pregunta: '¿Quién marca el ritmo de lo que vemos?',
    encontramos: 'Siete de cada diez videos (114 de 160) llevan alguna marca de la plataforma. Lo más común es usar un formato prestado, como un baile, un audio viral o una plantilla del tipo «Cuando…» o «POV» (88 videos); casi la mitad de esos formatos es humor (41 de 88). Los muros de hashtags aparecen en 72 videos, y 12 de ellos tienen diez o más etiquetas, todos de Instagram. Los llamados a comentar, seguir o comprar son raros (10).',
    significa: 'La plataforma funciona como la envoltura de la pareja mostrada como logro o como escena. Casi nunca acompaña al dolor ni al consejo: 13 de los 15 videos de dolor expuesto y 15 de los 21 de consejos no llevan ni formato prestado ni muro de hashtags.',
    limites: 'El formato prestado se juzgó viendo fotogramas, sin audio, y a partir de las notas de codificación. Los hashtags solo se registraron en los videos con muro de etiquetas, así que no podemos compararlos con los demás videos.',
    hipotesis: null,
    total: { videos: 114, tiktok: 46, instagram: 68 },
    formas: [
      { etiqueta: 'Seguir la tendencia (formato prestado)', videos: 88, tiktok: 31, instagram: 57 },
      { etiqueta: 'Muros de hashtags', videos: 72, tiktok: 32, instagram: 40 },
      { etiqueta: 'Pedir comentarios, seguimiento o compra', videos: 10, tiktok: 6, instagram: 4 }
    ],
    diferencia: {
      tipo: 'mezclada',
      texto: 'El formato prestado es más frecuente en Instagram (66 % frente a 42 % en TikTok), pero buena parte de esa diferencia viene de un bloque de videos de humor de pareja y de quién codificó: sin ese bloque, la cifra baja a 55 % frente a 42 %. Con estos códigos no se ve que TikTok sea más imitativo que Instagram.'
    },
    encuesta: {
      texto: 'En la encuesta, en promedio se está de acuerdo con que lo que se ve de parejas lo selecciona un algoritmo (3,76 de 5). Cerca de ocho de cada diez estudiantes ha intentado alguna vez modificar su algoritmo y alrededor del 17 % lo hace con frecuencia.',
      enlace: 'cuantitativos.html#algoritmo',
      enlaceTexto: 'Ver qué hacemos con el algoritmo'
    },
    extra: {
      titulo: 'El humor que no esperábamos',
      texto: 'El humor no estaba previsto en el muestreo: apareció al codificar. Es casi la mitad del formato prestado (41 de 88 videos, 47 %). En la encuesta pasa algo parecido: el humor, las bromas y los retos virales son el segundo formato más visto (55 menciones, después de las historias personales con 61) y el entretenimiento es la motivación principal (97 menciones). La mayor parte del humor de Instagram está en un solo bloque de videos, así que no podemos separar el efecto del humor del de quién codificó.',
      limites: 'Que el humor sea tan frecuente dentro del formato prestado se debe en parte a una regla del libro de códigos: el sketch cómico se codifica como formato prestado. El cruce muestra cuánto del formato prestado es humor; no prueba que el humor cause imitación. El humor se estudió a partir de las notas de codificación, sin crear un código nuevo.'
    },
    citas: []
  },
  {
    id: 'voz',
    slug: 'narrativas-del-vinculo',
    region: 'Voz',
    x: 50,
    y: 27,
    nombre: 'Narrativas del sujeto y el vínculo',
    pregunta: '¿Cómo dicen estos videos que debe ser el amor?',
    encontramos: 'En 34 videos (21 %) aparece un mandato sobre cómo debe ser o comportarse la pareja, casi siempre dirigido a la conducta del otro y con frecuencia a la del hombre. Tiene dos reversos: el control presentado como amor o como broma (11 videos) y la ruptura contada como crecimiento (8 videos, 7 de ellos de TikTok). El mandato llega sobre todo mostrando la relación como logro o como escena (19 de los 34) y menos enseñándola (8).',
    significa: 'El discurso dominante sobre el amor es normativo, y se dirige al comportamiento de la pareja más que al de quien habla.',
    limites: 'Estos códigos describen lo que se dice y solo se aplicaron donde había una narración transcrita o una frase clara: sus frecuencias no miden el discurso de todo el corpus (109 de los 160 videos no llevan ninguno). Que el control romantizado aparezca no prueba que haya control real ni violencia fuera del video.',
    hipotesis: null,
    total: { videos: 51, tiktok: 29, instagram: 22 },
    formas: [
      { etiqueta: 'Cómo debe ser la pareja (mandato)', videos: 34, tiktok: 17, instagram: 17 },
      { etiqueta: 'Control y celos como amor o broma', videos: 11, tiktok: 5, instagram: 6 },
      { etiqueta: 'La ruptura como crecimiento', videos: 8, tiktok: 7, instagram: 1 },
      { etiqueta: 'El yo como marca', videos: 7, tiktok: 2, instagram: 5 },
      { etiqueta: 'El amor se merece', videos: 5, tiktok: 2, instagram: 3 },
      { etiqueta: 'La felicidad es tu responsabilidad', videos: 4, tiktok: 3, instagram: 1 },
      { etiqueta: 'El cuerpo como proyecto', videos: 2, tiktok: 1, instagram: 1 }
    ],
    diferencia: {
      tipo: 'artefacto',
      texto: 'TikTok parece tener más (40 % de sus videos frente a 25 % de Instagram), pero tiene más videos transcritos (21 frente a 13) y estos códigos se aplican sobre todo donde hay transcripción: no es una diferencia de plataforma. Lo que sí es de TikTok es la ruptura como crecimiento (7 de 8 videos).'
    },
    encuesta: {
      texto: 'En la encuesta, la privacidad digital se valora como parte del cuidado mutuo (4,05 de 5) y se prefiere conversar antes que revisar las redes (3,39). En los videos, en cambio, el control y los celos circulan sobre todo como broma o como amor. Son pocos casos (5 de los 11 son humor): es un contraste, no una prueba.',
      enlace: 'cuantitativos.html#cuidado',
      enlaceTexto: 'Ver cuidar o vigilar'
    },
    extra: null,
    citas: []
  }
];

// Videos que comparten dos temas (informe de temas transversales). Grosor de las líneas de la capa
// «Qué temas viajan juntos». Es coocurrencia dentro de un mismo video, no difusión entre plataformas.
window.PARES = [
  { a: 'rostro', b: 'pulso', videos: 47 },
  { a: 'pecho', b: 'pulso', videos: 44 },
  { a: 'rostro', b: 'pecho', videos: 35 },
  { a: 'pulso', b: 'voz', videos: 30 },
  { a: 'pecho', b: 'voz', videos: 27 },
  { a: 'ojos', b: 'pulso', videos: 22 },
  { a: 'rostro', b: 'voz', videos: 21 },
  { a: 'ojos', b: 'rostro', videos: 20 },
  { a: 'ojos', b: 'voz', videos: 16 },
  { a: 'ojos', b: 'pecho', videos: 12 }
];
