import { EncounteredError } from 'src/app/services/ErrorLogger';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import firebase from 'firebase/app';

export class ErrorLoggerMock {
    public loggedErrors: EncounteredError[] = [];
    public async logError(component: string, message: string): Promise<MGPValidation> {
        this.loggedErrors.push({
            component,
            message,
            time: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return MGPValidation.failure(component + ': ' + message);
    }
}
