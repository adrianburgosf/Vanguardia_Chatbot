import { TextPrompt } from 'botbuilder-dialogs';
import { DialogTestClient, DialogTestLogger } from 'botbuilder-testing';
import { MainDialog } from '../../dialogs/mainDialog';
const assert = require('assert');

// Mock MainDialog
class MockMainDialog extends MainDialog {
    constructor() {
        super();
    }

    async beginDialog(dc, options) {
        return await dc.prompt('textPrompt', { prompt: 'Welcome mock dialog' });
    }
}

describe('MainDialog', () => {
    it('Shows message if LUIS is not configured and calls BookingDialogDirectly', async () => {
        const sut = new MainDialog(); // Adjusted to no arguments
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        const reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"', 'Did not show prompt');
    });

    it('Shows prompt if LUIS is configured', async () => {
        const sut = new MainDialog(); // Adjusted to no arguments
        const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

        const reply = await client.sendActivity('hi');
        assert.strictEqual(reply.text, 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"', 'Did not show prompt');
    });

    describe('Invokes tasks based on LUIS intent', () => {
        // Create array with test case data.
        const testCases = [
            { utterance: 'I want to book a flight', intent: 'BookFlight', invokedDialogResponse: 'bookingDialog mock invoked', taskConfirmationMessage: 'I have you booked to Seattle from New York' },
            { utterance: `What's the weather like?`, intent: 'GetWeather', invokedDialogResponse: 'TODO: get weather flow here', taskConfirmationMessage: undefined },
            { utterance: 'bananas', intent: 'None', invokedDialogResponse: `Sorry, I didn't get that. Please try asking in a different way (intent was None)`, taskConfirmationMessage: undefined }
        ];

        testCases.map((testData) => {
            it(testData.intent, async () => {
                // Create LuisResult for the mock recognizer.
                const mockLuisResult = JSON.parse(`{"intents": {"${ testData.intent }": {"score": 1}}, "entities": {"$instance": {}}}`);
                const sut = new MainDialog(); // Adjusted to no arguments
                const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

                // Execute the test case
                console.log(`Test Case: ${ testData.intent }`);
                let reply = await client.sendActivity('Hi');
                assert.strictEqual(reply.text, 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"');

                reply = await client.sendActivity(testData.utterance);
                assert.strictEqual(reply.text, testData.invokedDialogResponse);

                // The Booking dialog displays an additional confirmation message, assert that it is what we expect.
                if (testData.taskConfirmationMessage) {
                    reply = client.getNextReply();
                    assert(reply.text.startsWith(testData.taskConfirmationMessage));
                }

                // Validate that the MainDialog starts over once the task is completed.
                reply = client.getNextReply();
                assert.strictEqual(reply.text, 'What else can I do for you?');
            });
        });
    });

    describe('Shows unsupported cities warning', () => {
        // Create array with test case data.
        const testCases = [
            { jsonFile: 'FlightToMadrid.json', expectedMessage: 'Sorry but the following airports are not supported: madrid' },
            { jsonFile: 'FlightFromMadridToChicago.json', expectedMessage: 'Sorry but the following airports are not supported: madrid, chicago' },
            { jsonFile: 'FlightFromCdgToJfk.json', expectedMessage: 'Sorry but the following airports are not supported: cdg' },
            { jsonFile: 'FlightFromParisToNewYork.json', expectedMessage: 'bookingDialog mock invoked' }
        ];

        testCases.map((testData) => {
            it(testData.jsonFile, async () => {
                // Create LuisResult for the mock recognizer.
                const mockLuisResult = require(`../../../testResources/${ testData.jsonFile }`);
                const sut = new MainDialog(); // Adjusted to no arguments
                const client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);

                // Execute the test case
                console.log(`Test Case: ${ mockLuisResult.text }`);
                let reply = await client.sendActivity('Hi');
                assert.strictEqual(reply.text, 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"');

                reply = await client.sendActivity(mockLuisResult.text);
                assert.strictEqual(reply.text, testData.expectedMessage);
            });
        });
    });
});
