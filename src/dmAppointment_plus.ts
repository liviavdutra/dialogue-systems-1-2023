import { MachineConfig, send, Action, assign, StatesConfig, EventObject, BaseActionObject } from "xstate";

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
  lecture: {
    intent: "None",
    entities: { title: "Dialogue systems lecture" },
  },
  lunch: {
    intent: "None",
    entities: { title: "Lunch at the canteen" },
  },
  doctor: {
    intent: "None",
    entities: { title: "Doctor appointment" },
  },
  Meeting: {
    intent: "None",
    entities: { title: "Work meeting" },
  },
  Birthday: {
    intent: "None",
    entities: { title: "Jane's birthday" },
  },
  Dentist: {
    intent: "None",
    entities: { title: "Dentist at downtown" },
  },
  Coffe : {
    intent: "None",
    entities: { title: "Coffee Break" },
  },
  Tutoring: {
    intent: "None",
    entities: { title: "Tutoring session" },
  },
  Dinner: {
    intent: "None",
    entities: { title: "Dinner with family" },
  },
  Dance: {
    intent: "None",
    entities: { title: "Dance class" },
  },
  Gym: {
    intent: "None",
    entities: { title: "Work out session" },
  },
 
  "on friday": {
    intent: "None",
    entities: { day: "Friday" },
  },
  "on saturday": {
    intent: "None",
    entities: { day: "Saturday" },
  },
  "on monday": {
    intent: "None",
    entities: { day: "Monday" },
  },
  "on Tuesday": {
    intent: "None",
    entities: { day: "Tuesday" },
  },
  "on Thursday": {
    intent: "None",
    entities: { day: "Thursday" },
  },
  "on Wednesday": {
    intent: "None",
    entities: { day: "Wednesday" },
  },
  "on sunday": {
    intent: "None",
    entities: { day: "Sundat" },
  },
  "on weekend": {
    intent: "None",
    entities: { day: "Weekend" },
  },
  "at 10": {
    intent: "None",
    entities: { time: "10:00" },
  },
  "at 9": {
    intent: "None",
    entities: { time: "09:00" },
  },
  "at 7": {
    intent: "None",
    entities: { time: "07:00" },
  },
  "at 11": {
    intent: "None",
    entities: { time: "11:00" },
  },
  "at 8": {
    intent: "None",
    entities: { time: "08:00" },
  },
  "at 12": {
    intent: "None",
    entities: { time: "12:00" },
  },
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
  "Beyonce": {
    intent: "None",
  entities: { famous: "Beyonce"},
  },
  "create a meeting": {
    intent: "None",
    entities: { request: "Create a meeting" },
  },
  "who is beyoncé?": {
    intent: "None",
    entities: { request: "Who is x?", name: "beyonce" },
  },
  "who is taylor swift?": {
    intent: "None",
    entities: { request: "Who is x?", name: "taylor swift" },
  },

};

const getEntity = (context: SDSContext, entity: string) => {
  // lowercase the utterance and remove tailing "."
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "");
  if (u in grammar) {
    if (entity in grammar[u].entities) {
      return grammar[u].entities[entity];
    }
  }
  return false;
};

