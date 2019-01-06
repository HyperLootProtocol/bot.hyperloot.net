# Bot
Bot is powerful service what provide communication between people in community.

> ALL STRUCUTRES UNDERWORK! ALL SIGNATUES UNSTABLE!

## usage
Easy development start: `npm i` and `npm run dev` THEN u can create new modules. (using nedb and http adapter).

> TIP for debugging used [Debug](https://github.com/visionmedia/debug), please set env `debug=bot:*` to see details then app started <3

### other commands
* `npm run dev` start in development mode (with nodemon, it will reload after any changes), u can use web adapter for local work, easy start and call `//localhost:3000/api?message=/ping`
* `npm test` run jest and eslint (please check it before commit)
* `npm start` start bundle in prod mode (TODO)

## abstract

### executor
Atomic element, we use it to build all bot functionality. It simple function what get `response` and `context` and return new mutated `response` object.

`response` like temp container what keep all session data (UNDERWORK! Signature unstable).
* `response.output: string || [string] || [{ message, channelName }]` Output need to send text message as handler emiter (user get this as answer).
* `response.reactions: [string]` array of reactions what should be placed to input message

`context` immutable structure what contain basic functions provided by modules when app start `__INIT__` or per each request by adapters (then `process` calling) see [Adapters](#adapters), [DB](#db) and [Modules](#modules) for detail information

Basic example (signature):
```
async (response, context) => {
    //... CHECKERS (to prevent unexpected mutation)
    if (response.something) {
        return response; // if we return response, we skip executor
    }

    // OR skip executor-set
    if (response.something && context.someMethod()) {
        return; // if we return null, we skip executor and all executor set in this module (executor set) see later
    }

    //... RESPONSE MUTATIONS
    response.someData = true;

    // OR
    try {
        response.test = await someAsyncCall(); // we can write like this
    } catch (error) {
        throw(new Error());
    }

    return response;
}

// Also good point to deconstruction context
async (response, { i18n, db }) => { ... }
```

### module (executors set)
Module is array of executors. Each executor called by declared order and transmit mutated `response` to next executor in array.

If executor return `null` we prevent call rest executors in *array*! Also good point use this behavior for filtering in queue.

If executor `throw('error')` app also skip rest executors in array and add to `esponse.error` error tip. U can use it after filtering by some conditions and provide information for user.

#### examples:

```
instance.use([someFilter, errorer, mutate]);

// where
function someFilter(response, context) {
    if (context.input[0] === '1') {
        return response; // we pass only then first input symbol equal '!'
    }
}

function errorer(response, context) {
    if (context.input[0] !== '2') {
        throw('SECOND SYMBOL NOT 2');
    }

    return response;
}

function mutate(response) {
    response.output = '3';

    return response;
}

```

Also we can create advanced cases with different filters/filter factories and subchains
```
instance.use([
    [someFilter, filter2, mutate1, mutate2],
    [filter, filterFactory('someType'), mutate],
    otherCall,
    errorHandler
]);

```

### adapter
Adapter is a executor with `__INIT__` that must call `context.process` its start execute modules chain. Any client must emit `proccess` call then something happens and provide `context` with event data. Be sure to transform any handled data to universal form.

Client also must provide callback function, that will be called after all modules will be executed!

In general cases we provide `input` and `handle` and basic adapter ready to serve! :)
```

client.onEvent(data => {
    instance.process({
        input: data.msg,
        handle(response) {
            client.emitTextAnswer(response.output);
        },
    });
})
```

### executor init
App provide only one function: `process`, other features provided by modules in `__INIT__` section. `__INIT__` is a function, what get `context` and must return `context`. Init can mutate context to add some properties and call something then it need (it call once, then app starts.

It can be usefull for: setup/init something before app start get requests, provide functions for other modules (like `i18n` or `db connectors`) or emit proccess handler (as adapters).

Basic usecase:

```
const executor = () {
    console.log('i called every time, then someone call process')
};

executor.__INIT__ = (context) {
    console.log('i called once, then app starts')

    return context;
}
```

Advanced:
```
const twitterExample = (response, context) {
    if (context.event !== 'tweet') {
        return;
    }

    const id = parseIdFromPost(response.input);

    if (!id) {
        return;
    }

    const post = context.getTwitterPostById(id);
    context.emitLog(post);

    return response;
};

twitterExample.__INIT__ = (context) {
    context.getTwitterPostById = twitter.getTwitterPostById;

    twtitter.on('tweet').then(data =>
        context.process(
            event: 'tweet',
            input: data.tweet.toText(),
            handle: () => {}, // no back handler for this adapter!
        )
    )

    return context;
}
```

### user model
* signature
* cross-client ?
* ...

## db
Module db must provide three basics
* `getUser: (userId) => PROMISE(userData)` get user data by user id
* `getModuleData: (moduleName, scope = global) => PROMISE(moduleData)` get module data from user scope, or global
* `updateModuleData: (moduleName, query, scope = global) => PROMISE(void)` update module data to user scope, or global scope

### adater details
* mongo
* nedb
* ...

## modules
This modules provide funcs to context:
* `i18n: (keyword: string) => string` provide function what return string by unique keyword from string lib, see more in i18n

### other modules
* quiz
* poll
* ...

## adapters
Each adapter must provide to context:
* `input: string` contain text view of event (like user msg text in most cases)
* `handle: (response) => void` method for calling client callback (in-future need provide cross-client handling)
* `from: CLIENT_ID` client name (discord/telegram/etc)
* `id: string` client specific id (for unuqie provide client+id)
* `username: string` client specific username
* `user: USER` current user data

### adater details
* http
* discord
* ...

# TODO
- [x] local development (easy start)
- [x] nedb db
- [x] mongojs db
- [x] discord adapter
- [x] http adapter
- [ ] more docs and examples
- [ ] cross-client merging reglament
- [ ] telegram adapter
- [ ] twitch adapter
- [ ] youtube adapter
- [ ] clans
- [ ] missions
- [ ] dashboard
