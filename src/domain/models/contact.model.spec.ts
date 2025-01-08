import { ContactCreated } from '../events/create-contact.event';
import { ContactUpdated } from '../events/update-contact.event';
import { Contact } from './contact.model';

describe('Contact Aggregate', () => {
  it('should create a contact', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId'); // TODO:

    const uncommittedEvents = contact.getUncommittedEvents();
    expect(uncommittedEvents.length).toBe(1);

    const event = uncommittedEvents[0] as ContactCreated;
    expect(event.id).toBe('contactId');
    expect(event.name).toBe('Aida');
    expect(event.phoneNumber).toBe(9389835712);
    expect(event.correlationId).toBe('correlationId');

    contact.commit();
    expect(contact.getUncommittedEvents().length).toBe(0);
  });

  it('should update a contact', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId');
    contact.commit();

    contact.updateContact('correlationId', 'Azin');

    const uncommittedEvents = contact.getUncommittedEvents();
    expect(uncommittedEvents.length).toBe(1);

    const event = uncommittedEvents[0] as ContactUpdated;
    expect(event.name).toBe('Azin');

    contact.commit();
    expect(contact.getUncommittedEvents().length).toBe(0);
  });

  it('should throw an error if update count exceeds the limit', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId');
    contact.commit();

    for (let i = 0; i < 5; i++) {
      contact.updateContact(`Aida ${i}`);
      contact.commit();
    }

    expect(() => contact.updateContact('Aida 5')).toThrow(
      `Contact update limit exceeded`,
    );
  });

  it('should return true if the phone number already exists', () => {
    const existingPhoneNumber = 1234567890;
    const events = [
      {
        type: 'ContactCreated',
        data: { phoneNumber: 1234567890 },
      },
      {
        type: 'ContactCreated',
        data: { phoneNumber: 9876543210 },
      },
    ];

    const result = Contact.checkIfPhoneNumberExists(
      existingPhoneNumber,
      events,
    );

    expect(result).toBe(true);
  });

  it('should return false if the phone number does not exist', () => {
    const nonExistingPhoneNumber = 5555555555;
    const events = [
      {
        type: 'ContactCreated',
        data: { phoneNumber: 1234567890 },
      },
      {
        type: 'ContactCreated',
        data: { phoneNumber: 9876543210 },
      },
    ];

    const result = Contact.checkIfPhoneNumberExists(
      nonExistingPhoneNumber,
      events,
    );

    expect(result).toBe(false);
  });

  it('should return false if events list is empty', () => {
    const phoneNumber = 1234567890;
    const events = [];

    const result = Contact.checkIfPhoneNumberExists(phoneNumber, events);

    expect(result).toBe(false);
  });
});
