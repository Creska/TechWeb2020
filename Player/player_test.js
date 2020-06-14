var example = {
	"story_name": "Storia di prova",
	"settings": {},
	"quests": [
		{	
			"quest_name": "Prima missione",
			"activities": [
				{
					"activity_text": "<p>Questa è la prima attività.<br>Clicca su PROSEGUI per andare alla seconda.</p>",
					"answer_field": "<button id='button1'>Prosegui</button>",
					"right_answer": "",
					"need_human_evaluation": false,
					"next_activities": [1],
					"action_on_activity_answer": "goToActivity(1);",
					"activity_style": ""
				},
				{
					"activity_text": "<p>Questa è la seconda attività.</p>",
					"answer_field": "<button id='button1'>Fine</button>",
					"right_answer": "",
					"need_human_evaluation": false,
					"next_activities": [],
					"action_on_activity_answer": "if (document.getElementById('button1').clicked == 1) window.alert('Test andato a buon fine');",
					"activity_style": ""
				}
			],
			"quest_style": "",
		}
	],
	"story_style": "",
	"score": []
};

var story = JSON.parse(JSON.stringify(example));

var currentStatus = {
	currentQuest: 0,
	currentActivity: 0
};

function createStory() {
	var newStory = document.createElement("div");
	var newStoryName = document.createAttribute("id");
	var newStoryStyle = document.createAttribute("style");

	newStoryName.value = "main";
	newStoryStyle.value = story.story_style;
	newStory.setAttributeNode(newStoryName);
	newStory.setAttributeNode(newStoryStyle);

	var StoryTitle = document.createElement("div");
	StoryTitle.innerHTML = story.story_name;

	newStory.appendChild(StoryTitle);

	return newStory;
};

// Crea un nodo quest con la prima attività come nodo figlio
function createQuest(quest_n) {
	var newQuestNode = document.createElement("div");

	var newQuestNodeClass = document.createAttribute("class");
	var newQuestNodeId = document.createAttribute("id");
	var newQuestNodeStyle = document.createAttribute("style");

	newQuestNodeClass.value = "quest";
	newQuestNodeId.value = "quest" + String(quest_n + 1);
	newQuestNodeStyle.value = story.quests[quest_n].quest_style;
    newQuestNode.setAttributeNode(newQuestNodeClass);
	newQuestNode.setAttributeNode(newQuestNodeId);
	newQuestNode.setAttributeNode(newQuestNodeStyle);

	newQuestNode.appendChild(createActivity(quest_n, 0));

	return newQuestNode;
};

function createActivity(quest_n, activity_n) {
	var newActivityNode = document.createElement("div");
	
	var newActivityNodeClass = document.createAttribute("class");
	var newActivityNodeId = document.createAttribute("id");
	var newActivityNodeStyle = document.createAttribute("style");

	newActivityNodeClass.value = "activity";
	newActivityNodeId.value = "activity" + String(activity_n + 1);
	newActivityNodeStyle.value = story.quests[quest_n].activities[activity_n].activity_style;

	newActivityNode.innerHTML = story.quests[quest_n].activities[activity_n].activity_text;

	var UserInteraction = document.createElement("div");
	var UserInteractionId = document.createAttribute("id");
	UserInteractionId.value = "interaction_field" + String(activity_n + 1);

	UserInteraction.setAttributeNode(UserInteractionId);
	UserInteraction.innerHTML = story.quests[quest_n].activities[activity_n].answer_field;
	newActivityNode.appendChild(UserInteraction);

	if (UserInteraction.tagName == "button") {
		var JSAction = document.createAttribute("onclick");
		JSAction.value = story.quests[quest_n].activities[activity_n].action_on_activity_answer;
		UserInteraction.setAttributeNode(JSAction);
	}
	// oppure viene settato in altro modo, coerentemente con la tipologia del campo risposta
	

	return newActivityNode;
};

// Inizializza la quest specificata, sostituendola a quella precedente
function goToQuest(quest_n) {
	if (quest_n != 0) {
		document.body.main.removeChild(document.getElementById("quest" + String(quest_n - 1)));
	}
	
	document.getElementById("main").appendChild(createQuest(quest_n));

	currentStatus.currentQuest = quest_n;
	currentStatus.currentActivity = 0;
};

// Attiva l'attività corrispondente all'indice specificato e disattiva quella precedente
function goToActivity(activity_n) {
	var newActivityNode = createActivity(currentStatus.currentQuest, activity_n);

	document.body.main.replaceChild(newActivityNode, document.getElementById("activity" + String(currentStatus.currentActivity + 1)));

	currentStatus.currentActivity = activity_n;
};

function startGame() {
	document.body.replaceChild(createStory(), document.getElementById("welcome"));

	goToQuest(0);
};