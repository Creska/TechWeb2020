/*
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte
* La parte per associare l'action on answer al rispettivo answer field rischia di non andare bene per altre tipologie di elemento (form per esempio). Quindi forse è da rifare
* La parte per lo stile lasciatela perdere perché è da rifare e probabilmente non serve includere così tanti campi appositi nel JSON
*/

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
					"activity_text": "<p>Questa è la seconda attività.<br>Clicca su FINE per terminare il test.</p>",
					"answer_field": "<button id='button1'>Fine</button>",
					"right_answer": "",
					"need_human_evaluation": false,
					"next_activities": [],
					"action_on_activity_answer": "window.alert('Test andato a buon fine');",
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

// indica il numero della quest attiva ed il numero dell'attività attiva
var currentStatus = {
	currentQuest: 0,
	currentActivity: 0
};

/**
 * funzione utilizzata per gestire le condizioni di errore all'interno del player
 * in generale sarebbe meglio fermare l'applicazione e basta
 */
function handleError() {
	window.alert("!!! MAJOR ERROR !!!");
}

/**
 * @param node --> nodo a cui aggiungere gli attributi
 * @param nodeClass 
 * @param nodeId 
 * @param nodeStyle
 * funzione che aggiunge i tre attributi principali, qualora specificati
 */
function addNodeMainAttributes(node, nodeClass, nodeId, nodeStyle) {
	if (node != null) {
		if (nodeClass) {
			var ClassAttr = document.createAttribute("class");
			ClassAttr.value = nodeClass;
			node.setAttributeNode(ClassAttr);
		}
		if (nodeId) {
			var IdAttr = document.createAttribute("id");
			IdAttr.value = nodeId;
			node.setAttributeNode(IdAttr);
		}
		if (nodeStyle) {
			var StyleAttr = document.createAttribute("style");
			StyleAttr.value = nodeStyle;
			node.setAttributeNode(StyleAttr);
		}
	}
	else handleError();
}

/**
 * crea un nodo apposito per la storia
 */
function createStory() {
	var newStory = document.createElement("div");

	addNodeMainAttributes(newStory, "", "main", story.story_style);

	var StoryTitle = document.createElement("div");
	StoryTitle.innerHTML = story.story_name;

	newStory.appendChild(StoryTitle);

	return newStory;
};

/**
 * @param quest_n --> numero della quest da creare
 * 
 * crea un nodo per la quest specificata e per la sua prima attività (come figlio)
 * l'attività 0 è infatti la quest "apripista"
 */
function createQuest(quest_n) {
	var newQuestNode = document.createElement("div");

	addNodeMainAttributes(newQuestNode, "quest", "quest" + String(quest_n), story.quests[quest_n].quest_style);

	newQuestNode.appendChild(createActivity(0));

	return newQuestNode;
};

/**
 * @param activity_n --> attività da creare
 * crea il nodo relativo all'attività specificata
 */
function createActivity(activity_n) {
	var newActivityNode = document.createElement("div");

	addNodeMainAttributes(newActivityNode, "activity", "activity" + String(activity_n), story.quests[currentStatus.currentQuest].activities[activity_n].activity_style);

	newActivityNode.innerHTML = story.quests[currentStatus.currentQuest].activities[activity_n].activity_text;

	var UserInteraction = new DOMParser().parseFromString(story.quests[currentStatus.currentQuest].activities[activity_n].answer_field, "text/html").body.firstElementChild;

	var UserInteractionId = document.createAttribute("id");
	UserInteractionId.value = "interaction_field" + String(activity_n);
	UserInteraction.setAttributeNode(UserInteractionId);

	if (UserInteraction.tagName == "BUTTON") {
		var JSAction = document.createAttribute("onclick");
		JSAction.value = story.quests[currentStatus.currentQuest].activities[activity_n].action_on_activity_answer;
		UserInteraction.setAttributeNode(JSAction);
	}
	// oppure viene settato in altro modo, coerentemente con la tipologia del campo risposta
	
	newActivityNode.appendChild(UserInteraction);

	return newActivityNode;
};

/**
 * @param quest_n --> quest da mostrare
 * attiva la quest specificata, rendendola visibile a schermo, e aggiorna i campi status
 * eventualmente viene sostituita l'eventuale quest precedentemente attiva
 */
function goToQuest(quest_n) {
	if (quest_n != 0) {
		document.body.main.removeChild(document.getElementById("quest" + String(quest_n - 1)));
	}
	
	document.getElementById("main").appendChild(createQuest(quest_n));

	currentStatus.currentQuest = quest_n;
	currentStatus.currentActivity = 0;
};

/**
 * @param activity_n --> attività da mostrare
 * attiva l'attività specificata, rendendola visibile a schermo, e aggiorna i campi status
 * questa funzione viene usata esclusivamente per attività successive alla zero, dato che questa è attivata automaticamente all'inizio di una quest
 */
function goToActivity(activity_n) {
	
	var newActivityNode = createActivity(activity_n);

	document.getElementById("quest" + String(currentStatus.currentQuest)).replaceChild(newActivityNode, document.getElementById("activity" + String(currentStatus.currentActivity)));

	currentStatus.currentActivity = activity_n;
};

/**
 * attiva la storia, rimpiazzando la schermata di welcome con un nodo appositamente creato per la storia
 */
function startGame() {
	document.body.replaceChild(createStory(), document.getElementById("welcome"));

	goToQuest(0);
};