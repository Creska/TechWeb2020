var StoryObj = storia; // QUESTA E' LA VARIABILE DELLA STORIA



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
	QuestID: -1,
	ActivityN: -1,
	TimeToAnswer: 0,
	AlreadyHelped: 0,
	ChatMessages: 0,
	TotalScore: 0
};


var Chronometer;


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
	$( "#Main" ).prepend( $( "<h1 aria-level='1' class='StoryTitle'>" + StoryObj.story_title + "</h1>" ) );
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
	CurrentStatus.QuestID = StoryObj.quests[quest_n].quest_ID;

	let NewQuest = $( "<section class='Quest' aria-relevant='additions text'><p role='alert' aria-live='assertive' class='sr-only'>Nuova quest</p></section>" );
	NewQuest.attr( "id", assignID( "Quest" ) );
	NewQuest.append( $( "<h2 aria-level='2' class='QuestTitle'>" + StoryObj.quests[quest_n].quest_title + "</h2>" ) );

	$( ".Quest" ).replaceWith( NewQuest );

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
		
	NewActivity.append( $( "<p role='alert' aria-live='assertive' class='sr-only'>Nuova attività</p>" ) );

	NewActivityText = $( "<div/>",
	{
		"class": "ActivityText"
	});

	$.each( StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].activity_text, function(index, value) {
		addTextPart( NewActivityText, value, index );
	});

	NewActivity.append( NewActivityText );

    if ( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].activity_type == 'ANSWER' ) {
		let AF = $( "<div class='AnswerField'></div>" );
		AF.append( $( "<p class='AnswerFieldDescription'>" + StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field.description + "</p>" ));

		switch ( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field.type ) {
			case 'checklist':
				AF.append( $( "<ul class='AnswerInput'></ul>" ) );
				let newli;

				$.each( StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field.options, function(index, value) {
					newli = $( "<li class='form-check'></li>" );
					newli.append( $( "<input/>",
					{
						class: "form-check-input",
						type: "radio",
						name: "radio-checklist",
						id: "opt" + index
					}));
					newli.append( $( "<label/>",
					{
						class: "form-check-label",
						for: "opt" + index,
						text: value
					}));
					AF.find( ".AnswerInput" ).append( newli );
				});
				break;
			case 'text':
				AF.append( $( "<input/>",
				{
					type: "text",
					placeholder: "Risposta"
				}));
				break;
			case 'number':
				AF.append( $( "<input/>",
				{
					type: "number",
					placeholder: "0"
				}));
				break;
			case 'date':
			case 'time':
				AF.append( $( "<input/>", { type: StoryObj.quests[CurrentStatus.QuestN].activities[activity_n].answer_field.type } ) );
				break;
			default:
				handleError();
		}

		NewActivity.append(AF);
	}

	if ( StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].FINAL )
		NewActivity.append( $( "<button class='CloseGameBtn' onclick='window.close()'>CHIUDI</button>" ) );
	else
		NewActivity.append( $( "<button class='NextActivity' onclick='nextStage();'>PROSEGUI</button>" ) );

	$( ".Activity" ).remove();
	$( ".Quest" ).append( NewActivity );

	CurrentStatus.TimeToAnswer = 0;
	CurrentStatus.AlreadyHelped = 0;
	CurrentStatus.ChatMessages = 0;

	toggleChronometer();
};


/**
 * @param container --> puntatore al nodo che contiene tutto il testo dell'attività
 * @param node --> nodo da aggiungere al container
 * @param  {...any} other --> viene passato un indice per creare sul momento un id per la galleria
 * Aggiunge un nuovo pezzo al testo dell'attività (paragrafo di testo, immagine o galleria)
 */
