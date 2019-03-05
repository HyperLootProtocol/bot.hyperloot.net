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
Atomic element, we use it to build all bot functionality. It simple function what get `request` and `context` and return new mutated `request` object.

`request` like temp container what keep all session data (UNDERWORK! Signature unstable).
* `request.input: String` User input, what emit proccess in adapter
* `request.from: Array` Place where message getted, first item - adapter name, other - adapter-specific
* `requst.send: ({message, to, ...} | STRING | [{message, to, ...}]) => void` basic method, for sending anything from executors. `from` and `to` have equal structure, u can send simple string to direct answer (like `from` === `to`) or array with multiple answers. 

`context` immutable structure what contain basic functions provided by modules when app start `__INIT__` or per each request by adapters (then `process` calling) see [Adapters](#adapters), [DB](#db) and [Modules](#modules) for detail information

Basic example (signature):
```js
async (request, context) => {
    //... CHECKERS (to prevent unexpected mutation)
    if (request.something) {
        return request; // if we return request, we skip executor
    }

    // OR skip executor-set
    if (request.something && context.someMethod()) {
        return; // if we return null, we skip executor and all executor set in this module (executor set) see later
    }

    //... request MUTATIONS
    request.someData = true;

    // OR
    try {
        request.test = await someAsyncCall(); // we can write like this
    } catch (error) {
        throw(new Error());
    }

    return request;
}

// Also good point to deconstruction context
async (request, { i18n, db }) => { ... }
```

### module (executors set)
Module is array of executors. Each executor called by declared order and transmit mutated `request` to next executor in array.

If executor return `null` we prevent call rest executors in *array*! Also good point use this behavior for filtering in queue.

If executor `throw('error')` app also skip rest executors in array and add to `esponse.error` error tip. U can use it after filtering by some conditions and provide information for user.

#### examples:

```js
instance.use([someFilter, errorer, mutate]);

// where
function someFilter(request, context) {
    if (request.input[0] === '1') {
        return request; // we pass only then first input symbol equal '!'
    }
}

function errorer(request, context) {
    if (request.input[0] !== '2') {
        throw('SECOND SYMBOL NOT 2');
    }

    return request;
}

function mutate(request) {
    request.output = '3';

    return request;
}

```

Also we can create advanced cases with different filters/filter factories and subchains
```js
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

In general cases we provide `input` and `_handleDirect` and basic adapter ready to serve! :)
```js
client.onEvent(data => {
    instance.process({
        input: data.msg,
        _handleDirect(request) {
            client.emitTextAnswer(request.output);
        },
    });
})
```

Also, if adapter can provide sending messages to several places, need setup in `__INIT__` section`context._handlers.${adapterName}` function with `({ message, to, ...})` where
* `output.message: STRING` message for sending
* `output.to: [adapterName, ...] place to send message (first, adapterName, next adapterSpecific path, like channelId, or groupId etc)

### executor init
App provide only one function: `process`, other features provided by modules in `__INIT__` section. `__INIT__` is a function, what get `context` and must return `context`. Init can mutate context to add some properties and call something then it need (it call once, then app starts.

It can be usefull for: setup/init something before app start get requests, provide functions for other modules (like `i18n` or `db connectors`) or emit proccess handler (as adapters).

Basic usecase:

```js
const executor = () {
    console.log('i called every time, then someone call process')
};

executor.__INIT__ = (context) {
    console.log('i called once, then app starts')

    return context;
}
```

Advanced:
```js
const twitterExample = (request, context) {
    if (context.event !== 'tweet') {
        return;
    }

    const id = parseIdFromPost(request.input);

    if (!id) {
        return;
    }

    const post = context.getTwitterPostById(id);
    context.emitLog(post);

    return request;
};

twitterExample.__INIT__ = (context) {
    context.getTwitterPostById = twitter.getTwitterPostById;

    twtitter.on('tweet').then(data =>
        context.process(
            event: 'tweet',
            input: data.tweet.toText(),
            _handleDirect: () => {}, // no back handler for this adapter!
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
* `getUser: (userId, userData) => PROMISE(userData)` get user data by user id and default data about user
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
Each adapter must provide:
* `input: string` contain text view of event (like user msg text in most cases)
* `_handleDirect: (request) => void` method for calling client DIRECT callback (where `to` equal `from`, like answer)
* `from: [CLIENT_ID, ...]` client name (discord/telegram/etc), and coords/place where we get message (adapter specific data, what we use in `_handleTo`)
* `userId: string` client specific id (for unuqie provide client+id)
* `userData: USER` current user data

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
- [ ] cross-client sending messages, and multiple message sending
- [ ] cross-client merging reglament
- [ ] telegram adapter
- [ ] twitch adapter
- [ ] youtube adapter
- [ ] clans
- [ ] missions
- [ ] dashboard
