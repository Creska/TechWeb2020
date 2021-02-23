var StoryObj; // QUESTA E' LA VARIABILE DELLA STORIA

var TESTING = false; // se è true, indica che il player è aperto in preview
var mediapath; // in base a TESTING, identifica il path dove cercare le immagini

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

var IntervalTimer; // usato per l'invio dello status ogni 5s
var ValuationTimer; // usato per dare una scadenza alla richiesta di valutazione

var questmap; // per ogni questID indica [oggetto dell'array, indice all'interno di esso]
var activitymap; // per ogni activityID indica [oggetto dell'array, id della quest madre, indice all'interno dell'array]




/* //////////////// ROBA AJAX /////////////////// */

$(function () {

	/* query e caricamento della storia */
	const story_id = new URLSearchParams(window.location.search).get('story');
	const testing = new URLSearchParams(window.location.search).get('testing');
	console.log(story_id);
	socket = io.connect('', { query: { "type": "player", "story": "" + story_id + "", "testing": testing }, reconnection: false });
	socket.on('load-json', function (data) {
		console.log("Loading the JSON");
		StoryObj = data;
		if (StoryObj.published == false || StoryObj.published == undefined) {
			TESTING = true;
		}
		loadGame();
	});

	socket.on('chat-message', (message) => {
		if (message && Status.ActivityID != null) {
			ActivityRecap.ChatMessages += 1;
			$("#list").prepend($("<blockquote/>", {
				"class": "valuator-msg p-1",
				"aria-live": "assertive",
			}).html("<i class='far fa-comment mr-1' aria-hidden='true'></i><span class='sr-only'>Risposta del valutatore:</span>" + message));
		}
	});

	/* ricezione valutazione */
	socket.on('input-valued', (next_activity_id, score, old_activity_id) => {
		if ( old_activity_id == Status.ActivityID ) {
			Status.TotalScore += parseInt(score) || 0;
			ActivityRecap.Score += parseInt(score) || 0;
			goToActivity(next_activity_id);
		}
	});
});


function validateInput(question, answer) {
	$(".NextActivity").attr("disabled", true);
	$(".NextActivity").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span class="sr-only">Attendi valutazione</span>');

	ValuationTimer = setTimeout( function() {
		goToActivity( nextStageInOrder() ); // va all'attività successiva se il valutatore non manda un responso entro il tempo limite
		clearTimeout( ValuationTimer );
	}, 300000 );

	// goToActivity( nextStageInOrder() ); // roba per debugging

	socket.emit('validate-input-player', Status.ActivityID, question, answer, socket.id);
};


function sendMsg(msg) {
	if (msg === "")
		return;

	//client can't route the rooms: only the server can. I need to send the data there
	socket.emit('chat-message', msg, socket.id);

	$("#chat-room input").val("");

	$("#list").prepend($("<blockquote/>", {
		"class": "player-msg p-1",
		"aria-live": "assertive",
	}).html("<span class='sr-only'>Messaggio inviato:</span>" + msg + "<i class='far fa-comment ml-1' aria-hidden='true'>"));

	/*
	//roba per debugging
	setTimeout( function() {
		$( "#list" ).prepend( $( "<blockquote/>", {
			"class": "valuator-msg p-1",
		}).html( "<i class='far fa-comment mr-1' aria-hidden='true'></i><span class='sr-only'>Risposta del valutatore:</span>" + msg ));
	}, 10000);
	*/
};


function sendStatus() {
	let intervalStatus = {
		QuestID: Status.QuestID,
		ActivityID: Status.ActivityID,
		time_elapsed: Status.time_elapsed,
		Group: StoryObj.groupID,
		socketID: socket.id
	};

	$.ajax({
		url: "/player/playersActivities",
		type: "POST",
		data: intervalStatus,
		statusCode: {
			500: function() {
				clearInterval( IntervalTimer );
			}
		}
	});

	$.post("/player/playersActivities", intervalStatus);
	// console.log( intervalStatus ); // debugging 
};


function sendActivityRecap() {
	let recap = {
		QuestID: Status.QuestID,
		ActivityID: Status.ActivityID,
		TimeToAnswer: ActivityRecap.TimeToAnswer,
		ChatMessages: ActivityRecap.ChatMessages,
		Score: ActivityRecap.Score,
		Group: StoryObj.groupID,
		socketID: socket.id
	};

	$.post("/player/activityUpdate", recap);
	// console.log( recap ); // debugging
};



