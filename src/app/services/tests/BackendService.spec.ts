/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync } from '@angular/core/testing';
import { BackendService } from '../BackendService';
import { ConnectedUserServiceMock } from './ConnectedUserService.spec';
import { AppModule } from 'src/app/app.module';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { ConnectedUserService } from '../ConnectedUserService';
import { MGPFallible } from '@everyboard/lib';

@Injectable({ providedIn: 'root' })
export class SomeBackendService extends BackendService {

    public constructor(connectedUserService: ConnectedUserService) {
        super(connectedUserService);
    }

    public async someRequest(): Promise<MGPFallible<Response>> {
        return await this.performRequest('GET', 'foo');
    }

}

export function endpoint(path: string): string {
    return 'http://localhost:8081' + path;
}

export function expectedParams(method: 'POST' | 'GET' | 'DELETE'): object {
    return {
        method,
        headers: {
            Authorization: 'Bearer idToken',
        },
    };
}

describe('BackendService', () => {
    let backendService: SomeBackendService;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            imports: [
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        backendService = TestBed.inject(SomeBackendService);
    });

    it('should fail properly if no error message is returned', fakeAsync(async() => {
        // Given a backend that does not return error messages but fails
        const response: Response = Response.json(null, { status: 404 });
        spyOn(window, 'fetch').and.resolveTo(response);
        // When making a request that will fail
        const result: MGPFallible<Response> = await backendService.someRequest();
        // Then it should fail properly
        expect(result.getReason()).toBe('No error message');
    }));
});
