const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: [3, 'Title must be at least 3 character long'],
            maxlength: [50, 'tile can not exceed 50 characters']
        },
        description: {
            type: String,
            maxlength: [200, 'description cannot exceed 200 characters']
        },
        completed: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

const Task = mongoose.model('Task', taskSchema)

module.exports = Task