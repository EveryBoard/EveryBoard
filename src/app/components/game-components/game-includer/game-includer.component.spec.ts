/* eslint-disable max-lines-per-function */
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { GameIncluderComponent } from './game-includer.component';

describe('GameIncluderComponent', () => {

    let component: GameIncluderComponent;
    let fixture: ComponentFixture<GameIncluderComponent>;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            declarations: [GameIncluderComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(GameIncluderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
