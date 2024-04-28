import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const MarketSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},

		lat: {
			type: String,
			required: true,
		},
		lng: {
			type: String,
			required: true,
		},
	},

	{
		timestamps: true,
	}
);

export default model('MarketSchema', MarketSchema);
