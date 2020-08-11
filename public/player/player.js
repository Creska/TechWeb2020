/* Riassunto del funzionamento:
Questo è solo un test, quindi presenta vari bug che bisogna evitare conoscendo il funzionamento di questo mini-programma.
Alla schermata dei settings viene richiesto di scegliere una delle due opzioni (evitare di cliccarle entrambe o nessuna). A seconda dell'opzione scelta, cambierà l'attività successiva alla prima.
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte.
*/

var StoryObj = {
	ACCESSIBILITY: 0,
	story_title: "",
	story_ID: -1,
	game_mode: "",
	quests: [
		{	
			quest_title: "",
			activities: [
				{
					activity_text: "",
					answer_field: "",
					right_answer: "",
					answer_score: "",
					answer_outcome: "",
					ASK_EVAL: 0,
					expected_time: 0
				}
			]
		}
	],
	stylesheet: "",
	score: []
};

// bottone standard per passare alla prossima attività - da completare. scopo: durante la fase di costruzione del gioco, il player lo inserisce alla fine di ogni attività
var NextActivityBtn = "<button class='NextActivity'>PROSEGUI</button>";


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


	/* ----------------- FUNZIONI DEL PLAYER --------------------------- */

	/**
	* funzione utilizzata per gestire le condizioni di errore all'interno del player
	* in generale sarebbe meglio fermare l'applicazione e basta
	*/
	function handleError() {
		window.alert( "!!! MAJOR ERROR !!!" );
	};

	
	/**
	 * Semplicemente avvia il gioco sostituendo alla schermata di benvenuto il container "Quest"
	 */
	function startGame() {
		$( "#StartScreen" ).replaceWith( $( "template" ).content );

		goToQuest( 0 );
	};

	
	/**
	 * @param name
	 * Assegna un ID ad alcuni particolari eleenti, sulla base del numero di quest (ed eventualmente attività) di cui fanno parte. Utile esclusivamente per far funzionare le personalizzazioni CSS
	 */
	function assignID( name ) {
		if ( name == "Quest") {
			return ( name + String( CurrentStatus.QuestN ) );
		}
		else if ( name == "Activity" ) {
			return ( "Quest" + String( CurrentStatus.QuestN ) + name + String( CurrentStatus.ActivityN ) );
		}
		else {
			return ( "Q" + String( CurrentStatus.QuestN ) + "A" + String( CurrentStatus.ActivityN ) + "_" + name );
		}
	};


	/**
	 * @param quest_n
	 * Carica a schermo la quest specificata. Svuota il container della quest e ci aggiunge il titolo nuovo. Poi carica la quest numero zero.
	 */
	function goToQuest( quest_n ) {
		CurrentStatus.QuestN = quest_n;

		let NewQuest = $( ".Quest" );
		NewQuest.empty();
		NewQuest.attr( "id", assignID( "Quest" ) );

		NewQuest.append( StoryObj.quests[quest_n].quest_title );

		goToActivity( 0 );
	};


	/**
	 * @param activity_n
	 * Carica a schermo l'attività specificata, inserendo il suo nodo come figlio del nodo Quest attivo.
	 * Inserisce anche un pulsante per andare all'attività successiva
	 */
	function goToActivity( activity_n ) {
		CurrentStatus.ActivityN = activity_n;

		let NewActivity = $( "<div/>",
		{
			"class": "Activity", // la documentazione richiede di usare i quote per la keyword class
			id: assignID( "Activity" )
		});
		console.log( NewActivity.attr("class")); // debugging

		NewActivity.append( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].activity_text );
		NewActivity.append( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field );
		
		let NewNextActivityBtn = $.parseHTML( NextActivityBtn );
		NewNextActivityBtn.attr( "onclick", StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_outcome ); // qua va controllata la faccenda di traduzione degli apici
		NewActivity.append( NewNextActivityBtn );

		$( ".Quest" ).append( NewActivity );
	};

	

});






