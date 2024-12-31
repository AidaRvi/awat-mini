import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop()
  _id: string;

  @Prop()
  name: string;

  @Prop()
  phoneNumber: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
