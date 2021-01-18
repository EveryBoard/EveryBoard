import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { PylosComponent } from './pylos.component';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { PylosNode } from 'src/app/games/pylos/pylos-rules/PylosRules';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Pylos';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('PylosComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: PylosComponent;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    const onClick: (x: number, y: number, z: number) => Promise<boolean> = async (x: number, y: number, z: number) => {
        const buttonName: string = '#clickable_' + x + '_' + y + '_' + z;
        const element: DebugElement = debugElement.query(By.css(buttonName));
        if (element != null) {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        } else {
            console.log("l'élément", buttonName);
            return false;
        }
    };
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
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
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('PylosComponent should be created');
    });
    it('should allow droping piece on occupable case', fakeAsync(async () => {
        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(0, 0, 0)).toBeTrue();
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        const previousSlice: PylosPartSlice = gameComponent.rules.node.mother.gamePartSlice;
        flush();
        expect(gameComponent.tryMove).toHaveBeenCalledOnceWith(move, previousSlice);
    }));
    it('should forbid clicking on ennemy piece', fakeAsync(async () => {
        const initialBoard: number[][][] = [
            [
                [X, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();
        fixture.detectChanges();

        spyOn(gameComponent, 'message').and.callThrough();
        expect(await onClick(0, 0, 0)).toBeTrue();
        flush();
        expect(gameComponent.message).toHaveBeenCalledOnceWith('Can\'t click on ennemy pieces.');
    }));
    it('should allow climbing', fakeAsync(async () => {
        const initialBoard: number[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();
        fixture.detectChanges();

        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(3, 3, 0)).toBeTrue();
        expect(await onClick(0, 0, 1)).toBeTrue();
        expect(gameComponent.tryMove).toHaveBeenCalledTimes(1);
    }));
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async () => {
        const initialBoard: number[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();
        fixture.detectChanges();

        spyOn(gameComponent, 'tryMove').and.callThrough();
        expect(await onClick(1, 1, 0)).toBeTrue();
        expect(await onClick(0, 0, 0)).toBeTrue();
        expect(await onClick(0, 0, 0)).toBeTrue();
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(0, 0, 0)]);
        const previousSlice: PylosPartSlice = gameComponent.rules.node.mother.gamePartSlice;
        expect(gameComponent.tryMove).toHaveBeenCalledOnceWith(move, previousSlice);
    }));
    it('should allow capturing two pieces', fakeAsync(async () => {
        expect(await onClick(0, 0, 0)).toBeTrue();
        expect(await onClick(3, 0, 0)).toBeTrue();
        expect(await onClick(0, 1, 0)).toBeTrue();
        expect(await onClick(3, 1, 0)).toBeTrue();
        expect(await onClick(1, 0, 0)).toBeTrue();
        expect(await onClick(3, 2, 0)).toBeTrue();

        spyOn(gameComponent, 'concludeMoveWithCapture').and.callThrough();
        expect(await onClick(1, 1, 0)).toBeTrue();
        expect(await onClick(0, 0, 0)).toBeTrue();
        expect(await onClick(0, 1, 0)).toBeTrue();
        expect(gameComponent.concludeMoveWithCapture).toHaveBeenCalledWith([new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)]);
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async () => {
        const initialBoard: number[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        gameComponent.rules.node = new PylosNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();
        fixture.detectChanges();

        spyOn(gameComponent, 'message').and.callThrough();
        expect(await onClick(0, 0, 1)).toBeTrue();
        expect(await onClick(2, 2, 0)).toBeTrue();
        flush();
        expect(gameComponent.message).toHaveBeenCalledWith('Must move pieces upward.');
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, 'decode').and.callThrough();
        gameComponent.decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(PylosMove, 'encode').and.callThrough();
        gameComponent.encodeMove(PylosMove.fromDrop(new PylosCoord(0, 0, 0), []));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
