/**
 * This code is borrowed from Basarat Ali Syed from his Typescript Gitbook.
 * Licensed under Creative Commons https://creativecommons.org/licenses/by/4.0/
 */
export interface Listener<T> {
  (event: T): any;
}

/**
 * This code is borrowed from Basarat Ali Syed from his Typescript Gitbook.
 * Licensed under Creative Commons https://creativecommons.org/licenses/by/4.0/
 */
export interface Disposable {
  dispose(): any;
}

/**
 * This code is borrowed from Basarat Ali Syed from his Typescript Gitbook.
 * Licensed under Creative Commons https://creativecommons.org/licenses/by/4.0/
 *
 * Passes through events as they happen. You will not get events from before you start listening
 */

export class TypedEvent<T> {
  private listeners: Listener<T>[] = []
  private listenersOncer: Listener<T>[] = []

  on = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener)
    return {
      dispose: () => this.off(listener)
    }
  }

  once = (listener: Listener<T>): void => {
    this.listenersOncer.push(listener)
  }

  off = (listener: Listener<T>) => {
    let callbackIndex = this.listeners.indexOf(listener)
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1)
  }

  emit = (event: T) => {
    /** Update any general listeners */
    this.listeners.forEach((listener) => listener(event))

    /** Clear the `once` queue */
    this.listenersOncer.forEach((listener) => listener(event))
    this.listenersOncer = []
  }

  pipe = (te: TypedEvent<T>): Disposable => {
    return this.on((e) => te.emit(e))
  }
}
