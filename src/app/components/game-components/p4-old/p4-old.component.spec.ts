import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {P4OldComponent} from './p4-old.component';

describe('P4GameComponent', () => {
	let component: P4OldComponent;
	let fixture: ComponentFixture<P4OldComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [P4OldComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(P4OldComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