const getHelp = (context: SDSContext) => {
  let u = context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") === 'help' || context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") === 'help me' || context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") === 'help me please'
  return u;
};
const promptFunction = (pr1: any,pr2:any,pr3:any): StatesConfig<SDSContext, any, EventObject, BaseActionObject> => ({
  prompt: {
    
    initial: "choice",
    states: {
      choice: {
        always: [{
          target: "prompt2",
          cond: (context) => context.count === 2
          },
          {target: "prompt3",
          cond: (context) => context.count === 3
          },
          {
          target: "prompt4",
          cond: (context) => context.count > 3
          },
          "prompt1",
      ]
      },
    prompt1: {
      entry: [assign({ count: 2 })],
            initial: "prompt",
            states: {
              prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: pr1
              })),
              on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
    },
    prompt2: {
      entry: [assign({ count: 3 })],
            initial: "prompt",
            states: {
              prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: pr2
              })),
              on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
    },
    prompt3: {
      entry: [assign({ count: 4 })],
            initial: "prompt",
            states: {
              prompt: {
              entry: send((context) => ({
                type: "SPEAK",
                value: pr3
              })),
              on: { ENDSPEECH: "ask" },
        },
        ask: {
          entry: send("LISTEN"),
        },
      },
    },
    prompt4: {
        initial: "prompt",
        states: {
          prompt: {
          entry: send((context) => ({
            type: "SPEAK",
            value: "Okay! Let's get back to the beginning! You can try again later!"
          })),
          on: { ENDSPEECH: "#init" },
        },
      },
    },
},},
});
export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = {
  initial: 'idle',
    on: {
    },
    states: {
        idle: {
            on: {
                CLICK: 'init'
            }
        },
        init: {
          id: "init",
            on: {
                TTS_READY: 'help',
                CLICK: 'help'
          }
      },
    
    help0: {
      id:"help0",
      entry: say('Hi! I just need to know what is your name'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },
    
    help1: {
      id:"help1",
      entry: say('Hi! I\'m here to help you! I can either create a meeting for you or tell you about someone!'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    
    },

    help2: {
      id:"help2",
      entry: send(`Hi! You need to confirm if you want or not meet them?`),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },
    help3: {
      id:"help3",
      entry: send('Hi! Tell me what is your meeting! For example lunch, doctor, workout...'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },

    help4: {
      id:"help4",
      entry: send('Hi! On which day of the week is your meeting? Do not forget to say on before the day. For example on monday.'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },
    help5: {
      id:"help5",
      entry: send('Hi! I need to know if you will be busy with this meeting during the whole day or just for period of time.'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },

    help6: {
      id:"help6",
      entry: send('Hi! I need to know when your meeting starts.'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },

    help7: {
      id:"help7",
      entry: send('Hi! I just need you to confirm if all the informations about your meeting are correct.'),
      on: {
          ENDSPEECH: 'help.hist'
      }
    },

    help: {
      initial: 'whoareyou',
      states: {
          hist: {
              type: 'history',
              history: 'deep'
          },
    
      whoareyou: {
        id:"whoareyou",
      initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "#help0",
              cond: (context) => !!getHelp(context),
            },
            {
              target: "#hello",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence > 0.7,
              actions: assign({
                name: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
              }),
            },
            {
              target: "#Sure",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence <= 0.7,
              actions: assign({
                name: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
              }),
            },
           
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
      
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I'm afraid I can't hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          ...promptFunction("Hello! I'm here to help. How would you like me to call you?","Can you please tell me your name?","Last chance to tell me your name"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },},
      Sure: {
        id: "Sure",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "whoareyou",
              cond: (context) => !!getEntity(context, "reject"),
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "hello",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Is your name ${context.name}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: ` ${context.name} is your name?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance ${context.name}. Did I get your name right?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
    },
  
      hello: {
        id:"hello",
        initial: "prompt",
        on: {
          RECOGNISED: [
            {
              target: "#greeting",
              cond: (context) => getEntity(context, "request") == "Create a meeting" && context.recResult[0].confidence > 0.7,
              actions: assign({
                request: (context) => "Create a meeting"
              }),
            },
            
            {
              target: "#help1",
              cond: (context) => !!getHelp(context),
            },
            
            {
              target: ".information",
              cond: (context) => (context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") !== 'help' || context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") !== 'help me' || context.recResult[0].utterance.toLowerCase().replace(/\.$/g, "") !== 'help me please') && context.recResult[0].confidence > 0.7,
              actions: assign({famous:
                context => {return context.recResult[0].utterance.replace('Who is ',"").replace("Tell me about ","").toLowerCase().replace(/\.$/g, "")},
              }),
            },
            {
              target: "#checkmeeting",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence <= 0.7,
              actions: assign({
                request: (context) => context.recResult[0].utterance.replace(/\.$/g, "")
              }),
            },
            {
              target: "#checkperson",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence <= 0.7,
              actions: assign({
                famous:
                context => {return context.recResult[0].utterance.replace('Who is ',"").replace("Tell me about ","").toLowerCase().replace(/\.$/g, "")},
                
              }),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },
        states: {
          information: {
            invoke: {
              id: 'getInformation',
              src: (context, event) => kbRequest(context.famous),
              onDone: [{
                target: 'success',
                cond: (context, event) => event.data.Abstract !== "",
                actions: assign({ information: (context, event) => event.data })
              },
              {
                target: 'failure',
              },
            ],
              onError: {
                target: 'failure',
              }
            }
          },
          success: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `This is what I found about ${context.famous} ${context.information.Abstract}`
            })),
            on: {ENDSPEECH: "#meetingX"} //would you like to meet them? state
          },
          failure: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Sorry, I can't find anything about ${context.famous}. Ask about someone else!`
            })),
            on: {ENDSPEECH: "prompt"}
          },
          prompt: {
            entry: send((context) => ({
              type: "SPEAK",
              value: `Hi ${context.name}. Tell me what you need!`
            })),
            on: { ENDSPEECH: "ask" },
          },
          ask: {
            entry: send("LISTEN"),
          },
          nomatch: {
            entry: say(
              "Sorry, I don't know what it is. Tell me something I know."
            ),
            on: { ENDSPEECH: "ask" },
          },
        },
      },
          checkmeeting: {
            id: "checkmeeting",
            initial: "prompt",
            entry: [assign({ count: 1 })],
            on: {
              RECOGNISED: [
                
                {
                  target: "#hello",
                  cond: (context) => !!getEntity(context, "reject"),
                  actions: assign({
                    reject: (context) => getEntity(context, "reject")
                  })
                },
                {
                  target: "greeting",
                  cond: (context) => !!getEntity(context, "affirm"),
                  actions: assign({
                    affirm: (context) => getEntity(context, "affirm")
                  })
                },
                
                {
                  target: ".nomatch",
                },
              ],
              TIMEOUT: ".noinput",
            },  
            states:{
              noinput:{
                id: "noinput",
                entry: [say(
                  "Sorry, I don't quite hear you."
                )],
                on: { ENDSPEECH: "prompt" },
              },
              //prompt states here: 
              prompt: {
                initial: "choice",
                states: {
                  choice: {
                    always: [{
                      target: "prompt2",
                      cond: (context) => context.count === 2
                      },
                      {target: "prompt3",
                      cond: (context) => context.count === 3
                      },
                      {
                      target: "prompt4",
                      cond: (context) => context.count > 3
                      },
                      "prompt1",
                  ]
                  },
                prompt1: {
                  entry: [assign({ count: 2 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Did you mean create a meeting?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt2: {
                  entry: [assign({ count: 3 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: ` Do you want me to create a meeting?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt3: {
                  entry: [assign({ count: 4 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Last chance!`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt4: {
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: "Okay! Let's get back to the beginning! You can try again later!"
                      })),
                      on: { ENDSPEECH: "#init" },
                    },
                  },
                },
            },},
            nomatch: {
              entry: say(
                "Sorry, I don't know what it is. Tell me something I know."
              ),
              on: { ENDSPEECH: "prompt" },
            },
          },
        },
      checkperson: {
        id: "checkperson",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "hello",
              cond: (context) => !!getEntity(context, "reject"),
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "hello.information",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you wanna know about ${context.famous}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Is ${context.famous} the person you are asking about??`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance!`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
      nomatch: {
        entry: say(
          "Sorry, I don't know what it is. Tell me something I know."
        ),
        on: { ENDSPEECH: "prompt" },
      },
    },
  },
      greeting: {
        id: "greeting",
        entry: send((context) => ({
          type: "SPEAK",
          value: `OK, Let's create a meeting`,
        })),
        on: { ENDSPEECH: "welcome" },
      },
    
      meetingX: {
        id:"meetingX",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "denyMeeting",
              cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence > 0.7,
              actions: assign({
                reject: (context) => getEntity(context, "reject"),
              }), 
            },
            {
              target: "acceptMeeting",
              cond: (context) => !!getEntity(context, "affirm")&& context.recResult[0].confidence > 0.7,
              actions: assign({
                affirm: (context) => getEntity(context, "affirm"),
              }), 
            },
            {
              target: "#help2",
              cond: (context) => !!getHelp(context),
            },
            {
            target: "#checkmeetingx",
            cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence <= 0.7,
            actions: assign({
             affirm: (context) => getEntity(context, "affirm")
             }),
            },
            {
            target: "#checkmeetingx",
               cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence <= 0.7,
              actions: assign({
              reject: (context) => getEntity(context, "reject")
               }),
              },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
      
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Would you like to meet ${context.famous}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want to meet ${context.famous}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance!`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Ok! You can try again later!Let's get back."
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },},

        checkmeetingx: {
          id: "checkmeetingx",
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              
              {
                target: "meetingX",
                cond: (context) => !!getEntity(context, "reject"),
                actions: assign({
                  reject: (context) => getEntity(context, "reject")
                })
              },
              {
                target: "Date",
                cond: (context) => !!getEntity(context, "affirm"),
                actions: assign({
                  affirm: (context) => getEntity(context, "affirm")
                })
              },
              
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: ".prompt",
          },  
          states:{
            noinput:{
              id: "noinput",
              entry: [say(
                "Sorry, I don't quite hear you."
              )],
              on: { ENDSPEECH: "prompt" },
            },
            //prompt states here: 
            prompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [{
                    target: "prompt2",
                    cond: (context) => context.count === 2
                    },
                    {target: "prompt3",
                    cond: (context) => context.count === 3
                    },
                    {
                    target: "prompt4",
                    cond: (context) => context.count > 3
                    },
                    "prompt1",
                ]
                },
              prompt1: {
                entry: [assign({ count: 2 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: `Do you want to meet ${context.famous}?`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt2: {
                entry: [assign({ count: 3 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: ` Yes or no?`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt3: {
                entry: [assign({ count: 4 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: `Last chance!`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt4: {
                  initial: "prompt",
                  states: {
                    prompt: {
                    entry: send((context) => ({
                      type: "SPEAK",
                      value: "Okay! Let's get back to the beginning! You can try again later!"
                    })),
                    on: { ENDSPEECH: "#init" },
                  },
                },
              },
          },},
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
        },
        },
      denyMeeting: {
        entry: say("Ok!"),
        on: { ENDSPEECH: "#init" },
      },
      acceptMeeting: {
        entry: [
          say("Ok!Let's do it!"),
          assign((context) => ({title: `meeting with ${context.famous}`}))
        ],
        on: { ENDSPEECH: "Date" },
        },

      welcome: {
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "info",
              cond: (context) => !!getEntity(context, "title")&& context.recResult[0].confidence > 0.7,
              actions: assign({
                title: (context) => getEntity(context, "title"),
              }),
            },
            {
              target: "#checkwelcome",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence <= 0.7,
              actions: assign({
                title: (context) => context.recResult[0].utterance.replace(/\.$/g, ""),
              }),
            },
            {
              target: "#help3",
              cond: (context) => !!getHelp(context),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I'm afraid I can't hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          ...promptFunction("What is it about?","Can you please tell me the topic of your meeting?","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      checkwelcome: {
        id: "checkwelcome",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "welcome",
              cond: (context) => !!getEntity(context, "reject"),
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "#info",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Is your meeting ${context.title}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: ` Your meeting is ${context.title} ?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance. Yes or no?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
    },
        info: {
          id:"info",
          entry: send((context) => ({
            type: "SPEAK",
            value: `OK, ${context.title}`,
          })),
          on: { ENDSPEECH: "Date" },
        },
      Date: {
        id: "Date",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "Day",
              cond: (context) => !!getEntity(context, "day")&& context.recResult[0].confidence > 0.7,
              actions: assign({
                day: (context) => getEntity(context, "day"),
              }),
            },
            {
              target: "#checkdate",
              cond: (context) => !!context.recResult[0].utterance.replace(/\.$/g, "") && context.recResult[0].confidence <= 0.7,
              actions: assign({
                title: (context) => context.recResult[0].utterance.replace(/\.$/g, ""),
              }),
            },
            {
              target: "#help4",
              cond: (context) => !!getHelp(context),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you!"
            )],
            on: { ENDSPEECH: "prompt" },
          },
          ...promptFunction("On which day?","The day please?","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      checkdate: {
        id: "checkdate",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "welcome",
              cond: (context) => !!getEntity(context, "reject"),
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "#info",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Did you say ${context.day}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: ` Is your meeting on ${context.day} ?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance. Yes or no?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
    },
      Day: {
        entry: send((context) => ({
          type: "SPEAK",
          value: `OK, ${context.day}`,
        })),
        on: { ENDSPEECH: "#Duration" },
      },
      
      Duration: {
        id:"Duration",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "wholeDayDurationConfirm",
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence > 0.9,
              actions: assign({
                affirm: (context) => getEntity(context, "affirm"),
              }),
            },
            {
              target: "wholeDayDurationReject",
              cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence > 0.9,
              actions: assign({
                reject: (context) => getEntity(context, "reject"),
              }),
            },
            {
              target: "#help5",
              cond: (context) => !!getHelp(context),
            },
            {
              target: "#checkdurationwholeday", // this needs to be a different state
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence <= 0.9,
              actions: assign({
               affirm: (context) => getEntity(context, "affirm")
               }),
              },
              {
              target: "#checkrejectwholeday",
                 cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence <= 0.9,
                actions: assign({
                reject: (context) => getEntity(context, "reject")
                 }),
                },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you!"
            )],
            on: { ENDSPEECH: "prompt" },
          },
          ...promptFunction("Will it take the whole day?","I just need an yes or no","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      checkdurationwholeday: {
        id: "checkdurationwholeday",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "#Duration",
              cond: (context) => !!getEntity(context, "reject"),    
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "#wholeDayDurationConfirm",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Did you mean yes?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: ` Yes or no?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance!`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
          },
        },
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
      }, //starts here
        checkrejectwholeday: {
          id: "checkrejectwholeday",
          initial: "prompt",
          entry: [assign({ count: 1 })],
          on: {
            RECOGNISED: [
              
              {
                target: "#Duration",
                cond: (context) => !!getEntity(context, "reject"),    
                actions: assign({
                  reject: (context) => getEntity(context, "reject")
                })
              },
              {
                target: "#wholeDayDurationReject",
                cond: (context) => !!getEntity(context, "affirm"),
                actions: assign({
                  affirm: (context) => getEntity(context, "affirm")
                })
              },
              
              {
                target: ".nomatch",
              },
            ],
            TIMEOUT: ".noinput",
          },  
          states:{
            noinput:{
              id: "noinput",
              entry: [say(
                "Sorry, I don't quite hear you."
              )],
              on: { ENDSPEECH: "prompt" },
            },
            //prompt states here: 
            prompt: {
              initial: "choice",
              states: {
                choice: {
                  always: [{
                    target: "prompt2",
                    cond: (context) => context.count === 2
                    },
                    {target: "prompt3",
                    cond: (context) => context.count === 3
                    },
                    {
                    target: "prompt4",
                    cond: (context) => context.count > 3
                    },
                    "prompt1",
                ]
                },
              prompt1: {
                entry: [assign({ count: 2 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: `Did you mean no?`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt2: {
                entry: [assign({ count: 3 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: ` Yes or no?`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt3: {
                entry: [assign({ count: 4 })],
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: `Last chance!`
                        })),
                        on: { ENDSPEECH: "ask" },
                  },
                  ask: {
                    entry: send("LISTEN"),
                  },
                },
              },
              prompt4: {
                  initial: "prompt",
                  states: {
                    prompt: {
                    entry: send((context) => ({
                      type: "SPEAK",
                      value: "Okay! Let's get back to the beginning! You can try again later!"
                    })),
                    on: { ENDSPEECH: "#init" },
                  },
                },
              },
          },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
    },
    wholeDayDurationConfirm: { //
      id:"wholeDayDurationConfirm",
        entry: say("Ok. Let's create the meeting!"),
        on: { ENDSPEECH: "ConfirmationWholeDay" },
      },
      wholeDayDurationReject: {
        id:"wholeDayDurationReject",
        entry: say("Ok!"),
        on: { ENDSPEECH: "Time" },
        },
      Time: {
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "TimeOfTheDay",
              cond: (context) => !!getEntity(context, "time") && context.recResult[0].confidence > 0.9,
              actions: assign({
                time: (context) => getEntity(context, "time"),
              }),
            },
            {
              target: "#help6",
              cond: (context) => !!getHelp(context),
            },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you!"
            )],
            on: { ENDSPEECH: "prompt" },
          },
          ...promptFunction("What time is your meeting?","When your meeting starts please?","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      checktime: {
        id: "checktime",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            
            {
              target: "Time",
              cond: (context) => !!getEntity(context, "reject"),
              actions: assign({
                reject: (context) => getEntity(context, "reject")
              })
            },
            {
              target: "TimeOfTheDay",
              cond: (context) => !!getEntity(context, "affirm"),
              actions: assign({
                affirm: (context) => getEntity(context, "affirm")
              })
            },
            
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },  
        states:{
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you."
            )],
            on: { ENDSPEECH: "prompt" },
          },
          //prompt states here: 
          prompt: {
            initial: "choice",
            states: {
              choice: {
                always: [{
                  target: "prompt2",
                  cond: (context) => context.count === 2
                  },
                  {target: "prompt3",
                  cond: (context) => context.count === 3
                  },
                  {
                  target: "prompt4",
                  cond: (context) => context.count > 3
                  },
                  "prompt1",
              ]
              },
            prompt1: {
              entry: [assign({ count: 2 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Did you say ${context.time}?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt2: {
              entry: [assign({ count: 3 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: ` Is your meeting at ${context.time} ?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt3: {
              entry: [assign({ count: 4 })],
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: `Last chance. Yes or no?`
                      })),
                      on: { ENDSPEECH: "ask" },
                },
                ask: {
                  entry: send("LISTEN"),
                },
              },
            },
            prompt4: {
                initial: "prompt",
                states: {
                  prompt: {
                  entry: send((context) => ({
                    type: "SPEAK",
                    value: "Okay! Let's get back to the beginning! You can try again later!"
                  })),
                  on: { ENDSPEECH: "#init" },
                },
              },
            },
        },},
        nomatch: {
          id: "nomatch",
          entry: say("Sorry, I don't know what it is. Tell me something I know!"),
          on: { ENDSPEECH: "prompt" },
        },
      },
    },
      TimeOfTheDay: {
        entry: send((context) => ({
          type: "SPEAK",
          value: `OK, ${context.time}`,
        })),
        on: { ENDSPEECH: "Confirmation" },
      },
      ConfirmationWholeDay: {
        id: "ConfirmationWholeDay",  
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "ConfirmMetingCreation",
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence > 0.9,
              actions: assign({
                affirm: (context) => getEntity(context, "affirm"),
              }),
            },
            {
              target: "RejectMeetingCreation",
              cond: (context) => !!getEntity(context, "reject")&& context.recResult[0].confidence > 0.9,
              actions: assign({
                reject: (context) => getEntity(context, "reject"),
              }),
            },
            {
              target: "#help7",
              cond: (context) => !!getHelp(context),
            },
            {
              target: "#checkconfirmwholeday", 
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence <= 0.9,
              actions: assign({
               affirm: (context) => getEntity(context, "affirm")
               }),
              },
              {
              target: "#checkrejectwholeday",
                 cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence <= 0.9,
                actions: assign({
                reject: (context) => getEntity(context, "reject")
                 }),
                },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".prompt",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you!"
            )],
            on: { ENDSPEECH: "prompt" },
          },
        ...promptFunction("","",""),
        nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
          checkconfirmwholeday: {
            id: "checkconfirmwholeday",
            initial: "prompt",
            entry: [assign({ count: 1 })],
            on: {
              RECOGNISED: [
                
                {
                  target: "#Duration",
                  cond: (context) => !!getEntity(context, "reject"),    
                  actions: assign({
                    reject: (context) => getEntity(context, "reject")
                  })
                },
                {
                  target: "#ConfirmMetingCreation",
                  cond: (context) => !!getEntity(context, "affirm"),
                  actions: assign({
                    affirm: (context) => getEntity(context, "affirm")
                  })
                },
                
                {
                  target: ".nomatch",
                },
              ],
              TIMEOUT: ".noinput",
            },  
            states:{
              noinput:{
                id: "noinput",
                entry: [say(
                  "Sorry, I don't quite hear you."
                )],
                on: { ENDSPEECH: "prompt" },
              },
              //prompt states here: 
              prompt: {
                initial: "choice",
                states: {
                  choice: {
                    always: [{
                      target: "prompt2",
                      cond: (context) => context.count === 2
                      },
                      {target: "prompt3",
                      cond: (context) => context.count === 3
                      },
                      {
                      target: "prompt4",
                      cond: (context) => context.count > 3
                      },
                      "prompt1",
                  ]
                  },
                prompt1: {
                  entry: [assign({ count: 2 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Did you mean yes?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt2: {
                  entry: [assign({ count: 3 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: ` Yes or no?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt3: {
                  entry: [assign({ count: 4 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Last chance!`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt4: {
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: "Okay! Let's get back to the beginning! You can try again later!"
                      })),
                      on: { ENDSPEECH: "#init" },
                    },
                  },
                },
            },},
            nomatch: {
              id: "nomatch",
              entry: say("Sorry, I don't know what it is. Tell me something I know!"),
              on: { ENDSPEECH: "prompt" },
            },
          },
          },
            checkrejectdurationwholeday: {
              id: "checkduration",
              initial: "prompt",
              entry: [assign({ count: 1 })],
              on: {
                RECOGNISED: [
                  
                  {
                    target: "#ConfirmationWholeDay",
                    cond: (context) => !!getEntity(context, "reject"),    
                    actions: assign({
                      reject: (context) => getEntity(context, "reject")
                    })
                  },
                  {
                    target: "#RejectMeetingCreation",
                    cond: (context) => !!getEntity(context, "affirm"),
                    actions: assign({
                      affirm: (context) => getEntity(context, "affirm")
                    })
                  },
                  
                  {
                    target: ".nomatch",
                  },
                ],
                TIMEOUT: ".prompt",
              },  
              states:{
                noinput:{
                  id: "noinput",
                  entry: [say(
                    "Sorry, I don't quite hear you."
                  )],
                  on: { ENDSPEECH: "prompt" },
                },
                //prompt states here: 
                prompt: {
                  initial: "choice",
                  states: {
                    choice: {
                      always: [{
                        target: "prompt2",
                        cond: (context) => context.count === 2
                        },
                        {target: "prompt3",
                        cond: (context) => context.count === 3
                        },
                        {
                        target: "prompt4",
                        cond: (context) => context.count > 3
                        },
                        "prompt1",
                    ]
                    },
                  prompt1: {
                    entry: [assign({ count: 2 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: `Did you mean no?`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt2: {
                    entry: [assign({ count: 3 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: ` Yes or no?`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt3: {
                    entry: [assign({ count: 4 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: `Last chance!`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt4: {
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: "Okay! Let's get back to the beginning! You can try again later!"
                        })),
                        on: { ENDSPEECH: "#init" },
                      },
                    },
                  },
              },},
             
          ...promptFunction("Do you want me to create the meeting for the whole day?","Can I confirm the meeting?","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      ConfirmMetingCreation: {
        id: "ConfirmMetingCreation",
        entry: say("Ok. Let's create the meeting!"),
        on: { ENDSPEECH: "MeetingCreated" },
      },
      RejectMeetingCreation: {
        id: "RejectMeetingCreation",
        entry: say("Ok. Shall we start over?"),
        on: { ENDSPEECH: "welcome" },
      },
      MeetingCreated: {
        entry: say("Your meeting has been created!"),
        on: { ENDSPEECH: "#init" },

    },
      Confirmation: {
        id: "Confirmation",
        initial: "prompt",
        entry: [assign({ count: 1 })],
        on: {
          RECOGNISED: [
            {
              target: "ConfirmMetingCreation",
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence > 0.9,
              actions: assign({
                affirm: (context) => getEntity(context, "affirm"),
              }),
            },
            {
              target: "#RejectMetingCreationByHour",
              cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence > 0.9,
              actions: assign({
                reject: (context) => getEntity(context, "reject"),
              }),
            },
            {
              target: "#help7",
              cond: (context) => !!getHelp(context),
            },
            {
              target: "#checkconfirmmeeting", 
              cond: (context) => !!getEntity(context, "affirm") && context.recResult[0].confidence <= 0.9,
              actions: assign({
               affirm: (context) => getEntity(context, "affirm")
               }),
              },
              {
              target: "#checkrejectmeeting",
                 cond: (context) => !!getEntity(context, "reject") && context.recResult[0].confidence <= 0.9,
                actions: assign({
                reject: (context) => getEntity(context, "reject")
                 }),
                },
            {
              target: ".nomatch",
            },
          ],
          TIMEOUT: ".noinput",
        },
        states: {
          noinput:{
            id: "noinput",
            entry: [say(
              "Sorry, I don't quite hear you!"
            )],
            on: { ENDSPEECH: "prompt" },
          },
          
          ...promptFunction("Do you want me to create the meeting?","Can I confirm the meeting?","Last chance!"),
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
          checkconfirmmeeting: {
            id: "checkconfirmmeeting",
            initial: "prompt",
            entry: [assign({ count: 1 })],
            on: {
              RECOGNISED: [
                
                {
                  target: "#Confirmation",
                  cond: (context) => !!getEntity(context, "reject"),    
                  actions: assign({
                    reject: (context) => getEntity(context, "reject")
                  })
                },
                {
                  target: "#ConfirmMetingCreationByHour",
                  cond: (context) => !!getEntity(context, "affirm"),
                  actions: assign({
                    affirm: (context) => getEntity(context, "affirm")
                  })
                },
                
                {
                  target: ".nomatch",
                },
              ],
              TIMEOUT: ".prompt",
            },  
            states:{
              noinput:{
                id: "noinput",
                entry: [say(
                  "Sorry, I don't quite hear you."
                )],
                on: { ENDSPEECH: "prompt" },
              },
              //prompt states here: 
              prompt: {
                initial: "choice",
                states: {
                  choice: {
                    always: [{
                      target: "prompt2",
                      cond: (context) => context.count === 2
                      },
                      {target: "prompt3",
                      cond: (context) => context.count === 3
                      },
                      {
                      target: "prompt4",
                      cond: (context) => context.count > 3
                      },
                      "prompt1",
                  ]
                  },
                prompt1: {
                  entry: [assign({ count: 2 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Did you mean yes?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt2: {
                  entry: [assign({ count: 3 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: ` Yes or no?`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt3: {
                  entry: [assign({ count: 4 })],
                        initial: "prompt",
                        states: {
                          prompt: {
                          entry: send((context) => ({
                            type: "SPEAK",
                            value: `Last chance!`
                          })),
                          on: { ENDSPEECH: "ask" },
                    },
                    ask: {
                      entry: send("LISTEN"),
                    },
                  },
                },
                prompt4: {
                    initial: "prompt",
                    states: {
                      prompt: {
                      entry: send((context) => ({
                        type: "SPEAK",
                        value: "Okay! Let's get back to the beginning! You can try again later!"
                      })),
                      on: { ENDSPEECH: "#init" },
                    },
                  },
                },
            },},
            nomatch: {
              id: "nomatch",
              entry: say("Sorry, I don't know what it is. Tell me something I know!"),
              on: { ENDSPEECH: "prompt" },
            },
        },
        },
            checkrejectmeeting: {
              id: "checkrejectmeeting",
              initial: "prompt",
              entry: [assign({ count: 1 })],
              on: {
                RECOGNISED: [
                  
                  {
                    target: "Confirmation",
                    cond: (context) => !!getEntity(context, "reject"),    
                    actions: assign({
                      reject: (context) => getEntity(context, "reject")
                    })
                  },
                  {
                    target: "#RejectMetingCreationByHour",
                    cond: (context) => !!getEntity(context, "affirm"),
                    actions: assign({
                      affirm: (context) => getEntity(context, "affirm")
                    })
                  },
                  
                  {
                    target: ".nomatch",
                  },
                ],
                TIMEOUT: ".prompt",
              },  
              states:{
                noinput:{
                  id: "noinput",
                  entry: [say(
                    "Sorry, I don't quite hear you."
                  )],
                  on: { ENDSPEECH: "prompt" },
                },
                //prompt states here: 
                prompt: {
                  initial: "choice",
                  states: {
                    choice: {
                      always: [{
                        target: "prompt2",
                        cond: (context) => context.count === 2
                        },
                        {target: "prompt3",
                        cond: (context) => context.count === 3
                        },
                        {
                        target: "prompt4",
                        cond: (context) => context.count > 3
                        },
                        "prompt1",
                    ]
                    },
                  prompt1: {
                    entry: [assign({ count: 2 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: `Did you mean no?`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt2: {
                    entry: [assign({ count: 3 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: ` Yes or no?`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt3: {
                    entry: [assign({ count: 4 })],
                          initial: "prompt",
                          states: {
                            prompt: {
                            entry: send((context) => ({
                              type: "SPEAK",
                              value: `Last chance!`
                            })),
                            on: { ENDSPEECH: "ask" },
                      },
                      ask: {
                        entry: send("LISTEN"),
                      },
                    },
                  },
                  prompt4: {
                      initial: "prompt",
                      states: {
                        prompt: {
                        entry: send((context) => ({
                          type: "SPEAK",
                          value: "Okay! Let's get back to the beginning! You can try again later!"
                        })),
                        on: { ENDSPEECH: "#init" },
                      },
                    },
                  },
              },},
          nomatch: {
            id: "nomatch",
            entry: say("Sorry, I don't know what it is. Tell me something I know!"),
            on: { ENDSPEECH: "prompt" },
          },
      },
      },
      ConfirmMetingCreationByHour: {
        id: "ConfirmMetingCreationByHour",
        entry: say("Ok. Let's create the meeting!"),
        on: { ENDSPEECH: "MeetingCreated" },
      },
      RejectMetingCreationByHour: {
        id: "RejectMetingCreationByHour",
        entry: say("Ok. Shall we start over?"),
        on: { ENDSPEECH: "welcome" },
      },
      MeetingCreatedByHour: {
        entry: say("Your meeting has been created!"),
        on: { ENDSPEECH: "#init" },
      },
    },
  },
},
};

const kbRequest = (text: string) =>
  fetch(
    new Request(
      `https://cors.eu.org/https://api.duckduckgo.com/?q=${text}&format=json&skip_disambig=1`
    )
  ).then((data) => data.json());
