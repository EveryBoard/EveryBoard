/* eslint-disable max-lines-per-function */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ErrorLoggerService } from './services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from './services/tests/ErrorLoggerServiceMock.spec';

describe('AppComponent', () => {
    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            declarations: [AppComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ErrorLoggerService, useClass: ErrorLoggerServiceMock },
            ],
        }).compileComponents();
    }));
    it('should create the app', () => {
        const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
        const app: AppComponent = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

});
