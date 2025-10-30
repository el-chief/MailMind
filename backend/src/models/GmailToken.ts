import mongoose, { Schema, Document } from 'mongoose';

export interface IGmailToken extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

const GmailTokenSchema = new Schema<IGmailToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  scope: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const GmailToken = mongoose.model<IGmailToken>('GmailToken', GmailTokenSchema);
