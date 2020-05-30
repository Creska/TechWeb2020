// precondition: l'ambiente autore deve stabilire un certo ordine per quanto riguarda le attività.
//                lo schema di proseguimento avrà la forma di un grafo piuttosto semplice

{
	"quests": [
		"quest_ID": "...",
		"activities": [
			{
				"activity_type": "...", // indica se l'attività è una subquest oppure una spiegazione
				"activity_ID": "...", // codice alfanumerico che identifica in modo univoco l'attività
				"activity_paragraph": [
					{
						"text": "..."
						"images": [...] // immagine/i all'interno del paragrafo
					}
				],
				"answer_field": "..." // html del campo risposta. può essere un campo testo, una scelta multipla o un prosegui
				"expected_answer": "..." // stringa corrispondente alla risposta giusta (o accettabile)
				"action_on_activity_answer": "..." // JS corrispondente all'azione da eseguire in caso di risposta giusta o errata
				"activity_UI_style": "...", // CSS dell'interfaccia trasposto sottoforma di stringa
			}
		]
		"action_on_quest_completion": "..." // JS corrispondende all'azione da eseguire al completamento della missione
	],
	"story_style": "...", // CSS relativo all'interfaccia generale della storia
	"story_code": "...", // script JS che gestisce il display e le interazioni del giocatore con le varie attività
}
