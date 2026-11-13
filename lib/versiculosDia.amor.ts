import type { DiaLeccionId } from "@/lib/lecciones"

export type VersiculoDia = { cita: string; texto: string }

const POR_SEMANA: Record<number, Record<DiaLeccionId, VersiculoDia>> = {
  1: {
    dom: {
      cita: "Efesios 1:4",
      texto:
        "Según nos escogió en él antes de la fundación del mundo, para que fuésemos santos y sin mancha delante de él, en amor.",
    },
    lun: {
      cita: "Efesios 1:3",
      texto:
        "Bendito sea el Dios y Padre de nuestro Señor Jesucristo, que nos bendijo con toda bendición espiritual en los lugares celestiales en Cristo.",
    },
    mar: {
      cita: "Efesios 1:5",
      texto:
        "Nos predestinó para ser adoptados hijos suyos por medio de Jesucristo, según el puro afecto de su voluntad.",
    },
    mie: {
      cita: "Efesios 1:6",
      texto:
        "Para alabanza de la gloria de su gracia, con la cual nos hizo aceptos en el Amado.",
    },
    jue: {
      cita: "Jeremías 31:3",
      texto:
        "Jehová se manifestó a mí desde lejos, diciendo: Con amor eterno te he amado; por tanto, te prolongué mi misericordia.",
    },
    vie: {
      cita: "Romanos 8:38-39",
      texto:
        "Ni lo presente, ni lo porvenir… ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús nuestro Señor.",
    },
    sab: {
      cita: "1 Juan 4:19",
      texto: "Nosotros le amamos a él, porque él nos amó primero.",
    },
  },
  2: {
    dom: {
      cita: "Romanos 5:8",
      texto:
        "Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.",
    },
    lun: {
      cita: "Romanos 5:6",
      texto:
        "Porque Cristo, cuando aún éramos débiles, a su tiempo murió por los impíos.",
    },
    mar: {
      cita: "Romanos 5:9-10",
      texto:
        "Siendo, pues, enemigos, fuimos reconciliados con Dios por la muerte de su Hijo.",
    },
    mie: {
      cita: "Isaías 53:5",
      texto:
        "Mas él herido fue por nuestras rebeliones, molido por nuestros pecados; el castigo de nuestra paz fue sobre él, y por su llaga fuimos nosotros curados.",
    },
    jue: {
      cita: "Romanos 5:11",
      texto:
        "Y no solo esto, sino también nos gloriamos en Dios por el Señor nuestro Jesucristo, por quien ahora hemos recibido la reconciliación.",
    },
    vie: {
      cita: "1 Juan 3:16",
      texto:
        "En esto conocemos lo que es el amor: en que él puso su vida por nosotros.",
    },
    sab: {
      cita: "Gálatas 2:20",
      texto:
        "El Hijo de Dios, quien me amó y se entregó a sí mismo por mí.",
    },
  },
  3: {
    dom: {
      cita: "Lucas 15:4",
      texto:
        "¿Qué hombre de vosotros, teniendo cien ovejas, si pierde una de ellas, no deja las noventa y nueve en el desierto, e va tras la que se perdió, hasta que la halle?",
    },
    lun: {
      cita: "Lucas 15:7",
      texto:
        "Os digo que así habrá gozo en el cielo por un pecador que se arrepiente.",
    },
    mar: {
      cita: "Lucas 15:20",
      texto:
        "Vio al padre… y corrió, y echóse sobre su cuello, y le besó.",
    },
    mie: {
      cita: "Lucas 15:24",
      texto:
        "Este mi hijo muerto era, y ha revivido; se había perdido, y ha sido hallado.",
    },
    jue: {
      cita: "Lucas 19:10",
      texto:
        "Porque el Hijo del Hombre vino a buscar y a salvar lo que se había perdido.",
    },
    vie: {
      cita: "Miqueas 7:18",
      texto:
        "¿Qué Dios como tú, que perdona la maldad… no retiene para siempre su ira, porque se deleita en misericordia?",
    },
    sab: {
      cita: "Salmo 23:1",
      texto: "Jehová es mi pastor; nada me faltará.",
    },
  },
  4: {
    dom: {
      cita: "Hebreos 12:6",
      texto:
        "Porque al que ama, castiga, como el padre al hijo a quien quiere.",
    },
    lun: {
      cita: "Proverbios 3:11-12",
      texto:
        "Hijo mío, no menosprecies el castigo de Jehová… porque Jehová al que ama, disciplina, como el padre al hijo a quien quiere.",
    },
    mar: {
      cita: "Hebreos 12:10-11",
      texto:
        "Dios nos disciplina para nuestro beneficio, para que participemos de su santidad… después da fruto apacible de justicia.",
    },
    mie: {
      cita: "Salmo 119:75",
      texto:
        "He conocido, oh Jehová, que tus juicios son justicia, y que por tu fidelidad me afligiste.",
    },
    jue: {
      cita: "Apocalipsis 3:19",
      texto:
        "Yo reprendo y castigo a todos los que amo; sé, pues, celoso, y arrepiéntete.",
    },
    vie: {
      cita: "Job 5:17",
      texto:
        "He aquí, bienaventurado es el hombre a quien Dios castiga; no deseches, pues, la disciplina del Todopoderoso.",
    },
    sab: {
      cita: "Salmo 94:12-13",
      texto:
        "Bienaventurado el hombre a quien tú, oh Jehová, disciplinas… para darle descanso en los días malos.",
    },
  },
  5: {
    dom: {
      cita: "Mateo 5:44",
      texto:
        "Amad a vuestros enemigos, bendecid a los que os maldicen, haced bien a los que os aborrecen, y orad por los que os ultrajan y os persiguen.",
    },
    lun: {
      cita: "Mateo 5:45",
      texto:
        "Para que seáis hijos de vuestro Padre que está en los cielos; que hace salir su sol sobre malos y buenos, y que hace llover sobre justos e injustos.",
    },
    mar: {
      cita: "Mateo 5:48",
      texto: "Sed, pues, vosotros perfectos, como vuestro Padre celestial es perfecto.",
    },
    mie: {
      cita: "Romanos 12:20",
      texto:
        "Si tu enemigo tuviere hambre, dale de comer… porque haciendo esto, amontonarás ascuas de fuego sobre su cabeza.",
    },
    jue: {
      cita: "Lucas 6:27",
      texto: "Amad a vuestros enemigos, y haced bien, y prestad, no esperando de ello nada.",
    },
    vie: {
      cita: "1 Pedro 3:9",
      texto:
        "No volviendo mal por mal, ni maldición por maldición, sino por el contrario bendiciendo.",
    },
    sab: {
      cita: "Proverbios 25:21-22",
      texto:
        "Si el que te aborrece tuviere hambre, dale de comer pan… porque ascuas amontonarás sobre su cabeza.",
    },
  },
  6: {
    dom: {
      cita: "Juan 1:14",
      texto:
        "Y aquel Verbo fue hecho carne, y habitó entre nosotros, y vimos su gloria, gloria como del unigénito del Padre, lleno de gracia y de verdad.",
    },
    lun: {
      cita: "Juan 1:1",
      texto: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
    },
    mar: {
      cita: "Juan 1:12",
      texto:
        "Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.",
    },
    mie: {
      cita: "Filipenses 2:7",
      texto:
        "Sino que se despojó a sí mismo, tomando forma de siervo… y siendo hallado en la condición de hombre.",
    },
    jue: {
      cita: "Mateo 1:23",
      texto:
        "He aquí, la virgen concebirá y dará a luz un hijo, y llamará su nombre Emanuel, que traducido es: Con nosotros Dios.",
    },
    vie: {
      cita: "Juan 1:16",
      texto: "Porque de su plenitud tomamos todos, y gracia sobre gracia.",
    },
    sab: {
      cita: "1 Juan 4:9",
      texto:
        "En esto se mostró el amor de Dios para con nosotros, en que Dios envió a su Hijo unigénito al mundo, para que vivamos por él.",
    },
  },
  7: {
    dom: {
      cita: "Romanos 8:37",
      texto:
        "Mas en todas estas cosas somos más que vencedores por medio de aquel que nos amó.",
    },
    lun: {
      cita: "Romanos 8:31",
      texto: "Si Dios es por nosotros, ¿quién contra nosotros?",
    },
    mar: {
      cita: "Romanos 8:35",
      texto:
        "¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?",
    },
    mie: {
      cita: "Romanos 8:34",
      texto:
        "Cristo Jesús es el que murió, más aún, el que también resucitó… el cual también intercede por nosotros.",
    },
    jue: {
      cita: "Romanos 8:38-39",
      texto:
        "Ni la muerte, ni la vida… ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús nuestro Señor.",
    },
    vie: {
      cita: "Salmo 118:6",
      texto: "Jehová está conmigo; no temeré lo que me pueda hacer el hombre.",
    },
    sab: {
      cita: "Juan 10:28",
      texto:
        "Y yo les doy vida eterna; y no perecerán jamás, ni nadie las arrebatará de mi mano.",
    },
  },
  8: {
    dom: {
      cita: "Lamentaciones 3:22-23",
      texto:
        "Por la misericordia de Jehová no somos consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.",
    },
    lun: {
      cita: "Lamentaciones 3:24",
      texto:
        "Jehová es mi porción, ha dicho mi alma; por tanto, en él esperaré.",
    },
    mar: {
      cita: "1 Samuel 7:12",
      texto:
        "Entonces Samuel tomó una piedra y la levantó… y llamó su nombre Eben-ezer, diciendo: Hasta aquí nos ayudó Jehová.",
    },
    mie: {
      cita: "Salmo 103:8",
      texto:
        "Misericordioso y clemente es Jehová; lento para la ira, y grande en misericordia.",
    },
    jue: {
      cita: "Isaías 40:31",
      texto:
        "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.",
    },
    vie: {
      cita: "Salmo 136:1",
      texto:
        "Porque para siempre es su misericordia. Alabad a Jehová, porque es bueno.",
    },
    sab: {
      cita: "Deuteronomio 7:9",
      texto:
        "Conocerás, pues, que Jehová tu Dios es Dios, el Dios fiel, que guarda el pacto y la misericordia.",
    },
  },
}

export function getVersiculoDelDia(
  semana: number,
  dia: DiaLeccionId
): VersiculoDia | null {
  const n = Math.min(Math.max(Math.floor(semana), 1), 8)
  return POR_SEMANA[n]?.[dia] ?? null
}
