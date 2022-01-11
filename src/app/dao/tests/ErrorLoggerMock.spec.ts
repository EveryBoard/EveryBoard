import { EncounteredError } from 'src/app/services/ErrorLogger';
import { MGPValidation } from 'src/app/utils/MGPValidation';

export class ErrorLoggerMock {
    public loggedErrors: EncounteredError[] = [];
    public async logError(component: string, message: string): Promise<MGPValidation> {
        this.loggedErrors.push({
            component,
            message,
            time: null,
        });
        console.log('1')
        return MGPValidation.failure(component + ': ' + message);
    }
}