function addTextPart( container, node, ...other ) {
	if ( node.type == "text" ) {
		if ( node.content ) {
			container.append( $( "<p/>",
			{
				class: "TextParagraph",
				text: node.content
			}));
		}
	}
	else if ( node.type == "gallery" ) {
		if ( node.content.length === 1 ) {
			container.append( $( node.content[0] ).attr( "class", "SingleImage" ) );
		}
		else if ( node.content.length > 1 ) {
			let newgallery = $(`
			<div class="carousel slide ImageGallery" aria-label="Galleria di immagini" data-interval="false">
				<div class="carousel-inner"></div>
				<a class="carousel-control-prev" role="button" data-slide="prev">
    				<span class="carousel-control-prev-icon" aria-hidden="true"></span>
    				<span class="sr-only">Immagine precedente</span>
  				</a>
  				<a class="carousel-control-next" role="button" data-slide="next">
    				<span class="carousel-control-next-icon" aria-hidden="true"></span>
    				<span class="sr-only">Immagine successiva</span>
  				</a>
			</div>`);

			newgallery.attr( "id", "gallery" + arguments[2] );
			newgallery.find( "a" ).attr( "href", "#gallery" + arguments[2] );

			let newimage;
			$.each( node.content, function(index, value) {
				newimage = $( value ).attr( "class", "d-block w-100" );
				if (index === 0 )
					newgallery.find( ".carousel-inner" ).append( newimage.wrap( "<div class='carousel-item active'></div>" ).parent() );
				else
					newgallery.find( ".carousel-inner" ).append( newimage.wrap( "<div class='carousel-item'></div>" ).parent() );
			});
			container.append( newgallery );
		}
	}
};


/**
 * Attiva l'interval timer che aumenta ogni 5s il TimeToAnswer. Invia eventualmente una richiesta di aiuto (non visibile al player) al valutatore
 */
function toggleChronometer() {
	Chronometer = setInterval( function() {
		CurrentStatus.TimeToAnswer += 5000;

		if ( StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].GET_CHRONO && !CurrentStatus.AlreadyHelped && 
			CurrentStatus.TimeToAnswer > StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN].expected_time ) {
			/* TODO - invia richiesta di aiuto */
			CurrentStatus.AlreadyHelped = true;
			console.log("HELP"); // debugging
		}
	}, 5000 );
};


/**
 * Funzione che viene attivata cliccando il pulsante "Prosegui". Attiva il check della risposta oppure passa all'attività successiva, a seconda di come l'autore ha impostato. Invia anche lo status del player al valutatore
 */
function nextStage() {
	let CurrentStage = StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN];

	clearInterval( Chronometer );
	
	if ( CurrentStage.activity_type == 'ANSWER' )
		checkAnswer();
	else if ( CurrentStage.activity_type == 'READING') {
		if ( CurrentStage.answer_outcome[0].nextquest )
			goToQuest( CurrentNavStatus.QuestN + 1 );
		else
			goToActivity( CurrentStage.answer_outcome[0].nextactivity );
	}

	console.log( CurrentStatus ); // debugging
	/* TODO - invia status */
};


/**
 * In base alla risposta data, invia il giocatore all'attività rispettiva.
 * Nel caso si necessiti valutazione umana, la procedura attiva una chiamata al server.
 */
function checkAnswer() {
	let CurrentActivity = StoryObj.quests[CurrentStatus.QuestN].activities[CurrentStatus.ActivityN];

	if ( CurrentActivity.ASK_EVAL ) {
		/* TODO - manda richiesta */
	}
	else {
		let PlayerAnswer = "";

		if ( CurrentActivity.answer_field.type == 'checklist' ) {
			$( ".AnswerField input" ).each( function() {
				if ( $(this).prop( "checked" ) ) PlayerAnswer = $(this).next().text();
			});
		}
		else
			PlayerAnswer = $( ".AnswerField" ).find( "input" ).first().val();
		
		/* aggiorna il punteggio e controlla come proseguire la partita */

		let default_index;

		$.each( CurrentActivity.answer_outcome, function(index, value) {
			if ( value.response == PlayerAnswer ) {
				if ( value.nextquest ) {
					goToQuest( CurrentStatus.QuestN + 1 );
				}
				else {
					goToActivity( value.nextactivity );
				}

				CurrentStatus.TotalScore += parseInt(value.score) || 0;
				return false;
			}

			if ( value.response == "default" )
				default_index = index;

			if ( (index == CurrentActivity.answer_outcome.length - 1) && (value.response != PlayerAnswer) ) {
				if ( CurrentActivity.answer_outcome[default_index].nextquest ) {
					goToQuest( CurrentStatus.QuestN + 1 );
				}
				else {
					goToActivity( CurrentActivity.answer_outcome[default_index].nextactivity );
				}

				CurrentStatus.TotalScore += parseInt(CurrentActivity.answer_outcome[default_index].score) || 0;
				return false;
			}
		});
	}
};