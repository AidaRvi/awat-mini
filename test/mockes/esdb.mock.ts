import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class mockEventStoreRepository {
  private store: Record<string, any[]> = {};

  appendToStream(streamName: string, data: any) {
    if (!this.store[streamName]) this.store[streamName] = [];
    this.store[streamName].push({ ...data, status: 'pending' });
    console.log();
  }

  readStream(streamName: string) {
    return this.store[streamName] || [];
  }

  readAll() {
    const events = Object.values(this.store).flatMap((events) => events);
    return events;
  }

  subscribeToPersistentSubscriptionToAll() {
    setTimeout(() => {
      let eventStream: Readable;
      const events = this.readAll();
      const toBeSubscribed = events.filter(
        (event) => event.status == 'pending',
      );

      for (const event of toBeSubscribed)
        eventStream = this.objectToReadableStream(event);
      return eventStream;
    }, 2000);
  }

  objectToReadableStream(obj: any) {
    const stringified = JSON.stringify(obj);

    return new Readable({
      read() {
        this.push(stringified);
        this.push(null);
      },
    });
  }
}
