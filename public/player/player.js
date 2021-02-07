var StoryObj; // QUESTA E' LA VARIABILE DELLA STORIA

var socket; // contains the socket for this specific player

var Status = {
	QuestID: null,
	ActivityID: null,
	time_elapsed: 0, // tempo passato dall'inizio dell'attività corrente
	TotalScore: 0
};

var ActivityRecap = {
	TimeToAnswer: 0,
	ChatMessages: 0,
	Score: 0
};

var IntervalTimer;

var questmap; // per ogni questID indica [oggetto dell'array, indice all'interno di esso]
var activitymap; // per ogni activityID indica [oggetto dell'array, id della quest madre, indice all'interno dell'array]



$(function () {
	/* query e caricamento della storia */
	socket = io.connect('', { query: "type=player" });
	$.get("/player/loadJSON", function (data) {
		StoryObj = JSON.parse(data);
		console.log(StoryObj); // debugging

		loadGame();
	});

	socket.on('valuator-message', (message) => {
		if ( message ) {
			$( "#list" ).append( $( "<blockquote/>", {
				"class": "valuator-msg",
				text: msg
			}));
		}
	});


	socket.on('input-valued', (activity_id, score) => {
		Status.TotalScore += parseInt(score) || 0;
		Status.ActivityRecap.Score += parseInt(score) || 0;

		goToActivity( activity_id );
	});
});



/**
 * @param answer --> stringa corrispondente alla risposta
 * Renderizza un loading ed invia la richiesta di valutazione al Valuator
 */
function validateInput( question, answer ) {
	$( ".NextActivity" ).attr( "disabled", true );
	$( ".NextActivity" ).html( '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only">Loading...</span>' );
		
	goToActivity( nextStageInOrder() ); // debugging

	socket.emit( 'validate-input-player', question, answer, socket.id );
};


/**
* funzione utilizzata per gestire le condizioni di errore all'interno del player
* in generale sarebbe meglio fermare l'applicazione e basta
*/
function handleError() {
	$( "footer" ).fadeOut();
	$( "#Main" ).empty();

	$( "#Main" ).append( $(`
	<section role="alert" class="text-center">
		<i class="fas fa-exclamation-circle fa-7x text-danger" aria-hidden="true"></i>
		<p role="alert">
			Qualcosa è andato storto! Il gioco putroppo non può essere proseguito. Non sarebbe dovuto succedere e ci scusiamo.
		</p>
	</select>`));
};


/* da attivare all'apertura della finestra */
function loadGame() {
	buildMaps();
	
	showAccess();

	if ( StoryObj.game_mode == "CLASS" ) {
		let group_alert = $( "<div class='alert alert-info' role='alert'/>" );
		group_alert.append( $( "<i/>", {
			"class": "fas fa-info-circle fa-2x p-2",
			"aria-hidden": "true"
		}));
		group_alert.append( $( "<p/>" ).html( "Appartieni al gruppo <strong>" + StoryObj.groupID + "</strong>" ) );
		$( "#StartScreen" ).children().first().after( group_alert );
	}
	
	if ( StoryObj.testing ) {
		$( "#Open" ).attr( "onclick", "" ); // disabilita la chat
	}

	$( "#StartBtn" ).attr( "disabled", false );
};


function startGame() {
	$( "#StartScreen" ).replaceWith( document.getElementById( "MainContainer" ).content.cloneNode(true) );

	$( "#Main" ).before( $( "<h1/>", {
		"class": "p-2 StoryTitle",
		role: "heading",
		"aria-level": "1",
		text: StoryObj.story_title
	}));

	goToActivity( StoryObj.quests[0].activities[0].activity_id );
};


/* mostra l'accessibilità - da attivare appena la finestra si apre */
function showAccess() {
	let alerts = [];

	if ( StoryObj.accessibility.WA_visual )
		alerts.push( "disabilità visive" );
	
	if ( StoryObj.accessibility.WA_motor )
		alerts.push( "disabilità motorie" );

	if ( StoryObj.accessibility.WA_hearing )
		alerts.push( "disabilità uditive" );

	if ( StoryObj.accessibility.WA_convulsions )
		alerts.push( "problemi legati a convulsioni e/o epilessia" );
	
	if ( StoryObj.accessibility.WA_cognitive )
		alerts.push( "disabilità cognitive" );

	let accessibility_alert;
	if ( alerts.length ) {
		accessibility_alert = $( '<div class="alert alert-success accessibility-alert" role="alert"/>' );
		accessibility_alert.append( $( "<i/>", {
			"class": "fas fa-check-circle fa-2x p-2",
			"aria-hidden": "true"
		}));
		accessibility_alert.append( $( "<p>Il gioco è accessibile per gli utenti affetti da:</p><ul></ul>" ) );
		$.each( alerts, function( i, str ) {
			accessibility_alert.find( "ul" ).append( $( "<li/>", { text: str } ) );
		});
	}
	else {
		accessibility_alert = $( '<div class="alert alert-danger accessibility-alert" role="alert"/>' );
		accessibility_alert.append( $( "<i/>", {
			"class": "fas fa-times-circle fa-2x p-2",
			"aria-hidden": "true"
		}));
		accessibility_alert = $( '<p>Il gioco purtroppo <strong>non</strong> è accessibile.</p>' );
	}

	$( "#StartScreen" ).prepend( accessibility_alert );
};


