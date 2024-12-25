import { ICommand } from '@nestjs/cqrs';

export class CreateContactCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly phoneNumber: number,
  ) {}
}
