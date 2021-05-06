import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { InscriptionComponent } from './inscription.component';

describe('InscriptionComponent', () => {
    let testUtils: SimpleComponentTestUtils<InscriptionComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(InscriptionComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('Registration should navigate to ConfirmInscriptionComponent', fakeAsync(async() => {
        spyOn(testUtils.getComponent().router, 'navigate');

        expect(await testUtils.clickElement('#registerButton')).toBeTrue();

        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        spyOn(testUtils.getComponent().router, 'navigate');
        spyOn(testUtils.getComponent().authService, 'doRegister').and.rejectWith({ message: 'c\'est caca monsieur.' });

        expect(await testUtils.clickElement('#registerButton')).toBeTrue();

        const expectedError: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        expect(testUtils.getComponent().router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe('c\'est caca monsieur.');
    }));
});
