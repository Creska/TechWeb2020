var StoryObj; // QUESTA E' LA VARIABILE DELLA STORIA

var socket; // contains the socket for this specific player

var Status = {
	QuestID: null,
	ActivityID: null,
	time_elapsed: 0, // tempo passato dall'inizio dell'attività corrente
	TotalScore: 0
};

var ActivityRecap = {
	TimeToAnswer: null,
	ChatMessages: null,
	Score: null
};

var IntervalTimer;

var questmap; // per ogni questID indica l'oggetto dell'array
var activitymap; // per ogni activityID indica [oggetto dell'array, id della quest madre]



$(function () {
	/* query e caricamento della storia */
	socket = io.connect('', { query: "type=player" });
	$.get("/player/loadJSON", function (data) {
		StoryObj = JSON.parse(data);
		console.log(StoryObj); // debugging

		$( "body" ).children().first().after( $( "<h1/>", 
		{
			"class": ".StoryTitle",
			role: "heading",
			"aria-level": "2",
			text: StoryObj.story_title
		}));

		loadGame();
	});

	/* invio messaggio chat */
	$('#chat-room form').on("submit", function (e) {
		e.preventDefault();
		//client can't route the rooms: only the server can. I need to send the data there
		socket.emit('chat-message', $('#message').val(), socket.id);
		$('#message').val('');
		Status.ChatMessages += 1;
		return false;
	})


	socket.on('valuator-message', (message) => {
		if ( message )
			$( "#chat-test" ).append( "<p>" + message + "</p>" ); // test
	})


	socket.on('input-valued', (nextQuest, activity_n, score) => {
		Status.TotalScore += score;
		Status.ActivityRecap.Score += score;
		
		/* TODO - invio status */

		if ( nextQuest )
			goToQuest( Status.QuestN + 1 );
		else ( nextQuest )
			goToActivity( activity_n );
	});
});


/* FUNZIONE USATA PER I TEST */
function test_story(par) {
	switch (par) {
		case "a":
			StoryObj = storia7_10;
			break;
		case "b":
			StoryObj = storia11_14;
			break;
		case "c":
			StoryObj = storia15_18;
	}

	startGame();
}



/**
 * @param answer --> stringa corrispondente alla risposta
 * Renderizza un loading ed invia la richiesta di valutazione al Valuator
 */
function validateInput( answer ) {
	/* TODO - inserire il loading al posto della schermata della quest */
	socket.emit('validate-input-player', StoryObj.quests[Status.QuestN].activities[Status.QuestN].answer_field, answer, socket.id);
};


/**
* funzione utilizzata per gestire le condizioni di errore all'interno del player
* in generale sarebbe meglio fermare l'applicazione e basta
*/
function handleError() {
	window.alert("!!! MAJOR ERROR !!!");
};


/* NUOVE FUNZIONI */

/* da attivare all'apertura della finestra */
function loadGame() {
	buildMaps();
	
	showAccess();

	let group_alert = $( "<div class='alert alert-info' role='alert'/>" );
	group_alert.append( $( "<p/>" ).html( "Appartieni al gruppo <em>" + StoryObj.groupID + "</em>" ) );
	$( "#StartScreen" ).children().first().after( group_alert );
};


function startGame() {
	$( "#StartScreen" ).replaceWith( document.getElementById( "MainContainer" ).content.cloneNode(true) );
	goToActivity( StoryObj.quests[0].activities[0].activity_id );
};


/* mostra l'accessibilità - da attivare appena la finestra si apre */
function showAccess() {
	let alerts = [];

	if ( StoryObj.accessibility.WA_visual )
		alerts.append( "disabilità visive" );
	
	if ( StoryObj.accessibility.WA_motor )
		alerts.append( "disabilità motorie" );

	if ( StoryObj.accessibility.WA_hearing )
		alerts.append( "disabilità uditive" );

	if ( StoryObj.accessibility.WA_convulsions )
		alerts.append( "problemi legati a convulsioni e/o epilessia" );
	
	if ( StoryObj.accessibility.WA_cognitive )
		alerts.append( "disabilità cognitive" );

	let accessibility_alert;
	if ( alerts.length ) {
		accessibility_alert = $( '<div class="alert alert-success accessibility-alert" role="alert"/>' );
		accessibility_alert.append( $( "<p>Il gioco è accessibile per gli utenti affetti da:</p><ul></ul>" ) );
		$.each( alerts, function( i, str ) {
			accessibility_alert.find( "ul" ).append( $( "<li/>", { text: str } ) );
		});
	}
	else {
		accessibility_alert = $( '<div class="alert alert-danger accessibility-alert" role="alert"/>' );
		accessibility_alert = $( '<p>Il gioco purtroppo <strong>non</strong> è accessibile.</p>' );
	}

	$( "#StartScreen" ).prepend( accessibility_alert );
};


