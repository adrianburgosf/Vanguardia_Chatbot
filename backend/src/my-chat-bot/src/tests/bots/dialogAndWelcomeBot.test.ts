import { DialogAndWelcomeBot } from '../../bots/dialogAndWelcomeBot';
import { MainDialog } from '../../dialogs/mainDialog';
import { MemoryStorage, ConversationState, UserState } from 'botbuilder';
import { DialogTestClient, DialogTestLogger } from 'botbuilder-testing';
const assert = require('assert');

// Mock MainDialog without LUIS dependencies
class MockMainDialog extends MainDialog {
    constructor() {
        super();
    }

    async beginDialog(dc, options) {
        return await dc.prompt('textPrompt', { prompt: 'Welcome mock dialog' });
    }
}

describe('DialogAndWelcomeBot', () => {
    let memoryStorage;
    let conversationState;
    let userState;
    let bot;

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        conversationState = new ConversationState(memoryStorage);
        userState = new UserState(memoryStorage);
        bot = new DialogAndWelcomeBot(conversationState, userState, new MockMainDialog());
    });

    it('should send a welcome card to new users', async () => {
        const client = new DialogTestClient('test', bot, null, [new DialogTestLogger()]);

        // Simulate the arrival of a new member with required properties
        const reply = await client.sendActivity({
            type: 'conversationUpdate',
            membersAdded: [{ id: 'user1', name: 'User One' }],
            recipient: { id: 'bot', name: 'Bot' },
            serviceUrl: 'https://example.com'
        });

        assert(reply.text.includes('Bienvenido'), 'Did not send a welcome message');
    });

    it('should start a dialog when receiving a message', async () => {
        const client = new DialogTestClient('test', bot, null, [new DialogTestLogger()]);

        // Send a message to start the dialog
        const reply = await client.sendActivity('Hola, ¿cómo puedo ayudarte con el desarrollo de aplicaciones?');
        assert.strictEqual(reply.text, 'Welcome mock dialog', 'Did not show the mock dialog prompt');
    });
});
