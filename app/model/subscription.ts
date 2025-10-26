import mongoose, { Schema } from "mongoose";

const BillingSchema = new mongoose.Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
    country: { type: String }
});

const CustomerSchema = new mongoose.Schema({
    customer_id: { type: String, required: true },
    name: { type: String },
    email: { type: String, required: true },
    phone_number: { type: String }
});

const MetadataSchema = new mongoose.Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'groupingids', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'transactions', required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'admins' },
    planId: { type: Schema.Types.ObjectId, required: true, ref: 'plans' },
    previous_last_action: { type: String, default: "" }
});

const SubscriptionSchema = new mongoose.Schema(
    {
        business_id: { type: String, required: true },
        subscription_id: { type: String, required: true, unique: true },
        product_id: { type: String },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'succeeded', "failed", 'expired', 'pending', "on_hold"],
            default: 'active'
        },

        // Customer & Billing
        customer: { type: CustomerSchema, required: true },
        billing: { type: BillingSchema },

        // Subscription Details
        currency: { type: String, default: 'USD' },
        recurring_pre_tax_amount: { type: Number },
        quantity: { type: Number, default: 1 },
        addons: { type: [mongoose.Schema.Types.Mixed], default: [] },
        meters: { type: [mongoose.Schema.Types.Mixed], default: [] },

        // Period & Billing Information
        subscription_period_count: { type: Number, default: 1 },
        subscription_period_interval: {
            type: String,
            enum: ['Day', 'Week', 'Month', 'Year'],
            default: 'Month'
        },
        payment_frequency_count: { type: Number, default: 1 },
        payment_frequency_interval: {
            type: String,
            enum: ['Month', 'Year'],
            default: 'Month'
        },
        next_billing_date: { type: Date },
        previous_billing_date: { type: Date },
        cancel_at_next_billing_date: { type: Boolean, default: false },


        expires_at: { type: Date },
        created_at: { type: Date, default: Date.now },
        on_demand: { type: Boolean, default: false },
        trial_period_days: { type: Number, default: 0 },

        cancelled_at: { type: Date, default: null },
        cancellation_reason: { type: String, default: "" },
        cancelledBy :{ type: Schema.Types.ObjectId, ref: 'admins', required: false , default: null},
        // Tax & Discounts
        tax_inclusive: { type: Boolean, default: false },
        tax_id: { type: String, default: null },
        discount_id: { type: String, default: null },
        discount_cycles_remaining: { type: Number, default: null },

        // Metadata & Audit
        metadata: { type: MetadataSchema },
        payload_type: { type: String, default: 'Subscription' },
        timestamp: { type: Date },
        type: { type: String, default: 'subscription.renewed' },
        error_code: { type: String, default: "" },
        error_message: { type: String, default: "" },

    },
    { timestamps: true }
);

export default mongoose.model('subscriptions', SubscriptionSchema);
