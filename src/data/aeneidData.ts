export interface InlineAnnotation {
  id: string;
  markerLabel: string;
  anchorPhrase: string;
  category: '语文学与格律' | '历史与地理' | '神话与宗教' | '译法辨析';
  title: string;
  latinTerm?: string;
  explanation: string;
  comparativeNote?: string;
}

export interface VerseLine {
  lineNumber: number;
  zh: string;
  stanzaBreakAfter?: boolean;
  mapLocusId?: string;
  annotations?: InlineAnnotation[];
}

export interface BookPlateSpec {
  plateCode: string;
  title: string;
}

export interface AeneidBook {
  number: number;
  roman: string;
  titleZh: string;
  plate: BookPlateSpec;
  verses: VerseLine[];
}

export interface MapWaypoint {
  id: string;
  code: string;
  nameZh: string;
  coordinates: string;
  xPercent: number;
  yPercent: number;
  bookNumber: number;
  lineNumber: number;
  summary: string;
  poeticExcerpt: string;
}

export interface CartographicMap {
  id: 'map-mediterranean' | 'map-latium' | 'map-avernus';
  indexNumber: 'MAP I' | 'MAP II' | 'MAP III';
  titleZh: string;
  scopeBooks: string;
  curatorialNote: string;
  waypoints: MapWaypoint[];
}