/* crea la mappa delle quest e delle attività */
function buildMaps() {
	questmap = new Map();
	activitymap = new Map();

	$.each( StoryObj.quests, function( qi, quest ) {
		questmap[ quest.quest_id ] = [ quest, qi ];

		$.each( StoryObj.quests[qi].activities, function( ai, activity ) {
			activitymap[ activity.activity_id ] = [ activity, quest.quest_id, ai ];
		});
	});
};


function goToActivity( aid ) {
	sendActivityRecap();

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
		id: aid,
		style: "display:none;"
	});

	newactivity.append( $( "<div class='ActivityText'/>" ) );
	writeActivityText( newactivity.find( ".ActivityText" ) );

	if ( StoryObj.testing ) {
		newactivity.append( $( "<button/>", {
			"class": "NextActivity",
			onclick: "goToActivity( nextStageInOrder() );",
			text: "PROSSIMA IN ORDINE NUMERICO"
		}));
	}
	else {
		if ( activitymap[ aid ][0].activity_type == "READING" ) {
			if ( activitymap[ aid ][0].FINAL ) {
				newactivity.append( $( "<button/>", {
					"class": "CloseGameBtn",
					onclick: "endGame();",
					text: "FINE"
				}));
	
				/* TODO - togli la chat */
			}
			else {
				newactivity.append( $( "<button/>", {
					"class": "NextActivity",
					onclick: "goToNextActivity();",
					text: "PROSEGUI"
				}));
			}
		}
		else {
			buildAnswerField( newactivity );
			newactivity.append( $( "<button/>", {
				"class": "NextActivity",
				onclick: "goToNextActivity();",
				text: "PROSEGUI"
			}));
		}
	}

	$( "#Main .Activity" ).remove();
	$( "#Main .Quest .sr-only" ).remove();

	/* appende l'attività e resetta tutto ciò che va resettato */
	$( "#Main .Quest" ).append( $( "<div/>", {
		role: "alert",
		"aria-live": "assertive",
		"class": "sr-only",
		text: "nuova attività"
	}));
	$( "#Main .Quest" ).append( newactivity );
	$( "#Main .Activity" ).fadeIn( "slow" );

	$( "#list" ).empty();
	Status.time_elapsed = 0;
	ActivityRecap = {
		TimeToAnswer: 0,
		ChatMessages: 0,
		Score: 0
	};
	
	IntervalTimer = setInterval(function () {
		Status.time_elapsed += 5000;
		ActivityRecap.TimeToAnswer += 5000;

		sendStatus();
	}, 5000);
};


