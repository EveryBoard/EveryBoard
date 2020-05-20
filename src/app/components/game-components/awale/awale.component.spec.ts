import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaleComponent } from './awale.component';
import { AwaleMove } from 'src/app/games/awale/AwaleMove';

describe('AwaleComponent', () => {

    let component: AwaleComponent;

    let fixture: ComponentFixture<AwaleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AwaleComponent]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(AwaleComponent);
        component = fixture.componentInstance;
        component.chooseMove = (m, s, spz, spo) => { return true; }
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.onClick(0, 0)).toBeTruthy();
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(AwaleMove, "decode").and.callThrough();
        component.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(AwaleMove, "encode").and.callThrough();
        component.encodeMove(new AwaleMove(1, 1));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});