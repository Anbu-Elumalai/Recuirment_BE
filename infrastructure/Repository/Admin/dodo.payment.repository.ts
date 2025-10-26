import DodoPayments from "dodopayments";
import { StatusCodes } from "http-status-codes";
import { PaymentDteailsSchema } from "../../../api/Request/assessment";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import planMode from "../../../app/model/plan.mode";
import subscription from "../../../app/model/subscription";
import { _config } from "../../../config/config";
import { DODOpaymentDomainRepository } from "../../../domain/admin/dodoPaymentDomain";
import { Db, ObjectId } from "mongodb";
import { successResponse } from "../../../utils/common/commonResponse";
import dodoService from "../../../utils/common/dodo.payment.service";
import { SubscriptionStatus } from "../../../utils/common/enum";
import { createErrorResponse } from "../../../utils/common/errors";
import { getCountryCode, getSubscriptionStatusMessage } from "../../../utils/utilsFunctions/user.activity";
import TransactionModel from "../../../app/model/transaction"
import { PlanDtls, PaymentResponse } from "../../../api/response/planMode.response";

class dodopayments implements DODOpaymentDomainRepository{

     private readonly db: Db;
    
        constructor(db: Db) {
            this.db = db;
        }

          async paymentSubcription(data: PaymentDteailsSchema, userId: string, groupId: string): Promise<ApiResponse<PaymentResponse> | ErrorResponse> {
        try {

            console.log(data.amount)

            const findDodoProductID = await planMode.findOne({
                _id: new ObjectId(data.planId),
                isActive: true,
                isDelete: false
            })

            if (!findDodoProductID) {
                return createErrorResponse(
                    'Error product not found.',
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    'Error product not found.',
                );
            }

            const transaction = new TransactionModel({
                userId: new ObjectId(userId),
                planId: new ObjectId(data.planId),
                amount: data.amount,
                paymentStatus: "pending",
                currency: data.currency,
                createdBy: new ObjectId(userId),
                groupingId: new ObjectId(groupId)
            });

            await transaction.save();

            const obj = {
                product_id: 'pdt_OKYujFYRxFJF2BJjzV5vv', // findDodoProductID.dodoProductId,
                quantity: 1,
                billing: {
                    city: data.billing.city,
                    country: data.billing.country,
                    state: data.billing.state,
                    street: data.billing.street,
                    zipcode: data.billing.zipcode,
                },
                customer: {
                    email: data.email,
                    name: data.name,
                    phone_number: data.phoneNumber,
                    amount: data.amount,
                    userId: userId
                },

                payment_link: true,
                return_url: _config?.redirectUrl,
                cancel_url: _config?.CancelUrl,
                metadata: {
                    userId: userId.toString(),
                    planId: data.planId.toString(),
                    groupId: groupId.toString(),
                    transactionId: transaction._id.toString()
                },
            };

            console.log("=============Dodo service start=================")

            const resp = await dodoService.dodoPaymentService(obj)

            console.log("*************** payment response *************", resp.data,);

            await TransactionModel.findByIdAndUpdate(transaction._id, {
                dodoPaymentId: resp.data.payment_id,
                subscriptionId: resp.data.subscription_id,
                paymentLink: resp.data.payment_link,
                expiresOn: resp.data.expires_on,
                recurringPreTaxAmount: resp.data.recurring_pre_tax_amount
            });


            return successResponse("", StatusCodes.OK, {
                success: true,
                checkoutUrl: resp?.data.checkoutUrl?.toString(),
            })


        } catch (error: any) {
            return createErrorResponse(
                'Error buy plan',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async paymentSubscriptionAction(
        action: string,
        reason: string,
        userId: string,
        groupId: string
    ): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const dodo = new DodoPayments({
                bearerToken: _config?.DodoApiKey,
                environment: "test_mode",
            });

            //  1. Find the latest active or held subscription for this user or group

            const findLastSubscription = await subscription
                .findOne({
                    status: { $in: ['active', 'succeeded'] },
                    "metadata.groupId": new ObjectId(groupId),
                })
                .sort({ createdAt: -1 })
                .exec();

            // 2. Validate subscription
            if (!findLastSubscription) {
                return createErrorResponse(
                    "Error: no active plans found.",
                    StatusCodes.BAD_REQUEST,
                    "Error: no active plans found."
                );
            }

            if (findLastSubscription.status === SubscriptionStatus.Cancelled && action === "cancelled") {
                return createErrorResponse(
                    "Error: plans already canclled.",
                    StatusCodes.BAD_REQUEST,
                    "Error: plans already canclled.",
                );
            }

            if (findLastSubscription.status === SubscriptionStatus.OnHold && action === "on_hold") {
                return createErrorResponse(
                    "Error: plans already canclled.",
                    StatusCodes.BAD_REQUEST,
                    "Error: plans already canclled.",
                );
            }


            const subscriptionId = findLastSubscription.subscription_id;
            if (!subscriptionId) {
                return createErrorResponse(
                    "Missing subscription_id for Dodo Payments",
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    "Missing subscription_id for Dodo Payments"
                );
            }

            const code = await getCountryCode(findLastSubscription.billing?.country?.toString() || "")

            if (code == null) {
                return createErrorResponse(
                    "Error: Country code not found.",
                    StatusCodes.BAD_REQUEST,
                    "Error: Country code not found.",
                );
            }

            const getSubscriptionStatus = await getSubscriptionStatusMessage(action)

            if (getSubscriptionStatus == null) {
                return createErrorResponse(
                    "Error: Country code not found.",
                    StatusCodes.BAD_REQUEST,
                    "Error: Country code not found.",
                );
            }
            // 3️⃣ Prepare update object for Dodo API (full fields)
            const dodoUpdatePayload: any = {
                business_id: findLastSubscription.business_id,
                subscription_id: findLastSubscription.subscription_id,
                product_id: findLastSubscription.product_id,
                status: getSubscriptionStatus,

                cancelled_at: new Date().toISOString(),
                customer: {
                    customer_id: findLastSubscription.customer?.customer_id || "",
                    name: findLastSubscription.customer?.name || "",
                    email: findLastSubscription.customer?.email || "",
                    phone_number: findLastSubscription.customer?.phone_number || "",
                },
                billing: {
                    street: findLastSubscription.billing?.street || "",
                    city: findLastSubscription.billing?.city || "",
                    state: findLastSubscription.billing?.state || "",
                    zipcode: findLastSubscription.billing?.zipcode || "",
                    country: code,
                },
                addons: findLastSubscription.addons || [],
                meters: findLastSubscription.meters || [],
                currency: findLastSubscription.currency,
                recurring_pre_tax_amount: findLastSubscription.recurring_pre_tax_amount || 0,
                quantity: findLastSubscription.quantity || 1,
                trial_period_days: findLastSubscription.trial_period_days || 0,
                expires_at: findLastSubscription.expires_at,
                next_billing_date: findLastSubscription?.next_billing_date ? findLastSubscription?.next_billing_date.toISOString() : null,
                previous_billing_date: findLastSubscription.previous_billing_date,
                subscription_period_count: findLastSubscription.subscription_period_count || 1,
                subscription_period_interval: findLastSubscription.subscription_period_interval || "Month",
                payment_frequency_count: findLastSubscription.payment_frequency_count || 1,
                payment_frequency_interval: findLastSubscription.payment_frequency_interval || "Month",
                tax_inclusive: findLastSubscription.tax_inclusive || false,
                tax_id: findLastSubscription.tax_id ? findLastSubscription.tax_id : null,
                discount_id: findLastSubscription.discount_id ? findLastSubscription.tax_id : null,
                discount_cycles_remaining: findLastSubscription.discount_cycles_remaining || null,
                metadata: findLastSubscription.metadata || {},
                on_demand: findLastSubscription.on_demand || false,
                error_code: findLastSubscription.error_code || "",
                error_message: findLastSubscription.error_message || "",
            };


            // Cancel at next billing cycle
            dodoUpdatePayload.cancel_at_next_billing_date = true,

                await dodo.subscriptions.update(subscriptionId, dodoUpdatePayload);

            findLastSubscription.status = "cancelled";
            findLastSubscription.cancellation_reason = reason ?? "";
            findLastSubscription.cancelled_at = new Date()

            // 4. Update metadata safely
            findLastSubscription.metadata = {
                ...(findLastSubscription.metadata || {}),
                cancellation_reason: reason,
                previous_last_action: findLastSubscription.status,
            } as typeof findLastSubscription.metadata;

            // 5. Save changes in DB
            await findLastSubscription.save();

            return successResponse("", StatusCodes.OK, { message: 'Subscription cancellation scheduled successfully.' });
        } catch (error: any) {
            console.error("Subscription action error:", error);
            return createErrorResponse(
                "Error performing subscription action.",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function NewDODOPayRepositoryRegister(db: Db): DODOpaymentDomainRepository {
    return new dodopayments(db)
}