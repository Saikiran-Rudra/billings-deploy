import mongoose, { Schema, Document } from "mongoose";

export type ActivityAction = 
  | "user_created"
  | "user_deleted"
  | "user_updated"
  | "role_changed"
  | "permission_changed"
  | "company_created"
  | "company_updated"
  | "company_deleted"
  | "module_enabled"
  | "module_disabled"
  | "feature_toggle"
  | "invoice_created"
  | "invoice_deleted"
  | "invoice_paid"
  | "product_created"
  | "product_deleted"
  | "customer_created"
  | "customer_deleted"
  | "stock_adjusted"
  | "payment_recorded"
  | "report_generated"
  | "settings_updated";

export interface IActivityLog extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: ActivityAction;
  module: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId | string;
  before?: any;
  after?: any;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
  
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user_created",
        "user_deleted",
        "user_updated",
        "role_changed",
        "permission_changed",
        "company_created",
        "company_updated",
        "company_deleted",
        "module_enabled",
        "module_disabled",
        "feature_toggle",
        "invoice_created",
        "invoice_deleted",
        "invoice_paid",
        "product_created",
        "product_deleted",
        "customer_created",
        "customer_deleted",
        "stock_adjusted",
        "payment_recorded",
        "report_generated",
        "settings_updated",
      ],
      index: true,
    },
    module: { type: String, required: true, index: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.Mixed, default: undefined },
    before: { type: Schema.Types.Mixed, default: undefined },
    after: { type: Schema.Types.Mixed, default: undefined },
    ipAddress: { type: String, default: undefined },
    userAgent: { type: String, default: undefined },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    errorMessage: { type: String, default: undefined },
  },
  { timestamps: true }
);

// TTL Index - Auto-delete logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes for efficient querying
activityLogSchema.index({ companyId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ companyId: 1, action: 1, createdAt: -1 });

const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;
