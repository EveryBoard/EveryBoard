/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterOutlet } from '@angular/router';

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

    it('should preserve the routed component while settings are opened and closed', fakeAsync(async() => {
        // Given an app displaying a routed component
        const fixture: ComponentFixture<AppComponent> = TestBed.createComponent(AppComponent);
        const router: Router = TestBed.inject(Router);
        fixture.detectChanges();
        await router.navigateByUrl('/local');
        tick(0);
        fixture.detectChanges();
        const routerOutlet: RouterOutlet = fixture.debugElement.query(By.directive(RouterOutlet)).componentInstance;
        const routedComponent: object = routerOutlet.component;
        const settingsButton: DebugElement = fixture.debugElement.query(By.css('#settings'));

        // When opening settings
        settingsButton.triggerEventHandler('click');
        fixture.detectChanges();

        // Then settings are displayed without replacing the routed component
        expect(fixture.debugElement.query(By.css('#settings-modal'))).not.toBeNull();
        expect(routerOutlet.component).toBe(routedComponent);

        // When closing settings
        settingsButton.triggerEventHandler('click');
        fixture.detectChanges();

        // Then settings disappear and the routed component is still preserved
        expect(fixture.debugElement.query(By.css('#settings-modal'))).toBeNull();
        expect(routerOutlet.component).toBe(routedComponent);
    }));

});
