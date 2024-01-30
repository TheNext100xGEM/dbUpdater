const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); //ads pagination to schema


const Schema = mongoose.Schema;

const projectSchema = new Schema({
	uniqueKey: {
		type: String,
		required: true
	},

	presaleAddress: {
		type: String,
		required: false
	},

	tokenName: {
		type: String,
		required: true
	},

	tokenSymbol: {
		type: String,
		required: true,
	},

	saleToken: {
		type: String,
		required: false
	},

	audit: {
		type: Boolean,
		required: false
	},

    auditLink: {
		type: String,
		required: false
	},

	kyc: {
		type: Boolean,
		required: false
	},

	safu: {
		type: Boolean,
		required: false
	},

	softCap: {
		type: Number,
		required: false
	},

    hardCap: {
		type: Number,
		required: false
	},
	amountRaised:
	{
		type: Number,
		required: false
	},
	telegramLink:
	{
		type: String,
		required: false
	},
	twitterLink:
	{
		type: String,
		required: false
	},
	websiteLink:
	{
		type: String,
		required: false
	},
	submittedDescription:
	{
		type: String,
		required: false
	},
	githubLink:
	{
		type: String,
		required: false
	},
	redditLink:
	{
		type: String,
		required: false
	},
	logoLink:
	{
		type: String,
		required: false
	},
	startTime:
	{
		type: Date,
		required: false
	},
	endTime:
	{
		type: Date,
		required: false
	},
	poolType:
	{
		type: String,
		required: false
	},
	chain:
	{
		type: Number,
		required: false
	},
    status:
	{
		type: Number,
		required: false
	},

    telegramMemberCount:
	{
		type: Number,
		required: false
	},

    telegramOnlineCount:
	{
		type: Number,
		required: false
	},
    launchpad:
	{
		type: String,
		required: false
	}
    ,
    source:
	{
		type: String,
		required: false
	},
    chains:
	[
        {
            type: String,
            required: false
	    }
    ],
    launchpads:
	[
        {
            type: String,
            required: false
	    }
    ],
    analyzed:
	{
		type: Boolean,
		required: false
	},

    gemini_raw:
	{
		type: String,
		required: false
	},

    mistral_raw:
	{
		type: String,
		required: false
	},


    gpt_raw:
	{
		type: String,
		required: false
	},
    gpt_score:
	{
		type: String,
		required: false
	},

    gemini_score:
	{
		type: String,
		required: false
	},

    mistral_score:
	{
		type: String,
		required: false
	},

    area_project:
    {
        type: String,
        required: false
    },

    llm_summary: 
    {
        type: String,
        required: false
    },

    weighted_score:
    {
        type: Number,
        required: false
    }



}, {timestamps: true});

projectSchema.plugin(mongoosePaginate);

const Project = mongoose.model('Project', projectSchema);

//Exception for projects model on exports, since we will be using the schema aswell for llm
module.exports = { Project, projectSchema };