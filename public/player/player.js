/* Riassunto del funzionamento:
Questo è solo un test, quindi presenta vari bug che bisogna evitare conoscendo il funzionamento di questo mini-programma.
Alla schermata dei settings viene richiesto di scegliere una delle due opzioni (evitare di cliccarle entrambe o nessuna). A seconda dell'opzione scelta, cambierà l'attività successiva alla prima.
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte.
*/

var Storia = {
	ACCESSIBILITY: 0,
	story_title: "<div id='StoryTitle'>Storia di prova</div>",
	story_ID: -1,
	game_mode: "Singleplayer",
	quests: [
		{	
			quest_title: "<div class='QuestTitle'>Prima quest</div>",
			activities: [
				{
					activity_text: "<div class='ActivityText'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div><div class='AnswerField'></div>",
					answer_field: "<div class='AnswerField_Description>Inserire la risposta</div><div class='AnswerField_Input'><input type='text'></div>",
					right_answer: "",
					answer_score: "",
					ASK_EVAL: 0,
					expected_time: 0
				}
			]
		}
	],
	stylesheet: "",
	score: []
};

// bottone standard per passare alla prossima attività - da completare. scopo: durante la fase di costruzione dle gioco, il player lo inserisce alla fine di ogni attività
var NextActivityButtonTemplate = "<button class='NextActivity'>PROSEGUI</button>";


var socket; // contains the socket for this specific player

function validateInput(answer, current_quest, current_activity) {
	/*send the input to be validated from the valuator
	args: the current question being asked, the answer from the player, the ID of the player(socket)
	*/
	var tempactivity = story.quests[current_quest].activities[current_activity];
	socket.emit('validate-input-player', tempactivity.question, answer, socket.id)
}

$(function () {
	$.get("/player/stories/published/" + $('#story-name').html(), function (data) {
		//removing the useless template
		$('#story-name').remove();
		story = data;
		console.log(data)
	})
	// $.ajax({
	// 	url: "/player/games/" + $('#game-name').html(),
	// 	method: "GET",
	// 	success: function (data) {
	// 			$('#game-name').remove();
	// 			var story = data;
	// 			console.log(data)
	// 	}
	// })
	socket = io.connect('', { query: "type=player" });
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
	socket.on('input-valued', (answer_is_right) => {
		//values: -1(no valuator online),0(wrong),1(right)
		if (answer_is_right == -1) {
			//TODO no valuator online handling
		}
		else if (answer_is_right == 0) {
			//TODO wrong input handling
		}
		else {
			//TODO right input handling
		}
	});

	// indica il numero della quest attiva ed il numero dell'attività attiva
	var CurrentStatus = {
		QuestN: -1,
		ActivityN: -1
	};

	$( "#StartScreen" ).prepend( Storia.story_title );

	/**
		* funzione utilizzata per gestire le condizioni di errore all'interno del player
		* in generale sarebbe meglio fermare l'applicazione e basta
		*/
	function handleError() {
		window.alert( "!!! MAJOR ERROR !!!" );
	};

	function goToActivity( activity_n ) {
		CurrentStatus.ActivityN = activity_n;

		let NewActivity = Storia.quests[CurrentStatus.QuestN].activities[activity_n].activity_text;
		NewActivity.attr( "id", "Quest" + String( CurrentStatus.QuestN ) + "Activity" + String( activity_n ) + "Text" );


	};


	/**
	 * @param quest_n
	 * Carica a schermo la quest specificata. Svuota il container della quest e ci aggiunge il titolo nuovo. Poi carica la quest numero zero.
	 */
	function goToQuest( quest_n ) {
		CurrentStatus.QuestN = quest_n;

		let Container = $( ".Quest" );
		Container.empty();

		Container.append( Storia.quests[quest_n].quest_title );
		$( ".QuestTitle" ).attr( "id", "Quest" + String( quest_n ) + "QuestTitle" );

		goToActivity( 0 );
	};


	/**
	 * Semplicemente avvia il gioco sostituendo alla schermata di benvenuto il container "Quest"
	 */
	function startGame() {
		$( "#StartScreen" ).replaceWith( $( "template" ).content );

		goToQuest( 0 );
	};

});






