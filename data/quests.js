"use strict";

const cityLocations = [
  {
    id: "home",
    name: "Home",
    icon: "🏠",
    description: "Start your day, meet your guide, and practice friendly basics.",
    npc: "Mia",
    order: 1
  },
  {
    id: "cozy_cafe",
    name: "Cozy Café",
    icon: "☕",
    description: "Enter the café, talk to the barista, and order drinks politely.",
    npc: "Barista",
    order: 2
  },
  {
    id: "fresh_market",
    name: "Fresh Market",
    icon: "🛒",
    description: "Shop for food, ask prices, and complete small market tasks.",
    npc: "Shopkeeper",
    order: 3
  },
  {
    id: "city_station",
    name: "City Station",
    icon: "🚉",
    description: "Ask for directions and understand where to go next.",
    npc: "Station Guide",
    order: 4
  },
  {
    id: "work_office",
    name: "Work Office",
    icon: "💼",
    description: "Introduce yourself and use useful language for work or school.",
    npc: "Office Mentor",
    order: 5
  }
];

const questionTemplates = [
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Pick the correct answer from a short list."
  },
  {
    type: "fill_blank",
    label: "Fill Blank",
    description: "Type the missing word or phrase."
  },
  {
    type: "order_sentence",
    label: "Order Sentence",
    description: "Choose the correctly ordered sentence."
  },
  {
    type: "typing",
    label: "Typing",
    description: "Type the full answer."
  },
  {
    type: "choose_reply",
    label: "Choose Reply",
    description: "Choose the best reply in a conversation."
  }
];

