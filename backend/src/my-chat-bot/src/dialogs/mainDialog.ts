import { ComponentDialog, DialogTurnResult, WaterfallDialog, WaterfallStepContext, TextPrompt } from 'botbuilder-dialogs';

// Define los nombres de los diálogos
const MAIN_DIALOG = 'mainDialog';

export class MainDialog extends ComponentDialog {
    constructor() {
        super(MAIN_DIALOG);

        // Define los diálogos y sus pasos
        this.addDialog(new WaterfallDialog(MAIN_DIALOG, [
            this.introStep.bind(this),
            this.handleUserInput.bind(this),
            this.finalStep.bind(this),
        ]));

        // Añadir el TextPrompt para manejar entradas de texto
        this.addDialog(new TextPrompt('textPrompt'));

        // Configuración del diálogo principal
        this.initialDialogId = MAIN_DIALOG;
    }

    private async introStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // Saludo inicial
        return await stepContext.prompt('textPrompt', { prompt: 'Hola, ¿cómo puedo ayudarte con el desarrollo de aplicaciones de vanguardia?' });
    }

    private async handleUserInput(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const userInput = stepContext.result as string;

        // Lógica de manejo de entrada del usuario
        if (userInput.toLowerCase().includes('tendencias')) {
            await stepContext.context.sendActivity('Las últimas tendencias incluyen microservicios, contenedores y aplicaciones nativas en la nube.');
        } else if (userInput.toLowerCase().includes('microservicios')) {
            await stepContext.context.sendActivity('Los microservicios son una arquitectura que divide aplicaciones en componentes pequeños y manejables.');
        } else if (userInput.toLowerCase().includes('devops')) {
            await stepContext.context.sendActivity('DevOps es una cultura que busca la integración continua entre desarrollo y operaciones.');
        } else if (userInput.toLowerCase().includes('aplicaciones nativas en la nube')) {
            await stepContext.context.sendActivity('Las aplicaciones nativas en la nube están optimizadas para ejecutarse en entornos de nube y aprovechar su escalabilidad.');
        } else {
            await stepContext.context.sendActivity('No entendí eso, ¿puedes repetirlo?');
        }

        return await stepContext.next();
    }

    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // Mensaje final
        await stepContext.context.sendActivity('¿Hay algo más en lo que pueda ayudarte?');
        return await stepContext.endDialog();
    }
}
