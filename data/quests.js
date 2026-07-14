"use strict";

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
        meaning: "xin chao",
        example: "Hello! Nice to meet you."
      },
      {
        word: "nice to meet you",
        meaning: "rat vui duoc gap ban",
        example: "Nice to meet you too."
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
        text: "Let's practice a simple greeting."
      },
      {
        type: "choice",
        question: "How should you reply?",
        options: [
          "Nice to meet you too.",
          "I am coffee.",
          "Good night food."
        ],
        correctAnswer: "Nice to meet you too.",
        hint: "Use a polite greeting reply."
      },
      {
        type: "choice",
        question: "What does 'Hello' mean in Vietnamese?",
        options: [
          "Xin chao",
          "Tam biet",
          "Cam on"
        ],
        correctAnswer: "Xin chao",
        hint: "'Hello' is used when you greet someone."
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
    rewardCoins: 15
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
    rewardCoins: 15
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
    rewardCoins: 20
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
    rewardCoins: 25
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
        pinyin: "ni hao",
        meaning: "xin chao",
        example: "你好!"
      },
      {
        word: "谢谢",
        pinyin: "xie xie",
        meaning: "cam on",
        example: "谢谢你!"
      }
    ],
    steps: [
      {
        type: "dialogue",
        speaker: "小美",
        text: "你好! 欢迎来到日常生活小镇。"
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
          "Xin chao",
          "Tam biet",
          "Khong sao"
        ],
        correctAnswer: "Xin chao",
        hint: "\"你好\" is used when greeting someone."
      },
      {
        type: "choice",
        question: "Which sentence means 'Thank you'?",
        options: [
          "谢谢",
          "你好",
          "再见"
        ],
        correctAnswer: "谢谢",
        hint: "\"谢谢\" means thank you."
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
    rewardCoins: 15
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
    rewardCoins: 15
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
    rewardCoins: 20
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
    rewardCoins: 25
  }
];
