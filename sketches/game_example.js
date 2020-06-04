// Struttura del JSON

game_example = {
	/* La storia è un array di quests. Le quests possono essere in un unico ordine.
	Di conseguenza, ad ogni elemento corrisponde uno e un solo elemento successivo. */
	"quests": [
		{
			/* Ogni quest è un array di attività. Ad ognuna di esse può succedere una sola attività.
			Tuttavia, una particolare attività può avere esiti diversi. La scena successiva sarà quindi
			decisa dal codice JS "action_on_acivity_answer". */
			"activities": [
				{
					"activity_text": "", // testo HTML dell'attività
					"answer_field": "", // HTML del campo risposta
					"right_answer": "", // contiene la risposta giusta
					"need_human_evaluation": false, // booleano che indica se c'è necessità di valutazione umana per la risposta
					"next_activities": [],
					"action_on_activity_answer": "", // calcola il punteggio, richiama la valutazione umana, decide l'attività successiva
					"activity_UI_style": ""
				}
			],
			"quest_style": "", // stile della quest. eventuali stili particolari delle attività verranno sovrascritti a questo
		}
	],
	"story_style": "", // stile della storia. eventuali stili particolari di quests o attività verranno sovrascritti ad esso
	"score": [] // array che il player trasformerà in matrice. contiene tutti i punteggi delle attività - sarà il player ad aggiornarlo volta per volta
};