function goToQuest( qid ) {
	if ( qid == null || qid === "" || questmap[ qid ] == undefined ) {
		handleError();
		return;
	}

	Status.QuestID = qid;

	let newquest = $( "<section/>", {
		"class": "Quest",
		id: qid,
		"aria-relevant": "additions text",
		style: "display:none;"
	});

	newquest.append( $( "<h2/>", {
		"class": "QuestTitle",
		"aria-level": "3",
		text: questmap[ qid ][0].quest_title 
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
	$( "#Main .Quest" ).fadeIn( "slow" );
};


function goToNextActivity() {
	clearInterval( IntervalTimer );

	let activity = activitymap[ Status.ActivityID ][0];

	if ( activity.ASK_EVAL ) {
		validateInput( $( ".AnswerFieldDescription" ).first().text(), getPlayerAnswer() );
		return;
	}
	
	if ( activity.activity_type == "READING" ) {
		if ( activity.answer_outcome[0].next_activity_id ) {
			ActivityRecap.Score = parseInt( activity.answer_outcome[0].score ) || 0;
			Status.TotalScore += ActivityRecap.Score;

			goToActivity( activity.answer_outcome[0].next_activity_id );
		}
		else {
			goToActivity( nextStageInOrder() );
		}
	}
	else {
		let player_answer = getPlayerAnswer();
		$.each( activity.answer_outcome, function( i, outcome ) {
			if ( i > 0 ) {
				if ( outcome.condition.toLowerCase() == player_answer ) {
					ActivityRecap.Score = parseInt( outcome.score ) || 0;
					Status.TotalScore += ActivityRecap.Score;

					goToActivity( outcome.next_activity_id );
					return;
				}
			}	
		});

		if ( activity.answer_outcome[0].next_activity_id ) {
			ActivityRecap.Score = parseInt( activity.answer_outcome[0].score ) || 0;
			Status.TotalScore += ActivityRecap.Score;

			goToActivity( activity.answer_outcome[0].next_activity_id );
		}
		else {
			goToActivity( nextStageInOrder() );
		}
	}
};


function nextStageInOrder() {
	/* se questa attività NON è l'ultima di questa quest, conduce all'attività successiva */
	/* altrimenti, conduce alla quest successiva, sempre che la quest in corso non sia l'ultima */

	if ( activitymap[ Status.ActivityID ][2] < questmap[ Status.QuestID ][0].activities.length - 1 ) {
		return StoryObj.quests[ questmap[ Status.QuestID ][1] ].activities[ activitymap[ Status.ActivityID ][2] + 1 ].activity_id;
	}
	else {
		if ( questmap[ Status.QuestID ][1] < StoryObj.quests.length - 1  ) {
			return StoryObj.quests[ questmap[ Status.QuestID ][1] + 1 ].activities[0].activity_id;
		}
	}

	return null;
};


function writeActivityText( container ) {
	let activity = activitymap[ Status.ActivityID ][0];

	$.each( activity.activity_text, function( i, node ) {
		if ( node.type == "text" ) {
			container.append( $( "<p/>", {
				"class": "p-3 TextPar",
				text: node.content
			}));
		}
		else if ( node.type == "gallery" ) {
			let newgallery = $( `
			<div class="carousel slide p-3 ImageGallery" aria-label="Galleria di immagini" data-interval="false">
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
				
				pic.src = pic.src.replace( "unpublished", "published" ); // debugging

				newimage.append( $( "<img/>", {
					"class": "d-block w-100",
					alt: pic.alt,
					src: pic.src
				}));

				newimage.append( $( "<div/>", {
					"class": "carousel-caption", // le classi d-none e d-md-block fanno scomparire le captions su schermi piccoli
					"aria-hidden": "true"
				}));

				newimage.find( ".carousel-caption" ).append( $( "<p/>", {
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

	let AF = $( "<div class='AnswerField'>" ); // su questo bisogna poi ragionarci nel caso dia fastidio all'accessibilità

	AF.append( $( "<p/>", {
		"class": "AnswerFieldDescription",
		text: activity.answer_field.description
	}));

	let answerinput;

	switch ( activity.answer_field.type ) {
		case "checklist":
			answerinput = $( "<ul class='AnswerInput'/>" );
			let answeropt;

			$.each( activity.answer_field.options, function( opt_i, opt ) {
				answeropt = $( "<li class='form-check'/>" );
				answeropt.append( $( "<input/>", {
					"class": "form-check-input",
					type: "radio",
					name: "AnswerInputRadio",
					id: "opt" + opt_i,
					value: opt_i
				}));
				answeropt.append( $( "<label/>", {
					"class": "form-check-label",
					for: "opt" + opt_i,
					text: opt
				}));
				answerinput.append( answeropt );
			});
			break;
		case "text":
			answerinput = $( "<textarea/>", {
				"class": "AnswerInput w-100",
				placeholder: "Risposta"
			});
			break;
		case "number":
			answerinput = $( "<input/>", {
				"class": "AnswerInput",
				type: "number",
				placeholder: "0"
			});
			break;
		case "date":
		case "time":
			answerinput = $( "<input/>", {
				type: activity.answer_field.type
			});
			break;
		default:
			handleError();
			return;
	}

	AF.append( answerinput );

	container.append( AF );
};


function getPlayerAnswer() {
	let field = activitymap[ Status.ActivityID ][0].answer_field;

	switch ( field.type ) {
		case "checklist":
			if ( $( ".AnswerInput input:checked" ).length ) {
				return field.options[ $( ".AnswerInput input:checked" ).first().val() ].toLowerCase();
			}
			break;
		case "text":
		case "number":
		case "date":
		case "time":
			return $( ".AnswerInput" ).first().val().toLowerCase();
	}

	return null;
};


function sendMsg( msg ) {
	if ( msg === "" )
		return;
	
	//client can't route the rooms: only the server can. I need to send the data there
	socket.emit( 'chat-message', msg, socket.id );

	$( "#chat-room input" ).val( "" );
	ActivityRecap.ChatMessages += 1;
	$( "#list" ).append( $( "<blockquote/>", {
		"class": "player-msg",
		text: msg
	}));
};


function endGame() {
	clearInterval( IntervalTimer );
	sendActivityRecap();

	/* TODO - porta ad una schermata finale */
};


function sendStatus() {
	/*
	$.ajax({
		url: "/player/playersActivities",
		type: "POST",
		processData: false,
		data: Status
	});
	*/

	console.log( Status ); // debugging
};


function sendActivityRecap() {
	let recap = {
		QuestID: Status.QuestID,
		ActivityID: Status.ActivityID,
		TimeToAnswer: ActivityRecap.TimeToAnswer,
		ChatMessages: ActivityRecap.ChatMessages,
		Score: ActivityRecap.Score
	};

	/*
	$.ajax({
		url: "player/activityUpdate",
		type: "POST",
		processData: false,
		data: recap
	});
	*/

	console.log( recap ); // debugging
};