export const THREE_MAPS: CartographicMap[] = [
  {
    id: 'map-mediterranean',
    indexNumber: 'MAP I',
    titleZh: '地中海航线图',
    scopeBooks: '卷一至卷六',
    curatorialNote:
      '涵盖埃涅阿斯自特洛伊启航，经色雷斯、提洛岛、克里特、伊庇鲁斯、西西里德雷帕努姆，遭朱诺风暴吹至北非迦太基，最终抵意大利库迈的七年航迹。',
    waypoints: [
      {
        id: 'wp-troy',
        code: 'LOC.01',
        nameZh: '特洛伊',
        coordinates: '39°57′N 26°14′E',
        xPercent: 84,
        yPercent: 28,
        bookNumber: 2,
        lineNumber: 1,
        summary: '十年围城终结之地。埃涅阿斯背负老父安基塞斯、携幼子阿斯卡尼乌斯自废墟启航。',
        poeticExcerpt: '「那曾威震亚细亚的高傲伊利昂，已化作烟尘断壁。」',
      },
      {
        id: 'wp-delos',
        code: 'LOC.02',
        nameZh: '提洛岛',
        coordinates: '37°24′N 25°16′E',
        xPercent: 72,
        yPercent: 48,
        bookNumber: 3,
        lineNumber: 1,
        summary: '阿波罗神谕所，降下寻访古老祖邦之启示。',
        poeticExcerpt: '「寻找你们最初的母邦，那孕育达尔达努斯血脉的厚土。」',
      },
      {
        id: 'wp-drepanum',
        code: 'LOC.03',
        nameZh: '西西里德雷帕努姆',
        coordinates: '38°01′N 12°30′E',
        xPercent: 44,
        yPercent: 62,
        bookNumber: 5,
        lineNumber: 1,
        summary: '老父安基塞斯长眠之地；卷五在此举办周年祭礼竞技赛会。',
        poeticExcerpt: '「劈开幽黑的海浪，频频回首凝望火光。」',
      },
      {
        id: 'wp-carthage',
        code: 'LOC.04',
        nameZh: '迦太基',
        coordinates: '36°51′N 10°19′E',
        xPercent: 36,
        yPercent: 78,
        bookNumber: 1,
        lineNumber: 1,
        summary: '狄多女王建造的新邦；卷一风暴避难与卷四悲剧之源。',
        poeticExcerpt: '「然而女王早已被深重的郁结击中，以一身心血豢养着那道创伤。」',
      },
      {
        id: 'wp-cumae',
        code: 'LOC.05',
        nameZh: '库迈',
        coordinates: '40°50′N 14°03′E',
        xPercent: 52,
        yPercent: 38,
        bookNumber: 6,
        lineNumber: 2,
        summary: '阿波罗与西比尔神谕岩穴，下入阿佛尔努斯冥界之门户。',
        poeticExcerpt: '「终于滑入优卑亚人开辟的库迈海岸。」',
      },
    ],
  },
  {
    id: 'map-latium',
    indexNumber: 'MAP II',
    titleZh: '拉丁姆战局图',
    scopeBooks: '卷七至卷十二',
    curatorialNote:
      '台伯河下游冲积平原、奥斯提亚河口营垒、劳伦图姆平原、帕兰提乌姆与阿尔代亚部族战局分布。',
    waypoints: [
      {
        id: 'wp-tiber-mouth',
        code: 'LAT.01',
        nameZh: '台伯河口与营垒',
        coordinates: '41°44′N 12°17′E',
        xPercent: 34,
        yPercent: 46,
        bookNumber: 7,
        lineNumber: 1,
        summary: '特洛伊船队溯流而上登岸立营之所，亦为九卷围城血战之地。',
        poeticExcerpt: '「一幅更宏大的事物秩序在我面前诞生，我将开启更沉重的伟业。」',
      },
      {
        id: 'wp-laurentum',
        code: 'LAT.02',
        nameZh: '劳伦图姆平原',
        coordinates: '41°42′N 12°21′E',
        xPercent: 48,
        yPercent: 64,
        bookNumber: 12,
        lineNumber: 1,
        summary: '拉丁姆盟邦核心城池，城外平原即卷十二埃涅阿斯与图尔努斯决斗疆场。',
        poeticExcerpt: '「埃涅阿斯全副甲胄凛然卓立，目光如炬。」',
      },
      {
        id: 'wp-pallanteum',
        code: 'LAT.03',
        nameZh: '帕兰提乌姆',
        coordinates: '41°53′N 12°29′E',
        xPercent: 58,
        yPercent: 26,
        bookNumber: 8,
        lineNumber: 1,
        summary: '阿卡迪亚王厄汪德尔聚落，未来罗马帕拉蒂尼山基石。',
        poeticExcerpt: '「将后世子孙的赫赫盛名与千秋命运，一举扛在肩头。」',
      },
    ],
  },
  {
    id: 'map-avernus',
    indexNumber: 'MAP III',
    titleZh: '阿佛尔努斯冥界拓扑图',
    scopeBooks: '卷六专图',
    curatorialNote:
      '自阿佛尔努斯火山口、金枝林、阿刻戎河渡口，至塔尔塔罗斯深渊与极乐净土、角门与象牙门之路径。',
    waypoints: [
      {
        id: 'wp-avernus-gate',
        code: 'AVR.01',
        nameZh: '阿佛尔努斯火山口与金枝林',
        coordinates: 'AXIS 01 · 深度 -120M',
        xPercent: 18,
        yPercent: 22,
        bookNumber: 6,
        lineNumber: 5,
        summary: '幽暗火山口，埃涅阿斯在双鸽指引下折取金枝。',
        poeticExcerpt: '「下入阿佛尔努斯何其容易：黑夜与白昼，冥王的大门永远敞开。」',
      },
      {
        id: 'wp-elysium',
        code: 'AVR.02',
        nameZh: '极乐净土与勒忒河畔',
        coordinates: 'AXIS 04 · 深度 -850M',
        xPercent: 74,
        yPercent: 62,
        bookNumber: 6,
        lineNumber: 9,
        summary: '芳草青翠之所，安基塞斯向埃涅阿斯宣讲罗马帝国天命。',
        poeticExcerpt: '「但你，罗马人，请铭记：你的技艺是以主权统御万民。」',
      },
    ],
  },
];

