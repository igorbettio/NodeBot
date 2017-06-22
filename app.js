var restify = require('restify');
var builder = require('botbuilder');
var natural = require('natural');

const rules = [{
        name: 'Status',
        level: '1',
        id: '1',
        questions: [
            'how are you', 'hi', 'hi, how are you', 'how you doing', 'are you ok'
        ],
        answers: [
            'I\'m fine, thanks! And you?', 'I\'m great, what about you?',
        ],
    },
    {
        name: 'Status - Good',
        level: '2',
        id: '2',
        questions: [
            'fine', 'good', 'great'
        ],
        answers: [
            'Great.', 'Nice.',
        ],
    },
    {
        name: 'Status - Bad',
        level: '2',
        id: '3',
        questions: [
            'terrible', 'bad', 'not ok', 'not good'
        ],
        answers: [
            'Oh. I wish you get better.', 'That\'s bad.',
        ],
    }
];

var context = {
    currentLevel: '1',
    currentId: ''
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function(session) {

    const rules = RuleMatcher(session.message.text);

    if (rules.length > 0) {
        console.log('Returning text: ', rules[0].answers[Math.floor((Math.random() * rules[0].answers.length))]);
        session.send(rules[0].answers[0]);

        if (context.currentLevel == '2')
            context.currentLevel = '1';
        else
            context.currentLevel = '2';
    } else {
        console.log('No answer found');
        session.send('I couldn\'t understant, I\'m sorry.');
        context.currentLevel = '1';
    }

});

function RuleMatcher(message) {
    var matched = false;
    const matchRules = rules.filter((rule) => {
        rule.questions.every(function(question, index) {
            matched = (natural.DiceCoefficient(message, question) > 0.65)
            return !matched;
        });
        return matched;
    });
    return matchRules;
}