import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { PylosComponent } from './pylos.component';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { By } from '@angular/platform-browser';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Pylos"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('PylosComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: PylosComponent;

    let clickElement: (element: DebugElement) => Promise<boolean> = async(element: DebugElement) => {
        if (element != null) {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        } else {
            return false;
        }
    };
    let onClick: (x: number, y: number, z: number) => Promise<boolean> = async(x: number, y: number, z: number) => {
        const buttonName: string = '#clickable_' + x + '_' + y + '_' + z;
        const onClickElement: DebugElement = debugElement.query(By.css(buttonName));
        return clickElement(onClickElement);
    };
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        debugElement = fixture.debugElement;
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as PylosComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("PylosComponent should be created");
    });
    it('should allow droping piece on occupable case', fakeAsync(async() => {
        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(0, 0, 0)).toBeTruthy();
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        const previousSlice: PylosPartSlice = gameComponent.rules.node.mother.gamePartSlice;
        expect(gameComponent.tryMove).toHaveBeenCalledWith(move, previousSlice);
    }));
    it('should forbid clicking on ennemy piece', fakeAsync(async() => {
        expect(await onClick(0, 0, 0)).toBeTruthy();

        spyOn(gameComponent, 'cancelMove').and.callThrough();
        expect(await onClick(0, 0, 0)).toBeTruthy();
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(1);
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("Can't click on ennemy pieces.");
    }));
    it('should allow climbing', fakeAsync(async() => {
        expect(await onClick(0, 0, 0)).toBeTruthy("Move 0 should be legal");
        expect(await onClick(3, 3, 0)).toBeTruthy("Move 1 should be legal");
        expect(await onClick(1, 0, 0)).toBeTruthy("Move 2 should be legal");
        expect(await onClick(0, 1, 0)).toBeTruthy("Move 3 should be legal");
        expect(await onClick(1, 1, 0)).toBeTruthy("Move 4 should be legal");

        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(3, 3, 0)).toBeTruthy();
        expect(await onClick(0, 0, 1)).toBeTruthy();
        expect(gameComponent.tryMove).toHaveBeenCalledTimes(1);
    }));
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async() => {
        expect(await onClick(0, 0, 0)).toBeTruthy("Move 0 should be legal");
        expect(await onClick(3, 0, 0)).toBeTruthy("Move 1 should be legal");
        expect(await onClick(0, 1, 0)).toBeTruthy("Move 2 should be legal");
        expect(await onClick(3, 1, 0)).toBeTruthy("Move 3 should be legal");
        expect(await onClick(1, 0, 0)).toBeTruthy("Move 4 should be legal");
        expect(await onClick(3, 2, 0)).toBeTruthy("Move 5 should be legal");

        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(1, 1, 0)).toBeTruthy();
        expect(await onClick(0, 0, 0)).toBeTruthy();
        expect(await onClick(0, 0, 0)).toBeTruthy();
        expect(gameComponent.tryMove).toHaveBeenCalledTimes(1);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(0, 0, 0)]);
        const previousSlice: PylosPartSlice = gameComponent.rules.node.mother.gamePartSlice;
        expect(gameComponent.tryMove).toHaveBeenCalledWith(move, previousSlice);
    }));
    it('should allow capturing two pieces', fakeAsync(async() => {
        expect(await onClick(0, 0, 0)).toBeTruthy("Move 0 should be legal");
        expect(await onClick(3, 0, 0)).toBeTruthy("Move 1 should be legal");
        expect(await onClick(0, 1, 0)).toBeTruthy("Move 2 should be legal");
        expect(await onClick(3, 1, 0)).toBeTruthy("Move 3 should be legal");
        expect(await onClick(1, 0, 0)).toBeTruthy("Move 4 should be legal");
        expect(await onClick(3, 2, 0)).toBeTruthy("Move 5 should be legal");

        spyOn(gameComponent, 'concludeMoveWithCapture').and.callThrough();
        expect(await onClick(1, 1, 0)).toBeTruthy();
        expect(await onClick(0, 0, 0)).toBeTruthy();
        expect(await onClick(0, 1, 0)).toBeTruthy();
        expect(gameComponent.concludeMoveWithCapture).toHaveBeenCalledWith([new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)]);
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async() => {
        expect(await onClick(0, 0, 0)).toBeTruthy("Move 0 should be legal");
        expect(await onClick(0, 1, 0)).toBeTruthy("Move 1 should be legal");
        expect(await onClick(1, 0, 0)).toBeTruthy("Move 2 should be legal");
        expect(await onClick(1, 1, 0)).toBeTruthy("Move 3 should be legal");
        expect(await onClick(3, 3, 0)).toBeTruthy("Move 4 should be legal");
        expect(await onClick(0, 0, 1)).toBeTruthy("Move 5 should be legal");
        expect(await onClick(3, 2, 0)).toBeTruthy("Move 6 should be legal");

        spyOn(gameComponent, 'cancelMove').and.callThrough();
        expect(await onClick(0, 0, 1)).toBeTruthy("Selecting descending piece should be doable");
        expect(await onClick(2, 2, 0)).toBeTruthy("Clicking lower than her should be doable");
        expect(gameComponent.cancelMove).toHaveBeenCalledWith("Must move pieces upward.");
        expect(gameComponent.cancelMove).toHaveBeenCalledTimes(1);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, "decode").and.callThrough();
        gameComponent.decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, "encode").and.callThrough();
        gameComponent.encodeMove(PylosMove.fromDrop(new PylosCoord(0, 0, 0), []));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});