import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';
import { INodeSocket } from 'botframework-streaming';
import {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    ConversationState,
    createBotFrameworkAuthenticationFromConfiguration,
    MemoryStorage,
    UserState
} from 'botbuilder';
import { LuisApplication } from 'botbuilder-ai';
import { DialogAndWelcomeBot } from './bots/dialogAndWelcomeBot';
import { MainDialog } from './dialogs/mainDialog';
import { BookingDialog } from './dialogs/bookingDialog';
import { FlightBookingRecognizer } from './dialogs/flightBookingRecognizer';

// Carga las variables de entorno desde el archivo .env
const ENV_FILE = path.join(__dirname, '..', '.env');
config({ path: ENV_FILE });

// Configuración del adaptador del bot
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId || '',
    MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
    MicrosoftAppType: process.env.MicrosoftAppType || '',
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId || ''
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Crea el adaptador del bot
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Manejo de errores
const onTurnErrorHandler = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);

    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
    await conversationState.delete(context);
};

// Configuración del estado del bot
let conversationState: ConversationState;
let userState: UserState;

const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

// Configuración de LUIS
const { LuisAppId, LuisAPIKey, LuisAPIHostName } = process.env;
const luisConfig: LuisApplication = {
    applicationId: LuisAppId || '',
    endpointKey: LuisAPIKey || '',
    endpoint: `https://${LuisAPIHostName || 'westus.api.cognitive.microsofttranslator.com'}` // Cambia el endpoint según sea necesario
};

const luisRecognizer = new FlightBookingRecognizer(luisConfig);

// Crear los diálogos del bot
const bookingDialog = new BookingDialog('bookingDialog');
const dialog = new MainDialog(luisRecognizer, bookingDialog);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

// Crear el servidor HTTP
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// Escuchar actividades entrantes y enrutarlas al bot
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Escuchar solicitudes de actualización para Streaming.
server.on('upgrade', async (req, socket, head) => {
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket as unknown as INodeSocket, head, (context) => bot.run(context));
});
