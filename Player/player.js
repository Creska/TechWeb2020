/*
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte.
* La sintassi di dichiarazione dell'oggetto JSON non è formalmente corretta ma funziona comunque su Chrome.
*/

/* Riassunto del funzionamento:
Questo è solo un test, quindi presenta vari bug che bisogna evitare conoscendo il funzionamento di questo mini-programma.
Alla schermata dei settings viene richiesto di scegliere una delle due opzioni (evitare di cliccarle entrambe o nessuna). A seconda dell'opzione scelta, cambierà l'attività successiva alla prima.
*/

var example = {
	"game_html": "<div id='game'> <div id='storytitle'>Titolo della storia</div> </div>",
	"settings": {},
	"settings_form": "<div id='settingsform'><div>Scegli una delle due opzioni:</div><label for='optionchoice1'>Prima</label><input type='checkbox' id='optionchoice1' name='optionchoice1' class='formoption'><br><label for='optionchoice2'>Seconda</label><input type='checkbox' id='optionchoice2' name='optionchoice2' class='formoption'><br><button id='submitsettings' onclick='$(\"#settingsform\").children().each(function(){if($(this).attr(\"class\")==\"formoption\"){if($(this).is(\":checked\"))story.settings[$(this).attr(\"id\")]=1;else story.settings[$(this).attr(\"id\")]=0;}}); goToQuest(0);'>Salva</button></div>",
	"quests": [
		{	
			"quest_html": "<div id='quest0' class='quest'> <div id='questtitle'>Prima quest</div> </div>",
			"activities": [
				{
					"activity_html": "<div id='activity0' class='activity'> <p>Questa è la prima attività.<br>Clicca su PROSEGUI per andare alla seconda.</p> <button id='activity0answerfield' class='answerfield' onclick='if (story.settings.optionchoice1) goToActivity(1); else goToActivity(2);'>Prosegui</button> </div>",
					"right_answer": "",
					"need_human_evaluation": false,
					"action_on_activity_answer": "goToActivity(1);" // ignorare questo campo
				},
				{
					"activity_html": "<div id='activity1' class='activity'> <p>Questa è la seconda attività. Avevi scelto la prima opzione.<br>Clicca su FINE per completare il test.</p> <button id='activity1answerfield' class='answerfield' onclick='window.alert(\"Test andato a buon fine\");'>Fine</button> </div>",
					"right_answer": "",
					"need_human_evaluation": false,
					"action_on_activity_answer": "window.alert('Test andato a buon fine');" // ignorare questo campo
				},
				{
					"activity_html": "<div id='activity2' class='activity'> <p>Questa è la terza attività. Avevi scelto la seconda opzione.<br>Clicca su FINE per completare il test.</p> <button id='activity1answerfield' class='answerfield' onclick='window.alert(\"Test andato a buon fine\");'>Fine</button> </div>",
					"right_answer": "",
					"need_human_evaluation": false,
					"action_on_activity_answer": "window.alert('Test andato a buon fine');" // ignorare questo campo
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
		if (document.getElementById("settingsform") == null) window.alert("errore"); // debugging
		$( "#settingsform" ).replaceWith( story.quests[0].quest_html );
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