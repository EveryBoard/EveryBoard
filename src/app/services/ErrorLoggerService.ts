import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { serverTimestamp } from 'firebase/firestore';
import { FirebaseDocument, FirebaseFirestoreDAO } from '../dao/FirebaseFirestoreDAO';
import { FirebaseTime } from '../domain/Time';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPValidation } from '../utils/MGPValidation';
import { FirebaseJSONObject, JSONValue } from '../utils/utils';

export interface MGPError extends FirebaseJSONObject {
    // The component in which the error occured
    component: string,
    // Route on which the error occured
    route: string,
    // A message detailing the error
    message: string,
    // Some extra data for the error
    data: JSONValue,
    // First time the error occured
    firstEncounter: FirebaseTime,
    // Last time the error occured
    lastEncounter: FirebaseTime,
    // Number of times the error occured
    occurences: number,
}

@Injectable({
    providedIn: 'root',
})
export class ErrorDAO extends FirebaseFirestoreDAO<MGPError> {
    private constructor(firestore: Firestore) {
        super('errors', firestore);
    }
}

@Injectable({
    providedIn: 'root',
})
export class ErrorLoggerService {
    private static singleton: MGPOptional<ErrorLoggerService> = MGPOptional.empty();
    private static setSingletonInstance(service: ErrorLoggerService) {
        ErrorLoggerService.singleton = MGPOptional.of(service);
    }
    public static logError(component: string, message: string, data?: JSONValue): MGPValidation {
        if (this.singleton.isAbsent()) {
            // The error logger service has not been initialized, so we cannot log the error.
            // This can only happen in the test environment, or if something went wrong in the dependency injection.
            // In any case, we don't want to remain silent about it.
            throw new Error(`${component}: ${message} (extra data: ${data})`);
        }
        // This can be done in parallel, we don't care about awaiting the result
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.singleton.get().logError(component, message, data);
        return MGPValidation.failure(component + ': ' + message);
    }

    // The DAO used to log the errors within firebase
    public constructor(private readonly errorDAO: ErrorDAO,
                       private readonly router: Router) {
        ErrorLoggerService.setSingletonInstance(this);
    }
    private async logError(component: string, message: string, data?: JSONValue): Promise<void> {
        const route: string = this.router.url;
        const previousErrors: FirebaseDocument<MGPError>[] =
            await this.errorDAO.findWhere([['component', '==', component], ['route', '==', route], ['message', '==', message], ['data', '==', data]]);
        if (previousErrors.length === 0) {
            const error: MGPError = {
                component,
                route,
                message,
                data,
                firstEncounter: serverTimestamp(),
                lastEncounter: serverTimestamp(),
                occurences: 1,
            };
            await this.errorDAO.create(error);
        } else {
            // There should a single matching error, but it doesn't really matter, we add it to the first one
            const previousErrorId: string = previousErrors[0].id;
            const previousError: MGPError = previousErrors[0].data;
            await this.errorDAO.update(previousErrorId, {
                lastEncounter: serverTimestamp(),
                occurences: previousError.occurences + 1,
            });
        }
    }
}
