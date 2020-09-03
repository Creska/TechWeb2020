/* Riassunto del funzionamento:
Questo è solo un test, quindi presenta vari bug che bisogna evitare conoscendo il funzionamento di questo mini-programma.
Alla schermata dei settings viene richiesto di scegliere una delle due opzioni (evitare di cliccarle entrambe o nessuna). A seconda dell'opzione scelta, cambierà l'attività successiva alla prima.
NOTE:
* Per semplicità, l'applicazione internamente identifica le quest e le attività il base all'indice che esse hanno nell'array di cui fanno parte.
*/

var StoryObj = {
	ACCESSIBILITY: 0,
	story_title: "<div id='StoryTitle'>Storia di prova</div>",
	story_ID: -1,
	game_mode: "",
	quests: [
		{	
			quest_title: "<div class='QuestTitle'>Prima quest</div>",
			activities: [
				{
					activity_text: 
					[`<p>Questa è la prima attività della prima quest.<br>Ora un po' di testo per riempire<br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit pellentesque habitant morbi tristique senectus et. Scelerisque purus semper eget duis at tellus at urna condimentum. Sed faucibus turpis in eu mi. Amet est placerat in egestas. In hac habitasse platea dictumst vestibulum rhoncus. Velit egestas dui id ornare arcu odio. Ultricies tristique nulla aliquet enim tortor at auctor urna nunc. Luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Leo vel fringilla est ullamcorper eget nulla facilisi. Sed augue lacus viverra vitae congue eu consequat ac. Convallis posuere morbi leo urna molestie at elementum. At elementum eu facilisis sed. Vivamus at augue eget arcu dictum varius duis at. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum. Ultricies mi quis hendrerit dolor. Hac habitasse platea dictumst vestibulum. Erat imperdiet sed euismod nisi porta lorem mollis aliquam ut. Sit amet nulla facilisi morbi tempus iaculis urna. Leo in vitae turpis massa sed elementum tempus egestas. Venenatis cras sed felis eget velit aliquet sagittis id. Ut ornare lectus sit amet est placerat in egestas erat. Elit ut aliquam purus sit amet luctus venenatis lectus. In mollis nunc sed id semper risus in hendrerit. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Quisque non tellus orci ac auctor. Felis eget velit aliquet sagittis id consectetur purus ut faucibus.</p>`],
					answer_field: 
					`<div class='AnswerField'>
						<div class='AnswerFieldDescription'>Inserire la risposta corretta</div>
						<input type='text'>
					</div>`,
					right_answer: "",
					answer_score: 1,
					answer_outcome: "updateScore(); goToActivity(1);",
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 3000
				},
				{
					activity_text:
					[`<p>Questa è la seconda attività della prima quest.<br>Ancora un po' di testo per riempire<br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit pellentesque habitant morbi tristique senectus et. Scelerisque purus semper eget duis at tellus at urna condimentum. Sed faucibus turpis in eu mi. Amet est placerat in egestas. In hac habitasse platea dictumst vestibulum rhoncus. Velit egestas dui id ornare arcu odio. Ultricies tristique nulla aliquet enim tortor at auctor urna nunc. Luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Leo vel fringilla est ullamcorper eget nulla facilisi. Sed augue lacus viverra vitae congue eu consequat ac.</p>`,
					`<div id="Q0A1_Carousel" class="carousel slide" data-ride="carousel">
							<div class="carousel-inner">
					 			<div class="carousel-item active">
						  			<img src="../images/milan.jpg" class="d-block w-100" alt="...">
					  			</div>
					  			<div class="carousel-item">
									<img src="../images/turin.jpg" class="d-block w-100" alt="...">
					  			</div>
							</div>
							<a class="carousel-control-prev" href="#Q0A1_Carousel" role="button" data-slide="prev">
    							<span class="carousel-control-prev-icon" aria-hidden="true"></span>
    							<span class="sr-only">Previous</span>
  							</a>
  							<a class="carousel-control-next" href="#Q0A1_Carousel" role="button" data-slide="next">
    							<span class="carousel-control-next-icon" aria-hidden="true"></span>
    							<span class="sr-only">Next</span>
  							</a>
						</div>
					</div>`],
					answer_field:
					`<div class='AnswerField'>
						<div class='AnswerFieldDescription'>Checklist a caso:</div>
						<ul class='AnswerInput'>
							<li>
								<input type='radio' id='radio0'>
								<label for='radio0'>Prima</label>
							</li>
							<li>
								<input type='radio' id='radio1'>
								<label for='radio1'>Seconda</label>
							</li>
							<li>
								<input type='radio' id='radio2'>
								<label for='radio2'>Terza</label>
							</li>
							<li>
								<input type='radio' id='radio3'>
								<label for='radio3'>Quarta</label>
							</li>
							<li>
								<input type='radio' id='radio4'>
								<label for='radio4'>Quinta</label>
							</li>
							<li>
								<input type='radio' id='radio5'>
								<label for='radio5'>Sesta</label>
							</li>
						</ul>
					</div>`,
					right_answer: "",
					answer_score: 420,
					answer_outcome: "updateScore(); goToQuest(1);",
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 5000
				}
			]
		},
		{
			quest_title: "<div class='QuestTitle'>Seconda quest</div>",
			activities: [
				{
					activity_text: 
					[`<p>Questa è la prima attività della seconda quest.<br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Elit pellentesque habitant morbi tristique senectus et. Scelerisque purus semper eget duis at tellus at urna condimentum. Sed faucibus turpis in eu mi. Amet est placerat in egestas. In hac habitasse platea dictumst vestibulum rhoncus. Velit egestas dui id ornare arcu odio. Ultricies tristique nulla aliquet enim tortor at auctor urna nunc. Luctus venenatis lectus magna fringilla urna porttitor rhoncus dolor purus. Tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed. Leo vel fringilla est ullamcorper eget nulla facilisi. Sed augue lacus viverra vitae congue eu consequat ac. Convallis posuere morbi leo urna molestie at elementum. At elementum eu facilisis sed. Vivamus at augue eget arcu dictum varius duis at. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum. Ultricies mi quis hendrerit dolor. Hac habitasse platea dictumst vestibulum. Erat imperdiet sed euismod nisi porta lorem mollis aliquam ut. Sit amet nulla facilisi morbi tempus iaculis urna. Leo in vitae turpis massa sed elementum tempus egestas. Venenatis cras sed felis eget velit aliquet sagittis id. Ut ornare lectus sit amet est placerat in egestas erat. Elit ut aliquam purus sit amet luctus venenatis lectus. In mollis nunc sed id semper risus in hendrerit. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Quisque non tellus orci ac auctor. Felis eget velit aliquet sagittis id consectetur purus ut faucibus.</p>`],
					answer_field: 
					`<div class='AnswerField'>
						<div class='AnswerFieldDescription'>Inserire la risposta corretta</div>
						<input type='text'>
					</div>`,
					right_answer: "",
					answer_score: 69,
					answer_outcome: "updateScore(); window.alert('fine del test'); for(var j = 0; j < StoryObj.score.length; j++) { console.log(StoryObj.score[j])}",
					ASK_EVAL: 0,
					GET_CHRONO: 1,
					expected_time: 10000
				}
			]
		}

	],
	stylesheet: "",
	score: []
};