/* /////////////////////////////////////// */


function handleError() {
	$("#Main").empty();

	$("footer").fadeOut("slow");

	$("#Main").replaceWith(document.getElementById("ErrorContainer").content.cloneNode(true));
	$("#Error").fadeIn("slow");
};


/* da attivare all'apertura della finestra */
function loadGame() {
	showAccess();
	if (StoryObj.game_mode == "CLASS" && !TESTING) {
		let group_alert = $("<div class='alert alert-info' role='alert'/>");
		group_alert.append($("<i/>", {
			"class": "fas fa-info-circle fa-2x p-2",
			"aria-hidden": "true"
		}));
		group_alert.append($("<p/>").html("Appartieni al gruppo <strong>" + StoryObj.groupID + "</strong>"));
		$("#Main").children().first().after(group_alert);
	}

	buildMaps();
	mediapath = get_media_path();

	if (TESTING) {
		$("#OpenChat").attr("disabled", true); // disabilita la chat
	}

	$("#StartBtn").attr("disabled", false);
};


/* mostra l'accessibilità - da attivare appena la finestra si apre */
function showAccess() {
	let alerts = [];

	if (StoryObj.accessibility.WA_visual)
		alerts.push("disabilità visive");

	if (StoryObj.accessibility.WA_motor)
		alerts.push("disabilità motorie");

	if (StoryObj.accessibility.WA_hearing)
		alerts.push("disabilità uditive");

	if (StoryObj.accessibility.WA_convulsions)
		alerts.push("problemi legati a convulsioni e/o epilessia");

	if (StoryObj.accessibility.WA_cognitive)
		alerts.push("disabilità cognitive");

	let accessibility_alert;
	if (alerts.length) {
		accessibility_alert = $('<div class="alert alert-success accessibility-alert" role="alert"/>');
		accessibility_alert.append($("<i/>", {
			"class": "fab fa-accessible-icon fa-2x p-2",
			"aria-hidden": "true"
		}));
		accessibility_alert.append($("<p>Il gioco è accessibile per gli utenti con:</p><ul class='border border-success rounded p-3'></ul>"));
		$.each(alerts, function (i, str) {
			accessibility_alert.find("ul").append($("<li/>", {
				"class": "m-1",
				text: str
			}));
		});
	}
	else {
		accessibility_alert = $('<div class="alert alert-danger accessibility-alert" role="alert"/>');
		accessibility_alert.append($("<i/>", {
			"class": "fab fa-accessible-icon fa-2x p-2",
			"aria-hidden": "true"
		}));
		accessibility_alert.append($('<p>Il gioco purtroppo <strong>non</strong> è accessibile.</p>'));
	}

	$("#Main").prepend(accessibility_alert);
};


/* crea la mappa delle quest e delle attività */
function buildMaps() {
	questmap = new Map();
	activitymap = new Map();

	$.each(StoryObj.quests, function (qi, quest) {
		questmap[quest.quest_id] = [quest, qi];

		$.each(StoryObj.quests[qi].activities, function (ai, activity) {
			activitymap[activity.activity_id] = [activity, quest.quest_id, ai];
		});
	});
};


function get_media_path() {
	let folder;

	if (TESTING)
		folder = "unpublished";
	else
		folder = "published";

	return "/player/stories/" + folder + "/" + StoryObj.story_ID + "/";
};


function startGame() {
	$("StartBtn").attr("disabled", true); // per evitare doppio click

	$("#Main").empty();

	$("#Main").append($("<h1/>", {
		"class": "p-2 StoryTitle",
		role: "heading",
		"aria-live": "assertive",
		"aria-level": "1"
	}).html("<span class='sr-only'>Titolo della storia:</span>" + StoryObj.story_title));

	goToActivity(StoryObj.quests[0].activities[0].activity_id);

	$("footer").fadeIn("slow");
};


function goToQuest(qid) {
	if (qid == null || qid === "" || questmap[qid] == undefined) {
		handleError();
		return;
	}

	Status.QuestID = qid;

	let newquest = $("<section/>", {
		"class": "Quest",
		id: qid,
		"aria-label": "quest in corso",
		"aria-live": "polite",
		style: "display:none;"
	});

	newquest.append($("<h2/>", {
		"class": "QuestTitle",
		"aria-level": "2",
		"aria-live": "assertive"
	}).html("<span class='sr-only'>Quest:</span>" + questmap[qid][0].quest_title));

	$("#Main .Quest").remove();
	$("#Main").append(newquest);
	$("#Main .Quest").fadeIn("slow");
};


