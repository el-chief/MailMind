import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
  userId: mongoose.Types.ObjectId;
  emailId: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  receivedAt: Date;
  summarizedAt: Date;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  emailId: {
    type: String,
    required: true
  },
  sender: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  subject: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  receivedAt: {
    type: Date,
    required: true
  },
  summarizedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for userId + emailId uniqueness
SummarySchema.index({ userId: 1, emailId: 1 }, { unique: true });
// Index for date queries
SummarySchema.index({ userId: 1, receivedAt: -1 });

export const Summary = mongoose.model<ISummary>('Summary', SummarySchema);
