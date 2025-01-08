import { Contact } from './contact.model';

describe('Contact Aggregate', () => {
  it('should create a contact', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId');

    expect(contact.getContact().id).toBe('contactId');
    expect(contact.getContact().name).toBe('Aida');
    expect(contact.getContact().phoneNumber).toBe(9389835712);
    expect(contact.getContact().correlationId).toBe('correlationId');
  });

  it('should update a contact', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId');
    contact.updateContact('correlationId2', 'Azin');

    expect(contact.getContact().id).toBe('contactId');
    expect(contact.getContact().name).toBe('Azin');
    expect(contact.getContact().phoneNumber).toBe(9389835712);
    expect(contact.getContact().correlationId).toBe('correlationId2');
  });

  it('should throw an error if update count exceeds the limit', () => {
    const contact = new Contact();
    contact.createContact('contactId', 'Aida', 9389835712, 'correlationId');

    for (let i = 0; i < 5; i++)
      contact.updateContact(`correlationId ${i}`, `Aida ${i}`);

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
