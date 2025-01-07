import { ICommand } from '@nestjs/cqrs';

export class CreateContactCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phoneNumber: number,
    public readonly correlationId: string,
  ) {}
}