export const AENEID_BOOKS: AeneidBook[] = [
  {
    number: 1,
    roman: 'I',
    titleZh: '第一卷',
    plate: {
      plateCode: '卷一',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '我歌唱兵燹与那一人，他最先自特洛伊的海岸，',
        mapLocusId: 'wp-troy',
        annotations: [
          {
            id: 'n-1-1',
            markerLabel: '01',
            anchorPhrase: '兵燹与那一人',
            category: '语文学与格律',
            title: '开篇双关结构',
            explanation:
              '首词指向后六卷的意大利战争，第二词则指向前六卷的海上漂泊。以双音节保留沉重起拍。',
            comparativeNote: '旧译常作「我歌唱武器和那个人」，此处取「兵燹」兼具战火与城破意象。',
          },
        ],
      },
      {
        lineNumber: 2,
        zh: '被天命驱策，流亡至意大利与拉维尼姆的滩头；',
        annotations: [
          {
            id: 'n-1-2',
            markerLabel: '02',
            anchorPhrase: '被天命驱策',
            category: '神话与宗教',
            title: '命运的流亡者',
            explanation: '埃涅阿斯非因个人懦弱逃亡，而是受宇宙天命驱遣，将特洛伊家神迁往拉丁姆。',
          },
        ],
      },
      {
        lineNumber: 3,
        zh: '他在陆上与大洋辗转良久，受尽苍穹诸神的摧折，',
      },
      {
        lineNumber: 4,
        zh: '只因冷酷的朱诺胸中，那道宿怨未尝有一刻平息；',
        annotations: [
          {
            id: 'n-1-4',
            markerLabel: '03',
            anchorPhrase: '宿怨未尝有一刻平息',
            category: '语文学与格律',
            title: '有记忆的愤怒',
            explanation: '修辞移就，形容词铭记修饰愤怒，强调神怒跨越世代的持久记忆。',
          },
        ],
      },
      {
        lineNumber: 5,
        zh: '他又在兵火中历尽苦战，直到筑起那座新城，',
      },
      {
        lineNumber: 6,
        zh: '把家神迎入拉丁姆——由此才生出拉丁的族裔、',
        annotations: [
          {
            id: 'n-1-6',
            markerLabel: '04',
            anchorPhrase: '家神',
            category: '神话与宗教',
            title: '家族与城邦护神',
            explanation: '自火海救出的并非金银，而是家神，象征特洛伊礼法在意大利的延续。',
          },
        ],
      },
      {
        lineNumber: 7,
        zh: '阿尔巴的列位先父，以及高耸入云的罗马城垣。',
        stanzaBreakAfter: true,
        annotations: [
          {
            id: 'n-1-7',
            markerLabel: '05',
            anchorPhrase: '阿尔巴的列位先父',
            category: '历史与地理',
            title: '三代建城谱系',
            explanation: '拉维尼姆、阿尔巴隆加、罗马三级历史阶梯。',
          },
        ],
      },
      {
        lineNumber: 8,
        zh: '缪斯啊，请向我重述前因：究竟哪一桩神威受辱，',
      },
      {
        lineNumber: 9,
        zh: '或是因何怨愤，竟令众神之后驱迫这位以虔敬闻名的凡人，',
        annotations: [
          {
            id: 'n-1-9',
            markerLabel: '06',
            anchorPhrase: '以虔敬闻名',
            category: '译法辨析',
            title: 'Pietas 的核心内涵',
            explanation: 'Pietas 涵盖对神祇的敬畏、对先祖与家族的责任，以及对同袍之约守信。',
          },
        ],
      },
      {
        lineNumber: 10,
        zh: '历经无数劫难，涉足如许沉重的苦役？天神心中竟有如许的雷霆之怒！',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 11,
        zh: '曾有一座古城，提尔殖民者聚居于此，名为迦太基，',
        mapLocusId: 'wp-carthage',
      },
      {
        lineNumber: 12,
        zh: '遥对意大利与第伯河幽深的入海口；它资财雄厚，',
      },
      {
        lineNumber: 13,
        zh: '更在残酷的兵燹中百般锤炼。据说在朱诺眼里，',
      },
      {
        lineNumber: 14,
        zh: '世间万土无一处比它更蒙恩眷，纵使萨摩斯岛亦居其后；',
      },
      {
        lineNumber: 15,
        zh: '此处安置着她的战车，陈列着她的铠甲；若命运允许，',
      },
      {
        lineNumber: 16,
        zh: '女神自古便怀有宏愿，要令它凌驾诸邦，成为万民的宗主。',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 17,
        zh: '然而她听闻早有一脉特洛伊血胤正在繁衍，',
      },
      {
        lineNumber: 18,
        zh: '日后必将彻底倾覆提尔人的卫城；自这血脉中，',
      },
      {
        lineNumber: 19,
        zh: '将走出一支君临广土、在战阵中傲立的族群，',
      },
      {
        lineNumber: 20,
        zh: '为利比亚带来灭顶之灾：命运的纺车正是如此旋转。',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 21,
        zh: '萨图恩之女畏惧此谶，更未尝遗忘昔日那场旷日持久的战事——',
      },
      {
        lineNumber: 22,
        zh: '她曾为心爱的阿尔戈斯，在特洛伊城前率先挑起兵戈；',
      },
      {
        lineNumber: 23,
        zh: '况且她心中的宿怨与受挫的狂怒，从未自胸臆消褪：',
      },
      {
        lineNumber: 24,
        zh: '深埋在心底的，是帕里斯的裁判与对她美貌的轻蔑，',
        annotations: [
          {
            id: 'n-1-24',
            markerLabel: '07',
            anchorPhrase: '帕里斯的裁判',
            category: '神话与宗教',
            title: '朱诺宿怨的源起',
            explanation: '特洛伊王子帕里斯将金苹果判予维纳斯，结下朱诺深仇。',
          },
        ],
      },
      {
        lineNumber: 25,
        zh: '是那令人生厌的特洛伊族裔，以及被擢升天廷的加尼米德所受的殊荣。',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 26,
        zh: '朱诺为这一切焚心如狂，遂将那群残存的特洛伊人——',
      },
      {
        lineNumber: 27,
        zh: '那些自达那俄斯人屠刀下与冷酷阿喀琉斯矛尖下逃脱的遗孤，',
      },
      {
        lineNumber: 28,
        zh: '驱逐在大洋各处，令他们远远滞留在拉丁姆之外；',
      },
      {
        lineNumber: 29,
        zh: '他们被命运拨弄，一年复一年，在万顷波涛间漫无止境地漂泊。',
      },
      {
        lineNumber: 30,
        zh: '为了筑起罗马的邦族，竟要付出如此深重、如此浩瀚的代价！',
        stanzaBreakAfter: true,
        annotations: [
          {
            id: 'n-1-30',
            markerLabel: '08',
            anchorPhrase: '为了筑起罗马的邦族',
            category: '语文学与格律',
            title: '序诗结句之重锤',
            explanation: '序诗 11 行至 33 行的总收束，奠定全诗庄严史诗基调。',
          },
        ],
      },
      {
        lineNumber: 31,
        zh: '他们刚刚驶离西西里岛的视线，欣然向深海扬帆，',
      },
      {
        lineNumber: 32,
        zh: '以青铜船首犁开泛着盐花的浪沫；这时朱诺',
      },
      {
        lineNumber: 33,
        zh: '仍在胸中滋养着永不愈合的伤口，向自己暗暗说道：',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 34,
        zh: '「难道我要彻底受挫，不得不放弃这初衷，',
      },
      {
        lineNumber: 35,
        zh: '无力阻止特洛伊的王者驶向意大利的疆土？',
      },
      {
        lineNumber: 36,
        zh: '莫非命运真的能横加阻挠？难道帕拉斯能够',
      },
      {
        lineNumber: 37,
        zh: '将阿耳戈斯的船队付之一炬，将众人溺毙于深洋，',
      },
      {
        lineNumber: 38,
        zh: '只因小埃阿斯一人的狂悖与罪愆？',
      },
      {
        lineNumber: 39,
        zh: '她亲手自云层中掷下朱庇特的迅雷，击碎战舰，掀翻海床；',
      },
      {
        lineNumber: 40,
        zh: '那小埃阿斯胸膛被贯穿，口喷烈焰，被卷入旋风钉死在尖礁之上；',
      },
      {
        lineNumber: 41,
        zh: '而我，昂首阔步的众神之后，既是朱庇特的胞妹与正妻，',
        annotations: [
          {
            id: 'n-1-41',
            markerLabel: '09',
            anchorPhrase: '昂首阔步的众神之后',
            category: '语文学与格律',
            title: '神后的步态',
            explanation: '动词专指庄严威仪的王者步态，展现朱诺孤傲尊严。',
          },
        ],
      },
      {
        lineNumber: 42,
        zh: '竟与这区区一族交战经年！此后还有谁肯敬拜朱诺的神威，',
      },
      {
        lineNumber: 43,
        zh: '或满怀敬畏，向我的祭坛呈上祈求的牺牲？」',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 2,
    roman: 'II',
    titleZh: '第二卷',
    plate: {
      plateCode: '卷二',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '众人霎时静默，屏息凝神，齐齐仰望他的面容；',
        mapLocusId: 'wp-troy',
        annotations: [
          {
            id: 'n-2-1',
            markerLabel: '01',
            anchorPhrase: '众人霎时静默',
            category: '语文学与格律',
            title: '瞬间完成时的沉寂',
            explanation: '以瞬间完成时与未完成时并置，在句法上制造大厅骤然凝固的静止感。',
          },
        ],
      },
      {
        lineNumber: 2,
        zh: '于是埃涅阿斯先父自高耸的席榻上开口说道：',
      },
      {
        lineNumber: 3,
        zh: '「女王啊，你命我重揭那难以言说的剧痛：',
        annotations: [
          {
            id: 'n-2-3',
            markerLabel: '02',
            anchorPhrase: '难以言说的剧痛',
            category: '译法辨析',
            title: '超越言说边界之痛',
            explanation: '字面即不可启齿之痛。但丁在《神曲》地狱篇中化用此句。',
          },
        ],
      },
      {
        lineNumber: 4,
        zh: '讲述达那俄斯人如何倾覆特洛伊的繁华与可哀的王邦——',
      },
      {
        lineNumber: 5,
        zh: '那些惨烈之事，我曾亲眼目睹，更置身于大祸的中心。',
      },
      {
        lineNumber: 6,
        zh: '纵使是密尔米冬人或多洛佩斯兵卒，抑或残忍尤利西斯的部曲，',
      },
      {
        lineNumber: 7,
        zh: '在叙述这等惨变时，又怎能抑住滚落的双泪？',
      },
      {
        lineNumber: 8,
        zh: '况且湿润的夜色正从天穹坠落，沉落的群星',
      },
      {
        lineNumber: 9,
        zh: '已在劝人安眠。但你若怀有如许热忱，要洞悉我们的劫运，',
      },
      {
        lineNumber: 10,
        zh: '要听取特洛伊最终的垂死挣扎，那么即便记忆在战栗中',
      },
      {
        lineNumber: 11,
        zh: '退缩抗拒，我仍愿由此动笔，为你从头诉说。',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 12,
        zh: '历经多年征战，达那俄斯人的统帅们为兵锋所挫，',
      },
      {
        lineNumber: 13,
        zh: '又被天命屡屡击退，遂凭帕拉斯的神圣巧艺，',
      },
      {
        lineNumber: 14,
        zh: '筑起一匹高如山岳的木马，以劈开的冷杉木编织肋骨；',
        annotations: [
          {
            id: 'n-2-14',
            markerLabel: '03',
            anchorPhrase: '以劈开的冷杉木编织肋骨',
            category: '语文学与格律',
            title: '造船术隐喻',
            explanation: '用造船术语描写木马，暗示其本质为一艘开入城墙的攻城战舰。',
          },
        ],
      },
      {
        lineNumber: 15,
        zh: '他们诈称这是祈求归航顺遂的还愿祭礼，流言四散，',
      },
      {
        lineNumber: 16,
        zh: '暗地里却拈阄选出精锐死士，悄然闭锁在幽黑的木腹深处。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 3,
    roman: 'III',
    titleZh: '第三卷',
    plate: {
      plateCode: '卷三',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '既然上天诸神决意倾覆亚细亚的基业，与那无辜的',
        mapLocusId: 'wp-delos',
      },
      {
        lineNumber: 2,
        zh: '普里阿摩斯王族，高傲的伊利昂轰然坍塌，尼普顿亲手筑起的',
      },
      {
        lineNumber: 3,
        zh: '特洛伊全城在地底冒着余烟；我们受神兆敦促，',
        annotations: [
          {
            id: 'n-3-3',
            markerLabel: '01',
            anchorPhrase: '冒着余烟',
            category: '语文学与格律',
            title: '历史现在时的余烬感',
            explanation: '已坍塌完成时与冒烟现在时并置，令焦烟在叙事当下依然弥漫。',
          },
        ],
      },
      {
        lineNumber: 4,
        zh: '去远方寻访荒无人烟的流放之地，遂在安坦德罗斯山脚下',
      },
      {
        lineNumber: 5,
        zh: '砍伐弗里吉亚伊达山的林木，打造舰队，却不知命运将引向何方。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 4,
    roman: 'IV',
    titleZh: '第四卷',
    plate: {
      plateCode: '卷四',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '然而女王早已被深重的郁结击中，以一身的心血',
        mapLocusId: 'wp-carthage',
      },
      {
        lineNumber: 2,
        zh: '豢养着那道创伤，被盲目无形的暗火寸寸吞噬；',
        annotations: [
          {
            id: 'n-4-2',
            markerLabel: '01',
            anchorPhrase: '盲目无形的暗火',
            category: '语文学与格律',
            title: '创伤与火焰的双重母题',
            explanation: '开篇为隐秘心伤与暗火，卷末化为真实的佩剑创口与火葬台。',
          },
        ],
      },
      {
        lineNumber: 3,
        zh: '那英雄的万般勇毅，那王族的高贵门第，屡屡涌回她心头；',
      },
      {
        lineNumber: 4,
        zh: '他的容颜与言辞深镌于胸臆，苦恋令她的四肢百骸难获安眠。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 5,
    roman: 'V',
    titleZh: '第五卷',
    plate: {
      plateCode: '卷五',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '其时埃涅阿斯已率舰队稳踏中流，乘着凛冽北风，',
        mapLocusId: 'wp-drepanum',
      },
      {
        lineNumber: 2,
        zh: '劈开幽黑的海浪，频频回首凝望那座已被不幸的',
      },
      {
        lineNumber: 3,
        zh: '伊利莎的火葬烈焰照得通明的迦太基城垣。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 6,
    roman: 'VI',
    titleZh: '第六卷',
    plate: {
      plateCode: '卷六',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '他噙泪如此倾诉，随即为船队松开缰绳般的帆索，',
        mapLocusId: 'wp-cumae',
      },
      {
        lineNumber: 2,
        zh: '终于滑入优卑亚人开辟的库迈海岸。',
        annotations: [
          {
            id: 'n-6-2',
            markerLabel: '01',
            anchorPhrase: '优卑亚人开辟的库迈海岸',
            category: '历史与地理',
            title: '库迈的希腊移民渊源',
            explanation: '位于那不勒斯湾北侧，由希腊移民建立，为阿波罗崇拜传入意大利之门。',
          },
        ],
      },
      {
        lineNumber: 3,
        zh: '船首转向外海，铁锚以尖齿死死咬住海床，',
      },
      {
        lineNumber: 4,
        zh: '弧形的船尾依次排开，镶满蜿蜒的沙滩。',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 5,
        zh: '「特洛伊安基塞斯之子，下入阿佛尔努斯何其容易：',
        mapLocusId: 'wp-avernus-gate',
        annotations: [
          {
            id: 'n-6-5',
            markerLabel: '02',
            anchorPhrase: '下入阿佛尔努斯何其容易',
            category: '语文学与格律',
            title: '阿佛尔努斯千古训诫',
            explanation: '下坠冥界昼夜敞开，撤回步履重返天光才是真正的试炼。',
          },
        ],
      },
      {
        lineNumber: 6,
        zh: '黑夜与白昼，幽暗冥王迪斯的大门永远敞开；',
      },
      {
        lineNumber: 7,
        zh: '但若要撤回步履，重返上界清朗的空气与天光，',
      },
      {
        lineNumber: 8,
        zh: '这才是艰巨的志业，这才是真正的苦役！',
        stanzaBreakAfter: true,
      },
      {
        lineNumber: 9,
        zh: '「别人自会将呼吸的青铜锤炼得更加柔韧如生，',
        mapLocusId: 'wp-elysium',
      },
      {
        lineNumber: 10,
        zh: '从大理石中凿出栩栩如生的面容；别人会在法庭上',
      },
      {
        lineNumber: 11,
        zh: '更雄辩地陈词，或以测杆描绘天体的运行，预告星辰的升起；',
      },
      {
        lineNumber: 12,
        zh: '但你，罗马人，请铭记：你的技艺是以主权统御万民——',
        annotations: [
          {
            id: 'n-6-12',
            markerLabel: '03',
            anchorPhrase: '你的技艺是以主权统御万民',
            category: '历史与地理',
            title: '安基塞斯的罗马天命论',
            explanation: '将雕塑修辞归于希腊人，将秩序立法与削平傲者确立为罗马技艺。',
          },
        ],
      },
      {
        lineNumber: 13,
        zh: '这便是你的绝艺：为和平立下法度，',
      },
      {
        lineNumber: 14,
        zh: '宽宥那些归顺者，而以铁腕彻底平定骄狂之徒！」',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 7,
    roman: 'VII',
    titleZh: '第七卷',
    plate: {
      plateCode: '卷七',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '来吧，厄拉托女神！我将展示拉丁姆昔日的诸王、',
        mapLocusId: 'wp-tiber-mouth',
      },
      {
        lineNumber: 2,
        zh: '展示远古拉丁姆在异邦军队初登意大利海岸时的局势，',
      },
      {
        lineNumber: 3,
        zh: '我将唤醒最初交锋的记忆。女神啊，请指点你的诗人！',
      },
      {
        lineNumber: 4,
        zh: '我将歌唱酷烈的战阵、歌唱被怒火驱向死亡的诸王；',
      },
      {
        lineNumber: 5,
        zh: '一幅更宏大的事物秩序在我面前诞生，我将开启更沉重的伟业。',
        stanzaBreakAfter: true,
        annotations: [
          {
            id: 'n-7-5',
            markerLabel: '01',
            anchorPhrase: '更宏大的事物秩序',
            category: '语文学与格律',
            title: '下半部序言',
            explanation: '建国战争在此被置于高于航海漂泊的叙事层级。',
          },
        ],
      },
    ],
  },
  {
    number: 8,
    roman: 'VIII',
    titleZh: '第八卷',
    plate: {
      plateCode: '卷八',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '他凝视着母亲馈赠的伏尔甘神盾，虽未通晓其上的桩桩史事，',
        mapLocusId: 'wp-pallanteum',
      },
      {
        lineNumber: 2,
        zh: '却为那些浮雕的意象心旷神怡，随即扬起双肩，',
      },
      {
        lineNumber: 3,
        zh: '将后世子孙的赫赫盛名与千秋命运，一举扛在肩头。',
        stanzaBreakAfter: true,
        annotations: [
          {
            id: 'n-8-3',
            markerLabel: '01',
            anchorPhrase: '将后世子孙的赫赫盛名与千秋命运，一举扛在肩头',
            category: '语文学与格律',
            title: '背负过去与承担未来',
            explanation: '卷二结尾以双肩背负老父（过去），卷八结尾以双肩担起神盾（未来）。',
          },
        ],
      },
    ],
  },
  {
    number: 9,
    roman: 'IX',
    titleZh: '第九卷',
    plate: {
      plateCode: '卷九',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '死亡的寒流涌过欧律阿卢斯的四肢，殷红的鲜血顺着',
        mapLocusId: 'wp-tiber-mouth',
      },
      {
        lineNumber: 2,
        zh: '俊美的躯体滑落，折断的脖颈无力地垂向肩头：',
      },
      {
        lineNumber: 3,
        zh: '恰似一朵紫红的野花，被犁铧割断根茎，在垂死中枯萎，',
        annotations: [
          {
            id: 'n-9-3',
            markerLabel: '01',
            anchorPhrase: '恰似一朵紫红的野花，被犁铧割断根茎',
            category: '译法辨析',
            title: '紫花受犁之喻',
            explanation: '融合荷马与卡图卢斯之句，写历史铁犁对年轻生命的碾压。',
          },
        ],
      },
      {
        lineNumber: 4,
        zh: '又如罂粟花在暴雨鞭打下，因花冠沉重而低垂了颈项。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 10,
    roman: 'X',
    titleZh: '第十卷',
    plate: {
      plateCode: '卷十',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '「凡人各自有其既定的时日；生命的时光短暂且不可追回，',
        mapLocusId: 'wp-laurentum',
      },
      {
        lineNumber: 2,
        zh: '但凭壮烈的功业延展身后之名——这才是勇者的本分。',
      },
      {
        lineNumber: 3,
        zh: '在特洛伊的高墙之下，曾有那么多众神之子倒在尘埃，',
      },
      {
        lineNumber: 4,
        zh: '连我的亲生骨肉萨尔佩冬也一并陨落；如今图尔努斯自己的命运，',
      },
      {
        lineNumber: 5,
        zh: '也已在呼唤他，他也已走到所获寿数的终点。」',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 11,
    roman: 'XI',
    titleZh: '第十一卷',
    plate: {
      plateCode: '卷十一',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '其时曙光女神已将仁慈的晨曦洒向受苦的凡间，',
        mapLocusId: 'wp-laurentum',
      },
      {
        lineNumber: 2,
        zh: '重新唤回白昼的劳作与悲辛；埃涅阿斯先父与塔尔孔，',
      },
      {
        lineNumber: 3,
        zh: '已在弯曲的海岸上筑起无数的火葬木台，各自依祖宗旧例，',
      },
      {
        lineNumber: 4,
        zh: '抬来阵亡者的遗骸；待幽暗的浓烟自火台下方燃起，高天顿时被黑幕笼罩。',
        stanzaBreakAfter: true,
      },
    ],
  },
  {
    number: 12,
    roman: 'XII',
    titleZh: '第十二卷',
    plate: {
      plateCode: '卷十二',
      title: '卷首插画',
    },
    verses: [
      {
        lineNumber: 1,
        zh: '埃涅阿斯全副甲胄凛然卓立，目光如炬，却按住了举起的右手；',
        mapLocusId: 'wp-laurentum',
      },
      {
        lineNumber: 2,
        zh: '随着那求饶之词渐次吐露，他的心念已开始迟疑动摇——',
        annotations: [
          {
            id: 'n-12-2',
            markerLabel: '01',
            anchorPhrase: '迟疑动摇',
            category: '语文学与格律',
            title: '埃涅阿斯的恻隐之停顿',
            explanation: '图尔努斯提及老父，触动埃涅阿斯孝思，此时他几乎准备宽宥。',
          },
        ],
      },
      {
        lineNumber: 3,
        zh: '不料就在图尔努斯高耸的肩头，那条不幸的剑带赫然入目，',
      },
      {
        lineNumber: 4,
        zh: '熟悉的金钉扣环闪烁着光芒——那是少年帕拉斯的遗物！',
        annotations: [
          {
            id: 'n-12-4',
            markerLabel: '02',
            anchorPhrase: '少年帕拉斯的遗物',
            category: '神话与宗教',
            title: '决定生死的信物',
            explanation: '遗物唤醒了对盟友厄汪德尔的道义誓言，令恻隐瞬间化作盛怒。',
          },
        ],
      },
      {
        lineNumber: 5,
        zh: '昔日图尔努斯将这少年击倒刺伤，竟把这仇敌的徽记',
      },
      {
        lineNumber: 6,
        zh: '公然披挂在自己肩上。埃涅阿斯双目死死盯住这件',
      },
      {
        lineNumber: 7,
        zh: '唤醒彻骨悲痛的战利品，刹那间狂怒焚心，怖厉万状：',
      },
      {
        lineNumber: 8,
        zh: '「难道你身穿我挚友身上剥下的战利品，还能从我手中逃脱？',
      },
      {
        lineNumber: 9,
        zh: '是帕拉斯用这一创口，是帕拉斯亲手将你当作祭品宰杀，',
      },
      {
        lineNumber: 10,
        zh: '向你这罪孽之血索取偿还！」言毕，他满腔沸腾，',
      },
      {
        lineNumber: 11,
        zh: '将利剑深埋进迎面而立的胸膛；图尔努斯的四肢在死寒中瓦解，',
      },
      {
        lineNumber: 12,
        zh: '他的一缕性命带着悲愤的叹息，含恨逃入幽冥的暗影。',
        stanzaBreakAfter: true,
        annotations: [
          {
            id: 'n-12-12',
            markerLabel: '03',
            anchorPhrase: '带着悲愤的叹息，含恨逃入幽冥的暗影',
            category: '语文学与格律',
            title: '全诗终句之回声',
            explanation: '以暗影收束，将帝国的辉煌与被征服者的悲叹共同定格在凝思之中。',
          },
        ],
      },
    ],
  },
];
