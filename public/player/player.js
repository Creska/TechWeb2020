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


/**
* Semplicemente avvia il gioco sostituendo alla schermata di benvenuto il container "Quest"
 */
function startGame() {
	$("#StartScreen").replaceWith(document.getElementById("MainContainer").content.cloneNode(true));
	$("#Main").prepend($("<h1 aria-level='1' class='StoryTitle'>" + StoryObj.story_title + "</h1>"));
	goToQuest(0);
};


/**
* @param name
* Assegna un ID ad alcuni particolari elementi, sulla base del numero di quest (ed eventualmente attività) di cui fanno parte. Utile esclusivamente per far funzionare le personalizzazioni CSS
*/
function assignID(name) {
	if (name == "Quest") {
		return (name + String(Status.QuestN));
	}
	else if (name == "Activity") {
		return ("Quest" + String(Status.QuestN) + name + String(Status.ActivityN));
	}
	else return;
};


/**
* @param quest_n
* Carica a schermo la quest specificata. Svuota il container della quest e ci aggiunge il titolo nuovo. Poi carica la quest numero zero.
*/
function goToQuest(quest_n) {
	Status.QuestN = quest_n;
	Status.QuestID = StoryObj.quests[quest_n].quest_ID;

	let NewQuest = $("<section class='Quest' aria-relevant='additions text'><p role='alert' aria-live='assertive' class='sr-only'>Nuova quest</p></section>");
	NewQuest.attr("id", assignID("Quest"));
	NewQuest.append($("<h3 aria-level='2' class='QuestTitle'>" + StoryObj.quests[quest_n].quest_title + "</h3>"));

	$(".Quest").replaceWith(NewQuest);

	goToActivity(0);
};


/**
* @param activity_n
* Carica a schermo l'attività specificata, inserendo il suo nodo come figlio del nodo Quest attivo.
* Inserisce anche un pulsante per andare all'attività successiva
*/
function goToActivity(activity_n) {
	Status.ActivityN = activity_n;

	let NewActivity = $("<div/>",
		{
			"class": "Activity", // la documentazione richiede di usare i quote per la keyword class
			id: assignID("Activity")
		});

	NewActivity.append($("<p role='alert' aria-live='assertive' class='sr-only'>Nuova attività</p>"));

	NewActivityText = $("<div/>",
		{
			"class": "ActivityText"
		});

	$.each(StoryObj.quests[Status.QuestN].activities[Status.ActivityN].activity_text, function (index, value) {
		addTextPart(NewActivityText, value, index);
	});

	NewActivity.append(NewActivityText);

	if (StoryObj.quests[Status.QuestN].activities[activity_n].activity_type == 'ANSWER') {
		let AF = $("<div class='AnswerField'></div>");
		AF.append($("<p class='AnswerFieldDescription'>" + StoryObj.quests[Status.QuestN].activities[activity_n].answer_field.description + "</p>"));

		switch (StoryObj.quests[Status.QuestN].activities[activity_n].answer_field.type) {
			case 'checklist':
				AF.append($("<ul class='AnswerInput'></ul>"));
				let newli;

				$.each(StoryObj.quests[Status.QuestN].activities[activity_n].answer_field.options, function (index, value) {
					newli = $("<li class='form-check'></li>");
					newli.append($("<input/>",
						{
							class: "form-check-input",
							type: "radio",
							name: "radio-checklist",
							id: "opt" + index
						}));
					newli.append($("<label/>",
						{
							class: "form-check-label",
							for: "opt" + index,
							text: value
						}));
					AF.find(".AnswerInput").append(newli);
				});
				break;
			case 'text':
				AF.append($("<input/>",
					{
						type: "text",
						placeholder: "Risposta"
					}));
				break;
			case 'number':
				AF.append($("<input/>",
					{
						type: "number",
						placeholder: "0"
					}));
				break;
			case 'date':
			case 'time':
				AF.append($("<input/>", { type: StoryObj.quests[Status.QuestN].activities[activity_n].answer_field.type }));
				break;
			default:
				handleError();
		}

		NewActivity.append(AF);
	}

	if (StoryObj.quests[Status.QuestN].activities[Status.ActivityN].FINAL)
		NewActivity.append($("<div align='center'><button class='CloseGameBtn' onclick='window.close()'>CHIUDI</button></div>"));
	else
		NewActivity.append($("<div align='center'><button class='NextActivity' onclick='nextStage();'>PROSEGUI</button></div>"));

	$(".Activity").remove();
	$(".Quest").append(NewActivity);

	Status.time_elapsed = 0;
	Status.ActivityRecap.TimeToAnswer = 0;
	Status.ActivityRecap.AlreadyHelped = 0;
	Status.ActivityRecap.ChatMessages = 0;
	Status.ActivityRecap.Score = 0;

	IntervalTimer = setInterval(function () {
		Status.time_elapsed += 5000;

		if (StoryObj.quests[Status.QuestN].activities[Status.ActivityN].GET_CHRONO && !Status.ActivityRecap.AlreadyHelped &&
			Status.time_elapsed > StoryObj.quests[Status.QuestN].activities[Status.ActivityN].expected_time) {
			/* TODO - invia richiesta di aiuto */
			Status.ActivityRecap.AlreadyHelped = true;
			console.log("HELP"); // debugging
		}
	}, 5000);
};


