import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlacklistedTokenDocument = HydratedDocument<BlacklistedToken>;

@Schema({ timestamps: true })
export class BlacklistedToken {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({ type: Date, expires: '1s' })
  expiresAt: Date;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);