/* crea la mappa delle quest e delle attività */
function buildMaps() {
	$.each( StoryObj.quests, function( qi, quest ) {
		questmap[ quest.quest_id ] = quest;

		$.each( StoryObj.quests[qi].activities, function( ai, activity ) {
			activitymap[ activity.activity_id ] = [ activity, quest.quest_id ];
		});
	});
};


function goToActivity( aid ) {
	/* invia recap attività precedente */

	if ( aid == null || aid === "" || activitymap[ aid ] == undefined ) {
		handleError();
		return;
	}

	if ( Status.QuestID != activitymap[ aid ][1] ) {
		goToQuest( activitymap[ aid ][1] ); // va alla nuova quest
	}

	Status.ActivityID = aid;

	let newactivity = $( "<div/>", {
		"class": "Activity",
		id: aid
	});

	newactivity.append( $( "<div class='ActivityText'/>" ) );
	writeActivityText( newactivity.find( ".ActivityText" ) );

	if ( activitymap[ aid ][0].activity_type == "READING" ) {
		if ( activitymap[ aid ][0].FINAL ) {
			/* appendi bottone di chiusura */
		}
		else {
			/* appendi bottone prosegui */
		}
	}
	else {
		buildAnswerField( newactivity );
		/* appendi bottone prosegui */
	}

	$( "#Main .Activity" ).remove();
	$( "#Main .Quest .sr-only" ).remove();

	$( "#Main .Quest" ).append( $( "<div/>", {
		role: "alert",
		"aria-live": "assertive",
		"class": "sr-only",
		text: "nuova attività"
	}));

	$( "#Main .Quest" ).append( newactivity );

	IntervalTimer = setInterval(function () {
		Status.time_elapsed += 5000;

		/* invia stats */
	}, 5000);
};


function goToQuest( qid ) {
	if ( aid == null || qid === "" || questmap[ qid ] == undefined ) {
		handleError();
		return;
	}

	Status.QuestID = qid;

	let newquest = $( "<section/>", {
		"class": "Quest",
		id: qid,
		"aria-relevant": "additions text"
	});

	newquest.append( $( "<h2/>", {
		"class": "QuestTitle",
		"aria-level": "3",
		text: questmap[ qid ].quest_title 
	}));

	$( "#Main .Quest" ).remove();
	$( "#Main .sr-only" ).remove();

	$( "#Main" ).append( $( "<div/>", {
		role: "alert",
		"aria-live": "assertive",
		"class": "sr-only",
		text: "nuova quest"
	}));

	$( "#Main" ).append( newquest );
};


function goToNextActivity() {
	/* clear timer */
	/* clear history */
	
	let activity = activitymap[ Status.ActivityID ][0];

	if ( activity.ASK_EVAL ) {
		/* richiedi valutazione */
		return;
	}
	
	if ( activity.activity_type == "READING" ) {
		if ( activity.answer_outcome.length ) {
			/* incrementa punteggio */
			/* vai ad attività specificata */
		}
		else {
			/* cerca outcome */
			/* vai ad attività specificata */
		}
	}
	else {
		let player_answer = getPlayerAnswer();

		/* scansiona array */
			/* if outcome specifico trovato */
				/* update score */
				/* vai ad attività specifica */
				/* return */

		/* c'è un main outcome */
			/* update score */
			/* vai ad attività specifica */
		/* altrimenti */
			/* cerca outcome */
			/* vai ad attività specificata */
	}
};


function writeActivityText( container ) {
	let activity = activitymap[ Status.ActivityID ][0];

	$.each( activity.activity_text, function( i, node ) {
		if ( node.type == "text" ) {
			container.append( $( "<p/>", {
				"class": "TextPar",
				text: node.content
			}));
		}
		else if ( node.type == "gallery" ) {
			let newgallery = $( `
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
			</div>` );

			newgallery.attr( "id", "gallery" + i );
			newgallery.find( "a" ).attr( "href", "#gallery" + i );

			let newimage;
			$.each( node.content, function( pic_i, pic ) {
				if ( pic_i === 0 )
					newimage = $( "<div class='carousel-item active'/>" );
				else
					newimage = $( "<div class='carousel-item'/>" );
				
				newimage.append( $( "<img/>", {
					"class": "d-block w-100",
					alt: pic.alt,
					src: pic.src
				}));

				newimage.append( $( "<p/>", {
					"aria-hidden": "true",
					text: pic.alt
				}));

				newgallery.children().first().append( newimage );
			});

			container.append( newgallery );
		}
		else if ( node.type == "video" ) {
			container.append( $( node.content ) );
		}
	});
};


function buildAnswerField( container ) {
	let activity = activitymap[ Status.ActivityID ][0];

	/* creare domanda */

	if ( activity.ASK_EVAL ) {
		/* crea un campo testo */
	}
	else {
		/* crea l'input field */
	}

	/* appendi la roba */
};