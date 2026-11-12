// DATOS REALES AGREGADOS de la encuesta (Resultados · bloque cuantitativo, N = 136).
// Fuente: informe del Objetivo 1 y Reporte_EcAfectivas_v2_N136 (texto de los ítems tomado del instrumento).
// NO enviar a Antigravity. Se copia a prototipo/js/encuesta.js después de que Gemini construya con datos de ejemplo.
// Los campos `pendiente` son notas internas: no se muestran y se quitan antes de publicar.
// unidad: '%' (porcentaje sobre las 136 personas) | 'menciones' (selección múltiple: conteos más `base`; el gráfico los muestra como % de la base, con el conteo al lado) | 'media' (escala de 1 a 5).

window.ENCUESTA = {
  n: 136,
  muestra: {
    texto: 'Respondieron 136 estudiantes del programa de Psicología de la Fundación Universitaria del Área Andina, sede Pereira, entre febrero y mayo de 2026. Participaron voluntariamente: no es una muestra representativa de todos los estudiantes.',
    destacados: [
      { valor: '136', rotulo: 'estudiantes respondieron' },
      { valor: '86,8 %', rotulo: 'son mujeres' },
      { valor: '20 años', rotulo: 'edad promedio (de 16 a 32)' }
    ],
    grafico: {
      id: 'plataforma',
      titulo: 'Plataforma que más usan',
      unidad: '%',
      maximo: 100,
      filas: [
        { etiqueta: 'TikTok', valor: 47.1 },
        { etiqueta: 'Ambas por igual', valor: 38.2 },
        { etiqueta: 'Instagram', valor: 14.7 }
      ]
    }
  },
  secciones: [
    {
      id: 'consumo',
      pregunta: '¿Cuánto y para qué ves contenido de pareja?',
      objetivo: 'Objetivo 1 · se relaciona con el 2',
      texto: 'La mayoría dedica 30 minutos o menos al día a ver contenido de pareja (63,9 %) y lo hace sobre todo para entretenerse. Las historias personales y el humor son los formatos que más se ven.',
      destacados: [
        { valor: '63,9 %', rotulo: 'dedica 30 minutos o menos al día' },
        { valor: '20,6 %', rotulo: 'dedica más de una hora' }
      ],
      graficos: [
        {
          id: 'tiempo',
          titulo: '¿Cuánto tiempo al día?',
          unidad: '%',
          maximo: 100,
          filas: [
            { etiqueta: 'Menos de 15 minutos', valor: 36.0 },
            { etiqueta: 'Entre 16 y 30 minutos', valor: 27.9 },
            { etiqueta: 'Entre 31 y 60 minutos', valor: 15.4 },
            { etiqueta: 'Más de una hora', valor: 20.6 }
          ]
        },
        {
          id: 'motivaciones',
          titulo: '¿Por qué lo ves?',
          unidad: 'menciones',
          base: 136,
          maximo: 100,
          nota: 'Selección múltiple: cada persona pudo marcar varias opciones, por eso los porcentajes suman más de 100 %. Porcentajes sobre las 136 personas.',
          filas: [
            { etiqueta: 'Entretenimiento', valor: 97 },
            { etiqueta: 'Ideas para las relaciones', valor: 45 },
            { etiqueta: 'Curiosidad sobre tendencias', valor: 42 },
            { etiqueta: 'Cercanía o identificación', valor: 19 },
            { etiqueta: 'Comparación social', valor: 9 }
          ]
        },
        {
          id: 'formatos',
          titulo: '¿Qué formato ves más?',
          unidad: 'menciones',
          base: 136,
          maximo: 100,
          nota: 'Selección múltiple: cada persona pudo marcar varias opciones, por eso los porcentajes suman más de 100 %. Porcentajes sobre las 136 personas.',
          filas: [
            { etiqueta: 'Historias personales y experiencias afectivas', valor: 61 },
            { etiqueta: 'Humor, bromas y retos virales', valor: 55 },
            { etiqueta: 'Vlogs cotidianos', valor: 45 },
            { etiqueta: 'Consejos de relación', valor: 44 },
            { etiqueta: 'Lujo y viajes', valor: 32 },
            { etiqueta: 'Sexualidad e intimidad', valor: 8 }
          ]
        }
      ],
      significa: 'El contenido de pareja se ve más como entretenimiento que como una búsqueda consciente de orientación para las relaciones.',
      limite: 'Son respuestas de 136 estudiantes que participaron voluntariamente: no representan a todos los estudiantes.',
      relacion: {
        texto: 'En los videos pasa algo parecido: casi la mitad del formato prestado (tendencias, plantillas, bailes) es humor.',
        enlace: 'tema.html?tema=pulso',
        enlaceTexto: 'Ver el tema Lógicas de plataforma'
      }
    },
    {
      id: 'algoritmo',
      pregunta: '¿Qué haces con el algoritmo?',
      objetivo: 'Objetivo 1 · se relaciona con el 2',
      texto: 'Cerca de ocho de cada diez estudiantes ha intentado alguna vez modificar su algoritmo, y alrededor del 17 % lo hace con frecuencia: hay una sensación de agencia sobre lo que se recomienda. Guardar contenido es poco común, pero una de cada cuatro personas siente ansiedad si pasa un día sin revisar sus redes.',
      destacados: [],
      graficos: [
        {
          id: 'modificar',
          titulo: '¿Has intentado «limpiar» o «resetear» tu algoritmo de parejas?',
          unidad: '%',
          maximo: 100,
          nota: 'Se muestran las dos categorías de respuesta. Porcentajes sobre las 136 personas.',
          filas: [
            { etiqueta: 'Alguna vez', valor: 59.6 },
            { etiqueta: 'Con frecuencia', valor: 16.9 }
          ]
        },
        {
          id: 'enganche',
          titulo: '¿Y el vínculo con las redes?',
          unidad: '%',
          maximo: 100,
          filas: [
            { etiqueta: 'Guardan contenido con poca frecuencia (1 o 2 de 5)', valor: 60.3 },
            { etiqueta: 'Sienten ansiedad si pasan un día sin revisar sus redes (4 o 5 de 5)', valor: 25.0 }
          ]
        },
        {
          id: 'sentido',
          titulo: 'Algoritmo y tendencias (media de 1 a 5)',
          unidad: 'media',
          maximo: 5,
          filas: [
            { etiqueta: 'Entiendo que lo que veo de parejas lo selecciona un algoritmo', valor: 3.76 },
            { etiqueta: 'Uso etiquetas como #couplegoals o imito tendencias de pareja en mis redes', valor: 1.33 }
          ]
        }
      ],
      significa: 'La intensidad del vínculo con las plataformas no se explica solo por el tiempo que se les dedica.',
      limite: 'Las dos primeras barras son las categorías «alguna vez» y «con frecuencia»; su suma es cercana a ocho de cada diez.',
      pendiente: 'q13: el informe dice 77,9 % «al menos una vez» (59,6 + 16,9 = 76,5). Verificar el conteo real en la hoja de respuestas. Mientras tanto no se publica el 77,9 %.',
      relacion: {
        texto: 'En los videos, siete de cada diez llevan alguna marca de la plataforma. En sus propias redes, en cambio, los estudiantes casi no usan etiquetas ni imitan tendencias de pareja (1,33 de 5).',
        enlace: 'tema.html?tema=pulso',
        enlaceTexto: 'Ver el tema Lógicas de plataforma'
      }
    },
    {
      id: 'percepcion',
      pregunta: '¿Cómo se ven Instagram y TikTok?',
      objetivo: 'Objetivo 3',
      texto: 'Cuatro de cada diez estudiantes (41,2 %) ven a TikTok como más espontáneo y solo 11,0 % señala a Instagram. Pero uno de cada tres (32,4 %) cree que en ninguna de las dos el contenido de pareja es auténtico.',
      destacados: [
        { valor: '63,2 %', rotulo: 'está de acuerdo o muy de acuerdo con que en Instagram hay más presión por publicar contenido que se vea «perfecto»' }
      ],
      graficos: [
        {
          id: 'espontaneo',
          titulo: '¿En cuál el contenido de pareja es más espontáneo y auténtico?',
          unidad: '%',
          maximo: 100,
          filas: [
            { etiqueta: 'TikTok', valor: 41.2 },
            { etiqueta: 'En ninguna de las dos', valor: 32.4 },
            { etiqueta: 'En ambas por igual', valor: 15.4 },
            { etiqueta: 'Instagram', valor: 11.0 }
          ]
        },
        {
          id: 'presion-grupo',
          titulo: 'Presión estética percibida en Instagram, según el grupo (1 a 5)',
          unidad: 'media',
          maximo: 5,
          filas: [
            { etiqueta: 'Creen que en ninguna es auténtico', valor: 4.07 },
            { etiqueta: 'Ven a TikTok como más espontáneo', valor: 3.88 }
          ]
        }
      ],
      significa: 'Desconfiar del ideal no basta para librarse de la presión que ejerce.',
      limite: 'Esto es lo que perciben los estudiantes que respondieron. Cuando miramos los videos, la diferencia entre plataformas no aparece con la misma fuerza.',
      relacion: {
        texto: 'En los videos, lo que sí distingue a TikTok es el dolor expuesto y la ruptura contada como crecimiento; no se ve que sea más imitativo que Instagram.',
        enlace: 'conclusiones.html#plataformas',
        enlaceTexto: 'Ver qué se desprende'
      }
    },
    {
      id: 'sentir',
      pregunta: '¿Cómo nos sentimos después?',
      objetivo: 'Objetivo 1 · se relaciona con el 2',
      texto: 'Siete de cada diez estudiantes dicen que su ánimo queda igual tras ver contenido de parejas «ideales» por más de 15 minutos. Quienes salen peor tienen menos satisfacción con su vida afectiva. Compararse con las parejas que se siguen también se asocia con menor satisfacción (r = −0,38), y las mujeres reportan compararse más que los hombres (2,42 frente a 1,76 de 5; con solo 17 hombres en la muestra, esta diferencia pide cautela). El tiempo que se dedica a ver no predice cómo queda el ánimo.',
      destacados: [],
      graficos: [
        {
          id: 'estado',
          titulo: 'Ánimo después de ver parejas «ideales» por más de 15 minutos',
          unidad: '%',
          maximo: 100,
          filas: [
            { etiqueta: 'Queda igual', valor: 72.1 },
            { etiqueta: 'Queda peor', valor: 19.9 },
            { etiqueta: 'Queda mejor', valor: 8.1 }
          ]
        },
        {
          id: 'satisfaccion',
          titulo: 'Satisfacción con la vida afectiva, según cómo queda el ánimo (1 a 5)',
          unidad: 'media',
          maximo: 5,
          filas: [
            { etiqueta: 'Queda peor', valor: 2.70 },
            { etiqueta: 'Queda igual', valor: 3.78 },
            { etiqueta: 'Queda mejor', valor: 4.00 }
          ]
        },
        {
          id: 'presion',
          titulo: 'Qué tanta presión decimos sentir (1 a 5)',
          unidad: 'media',
          maximo: 5,
          filas: [
            { etiqueta: 'Compararme con las parejas que sigo', valor: 2.35 },
            { etiqueta: 'Planear y gestionar cómo me muestro al publicar', valor: 2.13 },
            { etiqueta: 'Aplicar de inmediato los consejos de relaciones', valor: 2.10 },
            { etiqueta: 'Que los likes y comentarios influyan en cómo valoro mi relación', valor: 1.68 }
          ]
        }
      ],
      significa: 'El tiempo de consumo no explica cómo quedamos; la comparación social sí se asocia con sentirse menos satisfecho.',
      limite: 'Son asociaciones, no causas, en una muestra pequeña y casi toda de mujeres. Las medias de escalas cortas se leen con cautela.',
      relacion: {
        texto: 'Las presiones que decimos sentir son bajas, pero los videos muestran la pareja como logro en 28 % de los casos y lo cotidiano como escena en 31 %. Es una tensión que miramos en las conclusiones.',
        enlace: 'conclusiones.html#tensiones',
        enlaceTexto: 'Ver las tensiones'
      }
    },
    {
      id: 'cuidado',
      pregunta: '¿Cuidar o vigilar?',
      objetivo: 'Objetivo 1 · se relaciona con el 2',
      texto: 'Los estudiantes valoran mucho la privacidad digital como parte del cuidado mutuo (4,05 de 5) y prefieren hablar antes que revisar las redes para saber qué pasa en la relación (3,39). Revisar la actividad de la pareja y sentir que una relación debe publicarse para ser válida puntúan bajo.',
      destacados: [],
      graficos: [
        {
          id: 'cuidado-items',
          titulo: 'Qué tan de acuerdo o con qué frecuencia (1 a 5)',
          unidad: 'media',
          maximo: 5,
          filas: [
            { etiqueta: 'Respetar la privacidad digital es parte del cuidado mutuo', valor: 4.05 },
            { etiqueta: 'Prefiero hablar y acordar antes que revisar redes', valor: 3.39 },
            { etiqueta: 'Las parejas acuerdan o exigen publicar como señal de la relación', valor: 2.82 },
            { etiqueta: 'Reviso con quién interactúa mi pareja en redes', valor: 2.11 },
            { etiqueta: 'Una relación debe publicarse para ser válida socialmente', valor: 1.64 }
          ]
        }
      ],
      significa: 'Declaramos valorar la privacidad y el diálogo mucho más que revisar o exigir publicar.',
      limite: 'La escala de vigilancia relacional tiene baja consistencia interna (α = 0,51): por eso se muestran los ítems por separado y no un promedio de la escala.',
      relacion: {
        texto: 'En los videos, el control y los celos aparecen como amor o como broma en 11 de 160 videos, y 5 de esos 11 son humor. Es un contraste con lo que se declara valorar, no una prueba.',
        enlace: 'tema.html?tema=voz',
        enlaceTexto: 'Ver el tema Narrativas del sujeto y el vínculo'
      }
    }
  ]
};
