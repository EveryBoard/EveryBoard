import { MGPValidation } from '@everyboard/lib';
// TODO FOR REVIEW: no split here right ?
export type AnyFunction = (...args: unknown[]) => Promise<MGPValidation>;

export type ClickNamer = (...args: unknown[]) => string;

export type MoveInterceptor = (fn: AnyFunction, clickNamer: ClickNamer) => AnyFunction;

export const CLICK_HANDLERS: symbol = Symbol('clickHandlers');

function hasOwnClickHandlers(target: object): boolean {
    return Object.prototype.hasOwnProperty.call(target, CLICK_HANDLERS);
}

function getOrCreateOwnClickHandlers(target: object): Map<string, ClickNamer> {
    const existing: unknown = Reflect.get(target, CLICK_HANDLERS);

    if (hasOwnClickHandlers(target) && existing instanceof Map) {
        return existing;
    }

    const handlers: Map<string, ClickNamer> = new Map<string, ClickNamer>(
        existing instanceof Map ? existing : undefined,
    );

    Reflect.set(target, CLICK_HANDLERS, handlers);

    return handlers;
}

export function ClickHandler(
    clickNamer: ClickNamer,
): (target: object, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
    /**
     * Decorator applied to the target method.
     *
     * @param target Prototype of the class containing the method.
     * @param key Name of the decorated method.
     * @param descriptor Property descriptor of the method.
     *
     * @returns The original property descriptor.
     */
    return function(target: object, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        const handlers: Map<string, ClickNamer> = getOrCreateOwnClickHandlers(target);
        handlers.set(key, clickNamer);
        return descriptor;
    };
}
