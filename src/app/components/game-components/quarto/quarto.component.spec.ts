import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { QuartoComponent } from './quarto.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { By } from '@angular/platform-browser';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Quarto';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of(AuthenticationService.NOT_CONNECTED),

    getAuthenticatedUser: () => {
        return AuthenticationService.NOT_CONNECTED;
    },
};
describe('QuartoComponent', () => {
    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let debugElement: DebugElement;

    let gameComponent: QuartoComponent;

    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element == null) {
            return false;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
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
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as QuartoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(gameComponent).toBeTruthy('QuartoComponent should be created');
    });
    it('should forbid clicking on occupied case', fakeAsync(async() => {
        const board: number[][] = [
            [AAAA, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 1, QuartoPiece.AAAB);
        gameComponent.rules.node = new MGPNode(null, null, slice, 0);
        gameComponent.updateBoard();
        fixture.detectChanges();

        spyOn(gameComponent, 'cancelMove').and.callThrough();
        expect(await clickElement('#chooseCoord_0_0')).toBeTrue();
        expect(gameComponent.cancelMove).toHaveBeenCalledOnceWith('Choisissez une case vide.');
    }));
    it('should accept move when choosing piece then choosing coord', fakeAsync(async() => {
        const oldSlice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        spyOn(gameComponent, 'chooseMove').and.callThrough();
        spyOn(gameComponent, 'cancelMoveAttempt').and.callThrough();

        expect(await clickElement('#choosePiece_1')).toBeTrue();
        expect(await clickElement('#chooseCoord_0_0')).toBeTrue();

        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
        expect(gameComponent.chooseMove).toHaveBeenCalledOnceWith(move, oldSlice, null, null);
        expect(gameComponent.cancelMoveAttempt).toHaveBeenCalledTimes(1);
        flush();
    }));
    it('should accept move when choosing coord then choosing piece', fakeAsync(async() => {
        const oldSlice: QuartoPartSlice = QuartoPartSlice.getInitialSlice();
        spyOn(gameComponent, 'chooseMove').and.callThrough();
        expect(await clickElement('#chooseCoord_0_0')).toBeTrue();
        expect(await clickElement('#choosePiece_1')).toBeTrue();
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.AAAB);
        expect(gameComponent.chooseMove).toHaveBeenCalledOnceWith(move, oldSlice, null, null);
        flush();
    }));
    it('should allow to make last move', fakeAsync(async() => {
        const board: number[][] = ArrayUtils.mapBiArray([
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ], QuartoPiece.toInt);
        const pieceInHand: QuartoPiece = QuartoPiece.BAAB;
        const initialSlice: QuartoPartSlice = new QuartoPartSlice(board, 15, pieceInHand);
        gameComponent.rules.node = new MGPNode(null, null, initialSlice, 0);
        gameComponent.updateBoard();

        spyOn(gameComponent, 'chooseMove').and.callThrough();
        expect(await clickElement('#chooseCoord_3_3')).toBeTrue();

        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        expect(gameComponent.chooseMove).toHaveBeenCalledOnceWith(move, initialSlice, null, null);
        expect(gameComponent.rules.node.gamePartSlice.turn).toBe(initialSlice.turn + 1);
    }));
    it('should delegate decoding to move', () => {
        spyOn(QuartoMove, 'decode').and.callThrough();
        gameComponent.decodeMove(5);
        expect(QuartoMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(QuartoMove, 'encode').and.callThrough();
        gameComponent.encodeMove(new QuartoMove(2, 2, QuartoPiece.AABA));
        expect(QuartoMove.encode).toHaveBeenCalledTimes(1);
    });
});