const questData = [
  {
    id: "greeting_001",
    title: "Greeting",
    description: "Learn how to greet someone politely.",
    language: "en",
    mapId: "daily_life_town",
    requiredQuestId: null,
    order: 1,
    rewardExp: 20,
    rewardCoins: 10,
    vocabulary: [
      {
        word: "hello",
        meaning: "xin chào",
        example: "Hello! Nice to meet you."
      },
      {
        word: "nice to meet you",
        meaning: "rất vui được gặp bạn",
        example: "Nice to meet you too."
      },
      {
        word: "welcome",
        meaning: "chào mừng",
        example: "Welcome to Daily Life Town."
      },
      {
        word: "thank you",
        meaning: "cảm ơn",
        example: "Thank you for helping me."
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "Mia",
        text: "Hello! Welcome to Daily Life Town."
      },
      {
        type: "dialogue",
        speaker: "Mia",
        text: "When someone greets you, you can reply politely."
      },
      {
        type: "choice",
        question: "What does \"Hello\" mean in Vietnamese?",
        options: [
          "Xin chào",
          "Tạm biệt",
          "Cảm ơn"
        ],
        correctAnswer: "Xin chào",
        hint: "\"Hello\" is used when you greet someone."
      },
      {
        type: "choice",
        question: "How should you reply to \"Nice to meet you\"?",
        options: [
          "Nice to meet you too.",
          "I am coffee.",
          "Good night food."
        ],
        correctAnswer: "Nice to meet you too.",
        hint: "Use \"too\" to politely return the greeting."
      }
    ]
  },
  {
    id: "coffee_001",
    title: "Order Coffee",
    description: "Learn how to order a drink at a coffee shop.",
    language: "en",
    mapId: "daily_life_town",
    requiredQuestId: "greeting_001",
    order: 2,
    rewardExp: 30,
    rewardCoins: 15,
    vocabulary: [
      {
        word: "coffee",
        meaning: "cà phê",
        example: "I would like a coffee, please."
      },
      {
        word: "cold brew",
        meaning: "cà phê ủ lạnh",
        example: "I would like a cold brew, please."
      },
      {
        word: "please",
        meaning: "vui lòng / làm ơn",
        example: "A small coffee, please."
      },
      {
        word: "small",
        meaning: "nhỏ",
        example: "A small coffee, please."
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "Barista",
        text: "Hi! What would you like to drink?"
      },
      {
        type: "dialogue",
        speaker: "Barista",
        text: "Use \"I would like\" to order politely."
      },
      {
        type: "choice",
        question: "Choose the best way to order.",
        options: [
          "I would like a cold brew, please.",
          "I am a cold brew.",
          "Coffee go home."
        ],
        correctAnswer: "I would like a cold brew, please.",
        hint: "Use: I would like + item + please."
      },
      {
        type: "choice",
        question: "Which sentence asks for a small size?",
        options: [
          "A small coffee, please.",
          "A left coffee, please.",
          "Coffee is a library."
        ],
        correctAnswer: "A small coffee, please.",
        hint: "Put the size before the drink: small coffee."
      }
    ]
  },
  {
    id: "food_001",
    title: "Buy Food",
    description: "Learn how to buy food in daily life.",
    language: "en",
    mapId: "daily_life_town",
    requiredQuestId: "coffee_001",
    order: 3,
    rewardExp: 30,
    rewardCoins: 15,
    vocabulary: [
      {
        word: "bread",
        meaning: "bánh mì",
        example: "I want to buy some bread."
      },
      {
        word: "apple",
        meaning: "táo",
        example: "I want two apples."
      },
      {
        word: "how much",
        meaning: "bao nhiêu tiền",
        example: "How much is this?"
      },
      {
        word: "total",
        meaning: "tổng cộng",
        example: "The total is five dollars."
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "Shopkeeper",
        text: "Welcome! We have bread and fresh apples today."
      },
      {
        type: "dialogue",
        speaker: "Shopkeeper",
        text: "You can say \"I want to buy\" when shopping."
      },
      {
        type: "choice",
        question: "Choose the best sentence to ask for bread.",
        options: [
          "I want to buy some bread.",
          "Bread wants me.",
          "I am the apple."
        ],
        correctAnswer: "I want to buy some bread.",
        hint: "Use: I want to buy + food."
      },
      {
        type: "choice",
        question: "What does \"The total is five dollars\" tell you?",
        options: [
          "The full price is five dollars.",
          "The bread is sleeping.",
          "The shop is near the park."
        ],
        correctAnswer: "The full price is five dollars.",
        hint: "\"Total\" means the final amount to pay."
      }
    ]
  },
  {
    id: "direction_001",
    title: "Ask for Directions",
    description: "Learn how to ask for and understand directions.",
    language: "en",
    mapId: "daily_life_town",
    requiredQuestId: "food_001",
    order: 4,
    rewardExp: 40,
    rewardCoins: 20,
    vocabulary: [
      {
        word: "where",
        meaning: "ở đâu",
        example: "Where is the library?"
      },
      {
        word: "left",
        meaning: "bên trái",
        example: "Turn left at the park."
      },
      {
        word: "right",
        meaning: "bên phải",
        example: "The shop is on the right."
      },
      {
        word: "straight",
        meaning: "đi thẳng",
        example: "Go straight and turn left."
      },
      {
        word: "near",
        meaning: "gần",
        example: "It is near the park."
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "Guide",
        text: "You are looking for the library."
      },
      {
        type: "dialogue",
        speaker: "Guide",
        text: "Ask with \"Where is\" when you need a place."
      },
      {
        type: "choice",
        question: "Choose the correct question.",
        options: [
          "Where is the library?",
          "Library is coffee?",
          "I buy left."
        ],
        correctAnswer: "Where is the library?",
        hint: "Use: Where is + place?"
      },
      {
        type: "choice",
        question: "What should you do if someone says \"Go straight and turn left\"?",
        options: [
          "Walk forward, then go left.",
          "Buy two apples.",
          "Say thank you at night."
        ],
        correctAnswer: "Walk forward, then go left.",
        hint: "\"Straight\" means forward. \"Left\" is one side."
      }
    ]
  },
  {
    id: "introduce_001",
    title: "Introduce Yourself",
    description: "Learn how to introduce yourself clearly.",
    language: "en",
    mapId: "daily_life_town",
    requiredQuestId: "direction_001",
    order: 5,
    rewardExp: 50,
    rewardCoins: 25,
    vocabulary: [
      {
        word: "my name is",
        meaning: "tên tôi là",
        example: "My name is Sherry."
      },
      {
        word: "I am from",
        meaning: "tôi đến từ",
        example: "I am from Vietnam."
      },
      {
        word: "I like",
        meaning: "tôi thích",
        example: "I like learning languages."
      },
      {
        word: "language",
        meaning: "ngôn ngữ",
        example: "English is a language."
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "Mia",
        text: "Now introduce yourself to the town."
      },
      {
        type: "dialogue",
        speaker: "Mia",
        text: "A simple introduction can include your name, country, and likes."
      },
      {
        type: "choice",
        question: "Choose the best self-introduction.",
        options: [
          "My name is Sherry.",
          "Name coffee left.",
          "I am the library."
        ],
        correctAnswer: "My name is Sherry.",
        hint: "Use: My name is + name."
      },
      {
        type: "choice",
        question: "What does \"I am from Vietnam\" mean?",
        options: [
          "Tôi đến từ Việt Nam.",
          "Tôi mua bánh mì.",
          "Tôi đi bên trái."
        ],
        correctAnswer: "Tôi đến từ Việt Nam.",
        hint: "\"I am from\" tells someone your country or hometown."
      },
      {
        type: "choice",
        question: "Choose a good sentence to finish your introduction.",
        options: [
          "I like learning languages.",
          "I like turning coffee.",
          "Language is five dollars."
        ],
        correctAnswer: "I like learning languages.",
        hint: "Use \"I like\" before something you enjoy."
      }
    ]
  },
  {
    id: "zh_greeting_001",
    title: "问候",
    description: "Learn basic Chinese greetings.",
    language: "zh",
    mapId: "daily_life_town",
    requiredQuestId: null,
    order: 1,
    rewardExp: 20,
    rewardCoins: 10,
    vocabulary: [
      {
        word: "你好",
        pinyin: "nǐ hǎo",
        meaning: "xin chào",
        example: "你好！"
      },
      {
        word: "谢谢",
        pinyin: "xiè xie",
        meaning: "cảm ơn",
        example: "谢谢你！"
      },
      {
        word: "再见",
        pinyin: "zài jiàn",
        meaning: "tạm biệt",
        example: "再见！"
      },
      {
        word: "欢迎",
        pinyin: "huān yíng",
        meaning: "chào mừng",
        example: "欢迎你！"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "小美",
        text: "你好！欢迎来到日常生活小镇。"
      },
      {
        type: "dialogue",
        speaker: "小美",
        text: "我们来练习简单的问候。"
      },
      {
        type: "choice",
        question: "\"你好\" means:",
        options: [
          "Xin chào",
          "Tạm biệt",
          "Không sao"
        ],
        correctAnswer: "Xin chào",
        hint: "\"你好\" is used when greeting someone."
      },
      {
        type: "choice",
        question: "Which sentence means \"Thank you\"?",
        options: [
          "谢谢",
          "你好",
          "再见"
        ],
        correctAnswer: "谢谢",
        hint: "\"谢谢\" means thank you."
      },
      {
        type: "choice",
        question: "Which word means \"goodbye\"?",
        options: [
          "再见",
          "欢迎",
          "咖啡"
        ],
        correctAnswer: "再见",
        hint: "Use \"再见\" when you leave."
      }
    ]
  },
  {
    id: "zh_coffee_001",
    title: "点咖啡",
    description: "Learn how to order coffee in Chinese.",
    language: "zh",
    mapId: "daily_life_town",
    requiredQuestId: "zh_greeting_001",
    order: 2,
    rewardExp: 30,
    rewardCoins: 15,
    vocabulary: [
      {
        word: "咖啡",
        pinyin: "kā fēi",
        meaning: "cà phê",
        example: "我要一杯咖啡。"
      },
      {
        word: "冰咖啡",
        pinyin: "bīng kā fēi",
        meaning: "cà phê đá",
        example: "请给我一杯冰咖啡。"
      },
      {
        word: "请",
        pinyin: "qǐng",
        meaning: "vui lòng",
        example: "请给我一杯咖啡。"
      },
      {
        word: "小杯",
        pinyin: "xiǎo bēi",
        meaning: "ly nhỏ",
        example: "我要小杯咖啡。"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "咖啡师",
        text: "你好！你想喝什么？"
      },
      {
        type: "dialogue",
        speaker: "咖啡师",
        text: "点饮料时，可以说 \"我要\"。"
      },
      {
        type: "choice",
        question: "Choose the sentence for \"I want a cup of coffee.\"",
        options: [
          "我要一杯咖啡。",
          "我是咖啡。",
          "咖啡在左边。"
        ],
        correctAnswer: "我要一杯咖啡。",
        hint: "\"我要\" means \"I want\" when ordering."
      },
      {
        type: "choice",
        question: "Which sentence politely asks for iced coffee?",
        options: [
          "请给我一杯冰咖啡。",
          "请给我图书馆。",
          "我喜欢右边。"
        ],
        correctAnswer: "请给我一杯冰咖啡。",
        hint: "\"请给我\" is a polite way to ask for something."
      },
      {
        type: "choice",
        question: "What does \"小杯\" mean?",
        options: [
          "Ly nhỏ",
          "Cảm ơn",
          "Bánh mì"
        ],
        correctAnswer: "Ly nhỏ",
        hint: "\"小\" means small, and \"杯\" means cup."
      }
    ]
  },
  {
    id: "zh_food_001",
    title: "买食物",
    description: "Learn how to buy food in Chinese.",
    language: "zh",
    mapId: "daily_life_town",
    requiredQuestId: "zh_coffee_001",
    order: 3,
    rewardExp: 30,
    rewardCoins: 15,
    vocabulary: [
      {
        word: "面包",
        pinyin: "miàn bāo",
        meaning: "bánh mì",
        example: "我要买面包。"
      },
      {
        word: "苹果",
        pinyin: "píng guǒ",
        meaning: "táo",
        example: "我要买苹果。"
      },
      {
        word: "多少钱",
        pinyin: "duō shǎo qián",
        meaning: "bao nhiêu tiền",
        example: "这个多少钱？"
      },
      {
        word: "一共",
        pinyin: "yí gòng",
        meaning: "tổng cộng",
        example: "一共五块。"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "店员",
        text: "欢迎！今天有面包和苹果。"
      },
      {
        type: "dialogue",
        speaker: "店员",
        text: "买东西时，可以问 \"这个多少钱？\""
      },
      {
        type: "choice",
        question: "Choose the sentence for \"I want to buy bread.\"",
        options: [
          "我要买面包。",
          "面包在学习。",
          "我是苹果。"
        ],
        correctAnswer: "我要买面包。",
        hint: "\"买\" means buy. Use \"我要买\" before the food."
      },
      {
        type: "choice",
        question: "Which question asks for the price?",
        options: [
          "这个多少钱？",
          "你好吗？",
          "图书馆在哪里？"
        ],
        correctAnswer: "这个多少钱？",
        hint: "\"多少钱\" asks how much money something costs."
      },
      {
        type: "choice",
        question: "What does \"一共五块\" mean?",
        options: [
          "The total is five yuan.",
          "The apple is on the left.",
          "I like learning languages."
        ],
        correctAnswer: "The total is five yuan.",
        hint: "\"一共\" means total."
      }
    ]
  },
  {
    id: "zh_direction_001",
    title: "问路",
    description: "Learn how to ask for directions in Chinese.",
    language: "zh",
    mapId: "daily_life_town",
    requiredQuestId: "zh_food_001",
    order: 4,
    rewardExp: 40,
    rewardCoins: 20,
    vocabulary: [
      {
        word: "在哪里",
        pinyin: "zài nǎ lǐ",
        meaning: "ở đâu",
        example: "图书馆在哪里？"
      },
      {
        word: "左边",
        pinyin: "zuǒ biān",
        meaning: "bên trái",
        example: "它在左边。"
      },
      {
        word: "右边",
        pinyin: "yòu biān",
        meaning: "bên phải",
        example: "它在右边。"
      },
      {
        word: "一直走",
        pinyin: "yì zhí zǒu",
        meaning: "đi thẳng",
        example: "一直走，然后左转。"
      },
      {
        word: "附近",
        pinyin: "fù jìn",
        meaning: "gần đây",
        example: "它在公园附近。"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "路人",
        text: "你要去哪里？"
      },
      {
        type: "dialogue",
        speaker: "路人",
        text: "问地点时，可以说 \"在哪里？\""
      },
      {
        type: "choice",
        question: "Choose the sentence for \"Where is the library?\"",
        options: [
          "图书馆在哪里？",
          "咖啡多少钱？",
          "我叫面包。"
        ],
        correctAnswer: "图书馆在哪里？",
        hint: "Use place + \"在哪里？\" to ask where it is."
      },
      {
        type: "choice",
        question: "What does \"一直走，然后左转\" mean?",
        options: [
          "Go straight, then turn left.",
          "Buy apples, then drink coffee.",
          "Say hello, then goodbye."
        ],
        correctAnswer: "Go straight, then turn left.",
        hint: "\"一直走\" means go straight. \"左转\" means turn left."
      },
      {
        type: "choice",
        question: "Which word means \"nearby\"?",
        options: [
          "附近",
          "谢谢",
          "小杯"
        ],
        correctAnswer: "附近",
        hint: "\"附近\" describes a place that is close."
      }
    ]
  },
  {
    id: "zh_introduce_001",
    title: "自我介绍",
    description: "Learn how to introduce yourself in Chinese.",
    language: "zh",
    mapId: "daily_life_town",
    requiredQuestId: "zh_direction_001",
    order: 5,
    rewardExp: 50,
    rewardCoins: 25,
    vocabulary: [
      {
        word: "我叫",
        pinyin: "wǒ jiào",
        meaning: "tôi tên là",
        example: "我叫 Sherry。"
      },
      {
        word: "我来自",
        pinyin: "wǒ lái zì",
        meaning: "tôi đến từ",
        example: "我来自越南。"
      },
      {
        word: "越南",
        pinyin: "yuè nán",
        meaning: "Việt Nam",
        example: "我来自越南。"
      },
      {
        word: "我喜欢",
        pinyin: "wǒ xǐ huān",
        meaning: "tôi thích",
        example: "我喜欢学习语言。"
      },
      {
        word: "学习语言",
        pinyin: "xué xí yǔ yán",
        meaning: "học ngôn ngữ",
        example: "我喜欢学习语言。"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "小美",
        text: "最后，试着用中文介绍自己。"
      },
      {
        type: "dialogue",
        speaker: "小美",
        text: "你可以说名字、来自哪里和喜欢什么。"
      },
      {
        type: "choice",
        question: "Choose the sentence for \"My name is Sherry.\"",
        options: [
          "我叫 Sherry。",
          "我买 Sherry。",
          "Sherry 在哪里？"
        ],
        correctAnswer: "我叫 Sherry。",
        hint: "\"我叫\" is used before your name."
      },
      {
        type: "choice",
        question: "What does \"我来自越南\" mean?",
        options: [
          "I am from Vietnam.",
          "I want coffee.",
          "The total is five yuan."
        ],
        correctAnswer: "I am from Vietnam.",
        hint: "\"我来自\" tells where you are from."
      },
      {
        type: "choice",
        question: "Choose the sentence for \"I like learning languages.\"",
        options: [
          "我喜欢学习语言。",
          "我喜欢买左边。",
          "语言一共五块。"
        ],
        correctAnswer: "我喜欢学习语言。",
        hint: "Use \"我喜欢\" before something you like."
      }
    ]
  }
];
