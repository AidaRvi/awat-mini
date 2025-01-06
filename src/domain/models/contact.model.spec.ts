import { Contact } from './contact.model';

describe('ContactAggregate', () => {
  it('should create a contact and emit a ContactCreated event', () => {
    const id = '12345';
    const name = 'John Doe';
    const phoneNumber = 9389837510;

    const contact = Contact.createContact(id, name, phoneNumber);

    const emittedEvents = contact.getUncommittedEvents();
    expect(contact.getContact()).toEqual({ id, name, phoneNumber });
    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].constructor.name).toEqual('ContactCreated');
  });

  it('should update a contact and emit a ContactUpdated event', () => {
    const id = '12345';
    const name = 'John Doe';
    const phoneNumber = 9389837510;
    const updatedName = 'Jane Doe2';

    const contact = Contact.createContact(id, name, phoneNumber);

    contact.updateContact(updatedName);

    const emittedEvents = contact.getUncommittedEvents();
    expect(contact.getContact()).toEqual({
      id,
      name: updatedName,
      phoneNumber,
    });
    expect(emittedEvents.length).toBe(2);
    expect(emittedEvents[1].constructor.name).toEqual('ContactUpdated');
    expect(emittedEvents[1]).toEqual({ id, name: updatedName });
  });
});
