/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ConfigureTestingModuleUtils } from './utils/tests/TestUtils.spec';

describe('AppComponent', () => {
    beforeEach(fakeAsync(async() => {
        await ConfigureTestingModuleUtils.configureTestingModule();
    }));

    it('should create the app', () => {
        const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
        const app: AppComponent = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

});
