import mongoose, { Schema } from "mongoose";
const TransactionSchema = new mongoose.Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true,ref: 'admins' },
        planId: { type: Schema.Types.ObjectId, required: true,ref:  'plans' },
        amount: { type: String, required: true },
        currency:{ type: String, required: true },
        paymentStatus: { type: String, default: "pending" },
        dodoPaymentId: { type: String, default: "" }, // from Dodo API
        subscriptionId: { type: String, default: "" },
        paymentLink: { type: String, default: "" },
        expiresOn:  { type: String, default: "" },
        recurringPreTaxAmount:  { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: 'admins', required: true },
        modifiedBy: { type: Schema.Types.ObjectId, ref: 'admins', required: false, default: null },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        groupingId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },

    },
    { timestamps: true }
);

export default mongoose.model("transactions", TransactionSchema);
