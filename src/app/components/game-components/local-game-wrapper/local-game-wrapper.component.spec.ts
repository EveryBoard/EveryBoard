import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Quarto"
            },
        },
    },
}
const userServiceStub = {
    getActivesUsersObs: () => of([]),
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: null, verified: null}),
    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('LocalGameWrapperComponent', () => {

    let component: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        component = fixture.debugElement.componentInstance;
    }));
    it('should create', async(() => {
        expect(component).toBeTruthy();
        const ngAfterViewInit = spyOn(component, "ngAfterViewInit").and.callThrough();
        expect(ngAfterViewInit).not.toHaveBeenCalled();

        fixture.detectChanges();

        expect(ngAfterViewInit).toHaveBeenCalledTimes(1);
    }));
    it('should have game included after view init', fakeAsync(() => {
        const compiled = fixture.debugElement.nativeElement;
        const gameIncluderTag = compiled.querySelector("app-game-includer");
        let quartoTag = compiled.querySelector("app-quarto");
        expect(gameIncluderTag).toBeTruthy("app-game-includer tag should be present at start");
        expect(quartoTag).toBeFalsy("app-quarto tag should be absent at start");
        expect(component.gameComponent).toBeUndefined("gameComponent should not be loaded before the timeout int afterViewInit resolve");

        fixture.detectChanges();
        tick(1);

        quartoTag = compiled.querySelector("app-quarto");
        expect(component.gameIncluder).toBeTruthy("gameIncluder should exist after view init");
        expect(quartoTag).toBeTruthy("app-quarto tag should be present after view init");
        expect(component.gameComponent).toBeTruthy("gameComponent should be present once component view init");
    }));
});