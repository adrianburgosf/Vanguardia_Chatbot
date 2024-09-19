import { BotFrameworkAdapter, ConversationState, UserState, TurnContext } from 'botbuilder';
import { Dialog, DialogSet, DialogTurnResult, DialogTurnStatus } from 'botbuilder-dialogs';
import { MainDialog } from '../dialogs/mainDialog';

export class DialogAndWelcomeBot {
    private dialogSet: DialogSet;
    private conversationState: ConversationState;
    private userState: UserState;

    constructor(conversationState: ConversationState, userState: UserState, mainDialog: MainDialog) {
        if (!conversationState) throw new Error('Missing parameter. conversationState is required');
        if (!userState) throw new Error('Missing parameter. userState is required');
        if (!mainDialog) throw new Error('Missing parameter. mainDialog is required');

        this.conversationState = conversationState;
        this.userState = userState;

        // Crear el conjunto de diálogos
        this.dialogSet = new DialogSet(this.conversationState.createProperty('dialogState'));
        this.dialogSet.add(mainDialog);
    }

    public async run(context: TurnContext): Promise<void> {
        // Crear un contexto de diálogo
        const dialogContext = await this.dialogSet.createContext(context);

        // Continuar el diálogo
        const results = await dialogContext.continueDialog();

        if (results.status === DialogTurnStatus.empty) {
            // Iniciar el diálogo si está vacío
            await dialogContext.beginDialog('mainDialog');
        } else if (results.status === DialogTurnStatus.complete) {
            // Mensaje al finalizar el diálogo
            await context.sendActivity('Diálogo completado.');
        }

        // Guardar el estado de la conversación y del usuario
        await this.conversationState.saveChanges(context);
        await this.userState.saveChanges(context);
    }
}
