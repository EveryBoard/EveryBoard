import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { MGPUniqueList } from '../MGPUniqueList';

describe('MGPUniqueList', () => {
    describe('equals', () => {
        it('should test size', () => {
            const one: MGPUniqueList<string> = new MGPUniqueList(['salut']);
            const two: MGPUniqueList<string> = new MGPUniqueList(['salut', 'kutentak']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should care about order', () => {
            const one: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            const two: MGPUniqueList<string> = new MGPUniqueList(['deux', 'un']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should detect inequality', () => {
            const one: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            const two: MGPUniqueList<string> = new MGPUniqueList(['deux', 'trois']);
            expect(one.equals(two)).toBeFalse();
        });
        it('should detect equality', () => {
            const one: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            const two: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            expect(one.equals(two)).toBeTrue();
        });
    });
    describe('get', () => {
        it('should get nth element', () => {
            const mySet: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            expect(mySet.get(0)).toBe('un');
            expect(mySet.get(1)).toBe('deux');
        });
        it('should fail if trying an out of bounds access', () => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const mySet: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            expect(() => mySet.get(2)).toThrowError('Assertion failure: MGPUniqueList: index out of bounds: 2');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'MGPUniqueList: index out of bounds: 2');
        });
    });
    describe('getFromEnd', () => {
        it('should get nth element from the end', () => {
            const mySet: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            expect(mySet.getFromEnd(0)).toBe('deux');
            expect(mySet.getFromEnd(1)).toBe('un');
        });
        it('should fail if trying an out of bounds access', () => {
            spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
            const mySet: MGPUniqueList<string> = new MGPUniqueList(['un', 'deux']);
            expect(() => mySet.getFromEnd(2)).toThrowError('Assertion failure: MGPUniqueList: index (from end) out of bounds: 2');
            expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', 'MGPUniqueList: index (from end) out of bounds: 2');
        });
    });
});
