// Struttura dell'oggetto JSON

game_example = {
	ACCESSIBILITY: 0, // flag che indica se la storia è accessibile
	story_title: "", // probabilmente servirà un div per contenerlo
	story_ID: -1, // ID di identificazione univoca. Inizializzato a -1
	game_mode: "", // indica la modalità di gioco (singolo, gruppo o classe)
	single_device: 1, // indica se vi è un solo dispositivo per gruppo. di default è settato a true
	quests: [
		{	
			quest_title: "", // probabilmente servirà un div per contenerlo
			/* Ogni quest è un array di attività. Ad ognuna di esse può succedere una sola attività.
			Tuttavia, una particolare attività può avere esiti diversi. La scena successiva sarà quindi
			decisa dal codice JS "action_on_activity_answer". */
			activities: [
				{
					activity_text: [
						{
							type: "", // "text" oppure "gallery"
							content: "" // testo oppure array di nodi <img> (url+alt)
						}
					], // testo HTML dell'attività. è un array in cui ogni elemento è un testo/immagine/galleria
					activity_type: "", // con READING indica attività di sola lettura, con ANSWER indica la presenza del campo risposta
					answer_field: {
						description: "", // eventuale indicazione per il giocatore
						type: "", // tipo dell'answer field: checklist, number o text
						options: [] // array di opzioni nel caso type = checklist
					},
					answer_outcome: [
						{
							response: "", // possibile risposta
							nextquest: false, // indica se conduce alla prossima quest
							nextactivity: "" // indica l'attività a cui conduce
						}
					],
					ASK_EVAL: 0, // flag che indica se c'è necessità di valutazione umana per la risposta
					GET_CHRONO: 0, // flag che indica se bisogna calcolare il tempo di risposta alla domanda
					expected_time: 0, // tempo in ms previsto per il completamento dell'attività
					FINAL: 0 // indica se l'attività è quella finale. In tal caso non vi sarà alcun campo risposta
				}
			]
		}
	],
	stylesheet: "" // CSS della storia. eventuali stili particolari di quests o attività verranno sovrascritti ad esso
};