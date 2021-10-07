import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
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

        await testUtils.clickElement('#registerButton');

        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        spyOn(testUtils.getComponent().router, 'navigate');
        spyOn(testUtils.getComponent().authService, 'doRegister').and.rejectWith({ message: `c'est caca monsieur.` });

        await testUtils.clickElement('#registerButton');

        const expectedError: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        expect(testUtils.getComponent().router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe(`c'est caca monsieur.`);
    }));
});
