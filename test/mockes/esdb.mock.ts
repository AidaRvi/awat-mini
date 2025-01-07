import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class mockEventStoreRepository {
  private store: Record<string, any[]> = {};

  appendToStream(streamName: string, data: any) {
    if (!this.store[streamName]) this.store[streamName] = [];
    this.store[streamName].push({ ...data, status: 'pending' });
  }

  readStream(streamName: string) {
    return this.store[streamName] || [];
  }

  readAll() {
    const events = Object.values(this.store).flatMap((events) => events);
    return events;
  }

  subscribeToPersistentSubscriptionToAll(): Promise<Readable> {
    // TODO: projection
    return new Promise((resolve) => {
      setTimeout(() => {
        let eventStream: Readable;
        const events = this.readAll();
        const toBeSubscribed = events.filter(
          (event) => event.status == 'pending',
        );

        for (const event of toBeSubscribed) {
          eventStream = this.objectToReadableStream({ event });
          this.store[`contacts-${event.data.id}`].find(
            (e) => e.id == event.id,
          ).status = 'completed';
        }
        resolve(eventStream);
      }, 1000);
    });
  }

  objectToReadableStream(obj: any) {
    return new Readable({
      objectMode: true,
      read() {
        this.push(obj);
        this.push(null);
      },
    });
  }
}
