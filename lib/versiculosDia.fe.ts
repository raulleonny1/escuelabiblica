import type { DiaLeccionId } from "@/lib/lecciones"

export type VersiculoDia = {
  cita: string
  texto: string
}

/** Un versículo distinto por día (dom–sáb), relacionado con el tema de cada lección */
const POR_SEMANA: Record<number, Record<DiaLeccionId, VersiculoDia>> = {
  1: {
    dom: {
      cita: "Hebreos 11:1",
      texto: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
    },
    lun: {
      cita: "Hebreos 11:6",
      texto: "Sin fe es imposible agradar a Dios; porque es necesario que el que se acerca a Dios crea que le existe.",
    },
    mar: {
      cita: "Romanos 4:20",
      texto: "No dudó, con desconfianza, de la promesa de Dios, sino que se fortaleció en fe.",
    },
    mie: {
      cita: "Hebreos 11:7",
      texto: "Por fe Noé, siendo advertido por Dios, preparó el arca para salvar su casa.",
    },
    jue: {
      cita: "Hebreos 11:8",
      texto: "Por la fe Abraham, siendo llamado, obedeció para salir al lugar que había de recibir como herencia.",
    },
    vie: {
      cita: "Hebreos 11:39",
      texto: "Todos éstos, aprobados por el testimonio de la fe, no recibieron lo prometido.",
    },
    sab: {
      cita: "Marcos 9:24",
      texto: "Creo; ayuda mi incredulidad.",
    },
  },
  2: {
    dom: {
      cita: "Romanos 10:17",
      texto: "Así que la fe es por el oír, y el oír, por la palabra de Dios.",
    },
    lun: {
      cita: "Salmo 119:105",
      texto: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
    },
    mar: {
      cita: "Josué 1:8",
      texto: "Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él.",
    },
    mie: {
      cita: "1 Samuel 3:10",
      texto: "Habla, Señor, porque tu siervo oye.",
    },
    jue: {
      cita: "2 Timoteo 3:16",
      texto: "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir.",
    },
    vie: {
      cita: "Salmo 1:2",
      texto: "Sino que en la ley de Jehová está su delicia, y en su ley medita de día y de noche.",
    },
    sab: {
      cita: "Salmo 19:7",
      texto: "La ley de Jehová es perfecta, que convierte el alma.",
    },
  },
  3: {
    dom: {
      cita: "Santiago 1:2-3",
      texto: "Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas, sabiendo que la prueba de vuestra fe produce paciencia.",
    },
    lun: {
      cita: "1 Pedro 1:7",
      texto: "Para que sometida a prueba vuestra fe, mucho más preciosa que el oro, sea hallada en alabanza.",
    },
    mar: {
      cita: "Job 23:10",
      texto: "Mas él conoce mi camino; me probará, y saldré como oro.",
    },
    mie: {
      cita: "Romanos 8:28",
      texto: "A los que aman a Dios, todas las cosas les ayudan a bien.",
    },
    jue: {
      cita: "2 Corintios 4:17",
      texto: "Porque esta leve tribulación momentánea produce en nosotros un eterno peso de gloria.",
    },
    vie: {
      cita: "Salmo 34:19",
      texto: "Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.",
    },
    sab: {
      cita: "Isaías 41:10",
      texto: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios.",
    },
  },
  4: {
    dom: {
      cita: "Santiago 2:17",
      texto: "Así también la fe, si no tiene obras, es muerta en sí misma.",
    },
    lun: {
      cita: "Juan 14:15",
      texto: "Si me amáis, guardad mis mandamientos.",
    },
    mar: {
      cita: "Hebreos 11:7",
      texto: "Por fe Noé preparó el arca, movido por temor, para salvar su casa.",
    },
    mie: {
      cita: "Génesis 22:18",
      texto: "En tu simiente serán benditas todas las naciones de la tierra, por cuanto obedeciste a mi voz.",
    },
    jue: {
      cita: "Santiago 2:26",
      texto: "Porque como el cuerpo sin espíritu está muerto, así también la fe sin obras está muerta.",
    },
    vie: {
      cita: "1 Juan 5:3",
      texto: "Pues este es el amor a Dios, que guardemos sus mandamientos.",
    },
    sab: {
      cita: "Mateo 7:21",
      texto: "No todo el que me dice: Señor, Señor, entrará en el reino de los cielos, sino el que hace la voluntad de mi Padre.",
    },
  },
  5: {
    dom: {
      cita: "Hebreos 12:2",
      texto: "Puestos los ojos en Jesús, el autor y consumador de la fe.",
    },
    lun: {
      cita: "Filipenses 2:8",
      texto: "Se humilló a sí mismo, haciéndose obediente hasta la muerte, y muerte de cruz.",
    },
    mar: {
      cita: "Gálatas 2:20",
      texto: "Vivo, mas no yo, sino Cristo vive en mí; y lo que ahora vivo en la carne, lo vivo en la fe del Hijo de Dios.",
    },
    mie: {
      cita: "Hebreos 2:9",
      texto: "Por un poco fue hecho menor que los ángeles, para que por la gracia de Dios gustase la muerte por todos.",
    },
    jue: {
      cita: "Colosenses 1:27",
      texto: "Cristo en vosotros, la esperanza de gloria.",
    },
    vie: {
      cita: "Hebreos 12:3",
      texto: "Considerad a aquel que sufrió tal contradicción de pecadores contra sí mismo, para que no os fatiguéis.",
    },
    sab: {
      cita: "Gálatas 6:14",
      texto: "Lejos esté de mí gloriarme, sino en la cruz de nuestro Señor Jesucristo.",
    },
  },
  6: {
    dom: {
      cita: "Santiago 5:16",
      texto: "La oración eficaz del justo puede mucho.",
    },
    lun: {
      cita: "Hebreos 11:6",
      texto: "Es necesario que el que se acerca a Dios crea que le existe, y que es galardonador de los que le buscan.",
    },
    mar: {
      cita: "Lucas 18:1",
      texto: "Es necesario orar siempre, y no desmayar.",
    },
    mie: {
      cita: "Santiago 5:17",
      texto: "Elías era hombre sujeto a pasiones semejantes a las nuestras, y oró fervientemente.",
    },
    jue: {
      cita: "Filipenses 4:6",
      texto: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración.",
    },
    vie: {
      cita: "1 Tesalonicenses 5:17",
      texto: "Orad sin cesar.",
    },
    sab: {
      cita: "Mateo 21:22",
      texto: "Todo lo que pidiereis en oración, creyendo, lo recibiréis.",
    },
  },
  7: {
    dom: {
      cita: "2 Timoteo 1:7",
      texto: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.",
    },
    lun: {
      cita: "1 Juan 4:18",
      texto: "En el amor no hay temor, sino que el perfecto amor echa fuera el temor.",
    },
    mar: {
      cita: "Josué 1:9",
      texto: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo.",
    },
    mie: {
      cita: "Salmo 56:3",
      texto: "En el día que temo, yo en ti confío.",
    },
    jue: {
      cita: "Isaías 41:13",
      texto: "Porque yo Jehová tu Dios te sostengo de tu mano derecha, y te digo: No temas, yo te ayudo.",
    },
    vie: {
      cita: "Salmo 27:1",
      texto: "Jehová es mi luz y mi salvación; ¿de quién temeré?",
    },
    sab: {
      cita: "Josué 1:7",
      texto: "Solamente esfuérzate y sé muy valiente para cuidar de hacer conforme a toda la ley.",
    },
  },
  8: {
    dom: {
      cita: "Efesios 4:32",
      texto: "Perdonándoos unos a otros, como Dios también os perdonó a vosotros en Cristo.",
    },
    lun: {
      cita: "1 Juan 1:9",
      texto: "Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados.",
    },
    mar: {
      cita: "Mateo 6:14",
      texto: "Porque si perdonáis a los hombres sus ofensas, os perdonará también vuestro Padre celestial.",
    },
    mie: {
      cita: "Génesis 50:20",
      texto: "Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien.",
    },
    jue: {
      cita: "Colosenses 3:13",
      texto: "Soportándoos unos a otros, y perdonándoos unos a otros si alguno tuviere queja contra otro.",
    },
    vie: {
      cita: "Salmo 32:1",
      texto: "Bienaventurado aquel cuya transgresión es perdonada, y cubierto su pecado.",
    },
    sab: {
      cita: "Lucas 23:34",
      texto: "Padre, perdónalos, porque no saben lo que hacen.",
    },
  },
  9: {
    dom: {
      cita: "Tito 2:13",
      texto: "Aguardando la esperanza bienaventurada y la manifestación gloriosa de nuestro gran Dios y Salvador Jesucristo.",
    },
    lun: {
      cita: "1 Tesalonicenses 4:16",
      texto: "Porque el Señor mismo con voz de mando descenderá del cielo.",
    },
    mar: {
      cita: "Juan 14:3",
      texto: "Vendré otra vez, y os tomaré a mí mismo, para que donde yo estoy, vosotros también estéis.",
    },
    mie: {
      cita: "Hechos 1:11",
      texto: "Este mismo Jesús, que ha sido tomado de vosotros al cielo, así vendrá como le habéis visto ir al cielo.",
    },
    jue: {
      cita: "Apocalipsis 22:20",
      texto: "El que da testimonio de estas cosas dice: Ciertamente vengo en breve. Amén; sí, ven, Señor Jesús.",
    },
    vie: {
      cita: "2 Pedro 3:13",
      texto: "Según su promesa, esperamos nuevos cielos y nueva tierra, en los cuales mora la justicia.",
    },
    sab: {
      cita: "Mateo 24:42",
      texto: "Velad, pues, porque no sabéis a qué hora ha de venir vuestro Señor.",
    },
  },
  10: {
    dom: {
      cita: "Gálatas 5:22",
      texto: "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe.",
    },
    lun: {
      cita: "Efesios 5:18",
      texto: "Sed llenos del Espíritu.",
    },
    mar: {
      cita: "Romanos 8:14",
      texto: "Porque todos los que son guiados por el Espíritu de Dios, éstos son hijos de Dios.",
    },
    mie: {
      cita: "Hechos 1:8",
      texto: "Recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo.",
    },
    jue: {
      cita: "Juan 14:26",
      texto: "El Espíritu Santo, a quien el Padre enviará en mi nombre, os enseñará todas las cosas.",
    },
    vie: {
      cita: "1 Corintios 12:7",
      texto: "Pero a cada uno le es dada la manifestación del Espíritu para provecho.",
    },
    sab: {
      cita: "Ezequiel 36:27",
      texto: "Pondré dentro de vosotros mi espíritu, y haré que andéis en mis estatutos.",
    },
  },
  11: {
    dom: {
      cita: "Hebreos 10:25",
      texto: "No dejando de congregarnos, como algunos tienen por costumbre, sino exhortándonos.",
    },
    lun: {
      cita: "1 Corintios 12:12",
      texto: "De la manera que el cuerpo es uno, y tiene muchos miembros, pero todos los miembros del cuerpo, siendo muchos, son un solo cuerpo, así también Cristo.",
    },
    mar: {
      cita: "Proverbios 27:17",
      texto: "Hierro con hierro se aguza; y el hombre aguza el rostro de su amigo.",
    },
    mie: {
      cita: "Hechos 2:42",
      texto: "Y perseveraban en la doctrina de los apóstoles, en la comunión unos con otros, en el partimiento del pan y en las oraciones.",
    },
    jue: {
      cita: "Romanos 12:5",
      texto: "Así nosotros, siendo muchos, somos un solo cuerpo en Cristo, y todos miembros los unos de los otros.",
    },
    vie: {
      cita: "Hebreos 10:24",
      texto: "Considerémonos unos a otros para estimularnos al amor y a las buenas obras.",
    },
    sab: {
      cita: "Eclesiastés 4:9",
      texto: "Mejores son dos que uno; porque tienen mejor paga de su trabajo.",
    },
  },
  12: {
    dom: {
      cita: "Gálatas 5:6",
      texto: "Porque en Jesucristo ni la circuncisión vale algo, ni la incircuncisión, sino la fe que obra por el amor.",
    },
    lun: {
      cita: "Santiago 2:18",
      texto: "Muéstrame tu fe sin tus obras, y yo te mostraré mi fe por mis obras.",
    },
    mar: {
      cita: "Mateo 25:40",
      texto: "De cierto os digo que en cuanto lo hicisteis a uno de estos mis hermanos más pequeños, a mí lo hicisteis.",
    },
    mie: {
      cita: "1 Pedro 4:10",
      texto: "Cada uno según el don que ha recibido, minístrelo a los otros, como buenos administradores.",
    },
    jue: {
      cita: "Gálatas 6:9",
      texto: "No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos, si no desmayamos.",
    },
    vie: {
      cita: "Miqueas 6:8",
      texto: "Oh hombre, él te ha declarado qué es lo bueno; hacer justicia, amar misericordia, y humillarte ante tu Dios.",
    },
    sab: {
      cita: "Marcos 10:45",
      texto: "El Hijo del Hombre no vino para ser servido, sino para servir.",
    },
  },
  13: {
    dom: {
      cita: "Hebreos 10:23",
      texto: "Mantengamos firme la profesión de nuestra fe sin fluctuar; porque fiel es el que prometió.",
    },
    lun: {
      cita: "Gálatas 6:9",
      texto: "No nos cansemos de hacer bien; porque a su tiempo segaremos, si no desmayamos.",
    },
    mar: {
      cita: "Hebreos 12:1",
      texto: "Corramos con paciencia la carrera que tenemos por delante.",
    },
    mie: {
      cita: "Hebreos 6:19",
      texto: "La cual tenemos como segura y firme ancla del alma.",
    },
    jue: {
      cita: "Efesios 6:13",
      texto: "Tomad toda la armadura de Dios, para que podáis resistir en el día malo.",
    },
    vie: {
      cita: "Hebreos 12:1",
      texto: "Puestos los ojos en Jesús, el autor y consumador de la fe.",
    },
    sab: {
      cita: "2 Timoteo 4:7",
      texto: "He peleado la buena batalla, he acabado la carrera, he guardado la fe.",
    },
  },
}

export function getVersiculoDelDia(
  semana: number,
  dia: DiaLeccionId
): VersiculoDia | null {
  const n = Math.min(Math.max(Math.floor(semana), 1), 13)
  return POR_SEMANA[n]?.[dia] ?? null
}
