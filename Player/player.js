/*
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte.
* La sintassi di dichiarazione dell'oggetto JSON non è formalmente corretta ma funziona comunque su Chrome.
*/

var example = {
	"game_html": "<div id='game'> <div id='storytitle'>Titolo della storia</div> </div>",
	"settings": {},
	"settings_form": "<div id='settingswindow'><p>Questa schermata serve a settare alcuni parametri di gioco.</p><button onclick='goToQuest(0);'>Prosegui</button></div>",
	"quests": [
		{	
			"quest_html": "<div id='quest0' class='quest'> <div id='questtitle'>Prima quest</div> </div>",
			"activities": [
				{
					"activity_html": "<div id='activity0' class='activity'> <p>Questa è la prima attività.<br>Clicca su PROSEGUI per andare alla seconda.</p> <button id='activity0answerfield' class='answerfield' onclick='goToActivity(1);'>Prosegui</button> </div>",
					"right_answer": "",
					"need_human_evaluation": false,
					"action_on_activity_answer": "goToActivity(1);" // boh
				},
				{
					"activity_html": "<div id='activity1' class='activity'> <p>Questa è la seconda attività.<br>Clicca su FINE per completare il test.</p> <button id='activity1answerfield' class='answerfield' onclick='window.alert(\"Test andato a buon fine\");'>Fine</button> </div>",
					"right_answer": "",
					"need_human_evaluation": false,
					"action_on_activity_answer": "window.alert('Test andato a buon fine');" // boh
				}
			]
		}
	],
	"stylesheet": "",
	"score": []
};

var story = JSON.parse( JSON.stringify( example ) );

// indica il numero della quest attiva ed il numero dell'attività attiva
var currentStatus = {
	currentQuest: -1,
	currentActivity: -1
};

/**
 * funzione utilizzata per gestire le condizioni di errore all'interno del player
 * in generale sarebbe meglio fermare l'applicazione e basta
 */
function handleError() {
	window.alert( "!!! MAJOR ERROR !!!" );
};

function goToActivity( activity_n ) {
	if ( activity_n ) {
		$( "#activity" + String( currentStatus.currentActivity ) ).replaceWith( story.quests[currentStatus.currentQuest].activities[activity_n].activity_html );
	}
	else {
		$( "#quest" + String( currentStatus.currentQuest ) ).append( story.quests[currentStatus.currentQuest].activities[activity_n].activity_html );
	}

	currentStatus.currentActivity = activity_n;
};

function goToQuest( quest_n ) {
	if ( quest_n ) {
		$( "#quest" + String( currentStatus.currentQuest ) ).replaceWith( story.quests[quest_n].quest_html );
	}
	else {
		if (document.getElementById("settingswindow") == null) window.alert("errore"); // debugging
		$( "#settingswindow" ).replaceWith( story.quests[0].quest_html );
	}

	currentStatus.currentQuest = quest_n;

	goToActivity( 0 ); // per convenzione ogni quest inizia con l'attività zero --> facciamo così???
};

function goToSettings() {
	$( "#game" ).append( story.settings_form );
};

function startGame() {
	$( "#welcome" ).replaceWith( story.game_html );

	goToSettings(); // invio alla schermata dei settings, che precede la quest 0
};