import { StatusCodes } from "http-status-codes";
import { CreateassessmentInput, UpdateassessmentInput } from "../../../api/Request/assessment";
import { assessmentDtls, assessmentRes } from "../../../api/response/assessment.response";
import { ErrorResponse } from "../../../api/response/cmmonerror";
import { ApiResponse, SuccessMessage } from "../../../api/response/commonResponse";
import Pagination, { PaginationResult } from "../../../api/response/paginationResponse";
import { assessmentListParams, AssRepositoryDomain } from "../../../domain/admin/assessmentDomain";
import { Db, ObjectId } from "mongodb";
import { successResponse } from "../../../utils/common/commonResponse";
import { createErrorResponse } from "../../../utils/common/errors";
import lanchAssessment from "../../../app/model/lanchAssessment";
import crypto from "crypto";
import { CandidateModel } from "../../../app/model/candidate";
import group from "../../../app/model/group";
import mailService from "../../../utils/common/mail.service";
import { _config } from "../../../config/config";
import { QuestionGroupModel } from "../../../app/model/question.group";
import Types from "mongodb"
import { QuestionModel } from "../../../app/model/question";
import lastInterviewDate from "../../../app/model/lastInterviewDate";
import { AssessAnsInput, AssessmentSubmitionSchema } from "../../../api/Request/questionAns";
import subscription from "../../../app/model/subscription";
class AssessmentRepository implements AssRepositoryDomain {
    private readonly db: Db

