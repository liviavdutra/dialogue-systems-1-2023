import { MachineConfig, send, Action, assign, StatesConfig, EventObject, BaseActionObject } from "xstate";
import { WORDS } from "./words"

function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }));
}

interface Grammar {
    [index: string]: {
        intent: string;
        entities: {
            [index: string]: string;
        };
    };
}
const grammar: Grammar = {
    "yes": {
        intent: "None",
        entities: { affirm: "yes" },
    },
    "yes, please": {
        intent: "None",
        entities: { affirm: "yes" },
    },
    "of course": {
        intent: "None",
        entities: { affirm: "of course" },
    },
    "no": {
        intent: "None",
        entities: { reject: "no" },
    },
    "no, thanks": {
        intent: "None",
        entities: { reject: "no" },
    },
    "no way": {
        intent: "None",
        entities: { reject: "no" },
    },
};
export const DATABASE = WORDS.map(item => {
    return {
        word: item.Word.toLowerCase(),
        relations: item.Relations.split(",").map(item => item.toLowerCase())
    }
})


export const usedWords: string[] = [];

export function returnWord(word: string) {
  const wordFound = DATABASE.find((item: { word: string; }) => item.word === word);

  if (!wordFound) {
    
    return "YOU LOST";
  }

  const relations = wordFound.relations;
 
  let newWord;
 
  do {
    const randomIndex = Math.floor(Math.random() * relations.length);
    newWord = relations[randomIndex];
  } while (usedWords.includes(newWord));

  usedWords.push(newWord);
  DATABASE.splice(DATABASE.indexOf(wordFound), 1);

  return newWord;
}



export function firstWord() {
    const random = Math.floor(Math.random() * DATABASE.length)
    let wordOne = DATABASE[random].word
    return wordOne
}

