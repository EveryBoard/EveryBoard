import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaleComponent } from './awale.component';

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
    it('should delegate encoding and decoding to move', () => {
        
    });
});