    constructor(db: Db) {
        this.db = db
    }
    async createAssessment(data: CreateassessmentInput, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {

            const currentDate = new Date();

            const currentPlanDetails = await subscription.findOne({
                'metadata.groupId': new ObjectId(groupId), // filter by group
                status: { $in: ['active', 'renewed'] },                  // active or renewed subscription
                next_billing_date: { $gte: currentDate }
            })
                .populate('metadata.planId')
                .sort({ next_billing_date: -1 });


            if (currentPlanDetails && currentPlanDetails.metadata?.planId) {

                const plan = currentPlanDetails.metadata!.planId as any;
                const dur = plan.duration
                const candidateLimit = plan.candidateLimit;

                const nextBillingDate = currentPlanDetails.next_billing_date!;
                let fromDate: Date;

                fromDate = new Date(nextBillingDate);

                if (dur == "monthly") {
                    fromDate.setMonth(fromDate.getMonth() - 1);
                } else if (dur == 'yearly') {
                    fromDate.setFullYear(fromDate.getFullYear() - 1);
                } else {
                    return createErrorResponse(
                        "Error",
                        StatusCodes.BAD_REQUEST,
                        "Subcription period is not found"
                    );
                }


                const assessments = await lanchAssessment.find({
                    groupingId: new ObjectId(groupId),
                    isActive: true,
                    isDelete: false,
                    createdAt: {
                        $gte: fromDate,
                        $lte: nextBillingDate
                    }
                });

                // Get all group candidate IDs from assessments
                const groupCandidateIds = assessments.map(e => e.groupCandidateId);

                // Remove duplicates
                const uniqueGrpCandId = Array.from(new Set(groupCandidateIds));

                // Fetch group details for these IDs
                const groupCandiDtls = await group.find({
                    _id: { $in: uniqueGrpCandId }
                });

                // ⚠️ Use canidateId as defined in your schema
                const grpCandidateIds = groupCandiDtls.flatMap(e => e.canidateId);

                // Extract candidate IDs from assessments (flattened)
                const assCandIds = assessments.flatMap(e => e.candidateIds);

                // Combine and get unique
                const final = [...grpCandidateIds, ...assCandIds];
                const uniqueCanIds = Array.from(new Set(final));

                console.log("Unique Candidate Count:", uniqueCanIds.length);

                if (uniqueCanIds.length > candidateLimit) {
                    return createErrorResponse(
                        "Error",
                        StatusCodes.BAD_REQUEST,
                        "Unique Candidate limit exceeded for this plan"
                    );
                }

               

                if(data.candidateIds){
                     data.candidateIds.filter((e)=> 
                       uniqueCanIds.map((exist)=> e !== exist)
                    )
                }

            } else {
                return createErrorResponse(
                    "Error",
                    StatusCodes.BAD_REQUEST,
                    "Active subscription plan not found"
                );
            }


            const obj = {
                assessmentName: data.name,

                candidateIds: !data.isGroupCandidate && data.candidateIds ? data.candidateIds.map((e) => new ObjectId(e)) : [],

                groupCandidateId: data.isGroupCandidate ? new ObjectId(data.assessmentGroupCandidateId) : null,

                groupQuestionId: new ObjectId(data.assessmentQuestionId),

                startDateTime: new Date(data.startDateTime),
                endDateTime: new Date(data.endDateTime),
                passingMarks: Number(data.passingMarks),

                timeAllocation: data.timeAllocation,

                // Generate secure token for unique access
                urlToken: crypto.randomBytes(32).toString("hex"),

                // Expiration time same as end date-time
                urlExpiresAt: new Date(data.endDateTime),

                createdBy: new ObjectId(userId),
                modifiedBy: null,
                groupingId: new ObjectId(groupId),
                isGroupCandidate: data.isGroupCandidate
            };

            await lanchAssessment.create(obj);

            return successResponse("assessment created successfully", StatusCodes.OK, { message: '' });
        } catch (error: any) {
            return createErrorResponse(
                "Error finding assessment",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async updateAssessment(data: UpdateassessmentInput, id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {


            const obj = {
                assessmentName: data.name,

                candidateIds: !data.isGroupCandidate && data.candidateIds ? data.candidateIds.map((e) => new ObjectId(e)) : [],

                groupCandidateId: data.isGroupCandidate ? new ObjectId(data.assessmentGroupCandidateId) : null,

                groupQuestionId: new ObjectId(data.assessmentQuestionId),

                startDateTime: new Date(data.startDateTime),
                endDateTime: new Date(data.endDateTime),
                passingMarks: Number(data.passingMarks),
                timeAllocation: data.timeAllocation,

                // Generate secure token for unique access
                urlToken: crypto.randomBytes(32).toString("hex"),

                // Expiration time same as end date-time
                urlExpiresAt: new Date(data.endDateTime),

                modifiedBy: new ObjectId(userId),
                groupingId: new ObjectId(groupId),
                isGroupCandidate: data.isGroupCandidate

            };

            await lanchAssessment.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            }, {
                $set: { obj }
            });

            return successResponse("assessment update successfully", StatusCodes.OK, { message: '' });
        } catch (error: any) {
            return createErrorResponse(
                "Error finding assessment",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async findAssessmentIdEist(id: string): Promise<Boolean | ErrorResponse> {
        try {
            const count = await lanchAssessment.countDocuments({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            });

            return count >= 1;
        } catch (error: any) {
            return createErrorResponse(
                "Error finding assessment",
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAssessmentById(id: string, userId: string, groupId: string): Promise<ApiResponse<assessmentRes> | ErrorResponse> {
        try {
            const res = await lanchAssessment.findById(
                {
                    _id: new ObjectId(id),
                    isActive: true,
                    isDelete: false
                }
            )

            if (!res) {
                return createErrorResponse('Assessment not found.', StatusCodes.BAD_REQUEST, 'Error Assessment not found');
            }


            const result: assessmentRes = {
                _id: res?._id.toString(),
                assessmentName: res?.assessmentName,
                startTime: res?.startDateTime.toString(),
                endTime: res?.endDateTime.toString(),
                passingMarks: res?.passingMarks.toString(),
                groupCandidateId: res.groupCandidateId ? res.groupCandidateId.toString() : "",
                groupQuestionId: res.groupQuestionId.toString()
            }

            return successResponse('Assessment details retrieved successfully', StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error delete assessment',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async getAllAssessment(params: assessmentListParams, userId: string, groupId: string): Promise<PaginationResult<assessmentDtls[]> | ErrorResponse> {
        try {

            const { page, limit, type } = params

            const pipeline: any = [
                {
                    $match: {
                        isActive: true,
                        isDelete: false,
                        groupingId: new ObjectId(groupId)
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: 'modifiedBy',
                        foreignField: '_id',
                        as: 'modifiedBy'
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: 'modifiedBy',
                        foreignField: '_id',
                        as: 'modifiedBy'
                    }
                },
                {
                    $lookup: {
                        from: 'candidategroups',
                        localField: 'groupCandidateId',
                        foreignField: '_id',
                        as: 'candidateGrp'
                    }
                },
                {
                    $lookup: {
                        from: 'questiongroups',
                        localField: 'groupQuestionId',
                        foreignField: '_id',
                        as: 'questionGrp'
                    }
                },
                {
                    $project: {
                        assessmentName: 1,
                        groupCandidateName: { $arrayElemAt: ['$candidateGrp.groupName', 0] },
                        groupQuestionName: { $arrayElemAt: ['$questionGrp.groupName', 0] },
                        startTime: 1,
                        endTime: 1,
                        passingMarks: 1,
                        isActive: 1,
                        isDelete: 1,
                        urlToken: 1,
                        createdBy: { $arrayElemAt: ['$createdBy.name', 0] },
                        modifiedBy: { $arrayElemAt: ['$modifiedBy.name', 0] },
                    }
                },

            ];

            if (type !== 'all') {
                pipeline.push(
                    { $skip: page * limit },
                    { $limit: limit }
                );
            }

            const roleDtls = await lanchAssessment.aggregate(pipeline);
            const count = await lanchAssessment.countDocuments({ isActive: 1, isDelete: 0 })

            return Pagination(count, roleDtls, limit, page)

        } catch (error: any) {
            return createErrorResponse(
                'Error delete assessment',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
    async deleteAssessment(id: string, userId: string, groupId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const delteProduct = await lanchAssessment.findOneAndUpdate(
                { _id: new ObjectId(id), isActive: true, isDelete: false },
                {
                    $set: {
                        isDelete: true,
                        modifiedBy: new ObjectId(userId),
                        updatedAt: new Date()
                    }
                },
                { new: true }
            );

            if (!delteProduct) {
                return createErrorResponse(
                    'Error in role delete',
                    StatusCodes.NOT_FOUND,
                    'role with given ID not found'
                );
            }

            const result: SuccessMessage = {
                message: 'role deleted success.'
            };
            return successResponse("role deleted successfully", StatusCodes.OK, result);

        } catch (error: any) {
            return createErrorResponse(
                'Error delete role',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async sendAssessemntLink(id: string, userId: string): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const findAss = await lanchAssessment.findOne({
                _id: new ObjectId(id),
                isActive: true,
                isDelete: false,
            });

            if (!findAss || findAss.isAssessentLanch) {
                return createErrorResponse(
                    "Assessment not found or already launched.",
                    StatusCodes.BAD_REQUEST,
                    "Assessment is not in a valid state to launch."
                );
            }

            // Resolve candidate IDs
            let findCandidateIds = [];

            if (findAss.isGroupCandidate) {
                const groupCandidate = await group.findOne({
                    _id: new ObjectId(findAss.groupCandidateId),
                    isActive: true,
                    isDelete: false,
                });

                findCandidateIds = groupCandidate?.canidateId || [];
            } else {
                findCandidateIds = findAss?.candidateIds || [];
            }

            if (!findCandidateIds.length) {
                return createErrorResponse(
                    "Error in send assessment",
                    StatusCodes.NOT_FOUND,
                    "No candidates found for this assessment."
                );
            }

            // Fetch all candidate details
            const candidates = await CandidateModel.find({
                _id: { $in: findCandidateIds.map((id) => new ObjectId(id)) },
            });

            if (!candidates.length) {
                return createErrorResponse(
                    "No valid candidates found.",
                    StatusCodes.NOT_FOUND,
                    "Candidates not found in database."
                );
            }

            // Fetch questions
            const findQuestions = await QuestionGroupModel.findOne({
                _id: new ObjectId(findAss.groupQuestionId),
                isActive: true,
                isDelete: false,
            });

            if (!findQuestions) {
                return createErrorResponse(
                    "Questions not found.",
                    StatusCodes.NOT_FOUND,
                    "Question group with given ID not found."
                );
            }

            const selectedQuestionIds = findQuestions.selectedQuestions.map(
                (id) => new ObjectId(id)
            );

            const questions = await QuestionModel.find({
                _id: { $in: selectedQuestionIds },
                isActive: true,
                isDelete: false,
            });

            // Prepare reusable question template
            const questionResults = questions.map((q) => {
                const correctOption = q.options.find((opt) => opt.isCorrect);
                return {
                    questionId: q._id,
                    correctAns: correctOption ? [correctOption._id.toString()] : [],
                    answerChosen: "",
                };
            });

            const link = `${_config?.WebsiteUrl}/assessment/start/${findAss.urlToken}`;
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            // Pre-fetch all recent interviews (last 3 months)
            const recentInterviews = await lastInterviewDate.find({
                candidateId: { $in: candidates.map((c) => c._id) },
                createdAt: { $gte: threeMonthsAgo },
            }).select("candidateId");

            //  Pre-fetch all active assessments for this assessmentId
            const activeAssessments = await lastInterviewDate.find({
                assessmentId: findAss._id,
                candidateId: { $in: candidates.map((c) => c._id) },
                isActive: true,
                isDelete: false,
            }).select("candidateId");

            // Create sets for fast lookup
            const recentSet = new Set(recentInterviews.map((i) => i.candidateId.toString()));
            const activeSet = new Set(activeAssessments.map((i) => i.candidateId.toString()));

            // Filter candidates that are eligible
            const eligibleCandidates = candidates.filter(
                (c) => !recentSet.has(c._id.toString()) && !activeSet.has(c._id.toString())
            );

            if (!eligibleCandidates.length) {
                return createErrorResponse(
                    "No eligible candidates to send assessment.",
                    StatusCodes.BAD_REQUEST,
                    "All candidates have recent or active assessments."
                );
            }

            // Loop only through eligible candidates
            for (const candidate of eligibleCandidates) {
                const interviewData = new lastInterviewDate({
                    candidateId: candidate._id,
                    assessmentId: findAss._id,
                    questions: questionResults,
                    createdBy: new ObjectId(userId),
                });

                await interviewData.save();

                const formData = {
                    assessmentName: findAss.assessmentName,
                    candidateName: candidate.firstName,
                    candidateEmail: candidate.email,
                    assessmentLink: link,
                    duration: findQuestions.totalDuration || 0,
                    expiryDate: findAss.endDateTime
                        ? new Date(findAss.endDateTime).toLocaleDateString()
                        : "N/A",
                    currentYear: new Date().getFullYear(),
                };

                await mailService.commonMailSend(
                    "Assessment Invitation",
                    candidate.email,
                    "You’ve been invited to take an assessment. Please check your email for details.",
                    formData
                );
            }

            // Mark assessment as launched
            await lanchAssessment.updateOne(
                { _id: findAss._id },
                { $set: { isAssessentLanch: true } }
            );

            return successResponse(
                "Emails sent successfully.",
                StatusCodes.OK,
                { message: "Assessment launched and invitations sent." }
            );

        } catch (error: any) {
            return createErrorResponse(
                'Error sending link to email',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async assementQuestion(token: string): Promise<PaginationResult<any[]> | ErrorResponse> {
        try {

            const findToken = await lanchAssessment.findOne({
                urlToken: token,
                isDelete: false,
            });

            if (!findToken) {
                return createErrorResponse(
                    "Invalid token.",
                    StatusCodes.BAD_REQUEST,
                    "No assessment found for this token."
                );
            }

            if (!findToken.isActive) {
                return createErrorResponse(
                    "Assessment is not in active state.",
                    StatusCodes.BAD_REQUEST,
                    "Assessment is not in active state."
                );
            }

            const now = new Date();

            if (findToken.urlExpiresAt && findToken.urlExpiresAt < now) {
                return createErrorResponse(
                    "Test link expired. Please request a new one.",
                    StatusCodes.BAD_REQUEST,
                    "Assessment link expired."
                );
            }

            const findQuestions = await QuestionGroupModel.findOne({
                _id: new ObjectId(findToken.groupQuestionId),
                isActive: true,
                isDelete: false,
            });

            if (!findQuestions) {
                return createErrorResponse(
                    "Questions not found.",
                    StatusCodes.BAD_REQUEST,
                    "Questions not found."
                );
            }

            const selectedQuestionIds = findQuestions.selectedQuestions.map(
                (id) => new ObjectId(id)
            );

            const questions = await QuestionModel.find({
                _id: { $in: selectedQuestionIds },
                isActive: true,
                isDelete: false,
            });

            const result = questions.map((q) => ({
                ...q.toObject(), // Convert Mongoose document to plain object
                totalDuration: findQuestions.totalDuration,
                totalQuestion: findQuestions.totalNumberOfQuestion,
                startDateTime: findToken.startDateTime,
                endDateTime: findToken.endDateTime,
                timeAllocation: findToken.timeAllocation
            }));

            return Pagination(0, result, 0, 0)

        } catch (error: any) {
            return createErrorResponse(
                'Error',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async questionAnswer(data: AssessAnsInput): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            await lastInterviewDate.updateOne(
                {
                    candidateId: new ObjectId(data.candidateId),
                    assessmentId: new ObjectId(data.assessmentId),
                    isSubmitted: false,
                    "questions.questionId": new ObjectId(data.questionId),
                },
                {
                    $set: {
                        "questions.$.answerChosen": data.chosen,
                    },
                }
            );


            return successResponse(
                "",
                StatusCodes.OK,
                { message: "" }
            );

        } catch (error: any) {
            return createErrorResponse(
                'Error',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }

    async submitAssessment(data: AssessmentSubmitionSchema): Promise<ApiResponse<SuccessMessage> | ErrorResponse> {
        try {
            const findAssessment = await lastInterviewDate.findOne({
                candidateId: new ObjectId(data.candidateId),
                assessmentId: new ObjectId(data.assessmentId),
                isSubmitted: false,
            });

            if (!findAssessment) {
                return createErrorResponse(
                    "Assessment not found",
                    StatusCodes.NOT_FOUND,
                    "Candidate assessment not found"
                );
            }

            // Count correct answers (supports multiple answers)
            const countScore = findAssessment.questions.filter((q) => {
                if (!Array.isArray(q.answerChosen) || !Array.isArray(q.correctAns)) return false;

                // Both arrays must match exactly — same length and same elements
                return (
                    q.answerChosen.length === q.correctAns.length &&
                    q.answerChosen.every((ans) => q.correctAns.includes(ans))
                );
            }).length;

            // Update the score
            await lastInterviewDate.updateOne(
                { _id: findAssessment._id },
                { $set: { score: countScore, isSubmitted: true, submittedAt: new Date() } }
            );

            return successResponse(
                "",
                StatusCodes.OK,
                { message: "" }
            );

        } catch (error: any) {
            return createErrorResponse(
                'Error',
                StatusCodes.INTERNAL_SERVER_ERROR,
                error.message
            );
        }
    }
}

export function newAssessmentRegister(db: Db): AssRepositoryDomain {
    return new AssessmentRepository(db)
}