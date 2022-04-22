import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { serverTimestamp } from 'firebase/firestore';
import { ErrorDAO, MGPError } from '../dao/ErrorDAO';
import { FirestoreDocument } from '../dao/FirestoreDAO';
import { MGPOptional } from '../utils/MGPOptional';
import { MGPValidation } from '../utils/MGPValidation';
import { JSONValue } from '../utils/utils';

@Injectable({
    providedIn: 'root',
})
export class ErrorLoggerService {
    private static singleton: MGPOptional<ErrorLoggerService>;
    public static setSingletonInstance(service: ErrorLoggerService) {
        ErrorLoggerService.singleton = MGPOptional.of(service);
    }
    public static logErrorAndFail(component: string, message: string, data?: JSONValue): never {
        ErrorLoggerService.logError(component, message, data);
        throw new Error(`${component}: ${message} (extra data: ${JSON.stringify(data)})`);
    }
    public static logError(component: string, message: string, data?: JSONValue): MGPValidation {
        if (this.singleton.isAbsent()) {
            // The error logger service has not been initialized, so we cannot log the error.
            // This can only happen in the test environment, or if something went wrong in the dependency injection.
            // In any case, we don't want to remain silent about it.
            throw new Error(`${component}: ${message} (extra data: ${JSON.stringify(data)})`);
        }
        // This can be done in parallel, we don't care about awaiting the result
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.singleton.get().logError(component, message, data);
        return MGPValidation.failure(component + ': ' + message);
    }
    public constructor(private readonly errorDAO: ErrorDAO,
                       private readonly router: Router) {
        ErrorLoggerService.setSingletonInstance(this);
    }
    public async logError(component: string, message: string, data?: JSONValue): Promise<void> {
        const route: string = this.router.url;
        const previousErrors: FirestoreDocument<MGPError>[] =
            await this.errorDAO.findErrors(component, route, message, data);
        if (previousErrors.length === 0) {
            const error: MGPError = {
                component,
                route,
                message,
                firstEncounter: serverTimestamp(),
                lastEncounter: serverTimestamp(),
                occurences: 1,
            };
            if (data != null) {
                error.data = data;
            }
            await this.errorDAO.create(error);
        } else {
            // There should be a single matching error, but it doesn't really matter, we add it to the first one
            const previousErrorId: string = previousErrors[0].id;
            const previousError: MGPError = previousErrors[0].data;
            await this.errorDAO.update(previousErrorId, {
                lastEncounter: serverTimestamp(),
                occurences: previousError.occurences + 1,
            });
        }
    }
}