function goToActivity(aid) {
	if (Status.ActivityID != null)
		sendActivityRecap(); // evita l'invio del recap a inizio gioco

	if (aid == null || aid === "" || activitymap[aid] == undefined) {
		handleError();
		return;
	}

	if (Status.QuestID != activitymap[aid][1]) {
		goToQuest(activitymap[aid][1]); // va alla nuova quest
	}

	Status.ActivityID = aid;

	let newactivity = $("<div/>", {
		"class": "Activity",
		id: aid,
		"aria-label": "attività in corso",
		"aria-live": "polite",
		role: "region",
		style: "display:none;"
	});

	newactivity.append($("<h3/>", {
		"class": "sr-only",
		role: "heading",
		"aria-level": "3",
		"aria-live": "assertive",
		text: "Attività"
	}));

	writeActivityText(newactivity);

	if (activitymap[aid][0].activity_type == "ANSWER") {
		buildAnswerField(newactivity);
	}

	if (activitymap[aid][0].FINAL) {
		newactivity.append($("<button/>", {
			"class": "btn btn-lg CloseGameBtn",
			onclick: "endGame();",
			text: "FINE"
		}));
	}
	else {
		if (TESTING) {
			newactivity.append($("<button/>", {
				"class": "btn btn-lg NextActivity",
				onclick: "goToActivity( nextStageInOrder() );",
				text: "PROSSIMA ATTIVITA' IN ORDINE"
			}));
		}
		else {
			newactivity.append($("<button/>", {
				"class": "btn btn-lg NextActivity",
				onclick: "goToNextActivity();",
				text: "PROSEGUI"
			}));
		}
	}

	$("#Main .Activity").remove();
	$("#Main .Quest").append(newactivity);
	$("#Main .Activity").fadeIn("slow");

	/* resetta tutto ciò che va resettato */
	$("#list").empty();
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


function writeActivityText(container) {
	let activity = activitymap[Status.ActivityID][0];

	$.each(activity.activity_text, function (i, node) {
		if (node.type == "text") {
			container.append($("<p/>", {
				"class": "p-3 TextPar",
				text: node.content
			}));
		}
		else if (node.type == "gallery") {
			let newgallery = $(`
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

			newgallery.attr("id", "gallery" + i);
			newgallery.find("a").attr("href", "#gallery" + i);

			let newimage;
			$.each(node.content, function (pic_i, pic) {
				if (pic_i === 0)
					newimage = $("<div class='carousel-item active'/>");
				else
					newimage = $("<div class='carousel-item'/>");

				newimage.append($("<img/>", {
					"class": "d-block w-100",
					alt: pic.alt,
					src: mediapath + pic.name
				}));

				newimage.append($("<div/>", {
					"class": "carousel-caption", // le classi d-none e d-md-block fanno scomparire le captions su schermi piccoli
					"aria-hidden": "true"
				}));

				newimage.find(".carousel-caption").append($("<p/>", {
					text: pic.alt
				}));

				newgallery.children().first().append(newimage);
			});

			container.append(newgallery);
		}
		else if (node.type == "video") {
			container.append($(node.content));
		}
	});
};


function buildAnswerField(container) {
	let activity = activitymap[Status.ActivityID][0];

	let AF = $("<div/>", {
		"class": "AnswerField",
		"aria-label": "esercizio",
		role: "form"
	});

	AF.append($("<p/>", {
		"class": "AnswerFieldDescription",
		"aria-hidden": "true",
		text: activity.answer_field.description
	}));

	let answerinput;

	switch (activity.answer_field.type) {
		case "checklist":
			answerinput = $("<ul/>", {
				"class": "AnswerInput",
				"aria-label": activity.answer_field.description,
				"role": "list"
			});
			let answeropt;

			$.each(activity.answer_field.options, function (opt_i, opt) {
				answeropt = $("<li class='form-check mt-2'/>");
				answeropt.append($("<input/>", {
					"class": "form-check-input",
					type: "radio",
					name: "AnswerInputRadio",
					id: "opt" + opt_i,
					value: opt_i
				}));
				answeropt.append($("<label/>", {
					"class": "form-check-label",
					for: "opt" + opt_i,
					text: opt
				}));
				answerinput.append(answeropt);
			});
			break;
		case "text":
			answerinput = $("<textarea/>", {
				"class": "AnswerInput w-100",
				"aria-label": activity.answer_field.description,
				placeholder: "Risposta"
			});
			break;
		case "number":
			answerinput = $("<input/>", {
				"class": "AnswerInput",
				type: "number",
				"aria-label": activity.answer_field.description,
				placeholder: "0"
			});
			break;
		case "date":
		case "time":
			answerinput = $("<input/>", {
				type: activity.answer_field.type,
				"aria-label": activity.answer_field.description
			});
			break;
		default:
			handleError();
			return;
	}

	AF.append(answerinput);

	container.append($("<h4/>", {
		"class": "sr-only",
		role: "heading",
		"aria-level": "4",
		text: "esercizio finale"
	}));
	container.append(AF);
};


function getPlayerAnswer() {
	let field = activitymap[Status.ActivityID][0].answer_field;

	switch (field.type) {
		case "checklist":
			if ($(".AnswerInput input:checked").length) {
				return field.options[$(".AnswerInput input:checked").first().val()].toLowerCase();
			}
			break;
		case "text":
		case "number":
		case "date":
		case "time":
			return $(".AnswerInput").first().val().toLowerCase();
	}

	return null;
};


function goToNextActivity() {
	$(".NextActivity").attr("disabled", true); // evita doppi click

	clearInterval(IntervalTimer);

	let activity = activitymap[Status.ActivityID][0];

	if (activity.ASK_EVAL) {
		validateInput($(".AnswerFieldDescription").first().text(), getPlayerAnswer());
		return;
	}

	if (activity.activity_type == "READING") {
		if (activity.answer_outcome[0].next_activity_id) {
			ActivityRecap.Score = parseInt(activity.answer_outcome[0].score) || 0;
			Status.TotalScore += ActivityRecap.Score;

			goToActivity(activity.answer_outcome[0].next_activity_id);
		}
		else {
			goToActivity(nextStageInOrder());
		}
	}
	else {
		let player_answer = getPlayerAnswer();

		let target = null; // va usato per evitare il return statement nel loop di each

		$.each(activity.answer_outcome, function (i, outcome) {
			if (i > 0) {
				if (outcome.condition.toLowerCase() == player_answer) {
					ActivityRecap.Score = parseInt(outcome.score) || 0;
					Status.TotalScore += ActivityRecap.Score;

					target = outcome.next_activity_id;
					return false;
				}
			}
		});

		if (target == null) {
			if (activity.answer_outcome[0].next_activity_id) {
				ActivityRecap.Score = parseInt(activity.answer_outcome[0].score) || 0;
				Status.TotalScore += ActivityRecap.Score;

				target = activity.answer_outcome[0].next_activity_id;
			}
			else {
				target = nextStageInOrder();
			}
		}

		goToActivity(target);
	}
};


function nextStageInOrder() {
	/* se questa attività NON è l'ultima di questa quest, conduce all'attività successiva */
	/* altrimenti, conduce alla quest successiva, sempre che la quest in corso non sia l'ultima */

	if (activitymap[Status.ActivityID][2] < questmap[Status.QuestID][0].activities.length - 1) {
		return StoryObj.quests[questmap[Status.QuestID][1]].activities[activitymap[Status.ActivityID][2] + 1].activity_id;
	}
	else {
		if (questmap[Status.QuestID][1] < StoryObj.quests.length - 1) {
			return StoryObj.quests[questmap[Status.QuestID][1] + 1].activities[0].activity_id;
		}
	}

	return null;
};


function endGame() {
	$(".CloseGameBtn").attr("disabled", true); // evita doppi click

	clearInterval(IntervalTimer);

	sendActivityRecap();
	socket.emit('player-end', socket.id);

	$("footer").fadeOut("slow");
	$("#Main").replaceWith(document.getElementById("FinishContainer").content.cloneNode(true));
	if (StoryObj.show_score) {
		$("#Finish .sr-only, #Finish p:nth-child(3)").html("Congratulazioni!<br>Hai completato il gioco.<br>Numero di punti ottenuti: <em>" + (parseInt(Status.TotalScore) || 0) + "</em>");
	}
	else {
		$("#Finish .sr-only, #Finish p:nth-child(3)").html("Congratulazioni!<br>Hai completato il gioco.");
	}

	$("#Finish").fadeIn("slow");

	Status.QuestID = null;
	Status.ActivityID = null;
};