import { ContactCreated } from '../events/create-contact.event';
import { ContactUpdated } from '../events/update-contact.event';
import { Contact } from './contact.model';

describe('Contact Aggregate', () => {
  it('should create a contact', () => {
    const contact = new Contact();
    contact.createContact('uuid', 'Aida', 9389835712);

    const uncommittedEvents = contact.getUncommittedEvents();
    expect(uncommittedEvents.length).toBe(1);

    const event = uncommittedEvents[0] as ContactCreated;
    expect(event.id).toBe('uuid');
    expect(event.name).toBe('Aida');
    expect(event.phoneNumber).toBe(9389835712);

    contact.commit();
    expect(contact.getUncommittedEvents().length).toBe(0);
  });

  it('should update a contact', () => {
    const contact = new Contact();
    contact.createContact('uuid', 'Aida', 9389835712);
    contact.commit();

    contact.updateContact('Azin');

    const uncommittedEvents = contact.getUncommittedEvents();
    expect(uncommittedEvents.length).toBe(1);

    const event = uncommittedEvents[0] as ContactUpdated;
    expect(event.name).toBe('Azin');

    contact.commit();
    expect(contact.getUncommittedEvents().length).toBe(0);
  });

  it('should throw an error if update count exceeds the limit', () => {
    const contact = new Contact();
    contact.createContact('uuid', 'Aida', 9389835712);
    contact.commit();

    for (let i = 0; i < 5; i++) {
      contact.updateContact(`Aida ${i}`);
      contact.commit();
    }

    expect(() => contact.updateContact('Aida 6')).toThrow(
      `Contact update limit exceeded`,
    );
  });
});
