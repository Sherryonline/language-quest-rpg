"use strict";

const missionMetadata = {
  greeting_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "home",
    difficultyLevel: "a0",
    topic: "Greetings",
    order: 1
  },
  coffee_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "cozy_cafe",
    difficultyLevel: "a1",
    topic: "Ordering Drinks",
    order: 2
  },
  food_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "fresh_market",
    difficultyLevel: "a1",
    topic: "Shopping",
    order: 3
  },
  direction_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "city_station",
    difficultyLevel: "a2",
    topic: "Directions",
    order: 4
  },
  introduce_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "work_office",
    difficultyLevel: "b1",
    topic: "Self Introduction",
    order: 5
  },
  zh_greeting_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "home",
    difficultyLevel: "a0",
    topic: "Greetings",
    order: 1
  },
  zh_coffee_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "cozy_cafe",
    difficultyLevel: "a1",
    topic: "Ordering Drinks",
    order: 2
  },
  zh_food_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "fresh_market",
    difficultyLevel: "a1",
    topic: "Shopping",
    order: 3
  },
  zh_direction_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "city_station",
    difficultyLevel: "a2",
    topic: "Directions",
    order: 4
  },
  zh_introduce_001: {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "work_office",
    difficultyLevel: "b1",
    topic: "Self Introduction",
    order: 5
  }
};

questData.forEach((mission) => {
  Object.assign(mission, missionMetadata[mission.id] || {
    missionType: "mission",
    mapId: "lingua_city",
    locationId: "home",
    difficultyLevel: "a0",
    topic: "Daily Life"
  });
});

function updateStep(missionId, stepIndex, update) {
  const mission = questData.find((item) => item.id === missionId);

  if (mission && Array.isArray(mission.steps) && mission.steps[stepIndex]) {
    Object.assign(mission.steps[stepIndex], update);
  }
}

updateStep("greeting_001", 2, { type: "multiple_choice" });
updateStep("greeting_001", 3, { type: "choose_reply" });
updateStep("coffee_001", 3, {
  type: "fill_blank",
  question: "Complete the cafe order: A ____ coffee, please.",
  correctAnswer: "small",
  acceptedAnswers: ["small"],
  inputPlaceholder: "Type the missing word"
});
updateStep("food_001", 2, {
  type: "typing",
  question: "Type the full sentence to ask for bread.",
  correctAnswer: "I want to buy some bread.",
  acceptedAnswers: ["I want to buy some bread", "I want to buy some bread."]
});
updateStep("direction_001", 2, {
  type: "order_sentence",
  question: "Choose the correctly ordered sentence.",
  options: ["Where is the library?", "Is where the library?", "Library where is?"],
  correctAnswer: "Where is the library?"
});
updateStep("zh_greeting_001", 2, { type: "multiple_choice" });
updateStep("zh_greeting_001", 3, { type: "choose_reply" });
updateStep("zh_coffee_001", 2, { type: "multiple_choice" });
updateStep("zh_food_001", 3, {
  type: "fill_blank",
  question: "Complete the price question with the missing Chinese word.",
  correctAnswer: "多少",
  acceptedAnswers: ["多少"]
});
updateStep("zh_direction_001", 2, {
  type: "order_sentence",
  question: "Choose the correct sentence order.",
  options: ["图书馆在哪里？", "在哪里图书馆？", "图书馆咖啡哪里？"],
  correctAnswer: "图书馆在哪里？"
});
updateStep("zh_introduce_001", 2, {
  type: "typing",
  question: "Type the sentence for: My name is Sherry.",
  correctAnswer: "我叫 Sherry。",
  acceptedAnswers: ["我叫 Sherry。", "我叫Sherry。"]
});

const missions = questData;
const vocabulary = missions.flatMap((mission) => (mission.vocabulary || []).map((word) => ({
  ...word,
  missionId: mission.id,
  language: mission.language,
  topic: mission.topic
})));
const phrases = missions.flatMap((mission) => (mission.steps || [])
  .filter((step) => step.type === "dialogue" || step.correctAnswer)
  .map((step, index) => ({
    id: `${mission.id}_phrase_${index + 1}`,
    missionId: mission.id,
    language: mission.language,
    text: step.text || step.correctAnswer || "",
    speaker: step.speaker || "",
    topic: mission.topic
  })));
