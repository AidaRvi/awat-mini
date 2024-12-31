import { ICommand } from '@nestjs/cqrs';

export class UpdateContactCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
