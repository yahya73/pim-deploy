import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AiQuiz = new Schema({
    
    parentUsername :{
        type: String,
        required: true  
    },
    childUsername:{
        type: String,
        required: true
    },
    age:{
        type:Number,
        required:true
    },
    amount:{
        type: Number,
        required: true
    }

});

export default model('AiQuiz', AiQuiz);