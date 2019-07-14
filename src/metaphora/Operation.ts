import * as debug from 'debug';

const log = debug('metaflow');

/**
 * A decorator that makes a class method emit events upon completion.
 * @param target A class
 * @param key A method name
 * @param descriptor A property descriptor
 */
export function emits(target: any, key: string, descriptor: PropertyDescriptor) {
	let originalMethod = target[key] as Function;
	let fn = function (...args: any[]) {
		let ret = originalMethod.apply(this, args);
		emit(originalMethod.name, ret);
		return ret;
	};

	/**
	 * This is here because the new function which replaces the originalMethod
	 * is anonymous and thus has no value of the name property.
	 * This value is used to bind event handlers to methods, so restoring
	 * it here.
	 */
	Object.defineProperty(fn, 'name', {value: key});

	descriptor.value = fn;
	
	return descriptor;
}

/**
 * Storage for handlers.
 */
let handlers: Object = {};

/**
 * Your way to fire events.
 * @param e An event instance.
 */
function emit(e: string, result: any) {
	if (handlers.hasOwnProperty(e)) {
		for (let eI in handlers[e]) {
			handlers[e][eI](result);
		}
	}
}

/**
 * Your way to bind handlers to event types.
 * @param e An event class.
 * @param handler A handler function.
 */
export function bind<T>(op: (... args :any[])=> T, handler: (e: T)=>void) {
	if (! handlers.hasOwnProperty(op.name)) {
		handlers[op.name] = [];
	}

	handlers[op.name].push(handler);
}