export const getEntity = (context: SDSContext, entity: string) => {
    // lowercase the utterance and remove tailing "."
    let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
    if (u in grammar) {
        if (entity in grammar[u].entities) {
            return grammar[u].entities[entity];
        }
    }
    return false;
}

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
    initial: "idle",
    states: {
        idle: {
            on: {
                CLICK: "init",
            },
        },
        init: {
            on: {
                TTS_READY: "whoareyou",
                CLICK: "whoareyou",
            },
        },
        whoareyou: {
            id: "whoareyou",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "Introduction",
                        actions: assign({
                            name: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
                        }),
                    },
                    {
                        target: ".noinput",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: say("Hi! My name is Minerva and I will be your co-player today! What would you like to have as your nickname for this game?"),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                noinput: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know!"
                    ),
                    on: { ENDSPEECH: "ask" },
                },
            },
        },
        Introduction: {
            id: "Introduction",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "denyInstructions",
                        cond: (context) => !!getEntity(context, "reject"),
                        actions: assign({
                            reject: (context) => getEntity(context, "reject"),
                        }),
                    },
                    {
                        target: "acceptInstructions",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                        }),
                    },
                    {
                        target: ".nomatch",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Hi ${context.name}!I have some instructions for you! If this is your first time this playing this game, I would advise you to listen to them. Do you want to hear the instructions?`,
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                nomatch: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know.!"
                    ),
                    on: { ENDSPEECH: "prompt" },
                },
            },
        },
        denyInstructions: {
            entry: say("Ok!Let's play!"),
            on: { ENDSPEECH: "gamestart" },
        },
        acceptInstructions: {
            entry: [
                say("Ok!Here we go!"),
                //assign((context) => ({title: `meeting with ${context.famous}`}))
            ],
            on: { ENDSPEECH: "Instructions" },
        },

        Instructions: {
            id: "Instructions",
            initial: "prompt",
            on: {
                RECOGNISED: [
                    {
                        target: "playlater",
                        cond: (context) => !!getEntity(context, "reject"),
                        actions: assign({
                            reject: (context) => getEntity(context, "reject"),
                            word: (context) => firstWord(),
                        }),
                    },
                    {
                        target: "playnow",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                            word: (context) => firstWord()
                        }),
                    },

                    {
                        target: ".nomatch",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `GIVE INSTRUCTIONS LATER! Do you want to start playing? I just need a yes or no ${context.name}`,
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                nomatch: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know.!"
                    ),
                    on: { ENDSPEECH: "prompt" },
                },
            },
        },
        playlater: {
            entry: say(`Ok!See you another time!`),
            on: { ENDSPEECH: "init" },
        },
        playnow: {
            entry: [
                say("Ok!Here we go!")
            ],
            on: { ENDSPEECH: "gamestart" },
        },
        gamestart: {
            id: "gamestart",
            initial: "prompt",
            on: {
                RECOGNISED: [

                    

                    {
                        target: "accept",
                        //cond:,
                        actions: assign({
                            words: (context) => returnWord(context.recResult[0].utterance.toLowerCase().replace(".","")),
                        }),


                    },
                    
                    {
                        target: "Userlost",
                        cond: (context) => returnWord(context.recResult[0].utterance.toLowerCase().replace(".","")) ==="YOU LOST",
                        actions: assign({
                            userword: (context) => {
                               
                                //return context.recResult[0].utterance
                            },

                        }),
                        
                    },

                    // first you can assign WORDS to context.words. Then, you can select a value 
                    // (say, randomly or based on certain criteria) from context.words. Then you remove it from context.words
                    //  (assign context.words.filter(item => item != value). )
                    

                    // {
                    //     target: "Computerlost",
                    //     actions: assign({
                    //         userword: (context) => {
                    //             TRY_WORDS.user = context.recResult[0].utterance
                    //             return context.recResult[0].utterance
                    //         },

                    //     }),
                    //     cond: (context) => userTry(TRY_WORDS.user.toLowerCase(),TRY_WORDS.previous.toLowerCase()) === 'You win',

                    // },


                    {
                        target: ".noinput",
                    },
                ],
                TIMEOUT: ".prompt",
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: ` ${context.word}`
                    })),
                    on: { ENDSPEECH: "ask" },
                },
                ask: {
                    entry: send("LISTEN"),
                },
                noinput: {
                    entry: say(
                        "Sorry, I don't know what it is. Tell me something I know!"
                    ),
                    on: { ENDSPEECH: "ask" },
                },
            },
        },
            gametwo: {
                id: "gametwo",
                initial: "prompt",
                on: {
                    RECOGNISED: [

                      
                        
                        {
                            target: "gametwo",

                            actions: assign({
                                words: (context) => returnWord(context.recResult[0].utterance.toLowerCase().replace(".","")),
                            }),


                        },
                        {
                            target: "Userlost",
                            cond: (context) => returnWord(context.recResult[0].utterance.toLowerCase().replace(".","")) ==="YOU LOST",
                            actions: assign({
                                userword: (context) => {
                                   
                                    //return context.recResult[0].utterance
                                },
    
                            }),
                            
                        },

                        // {
                        //     target: "Computerlost",
                        //     actions: assign({
                        //         userword: (context) => {
                        //             TRY_WORDS.user = context.recResult[0].utterance
                        //             return context.recResult[0].utterance
                        //         },

                        //     }),
                        //     cond: (context) => userTry(TRY_WORDS.user.toLowerCase(),TRY_WORDS.previous.toLowerCase()) === 'You win',

                        // },


                        {
                            target: ".noinput",
                        },
                    ],
                    TIMEOUT: ".prompt",
                },
                states: {
                    prompt: {
                        entry: send((context) => ({
                            type: "SPEAK",
                            value: ` ${context.words}`
                        })),
                        on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                        entry: send("LISTEN"),
                    },
                    noinput: {
                        entry: say(
                            "Sorry, I don't know what it is. Tell me something I know!"
                        ),
                        on: { ENDSPEECH: "ask" },
                    },
                },

            
            },
            accept: {
                id: "accept",

                entry: send((context) => ({
                    type: "SPEAK",
                    value: `You got it!`
                })),
                on: { ENDSPEECH: "gametwo" },
            },

            Userlost: {
                id: "Userlost",
                entry: send((context) => ({
                    type: "SPEAK",
                    value: `You lost! Let's see how many points you got!`
                })),
                on: { ENDSPEECH: "init" },
            },
            // Computerlost: {
            //     id: "Computerlost",
            //     entry: send((context) => ({
            //         type: "SPEAK",
            //         value: `You win! Let's see how many points you got`
            //     })),
            //     on: { ENDSPEECH: "init" },
            // },
        },

    };
