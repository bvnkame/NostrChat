import * as Comlink from 'comlink';
import {Event, Filter, SimplePool} from 'nostr-tools';

export class BgRaven {
    private seenOn: Record<string, string[]> = {};
    private subs: Record<string, any> = {};
    private relays: string[] = [];
    private pool = new SimplePool();
    private poolCreated = Date.now();

    public setup(relays: string[]) {
        this.relays = relays;
    }

    private getPool = (): SimplePool => {
        if (Date.now() - this.poolCreated > 120000) {
            // renew pool every two minutes
            try {
                this.pool.close(this.relays);
            }
            catch (e) {
            }

            this.pool = new SimplePool();
            this.poolCreated = Date.now();
        }

        return this.pool;
    }

    public fetch(filters: Filter[], quitMs: number = 0): Promise<Event[]> {
        return new Promise((resolve) => {
            const pool = this.getPool();
            
            const sub = pool.subscribeMany(
                this.relays, 
                filters,
                {
                    onevent: (event: Event) => {
                        // if(event.kind === 40) {
                        //     console.log('BgRaven.fetch got event', event);
                        // }

                        events.push(event);
                        // const seenSet = pool.seenOn.get(event.id);
                        // console.log('BgRaven.fetch seenSet', seenSet);
                        // this.seenOn[event.id] = event.tags.find(t => t[0] === 'relays') ? event.tags.filter(t => t[0] === 'relays').map(t => t[1]) : (seenSet ? Array.from(seenSet).map(relay => relay.url) : []);
                        // console.log('BgRaven.fetch seen on', this.seenOn[event.id]);

                        this.seenOn[event.id] = this.relays

                        if (quitMs > 0) {
                            clearTimeout(timer);
                            timer = setTimeout(quit, quitMs);
                        }
                    },
                    oneose: () => {
                        if (quitMs === 0) {
                            sub.close();
                            resolve(events);
                        }
                    }
                }
            );
            const events: Event[] = [];

            const quit = () => {
                sub.close();
                resolve(events);
            }
            let timer: any = quitMs > 0 ? setTimeout(quit, quitMs) : null;
        });
    }

    public sub(filters: Filter[], onEvent: (e: Event) => void, unsub: boolean = true) {
        const subId = Math.random().toString().slice(2);
        const pool = this.getPool();
        var that = this;
        
        const sub = pool.subscribeMany(
            this.relays, 
            filters, 
            {
                onevent(event) {
                    that.seenOn[event.id] = that.relays;
                    onEvent(event)
                },
                oneose() {
                    if (unsub) {
                        that.unsub(subId);
                    }
                }
            }
        );

        this.subs[subId] = sub;
        return subId;
    }

    public unsub(subId: string) {
        if (this.subs[subId]) {
            this.subs[subId].close();
            delete this.subs[subId];
        }
    }

    public async where(eventId: string) {
        let try_ = 0;
        while (!this.seenOn[eventId]) {
            await this.fetch([{ids: [eventId]}]);
            try_++;
            if (try_ === 3) {
                break;
            }
        }

        if (!this.seenOn[eventId]) {
            throw new Error('Could not find root event');
        }

        return this.findHealthyRelay(this.seenOn[eventId]);
    }

    private async findHealthyRelay(relays: string[]) {
        const pool = this.getPool();
        for (const relay of relays) {
            try {
                await pool.ensureRelay(relay);
                return relay;
            } catch (e) {
            }
        }

        throw new Error("Couldn't find a working relay");
    }
}

Comlink.expose(new BgRaven());
