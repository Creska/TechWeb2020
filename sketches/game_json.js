// precondition: l'ambiente autore deve stabilire un certo ordine per quanto riguarda le attività.
//                lo schema di proseguimento avrà la forma di un grafo piuttosto semplice

{
	"activities": [
		{
			"activity_name": "...", // indica se l'attività è una quest oppure una spiegazione
			"activity_code": "...", // codice alfanumerico che identifica univocamente l'attività
			"activity_paragraph": [
				{
					"text": "..."
					"images": [...] // immagine/i all'interno del paragrafo
				}
			],
			"answer_field": "..." // html del campo risposta. può essere un campo testo, una scelta multipla o un prosegui
			"right_answer": "..." // stringa corrispondente alla risposta giusta (o accettabile)
			"action_on_answer": "..." // JS corrispondente all'azione da eseguire in caso di risposta giusta o errata
			"activity_UI_style": "...", // CSS dell'interfaccia trasposto sottoforma di stringa
		}
	],
	"story_style": "...", // CSS relativo all'interfaccia generale della storia
	"story_code": "...", // script JS che gestisce il display e le interazioni del giocatore con le varie attività
}
