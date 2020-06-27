$(function () {
	$.get("/player/games/" + $('#game-name').html() + ".json", function (data) {
		//removing the useless template
		$('#game-name').remove();
		var story = data;
		console.log(data)
		var socket = io.connect('', { query: "type=player" });
		$('form').submit(function (e) {
			e.preventDefault();
			//client can't route the rooms: only the server can. I need to send the data there
			socket.emit('chat-message', $('#message').val(), socket.id);
			$('#message').val('');
			return false;
		})
		socket.on('valuator-message', (message) => {
			//TODO rendering the valuator message
		})
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
	})
})
