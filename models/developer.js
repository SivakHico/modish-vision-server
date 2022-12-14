import mongoose from 'mongoose'

const developerSchema = mongoose.Schema({
    salutation: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true
    },
    specialist: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number,
        required: true
    },
    linkedin: {
        type: String,
        required: false
    },
    github: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        default: 0
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cities',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

const Developer = mongoose.model('Developer', developerSchema)

export default Developer
