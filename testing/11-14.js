var storia11_14 = {
    ACCESSIBILITY: 1, 
	story_title: "Furto del quadro", 
	story_ID: -1, 
	game_mode: "SINGLE", 
	single_device: 1,
	quests: [
        {
            quest_title:"Un Risveglio sereno.",
            quest_ID:"",
            activities:[
                {
                    activity_text: [
                        {
                            type: "text",
                            content: `
                                Sei un investigatore dei servizi segreti italiani, famoso per le tue indagini che, seppur molto particolari, portano velocemente ad una soluzione. 
                                In questo periodo però sei tranquillo perché è periodo di ferie e ti trovi in viaggio, più precisamente a Firenze. 
                                Alle 4:00 di mattina, mentre stai dormendo in albergo, arriva però una chiamata d’urgenza. 
                                Il tuo maggiore ti chiede un aiuto eccezionale e ti manda alla Galleria degli Uffizi, che, pochi minuti prima, ha subito un grosso tentativo di furto.`
                        },
                        {
                            type: "text",
                            content: `
                                La Galleria degli Uffizi è un grande palazzo di proprietà dello Stato italiano. 
                                Ospita un elevato numero di pezzi d’arte di grandissima importanza. 
                                Le più famose sono certamente le pitture, tra cui opere di Leonardo Da Vinci, Botticelli e Piero Della Francesca.`
                        },
                        {
                            type: "gallery",
                            content: ['<img src="../images/galleria_uffizi.jpg" alt="La foto mostra la galleria uffizi di Firenze">', 
                                      '<img src="../images/LDV.jpg" alt="La foto mostra il volto di Leonardo da Vinci">',
                                      '<img src="../images/Botticelli.png" alt="La foto mostra il volto di Sandro Botticelli">', 
                                      '<img src="../images/PDF.jpg" alt="La foto mostra il presunto volto di Piero della Francesca">']
                        },
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Sai qualcosa di questi artisti? ",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0
                },
                {
                    activity_text:[
                        {
                            type:"text",
                            content: `
                                Appena arrivato sul posto rimani stupito perché la situazione sembra molto più grave del previsto. 
                                Oltre ad automobili dei carabinieri sono infatti presenti anche delle ambulanze. 
                                I militari ed il personale del museo ti accolgono ringraziandoti e iniziano subito a spiegarti nel dettaglio l’accaduto. `
                        },
                        {
                            type:"text",
                            content: `
                                Il colpo non è andato a segno ma le conseguenze sono gravi, dato che quattro guardie sono state uccise, a quanto pare grazie all’uso di armi silenziate. 
                                Come mostrano le telecamere di sorveglianza, il gruppo si muoveva in modo astuto e pianificato per poi, all’improvviso, optare per la ritirata. 
                                Forse a causa di qualcosa andato storto nel piano, i criminali hanno preferito salvare la pelle e dileguarsi nella notte. 
                                La parte più assurda di tutta la faccenda però è il messaggio mail arrivato sui computer del museo mezz’ora dopo la fuga.`
                        }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                },
                {
                    activity_text:[   
                        {
                            type:"text",
                            content: `
                                “La storica vendetta non è purtroppo andata a buon fine. 
                                Tuttavia, i cadaveri che abbiamo lasciato dovrebbero essere un messaggio importante per la gente. 
                                Una lezione meritata per esservi impossessati delle opere di un grande artista, che sarebbero dovute rimanere alla sua famiglia. 
                                Le ingiustizie e le vessazioni subite da Lui in vita non dovranno rimanere impunite. Torneremo.”`
                        },
                    ],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                }
            ]
        },
        {
            quest_title: "Un ritorno ai banchi di scuola.",
            quest_ID:"",
            activities:[
                {
                    activity_text: [
                        {
                            type:"text",
                            content: `
                                Il movente del colpo sembrerebbe essere a tutti gli effetti un tentativo di impossessarsi delle opere appartenute ad uno degli artisti. 
                                E dietro tutto questo dovrebbe esserci un discendente dell’autore, che parla addirittura di ingiustizie subite da esso. 
                                L’analisi dei video ti porta a stilare una lista dei probabili autori bersaglio del furto. Precisamente, i quattro nomi sono: Leonardo da Vinci, Raffaello, Caravaggio e Sandro Botticelli.
                                Decidi brevemente di ripassare quel poco che sai sul vero nome di battesimo di essi. `
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quanti autori, di quelli citati in precedenza, sono conosciuti con un soprannome o con uno pseudonimo?",
                        type: "number",
                        options: []
                    },
                    answer_outcome: [
                    {
                        response: '2',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    },
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0            
                },
                {
                    activity_text: [
                        {
                            type:"text",
                            content: `
                                Tanti artisti, al tempo di codesti, si appropriavano di un soprannome o di uno pseudonimo.`
                        },
                        {
                            type:"text",
                            content: `
                                Il denominarsi con un nome diverso dal proprio consisteva in una forma di tutela per la propria persona e soprattutto per le persone care all'artista.`
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Quale tra queste coppie di autori sono conosciuto con un soprannome o con uno pseudonimo?",
                        type: "checklist",
                        options: ['Leonardo da Vinci e Caravaggio', 'Raffaello e Caravaggio', 'Sandro Botticelli e Caravaggio', 
                                'Sandro Botticelli e Leonardo da Vinci', 'Sandro Botticelli e Raffaello', 'Leonardo da Vinci e Raffaello']
                    },
                    answer_outcome: [
                    {
                        response: 'Leonardo da Vinci e Caravaggio',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'Raffaello e Caravaggio',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'Sandro Botticelli e Caravaggio',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    },
                    {
                        response: 'Sandro Botticelli e Leonardo da Vinci',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'Sandro Botticelli e Raffaello',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'Leonardo da Vinci e Raffaello',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    },
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0            
                },
                {
                    activity_text:[
                        {
                            type:"text",
                            content: `
                                Per quanto possa sembrare bizzarro e strano, i due artisti con un nome d'arte sono loro: Caravaggio e Sandro Botticelli.`
                        },
                        {
                            type:"text",
                            content: `
                                Caravaggio, infatti anche noto come “Il Caravaggio”, nacque Michelangelo Morisi ma, negli anni a venire, fu sempre indicato con il nome del feudo dove ha vissuto per un periodo importante.`
                        },
                        {
                            type: "gallery",
                            content: ['<img style="padding-bottom: 15px;" src="../images/opera_c1.jpg" alt="La foto mostra la opera "Bacco"">', 
                                      '<img style="padding-bottom: 15px;" src="../images/opera_c2.jpg" alt="La foto mostra la opera "Il sacrificio di Isacco"">']
                        },
                        {
                            type:"text",
                            content: `
                                “Sandro Botticelli” invece era un vero e proprio pseudonimo, composto dal nome di battesimo e dal soprannome del fratello di colui che si chiamava in realtà Alessandro di Mariano di Vanni Filipepi. `
                        }, 
                        {
                            type: "gallery",
                            content: ['<img style="padding-bottom: 15px;" src="../images/opera_b1.jpeg" alt="La foto mostra la opera "Nascita di Venere"">', 
                                      '<img style="padding-bottom: 15px;" src="../images/opera_b2.jpg" alt="La foto mostra la opera "La primavera"">']
                        }
                    ],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                }
            ],
        },
        {
            quest_title: "La verità viene a galla.",
            quest_ID:"",
            activities:[
                {
                    activity_text:[
                        {
                            type:"text",
                            content: `
                                Per istinto provi a concentrarti su questi due autori, il cui nome ha forse contribuito a perdere, negli anni, la cronaca delle loro vicende famigliari.
                                Sarebbe però troppo complicato contattare chi di mestiere per far analizzare tutti gli alberi genealogici e chissà quanti documenti. 
                                Decidi quindi di procedere a modo tuo, girando per il museo e approfondendo la storia di questi due importanti artisti, alla ricerca di un qualche elemento utile ricollegabile al misterioso messaggio mail.`
                        },
                        {
                            type:"text",
                            content: `
                                Botticelli nacque nel 1445 a Firenze, mentre Caravaggio nel 1571 a Milano. 
                                Entrambi gli autori vissero quindi nella prima parte dell’Età Moderna, l’era immediatamente successiva al Medioevo.`
                        }
                    ],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Ricordi quale importante evento viene usato per indicare la fine del periodo medioevale ",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0            
                },
                {
                    activity_text:[
                        {
                            type:"text",
                            content:`
                                In questo tumultuoso periodo la penisola italiana era profondamente divisa tra ducati, come quelli di Milano e dei Savoia, lo stato della Chiesa e i domini spagnoli. 
                                In campo artistico, il periodo viene detto “Rinascimento”, e fu teatro di grandi cambiamenti, tra cui la nascita dell’Umanesimo, ovvero una corrente letteraria volta alla riscoperta dei classici latini.`
                        }
                    ],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                },
                {
                    activity_text:[
                    {
                        type:"text",
                        content:`
                            Mentre rimugini sul contesto storico che potrebbe essere legato al movente dei criminali, continui distrattamente a guardare tutti i pannelli che raccontano la storia degli artisti. 
                            Una delle figure, all’improvviso, cattura la tua attenzione. Il dipinto in questione è la “Vocazione di San Matteo” di Caravaggio. 
                            La figura rappresentata è infatti estremamente buia, e nel cartello di fianco è scritto chiaramente che i soggetti della scena sono Cristo e gli apostoli.`
                    }, 
                    {
                        type: "gallery",
                        content: ['<img style="padding-bottom: 15px;" src="../images/vocazione.jpg" alt="La foto mostra la opera "Vocazione di San Matteo"">', 
                                  '<img style="padding-bottom: 15px;" src="../images/cristo_vocazione.jpg" alt="La foto mostra Cristo">']
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Capisci subito che quest’opera va approfondita. Per quale motivo? ",
                        type: "checklist",
                        options:['Al tempo la religione era un argomento molto controverso ed era rischioso provare a trattarla in opere artistiche', 
                                'L’immagine sacra di Cristo e dei suoi apostoli all’interno di un locale dall’aspetto sinistro poteva risultare blasfema']
                    },
                    answer_outcome: [{
                        response: 'Al tempo la religione era un argomento molto controverso ed era rischioso provare a trattarla in opere artistiche',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    },
                    {
                        response: 'L’immagine sacra di Cristo e dei suoi apostoli all’interno di un locale dall’aspetto sinistro poteva risultare blasfema',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    },
                    {
                        response: '',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0            
                },
            ]
        },
        {
            quest_title: "Il mondo buio di un artista.",
            quest_ID: "",
            activities:[
                {
                    activity_text:[{
                        type: "text",
                        content:`Continuando a leggere il pannello, scopri che questo particolare dipinto fu commissionato all’artista proprio per decorare una chiesa, nel momento in cui il Caravaggio abitava a Roma. È quindi ovvio pensare allo sdegno che l’opera causò alla sua rivelazione, avvenuta presumibilmente nel 1600. Nel Medioevo le figure religiose erano molto spesso protagoniste di opere d’arte, ma conservavano comunque un aspetto elegante e divino. L’immagine ha ovviamente fatto scalpore per l’ambientazione che rasentava la blasfemia. Questo evento, unito alla reputazione che la gente aveva di Caravaggio, un assiduo frequentatore di locali malfamati, fece sicuramente in modo che egli venisse mal visto in città. Decidi quindi di prendere un PC e iniziare una ricerca su internet perché sei sicuro di avere una pista interessante.`
                    },
                    {
                        type: "text",
                        content:`Dopo solamente un paio di minuti scopri altri interessanti dettagli. 
                            L’artista, nel 1606, ha infatti svelato una nuova opera, titolata “La morte della Vergine” e commissionata da un membro dell’istituzione papale. `
                    },
                    {
                        type: "gallery",
                        content: ['<img style="padding-bottom: 15px;" src="../images/morte_vergine.jpg" alt="La foto mostra la opera "La morte della vergine"">', 
                                  '<img style="padding-bottom: 15px;" src="../images/vergine.jpg" alt="La foto mostra la vergine">']
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Noti subito alcuni particolari che questo dipinto ha in comune con quello visto precedentemente?",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0 
                }, 
                {
                    activity_text:[{
                        type: "text",
                        content:`
                            La nuova opera è molto simile alla “Vocazione” per quanto riguarda la poca illuminazione ed il generale senso di inquietudine. 
                            Ma non fu questa la causa dell’eccezionale rifiuto da parte del committente. 
                            Caravaggio venne infatti accusato di aver dato alla Vergine le sembianze di una prostituta trovata annegata nel Tevere poco tempo prima.`
                    },
                    {
                        type: "text",
                        content:`
                            La reputazione dell’artista era già in bilico quando, nello stesso anno, arrivò il fattaccio. 
                            Durante una rissa, Caravaggio uccide uno dei litiganti e viene quindi condannato a morte per decapitazione.`
                    }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 2,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0,     
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Caravaggio decide di fuggire il più lontano possibile dallo Stato Papale. 
                            Prima trova protezione a Napoli e, dopo 2 anni, approda a Malta. 
                            Qui però incappa in un’altra rissa, dove ferisce un membro dell’ordine cavalleresco in cui si era arruolato. 
                            Braccato dagli amici del ferito, decide di scappare in Sicilia – dal suo amico ed ex-modello Mario Minniti - e, successivamente, di nuovo a Napoli.`
                    },
                    {
                        type:"text",
                        content: `
                            Nella città campana viene tuttavia raggiunto dai sicari e ferito gravemente al volto. 
                            È il 1610 e l’artista, seppur distrutto, continua a lavorare ad una grande quantità di opere. 
                            In molte di queste è tuttavia riscontrabile un importante dettaglio.`
                    },
                    {
                        type: "gallery",
                        content: ['dipinti raffiguranti decapitazioni, completati dopo il 1609']
                    }],
                    activity_type: 'ANSWER',
                    answer_field: {
                        description: "Riesci a notarlo? ",
                        type: "text",
                        options: []
                    },
                    answer_outcome: [{
                        response: 'Decapitazione',
                        nextquest: 0,
                        nextactivity: 3, 
                        score:""
                    },
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 3, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0 
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Molte di queste opere presentano esplicite scene di decapitazione. 
                            È quindi chiaro come la condanna a morte abbia terribilmente lasciato un segno nell’anima dell’artista, facendolo vivere nella paura e nello sconforto. 
                            Questa deduzione ti fa comprendere che, molto probabilmente, la pista che stai seguendo è quella giusta.`
                    }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0, 
                }
            ]
        },
        {
            quest_title: "Il tappo della bottiglia.",
            quest_ID:"",
            activities:[
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Sei sicuro di essere arrivato ad un punto sicuro dell’indagine e decidi quindi di avvisare i tuoi superiori che è possibile proseguire con le operazioni. 
                            Il mandante del crimine potrebbe infatti essere non solo un discendente di Caravaggio, ma anche un discendente di un caro amico dell’artista. 
                            Il tuo obiettivo è infatti quello di indagare sulle parentele dei contatti più stretti che il pittore ha avuto durante i suoi viaggi.`
                    }],
                    activity_type: 'ANSWER',
                        answer_field: {
                            description: "Su quale dei seguenti luoghi chiave hai più speranze?",
                            type: "checklist",
                            options: ['Roma', 'Milano', 'Malta', 'Sicilia', 'Napoli']
                        },
                    answer_outcome: [{
                        response: 'Roma',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    },
                    {
                        response: 'Sicilia',
                        nextquest: 1,
                        nextactivity: 0, 
                        score:""
                    },
                    {
                        response: 'Milano',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    },
                    {
                        response: 'Malta',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    },
                    {
                        response: 'Napoli',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    },
                    {
                        response: 'default',
                        nextquest: 0,
                        nextactivity: 1, 
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0 
                },
                {
                    activity_text:[{
                        type:"text",
                        content: `
                            Gli storici e biografi contattati per rianalizzare la storia del Caravaggio si sono concentrati alla fine su due opzioni: Roma e la Sicilia.`
                    },
                    {
                        type: "gallery",
                        content: ['<img style="padding-bottom: 15px;" src="../images/roma.jpg" alt="La foto mostra Roma"">', 
                                  '<img style="padding-bottom: 15px;" src="../images/sicilia.jpg" alt="La foto mostra la Sicilia">']
                    }],
                    activity_type: 'READING',
                    answer_field: {},
                    answer_outcome: [{
                        response: 'default',
                        nextquest: 1,
                        nextactivity: 0,
                        score:""
                    }],
                    ASK_EVAL: 0,
                    GET_CHRONO: 0,
                    expected_time: 30000,
                    FINAL: 0, 
                }  
            ],
        },
        {
			quest_title: "Dove tutto sembrava impossibile.",
			quest_ID: "",
			activities: [
				{
					activity_text: [{
						type: "text",
						content: `
                            Alcuni mesi dopo l’inizio dell’indagine, in seguito ai sopralluoghi in entrambe le località, viene arrestato un discendente di Minniti nei dintorni di Palermo. 
                            L’ex modello, e, secondo molti, l’ex-amante, di Caravaggio si era infatti stabilito e sposato nell’isola, dove poi ha accolto l’artista per proteggerlo. 
                            Una serie di interrogatori porterà poi alla condanna definitiva e, quindi, alla soluzione del grande tentativo di furto agli Uffizi.`
                    }],
					activity_type: 'READING',
					answer_field: {},
					answer_outcome: {},
					ASK_EVAL: 0,
					GET_CHRONO: 0,
					expected_time: 600000,
					FINAL: 1,
                } 
			]
        }
    ]
}