/**
 * @param container --> puntatore al nodo che contiene tutto il testo dell'attività
 * @param node --> nodo da aggiungere al container
 * @param  {...any} other --> viene passato un indice per creare sul momento un id per la galleria
 * Aggiunge un nuovo pezzo al testo dell'attività (paragrafo di testo, immagine o galleria)
 */
function addTextPart(container, node, ...other) {
	if (node.type == "text") {
		if (node.content) {
			container.append($("<p/>",
				{
					class: "TextParagraph",
					text: node.content
				}));
		}
	}
	else if (node.type == "gallery") {
		if (node.content.length === 1) {
			container.append($(node.content[0]).attr("class", "SingleImage"));
		}
		else if (node.content.length > 1) {
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

			newgallery.attr("id", "gallery" + arguments[2]);
			newgallery.find("a").attr("href", "#gallery" + arguments[2]);

			let newimage;
			$.each(node.content, function (index, value) {
				newimage = $(value).attr("class", "d-block w-100");
				if (index === 0)
					newgallery.find(".carousel-inner").append(newimage.wrap("<div class='carousel-item active'></div>").parent());
				else
					newgallery.find(".carousel-inner").append(newimage.wrap("<div class='carousel-item'></div>").parent());
			});
			container.append(newgallery);
		}
	}
};


/**
 * Funzione che viene attivata cliccando il pulsante "Prosegui". Attiva il check della risposta oppure passa all'attività successiva, a seconda di come l'autore ha impostato. Invia anche lo status del player al valutatore
 */
function nextStage() {
	let CurrentStage = StoryObj.quests[Status.QuestN].activities[Status.ActivityN];

	clearInterval(IntervalTimer);
	Status.ActivityRecap.TimeToAnswer = Status.time_elapsed;

	if (CurrentStage.activity_type == 'ANSWER')
		checkAnswer();
	else if (CurrentStage.activity_type == 'READING') {
		if (CurrentStage.answer_outcome[0].nextquest)
			goToQuest(Status.QuestN + 1);
		else
			goToActivity(CurrentStage.answer_outcome[0].nextactivity);
	}
};


/**
 * In base alla risposta data, invia il giocatore all'attività rispettiva.
 * Nel caso si necessiti valutazione umana, la procedura attiva una chiamata al server.
 */
function checkAnswer() {
	let CurrentActivity = StoryObj.quests[Status.QuestN].activities[Status.ActivityN];

	let PlayerAnswer = "";

	if (CurrentActivity.answer_field.type == 'checklist') {
		$(".AnswerField input").each(function () {
			if ($(this).prop("checked")) PlayerAnswer = $(this).next().text();
		});
	}
	else
		PlayerAnswer = $(".AnswerField").find("input").first().val();


	if (CurrentActivity.ASK_EVAL) {
		validateInput( PlayerAnswer );
	}
	else {
		let default_index;
		let goto = {
			q: -1,
			a: -1
		};

		$.each(CurrentActivity.answer_outcome, function (index, value) {
			if (value.response == PlayerAnswer) {
				if (value.nextquest)
					goto.q = Status.QuestN + 1;
				else
					goto.a = value.nextactivity;

				Status.ActivityRecap.Score += parseInt(value.score) || 0;
				return false;
			}

			if (value.response == "default")
				default_index = index;

			if ((index == CurrentActivity.answer_outcome.length - 1) && (value.response != PlayerAnswer)) {
				if (CurrentActivity.answer_outcome[default_index].nextquest)
					goto.q = Status.QuestN;
				else
					goto.a = CurrentActivity.answer_outcome[default_index].nextactivity;

				Status.ActivityRecap.Score += parseInt(CurrentActivity.answer_outcome[default_index].score) || 0;
				return false;
			}
		});

		Status.TotalScore += Status.ActivityRecap.Score;

		/* TODO - invia status */

		if ( goto.q >= 0 )
			goToQuest( goto.q );
		else
			goToActivity( goto.a );
	}
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

	/* crea l'attività nuova */

	/* se c'è un'attività, la elimina */

	/* appende l'alert */

	/* appende l'attività */

	/* fa partire i timer */
};


function goToQuest( qid ) {
	if ( aid == null || qid === "" || questmap[ qid ] == undefined ) {
		handleError();
		return;
	}

	/* crea la nuova quest */

	/* elimina la quest vecchia */

	/* appende l'alert */

	/* appende la quest */
};


function goToNextActivity() {
	/* clear timer */
	
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