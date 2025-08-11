import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    description: { type: String },
    // Optional labels/tags for later organization
    tags: [{ type: String }],
    // Physical path relative to project (for internal use)
    filePath: { type: String, required: true },
    // Public URL to access file (served statically)
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
