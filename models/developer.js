import mongoose from 'mongoose'

const developerSchema = mongoose.Schema({
    salutation: {
        type: String,
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
    specialist: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    postcode: {
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
