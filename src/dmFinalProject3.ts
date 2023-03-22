import { MachineConfig, send, Action, assign, StatesConfig, EventObject, BaseActionObject } from "xstate";
import { WORDS } from "./wordsfinal"

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
        relations: item.Relation.split(",").map(item => item.toLowerCase())
    }
})
// export const USED_WORDS = ['']

// export function userTry(word: string, previousWord: string) {
//     word = word.toLowerCase()
//     previousWord = previousWord.toLowerCase()
//     if (USED_WORDS.includes(word)) {
//         return 'You lost'
//     }
//     USED_WORDS.push(word)
//     const dataWord = DATABASE.find(item => item.word == previousWord)

//     if (dataWord!.relations.includes(word)) {
//         return word
//     } else {
//         return 'YOU LOST'
//     }
// }

export function checkRelation(systemword: any, word: any) {
    const wordGiven = DATABASE.find((item: { word: string; }) => item.word === systemword);
    //console.log(wordGiven.relations)
    if (wordGiven) {
        //console.log(wordGiven)
        const relations = wordGiven.relations;
        if (relations.includes(word)) {
            return true
        }
        else {
            return false
        }
    }
    else {
        return false
    }

}

export function returnWord(word: string) { //call function with only one argument → context.recResult[0].utterance
    const wordFound = DATABASE.find((item: { word: string; }) => item.word === word);
    if (wordFound) {
        const relations = wordFound.relations;
        const randomIndex = Math.floor(Math.random() * relations.length);
        const newWord = relations[randomIndex];
        //DATABASE.splice(DATABASE.indexOf(wordFound), 1)
        return newWord;
    }
}
// (userWord, systemWord)
export function checkRelation2(context: SDSContext, userWord: any) {
    const wordGiven = context.unusedWords.find((item: { word: string; }) => item.word === userWord);
    //console.log(wordGiven)
    if (wordGiven) {
        console.log(wordGiven)
        const relations = wordGiven.relations;

        if (relations.includes(context.word)) {
            console.log(relations)
            return true
        }
        else {
            return false
        }
    }
    else {
        return false
    }

}

// blue -> white, orange, [purple] -> white, orange, blue


// next word
export function returnWord2(context: SDSContext, userWord: string) { //call function with only one argument → context.recResult[0].utterance
    const wordFound = context.unusedWords.find((item: { word: string; }) => item.word === userWord);
    console.log(wordFound)
   
        if (wordFound) {
        const relations = wordFound.relations;
        let unusedwords = context.unusedWords.map((item: { word: any; }) =>{
            return item.word})
        
        // to remove used words from the relations
        const allowedRelations = relations.filter((item: any) => unusedwords.includes(item))
        console.log(allowedRelations)
        const randomIndex = Math.floor(Math.random() * relations.length);
        const newWord = relations[randomIndex];
        console.log("my variable var is equal to", unusedwords)
        console.log(newWord)
        //context.unusedWords.splice(context.unusedWords.indexOf(wordFound), 1)
        return newWord;
    }
}
console.log(returnWord2)




export function computerTry(word: string) {
    word = word.toLowerCase();
    if (word) {
        return returnWord(word)
    }
    else {
        return 'You win'
    }
}

export function firstWord(context: SDSContext) {
    const random = Math.floor(Math.random() * context.unusedWords.length)
    let wordOne = context.unusedWords[random].word
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
            //entry: assign({unusedWords : (context) => DATABASE}),
            on: {
                RECOGNISED: [
                    {
                        target: "Introduction",
                        actions: assign({
                            name: (context) => context.recResult[0].utterance.replace(/\.$/g, ""),
                            unusedWords: (context) => DATABASE,
                            
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
            entry: [assign({score: (context) => 0 })],
            on: {
                RECOGNISED: [
                    {
                        target: "denyInstructions",
                        cond: (context) => !!getEntity(context, "reject"),
                        actions: [assign({
                            reject: (context) => getEntity(context, "reject"),
                            word: (context) => firstWord(context),
                        }),
                        assign({
                            unusedWords: (context) => context.unusedWords.filter((item: any) => item.word !== context.words)
                        })
                        ]
                    },
                    {
                        target: "acceptInstructions",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                            word: (context) => firstWord(context),
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
                            word: (context) => firstWord(context),
                        }),
                    },
                    {
                        target: "playnow",
                        cond: (context) => !!getEntity(context, "affirm"),
                        actions: assign({
                            affirm: (context) => getEntity(context, "affirm"),
                            word: (context) => firstWord(context)
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
                        cond: (context) => checkRelation2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")) === true,
                        actions: assign({
                            words: (context) => returnWord2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")),
                        }),

                    },

                    {
                        target: "Userlost",
                        cond: (context) => checkRelation2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")) === false,
                        actions: assign({
                            userword: (context) => {

                                //return context.recResult[0].utterance
                            },

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
            entry: [assign({score: (context) => context.score +10})],
            on: {
                RECOGNISED: [

                    {
                        target: "Userlost",
                        cond: (context) => checkRelation2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")) === false,
                        actions: assign({
                            userword: (context) => {

                                //return context.recResult[0].utterance
                            },

                        }),

                    },

                    {
                        target: "gametwo",
                        cond: (context) => checkRelation2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")) === true,
                        actions: assign({
                            words: (context) => returnWord2(context, context.recResult[0].utterance.toLowerCase().replace(".", "")),

                        }),

                        //assign({
                        //unusedWords: (context) => context.unusedWords.filter((item:any) => item.word !== context.words)
                        // })
                        //]
                    },

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
                value: `You got it!Let's start playing for real now!`
            })),
            on: { ENDSPEECH: "gametwo" },
        },

        Userlost: {
            id: "Userlost",
            entry: send((context) => ({
                type: "SPEAK",
                value: `You lost! Let's see how many points you got!`
            })),
            on: { ENDSPEECH: "points" },
        },
        points: {
            id: "points",
            entry: send((context) => ({
                type: "SPEAK",
                value: `Your score is ${context.score}!`
            })),
            on: { ENDSPEECH: "init" },
        },
       
    },

};
