storyjs = {
	"quests": [
		{
			"activities": [
				{
					"activity_text": "",
					"answer_field": "",
					"right_answer": "",
					"need_human_evaluation": false,
					"next_activities": [],
					"action_on_activity_answer": "",
					"activity_UI_style": ""
				}
			],
			"quest_style": "",
		}
	],
	"story_style": "",
	"score": []
};

story = JSON.parse(JSON.stringify(storyjs));

function createQuest(quest_obj, quest_n) {
	var newQuestNode = document.createElement("div");

	var newQuestNodeClass = document.createAttribute("class");
	var newQuestNodeId = document.createAttribute("id");
	var newQuestNodeStyle = document.createAttribute("style");

	newQuestNodeClass.value = "quest";
	newQuestNodeId.value = "quest" + String(quest_n + 1);
	newQuestNodeStyle.value = quest_obj.quest_style;
    newQuestNode.setAttributeNode(newQuestNodeClass);
	newQuestNode.setAttributeNode(newQuestNodeId);
	newQuestNode.setAttributeNode(newQuestNodeStyle);

	document.appendChild(newQuestNode); // meglio creare un padre "story" per contenere la quest

	newQuestNode.appendChild(createActivity(quest_obj.activities[0], 0));

}

function createActivity(activity_obj, activity_n) {
	var newActivityNode = document.createElement("div");

	var newActivityText = document.createTextNode(activity_obj.activity_text);
	newActivityNode.appendChild(newActivityText);
	
	var newActivityNodeClass = document.createAttribute("class");
	var newActivityNodeId = document.createAttribute("id");
	var newActivityNodeStyle = document.createAttribute("style");

	newActivityNodeClass.value = "activity";
	newActivityNodeId.value = "activity" + String(activity_n + 1);
	newActivityNodeStyle.value = activity_obj.activity_UI_style;

	return newActivityNode;
}

// Inizializza la quest specificata, con solamente la prima attività visibile
// Eventualmente, sostituisce la quest specificata a quella precedente
function goToQuest(quest_obj, quest_n) {
    if (quest_n != 0) {
        var oldQuestNode = document.getElementById("quest" + String(quest_n - 1));
        document.removeChild(oldQuestNode);
    }
	
	createQuest(quest_obj, quest_n);
}

// Attiva l'attività corrispondente all'indice specificato e disattiva quella precedente
function goToActivity(activity_n) {
	if (activity_n != 0) {
		var oldActivityNode = document.getElementsByClassName("activity")[0];
		document.removeChild(oldActivityNode0);
	}

	var currentQuestNode = document.getElementsByClassName("quest")[0];

	currentQuestNode.appendChild(createActivity())
}