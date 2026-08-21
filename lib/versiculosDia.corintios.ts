import type { DiaLeccionId } from "@/lib/lecciones"

export type VersiculoDia = {
  cita: string
  texto: string
}

/** Un versículo distinto por día (dom–sáb), relacionado con el tema de cada lección de Corintios */
const POR_SEMANA: Record<number, Record<DiaLeccionId, VersiculoDia>> = {
  1: {
    dom: {
      cita: "1 Corintios 1:10",
      texto:
        "Os ruego, pues, hermanos, por el nombre de nuestro Señor Jesucristo, que habléis todos una misma cosa, y que no haya entre vosotros divisiones.",
    },
    lun: {
      cita: "1 Corintios 1:13",
      texto: "¿Acaso está dividido Cristo? ¿Fue crucificado Pablo por vosotros?",
    },
    mar: {
      cita: "1 Corintios 3:11",
      texto:
        "Porque nadie puede poner otro fundamento que el que está puesto, el cual es Jesucristo.",
    },
    mie: {
      cita: "Efesios 2:20",
      texto:
        "Edificados sobre el fundamento de los apóstoles y profetas, siendo la principal piedra del ángulo Jesucristo mismo.",
    },
    jue: {
      cita: "1 Corintios 1:9",
      texto:
        "Fiel es Dios, por el cual fuisteis llamados a la comunión con su Hijo Jesucristo nuestro Señor.",
    },
    vie: {
      cita: "Colosenses 1:18",
      texto:
        "Y él es la cabeza del cuerpo que es la iglesia, él que es el principio, el primogénito de entre los muertos.",
    },
    sab: {
      cita: "1 Corintios 1:17",
      texto:
        "Porque no me envió Cristo a bautizar, sino a predicar el evangelio; no con sabiduría de palabras, para que no se haga vana la cruz de Cristo.",
    },
  },
  2: {
    dom: {
      cita: "1 Corintios 1:18",
      texto:
        "Porque la palabra de la cruz es locura a los que se pierden; pero a los que se salvan, esto es, a nosotros, es poder de Dios.",
    },
    lun: {
      cita: "1 Corintios 1:23-24",
      texto:
        "Nosotros predicamos a Cristo crucificado… para los llamados, Cristo poder de Dios, y sabiduría de Dios.",
    },
    mar: {
      cita: "1 Corintios 2:2",
      texto:
        "Pues me propuse no saber entre vosotros cosa alguna sino a Jesucristo, y a éste crucificado.",
    },
    mie: {
      cita: "1 Corintios 2:12",
      texto:
        "Y nosotros no hemos recibido el espíritu del mundo, sino el Espíritu que proviene de Dios, para que sepamos lo que Dios nos ha concedido.",
    },
    jue: {
      cita: "1 Corintios 2:14",
      texto:
        "Pero el hombre natural no percibe las cosas que son del Espíritu de Dios, porque le parecen locura.",
    },
    vie: {
      cita: "1 Corintios 1:25",
      texto:
        "Porque lo insensato de Dios es más sabio que los hombres, y lo débil de Dios es más fuerte que los hombres.",
    },
    sab: {
      cita: "1 Corintios 2:16",
      texto: "Porque ¿quién conoció la mente del Señor?… Pues nosotros tenemos la mente de Cristo.",
    },
  },
  3: {
    dom: {
      cita: "1 Corintios 3:11",
      texto:
        "Porque nadie puede poner otro fundamento que el que está puesto, el cual es Jesucristo.",
    },
    lun: {
      cita: "1 Corintios 3:6",
      texto: "Yo planté, Apolos regó; pero el crecimiento lo ha dado Dios.",
    },
    mar: {
      cita: "1 Corintios 3:16",
      texto:
        "¿No sabéis que sois templo de Dios, y que el Espíritu de Dios mora en vosotros?",
    },
    mie: {
      cita: "1 Corintios 4:1",
      texto:
        "Así, pues, téngannos los hombres por servidores de Cristo, y administradores de los misterios de Dios.",
    },
    jue: {
      cita: "1 Corintios 4:2",
      texto: "Ahora bien, se requiere de los administradores, que cada uno sea hallado fiel.",
    },
    vie: {
      cita: "1 Corintios 3:9",
      texto: "Porque nosotros somos colaboradores de Dios, y vosotros sois labranza de Dios, edificio de Dios.",
    },
    sab: {
      cita: "1 Corintios 3:21",
      texto: "Así que, ninguno se gloríe en los hombres; porque todo es vuestro.",
    },
  },
  4: {
    dom: {
      cita: "1 Corintios 6:19-20",
      texto:
        "¿O ignoráis que vuestro cuerpo es templo del Espíritu Santo…? Porque habéis sido comprados por precio; glorificad, pues, a Dios en vuestro cuerpo.",
    },
    lun: {
      cita: "1 Corintios 5:7",
      texto:
        "Limpiaos, pues, de la vieja levadura, para que seáis nueva masa… porque nuestra pascua, que es Cristo, ya fue sacrificada por nosotros.",
    },
    mar: {
      cita: "1 Corintios 5:12",
      texto: "Porque ¿qué razón tendría yo para juzgar a los que están fuera? ¿No juzgáis vosotros a los que están dentro?",
    },
    mie: {
      cita: "1 Corintios 6:11",
      texto:
        "Y esto erais algunos; mas ya habéis sido lavados, ya habéis sido santificados, ya habéis sido justificados en el nombre del Señor Jesús.",
    },
    jue: {
      cita: "Gálatas 6:1",
      texto:
        "Hermanos, si alguno fuere sorprendido en alguna falta, vosotros que sois espirituales, restauradle con espíritu de mansedumbre.",
    },
    vie: {
      cita: "1 Corintios 6:12",
      texto: "Todas las cosas me son lícitas, mas no todas convienen; todas me son lícitas, mas yo no me dejaré dominar de ninguna.",
    },
    sab: {
      cita: "1 Pedro 1:15",
      texto: "Sino, como aquel que os llamó es santo, sed también vosotros santos en toda vuestra manera de vivir.",
    },
  },
  5: {
    dom: {
      cita: "1 Corintios 10:23-24",
      texto:
        "Todo me es lícito, pero no todo conviene… Ninguno busque su propio bien, sino el del otro.",
    },
    lun: {
      cita: "1 Corintios 8:9",
      texto:
        "Pero mirad que esta libertad vuestra no sea tropezadero para los débiles.",
    },
    mar: {
      cita: "1 Corintios 8:13",
      texto:
        "Por lo cual, si la comida le es a mi hermano ocasión de caer, no comeré carne jamás, para no poner tropiezo a mi hermano.",
    },
    mie: {
      cita: "1 Corintios 9:22",
      texto:
        "Me he hecho a todos a fin de ganar a algunos. A todos me he hecho de todo, para que de todos modos salve a algunos.",
    },
    jue: {
      cita: "1 Corintios 10:31",
      texto: "Si, pues, coméis o bebéis, o hacéis otra cosa, hacedlo todo para la gloria de Dios.",
    },
    vie: {
      cita: "Romanos 14:19",
      texto: "Así que, sigamos lo que contribuye a la paz y a la mutua edificación.",
    },
    sab: {
      cita: "Gálatas 5:13",
      texto:
        "Porque vosotros, hermanos, a libertad fuisteis llamados; solamente que no uséis la libertad como ocasión para la carne, sino servíos por amor los unos a los otros.",
    },
  },
  6: {
    dom: {
      cita: "1 Corintios 11:26",
      texto:
        "Así, pues, todas las veces que comiereis este pan, y bebiereis esta copa, la muerte del Señor anunciáis hasta que él venga.",
    },
    lun: {
      cita: "1 Corintios 11:28",
      texto: "Por tanto, pruébese cada uno a sí mismo, y coma así del pan, y beba de la copa.",
    },
    mar: {
      cita: "1 Corintios 11:33",
      texto: "Así que, hermanos míos, cuando os reunís a comer, esperaos unos a otros.",
    },
    mie: {
      cita: "1 Corintios 14:40",
      texto: "Pero hágase todo decentemente y con orden.",
    },
    jue: {
      cita: "Salmo 96:9",
      texto: "Adorad a Jehová en la hermosura de la santidad; temed delante de él, toda la tierra.",
    },
    vie: {
      cita: "Hebreos 12:28",
      texto:
        "Así que, recibiendo nosotros un reino inconmovible, tengamos gratitud, y mediante ella sirvamos a Dios agradándole con temor y reverencia.",
    },
    sab: {
      cita: "1 Corintios 10:16",
      texto:
        "La copa de bendición que bendecimos, ¿no es la comunión de la sangre de Cristo? El pan que partimos, ¿no es la comunión del cuerpo de Cristo?",
    },
  },
  7: {
    dom: {
      cita: "1 Corintios 13:13",
      texto: "Y ahora permanecen la fe, la esperanza y el amor, estos tres; pero el mayor de ellos es el amor.",
    },
    lun: {
      cita: "1 Corintios 12:7",
      texto: "Pero a cada uno le es dada la manifestación del Espíritu para provecho.",
    },
    mar: {
      cita: "1 Corintios 12:27",
      texto: "Vosotros, pues, sois el cuerpo de Cristo, y miembros cada uno en particular.",
    },
    mie: {
      cita: "1 Corintios 13:1",
      texto:
        "Si yo hablase lenguas humanas y angélicas, y no tengo amor, vengo a ser como metal que resuena, o címbalo que retiñe.",
    },
    jue: {
      cita: "1 Corintios 14:12",
      texto: "Así también vosotros; pues que anheláis dones espirituales, procurad abundar en ellos para edificación de la iglesia.",
    },
    vie: {
      cita: "1 Corintios 14:26",
      texto: "Cuando os reunís, cada uno de vosotros tiene salmo, tiene doctrina… Hágase todo para edificación.",
    },
    sab: {
      cita: "Romanos 12:6",
      texto: "De manera que, teniendo diferentes dones según la gracia que nos es dada, si el de profecía, úsese conforme a la medida de la fe.",
    },
  },
  8: {
    dom: {
      cita: "1 Corintios 15:3-4",
      texto:
        "Que Cristo murió por nuestros pecados, conforme a las Escrituras; y que fue sepultado, y que resucitó al tercer día, conforme a las Escrituras.",
    },
    lun: {
      cita: "1 Corintios 15:20",
      texto: "Mas ahora Cristo ha resucitado de los muertos; primicias de los que durmieron es hecho.",
    },
    mar: {
      cita: "1 Corintios 15:14",
      texto: "Y si Cristo no resucitó, vana es entonces nuestra predicación, vana es también vuestra fe.",
    },
    mie: {
      cita: "1 Corintios 15:57",
      texto: "Mas gracias sean dadas a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo.",
    },
    jue: {
      cita: "1 Corintios 15:58",
      texto:
        "Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre.",
    },
    vie: {
      cita: "Juan 11:25",
      texto: "Yo soy la resurrección y la vida; el que cree en mí, aunque esté muerto, vivirá.",
    },
    sab: {
      cita: "1 Tesalonicenses 4:14",
      texto:
        "Porque si creemos que Jesús murió y resucitó, así también traerá Dios con Jesús a los que durmieron en él.",
    },
  },
  9: {
    dom: {
      cita: "2 Corintios 5:18",
      texto:
        "Y todo esto proviene de Dios, quien nos reconcilió consigo mismo por Cristo, y nos dio el ministerio de la reconciliación.",
    },
    lun: {
      cita: "2 Corintios 5:20",
      texto:
        "Así que, somos embajadores en nombre de Cristo, como si Dios rogase por medio de nosotros; os rogamos en nombre de Cristo: Reconciliaos con Dios.",
    },
    mar: {
      cita: "2 Corintios 5:17",
      texto: "De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.",
    },
    mie: {
      cita: "2 Corintios 1:3-4",
      texto:
        "Bendito sea el Dios y Padre de nuestro Señor Jesucristo, Padre de misericordias… el cual nos consuela en todas nuestras tribulaciones.",
    },
    jue: {
      cita: "2 Corintios 4:5",
      texto: "Porque no nos predicamos a nosotros mismos, sino a Jesucristo como Señor.",
    },
    vie: {
      cita: "Romanos 5:10",
      texto:
        "Porque si siendo enemigos, fuimos reconciliados con Dios por la muerte de su Hijo, mucho más, estando reconciliados, seremos salvos por su vida.",
    },
    sab: {
      cita: "Colosenses 1:20",
      texto:
        "Y por medio de él reconciliar consigo todas las cosas… haciendo la paz mediante la sangre de su cruz.",
    },
  },
  10: {
    dom: {
      cita: "2 Corintios 12:9",
      texto:
        "Y me ha dicho: Bástate mi gracia; porque mi poder se perfecciona en la debilidad.",
    },
    lun: {
      cita: "2 Corintios 4:7",
      texto:
        "Pero tenemos este tesoro en vasos de barro, para que la excelencia del poder sea de Dios, y no de nosotros.",
    },
    mar: {
      cita: "2 Corintios 4:8-9",
      texto:
        "Estamos atribulados en todo, mas no angustiados; en apuros, mas no desesperados; perseguidos, mas no desamparados.",
    },
    mie: {
      cita: "2 Corintios 12:10",
      texto:
        "Por lo cual, por amor a Cristo me gozo en las debilidades… porque cuando soy débil, entonces soy fuerte.",
    },
    jue: {
      cita: "Filipenses 4:13",
      texto: "Todo lo puedo en Cristo que me fortalece.",
    },
    vie: {
      cita: "Isaías 40:29",
      texto: "Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas.",
    },
    sab: {
      cita: "Salmo 73:26",
      texto: "Mi carne y mi corazón desfallecen; mas la roca de mi corazón y mi porción es Dios para siempre.",
    },
  },
  11: {
    dom: {
      cita: "2 Corintios 8:9",
      texto:
        "Porque ya conocéis la gracia de nuestro Señor Jesucristo, que por amor a vosotros se hizo pobre, siendo rico, para que vosotros con su pobreza fueseis enriquecidos.",
    },
    lun: {
      cita: "2 Corintios 9:7",
      texto:
        "Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre.",
    },
    mar: {
      cita: "2 Corintios 9:8",
      texto:
        "Y poderoso es Dios para hacer que abunde en vosotros toda gracia, a fin de que… abundéis para toda buena obra.",
    },
    mie: {
      cita: "2 Corintios 8:12",
      texto:
        "Porque si primero hay la voluntad dispuesta, será acepta según lo que uno tiene, no según lo que no tiene.",
    },
    jue: {
      cita: "Hechos 20:35",
      texto: "Más bienaventurado es dar que recibir.",
    },
    vie: {
      cita: "Proverbios 11:25",
      texto: "El alma generosa será prosperada; y el que saciare, él también será saciado.",
    },
    sab: {
      cita: "1 Juan 3:17",
      texto:
        "Pero el que tiene bienes de este mundo y ve a su hermano tener necesidad, y cierra contra él su corazón, ¿cómo mora el amor de Dios en él?",
    },
  },
  12: {
    dom: {
      cita: "2 Corintios 10:17",
      texto: "Mas el que se gloria, gloríese en el Señor.",
    },
    lun: {
      cita: "2 Corintios 10:18",
      texto:
        "Porque no es aprobado el que se recomienda a sí mismo, sino aquel a quien Dios recomienda.",
    },
    mar: {
      cita: "2 Corintios 11:30",
      texto: "Si es necesario gloriarse, me gloriaré en lo que es de mi debilidad.",
    },
    mie: {
      cita: "Marcos 10:43-44",
      texto:
        "Mas entre vosotros no será así, sino que el que quiera hacerse grande entre vosotros será vuestro servidor.",
    },
    jue: {
      cita: "1 Pedro 5:2-3",
      texto:
        "Apacentad la grey de Dios… no como teniendo señorío sobre los que están a vuestro cuidado, sino siendo ejemplos de la grey.",
    },
    vie: {
      cita: "Filipenses 2:5-7",
      texto:
        "Haya, pues, en vosotros este sentir que hubo también en Cristo Jesús… se despojó a sí mismo, tomando forma de siervo.",
    },
    sab: {
      cita: "2 Corintios 4:5",
      texto: "Porque no nos predicamos a nosotros mismos, sino a Jesucristo como Señor, y a nosotros como vuestros siervos por amor de Jesús.",
    },
  },
  13: {
    dom: {
      cita: "2 Corintios 13:5",
      texto:
        "Examinaos a vosotros mismos si estáis en la fe; probadlos a vosotros mismos.",
    },
    lun: {
      cita: "2 Corintios 12:9",
      texto: "Bástate mi gracia; porque mi poder se perfecciona en la debilidad.",
    },
    mar: {
      cita: "2 Corintios 13:11",
      texto:
        "Por lo demás, hermanos, tened gozo, perfeccionaos, consolaos, sed de un mismo sentir, y vivid en paz.",
    },
    mie: {
      cita: "2 Corintios 13:14",
      texto:
        "La gracia del Señor Jesucristo, el amor de Dios, y la comunión del Espíritu Santo sean con todos vosotros.",
    },
    jue: {
      cita: "Salmo 139:23-24",
      texto:
        "Examíname, oh Dios, y conoce mi corazón… Y ve si hay en mí camino de perversidad, y guíame en el camino eterno.",
    },
    vie: {
      cita: "1 Corintios 3:11",
      texto:
        "Porque nadie puede poner otro fundamento que el que está puesto, el cual es Jesucristo.",
    },
    sab: {
      cita: "Filipenses 1:6",
      texto:
        "Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.",
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
