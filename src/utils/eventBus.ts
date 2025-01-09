class EventBus {

    events: Record<string, Set<(...args: any[]) => void>> = {}

    on(eventName: string, cb: (...args: any[]) => void) {
        (this.events[eventName] ??= new Set()).add(cb)
    }

    emit(eventName: string, ...args: any[]) {
        this.events[eventName]?.forEach(cb => {
            try {
                cb(...args)
            }
            catch (error) {
                console.error(`Error in event handler for "${eventName}":`, error)
            }
        })
    }

    off(eventName: string, cb: (...args: any[]) => void) {
        this.events[eventName]?.delete(cb)
    }
    once(eventName: string, cb: (...args: any[]) => void) {
        const onceCb = (...args: any[]) => {
            cb(...args)
            this.off(eventName, onceCb)
        }
        this.on(eventName, onceCb)
    }
    clearAll() {
        this.events = {}
    }

}

export const bus = new EventBus()