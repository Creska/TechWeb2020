example = {
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
					"action_on_activity_answer": "<script> if (document.geElementById('button1').clicked == 1) goToActivity(1); </script>",
					"activity_style": ""
				},
				{
					"activity_text": "<p>Questa è la seconda attività.</p>",
					"answer_field": "<button id='button1'>Fine</button>",
					"right_answer": "",
					"need_human_evaluation": false,
					"next_activities": [],
					"action_on_activity_answer": "<script> if (document.geElementById('button1').clicked == 1) window.alert('Test andato a buon fine'); </script>",
					"activity_style": ""
				}
			],
			"quest_style": "",
		}
	],
	"story_style": "",
	"score": []
};

story = JSON.parse(JSON.stringify(example));

var currentStatus = {
	currentQuest = 0,
	currentActivity = 0
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

	newActivityNode.innerHTML = story.quests[quest_n].activities[activity_n].activity_text;
	
	var newActivityNodeClass = document.createAttribute("class");
	var newActivityNodeId = document.createAttribute("id");
	var newActivityNodeStyle = document.createAttribute("style");

	newActivityNodeClass.value = "activity";
	newActivityNodeId.value = "activity" + String(activity_n + 1);
	newActivityNodeStyle.value = story.quests[quest_n].activities[activity_n].activity_style;

	return newActivityNode;
};

// Inizializza la quest specificata, sostituendola a quella precedente
function goToQuest(quest_n) {
	if (quest_n != 0) {
		document.removeChild(document.getElementById("quest" + String(quest_n - 1)));
	}
	
	document.getElementById("main").appendChild(quest_n);

	currentStatus.currentQuest = quest_n;
	currentStatus.currentActivity = 0;
};

// Attiva l'attività corrispondente all'indice specificato e disattiva quella precedente
function goToActivity(activity_n) {
	var newActivityNode = createActivity(currentStatus.currentQuest, activity_n);

	document.replaceChild(newActivityNode, document.getElementById("activity" + String(currentStatus.currentActivity + 1)));

	currentStatus.currentActivity = activity_n;
};

function startGame() {
	document.replaceChild(createStory(), document.getElementById("welcome"));

	goToQuest(0);
};