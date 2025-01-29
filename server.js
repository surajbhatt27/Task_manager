const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const app = express()

mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json())

const Task = require('./models/Task')

app.post('/tasks', async(req, res) => {
    try {
        const {title, description} = req.body
        const task = new Task({title, description})
        await task.save()
        res.status(201).json(task)
    } catch (err) {
        res.status(400).json({message: 'error creating task', error:err})
    }
    console.log(req.body)
})

app.get('/tasks', async(req, res) => {
    try {
        const {page = 1, limit = 10, completed} = req.query
        const query = {}
        if(completed) {
            query.completed = completed === 'true'
        }

        const tasks = await Task.find(query)
        .limit(limit*1)
        .skip((page-1)*limit)
        .exec()

        const count = await Task.countDocuments(query)

        res.status(200).json({
            tasks,
            totalPages: Math.ceil(count/limit),
            currentPage: page
        })
    } catch (err) {
        res.status(500).json({message: 'error fetching task', error: err})
    }
})

app.put('/tasks/:id', async(req, res) => {
    try {
        const { title, description, completed } = req.body
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {title, description, completed},
            {new: true, runValidators: true}
        )
        if(!task) {
            return res.status(404).json({message: 'Task is not found'})
        }
        res.status(200).json(task)
    } catch (err) {
        res.status(400).json({message: 'Error updating task', error: err})
    }
})

app.delete('/tasks/:id', async(req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if(!task) {
            return res.status(404).json({message: 'task is not found'})
        }
        res.status(200).json({message: 'task is deleted successfully'})
    } catch (err) {
        res.status(400).json({message: 'Error deleting task', error: err})
    }
})

app.use((err, req, res, next) =>{
    console.log(err.stack)
    res.status(err.stack||500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    })
})

const PORT = process.env.PORT || 5000; // Default to 5000 if no port is provided in env
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});