var socket; // contains the socket for this specific player

function validateInput(answer, current_quest, current_activity) {
	// send the input to be validated from the valuator
	// args: the current question being asked, the answer from the player, the ID of the player(socket)
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
});


	
/* ------------------------------------------------------------------------------- */



// indica il numero della quest attiva ed il numero dell'attività attiva
var CurrentStatus = {
	QuestN: -1,
	ActivityN: -1,
	TimeToAnswer: -1,
	ChatMessages: 0
};

var countdown;
var time_limit;
var answer_chrono = `
clearTimeout( 'time_limit');
clearInterval( 'countdown' );
CurrentStatus.TimeToAnswer = StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].expected_time - ( parseInt($('#AnswerTimer')) * 1000 )
console.log( CurrentStatus.TimeToAnswer ) // debugging`;

// bottone standard per passare alla prossima attività - da completare. scopo: durante la fase di costruzione del gioco, il player lo inserisce alla fine di ogni attività
var NextActivityBtn = "<button class='NextActivity'>PROSEGUI</button>";
var AnswerTimer = "<div id='AnswerTimer' role='timer'>0</div>";


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
	$( "#StartScreen" ).replaceWith( document.getElementById( "MainContainer" ).content.cloneNode(true) );
	$( "#Main" ).prepend( $.parseHTML( StoryObj.story_title ) );

	/* TODO: aggiungere l'alert riguardante l'accessibilità del gioco */

    goToQuest( 0 );
};

	
/**
* @param name
* Assegna un ID ad alcuni particolari elementi, sulla base del numero di quest (ed eventualmente attività) di cui fanno parte. Utile esclusivamente per far funzionare le personalizzazioni CSS
*/
function assignID( name ) {
	if ( name == "Quest") {
		return ( name + String( CurrentStatus.QuestN ) );
	}
	else if ( name == "Activity" ) {
		return ( "Quest" + String( CurrentStatus.QuestN ) + name + String( CurrentStatus.ActivityN ) );
	}
	else return;
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

	StoryObj.score.push( [] );

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
			id: assignID( "Activity" ),
			"aria-live": "assertive"
    	});

	NewActivityText = $( "<div/>",
	{
		"class": "ActivityText"
	});

	for ( i = 0; i <= StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].activity_text.length; i++ ) {
		NewActivityText.append( $.parseHTML( StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].activity_text[i] ));
	}

	NewActivity.append( NewActivityText );

    if ( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field != "" ) {
        NewActivity.append( $.parseHTML( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field ) );
	}

	$( ".Activity" ).remove();
	$( ".Quest" ).append( NewActivity );

	CurrentStatus.TimeToAnswer = -1;
	CurrentStatus.ChatMessages = 0;

	/* Se la domanda prevede un calcolo del cronometraggio, viene attivato il timer */
	if ( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].GET_CHRONO ) {
		$( ".Activity" ).append( $.parseHTML( AnswerTimer ) );
		$( ".Activity" ).append( $.parseHTML( NextActivityBtn ) );
		$( ".NextActivity" ).attr( "onclick", answer_chrono + StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_outcome );
		toggleAnswerTimer();
	}
	else {
		$( ".Activity" ).append( $.parseHTML( NextActivityBtn ) );
		$( ".NextActivity" ).attr( "onclick", StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_outcome );
	}
};


/**
 * Attiva il timer della domanda e il countdown dei secondi.
 */
function toggleAnswerTimer() {
	$( "#AnswerTimer" ).text( StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].expected_time / 1000 );

	countdown = setInterval( function() {
		$( "#AnswerTimer" ).text( $( "#AnswerTimer" ).text() - 1 );
	}, 1000 );

	time_limit = setTimeout( function() {
		window.alert("tempo scaduto");
		clearInterval( countdown );
	}, StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].expected_time );
};


/**
* Funzione che incrementa il punteggio ottenuto rispondendo alle domande in modo giusto
* La call viene inserita dall'editor all'interno della programmazione delle attività
*/
function updateScore() {
	StoryObj.score[CurrentStatus.QuestN].splice( CurrentStatus.ActivityN, 0, StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].answer_score );
};