// Struttura dell'oggetto JSON
// ogni valore mostrato qui rappresenta quello di default

game_example = {
	accessibility: {
		WA_visual: false,
		WA_motor: false,
		WA_hearing: false,
		WA_convulsions: false,
		WA_cognitive: false
	}, // flags che indicano per quale tipo di disabilità la storia è accessibile
	story_title: "", // probabilmente servirà un div per contenerlo
	story_ID: -1, // ID di identificazione univoca. Inizializzato a -1
	game_mode: "", // indica la modalità di gioco (singolo, gruppo o classe)
	players: 0, // numero di giocatori che avranno un device
	quests: [
		{	
			quest_title: "",
			quest_id: "",
			activities: [
				{
					activity_id: "",
					activity_text: [
						{
							type: "", // può essere "text", "gallery" o "video"
							content: "" // rispettivamente può essere una stringa di testo, un'array di oggetti immagine, oppure una stringa html
						}
					], // testo HTML dell'attività. è un array in cui ogni elemento è un testo/immagine/galleria
					activity_type: "ANSWER", // con READING indica attività di sola lettura, con ANSWER (default) indica la presenza del campo risposta
					answer_field: {
						description: "", // eventuale indicazione per il giocatore
						type: "", // tipo dell'answer field: checklist, number o text
						options: [] // array di opzioni nel caso type = checklist
					},
					answer_outcome: [
						{
							condition: "", // possibile risposta - nel main outcome ha valore null
							next_quest_id: "",
							next_activity_id: "", // indica l'attività a cui conduce
							score: null // punteggio relativo a questa specifica attività - va sommato al totale; se è null viene considerato uguale a zero
						}
					],
					ASK_EVAL: false, // flag che indica se c'è necessità di valutazione umana per la risposta
					GET_CHRONO: false, // flag che indica se bisogna calcolare il tempo di risposta alla domanda
					expected_time: 0, // tempo in ms previsto per il completamento dell'attività
					FINAL: false // indica se l'attività è quella finale. In tal caso non vi sarà alcun campo risposta
				}
			]
		}
	]
};

// oggetto immagine
media = {
	isFile: "", // indica se bisogna salvare il file su server
	src: "", // se l'immagine è salvata su server, corrisponde al path - altrimenti corrisponde al nome che il nuovo file ha all'interno della mappa
	alt: ""
}

CSSexample = {
	sheet: "", // codice CSS
	valid: true // bool che indica la validità, in base al numero degli errori trovati
};