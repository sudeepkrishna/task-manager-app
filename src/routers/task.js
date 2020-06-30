const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const { ObjectID } = require("mongodb")
const auth = require('../middleware/auth')

//REST API to add a new task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,   //es6 spread shorthand
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

//API for getting all tasks
// GET tasks/completed=true
// GET tasks/limit=10&skip=10
//GET tasks/sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
  if(req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    //const tasks = await Task.find({owner: req.user._id})
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.status(200).send(req.user.tasks)
  } catch (e) {
    res.status(400).send(e)
  }
})

//API for getting a particular task
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id
  
  try {
    let task = await Task.findOne({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send()
  }
  // Task.findById(_id).then((task) => {
  //     if(!task){
  //         return res.status(404).send('ID not found')
  //     }
  //     res.status(200).send(task)
  // }).catch((e) => {
  //     console.log(e)
  //     res.status(500).send()
  // })
})

//API for updating tasks
router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id
  const requestedUpdates = Object.keys(req.body)
  const allowedUpdates = ["description", "completed"]
  const isValidUpdate = requestedUpdates.every((update) =>
    allowedUpdates.includes(update)
  )
  if (!isValidUpdate) {
    return res.status(400).send("Invalid update")
  }
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send("No matching id")
    }
    requestedUpdates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

//API for deleting a task by id
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(400).send("Task not found")
    }
    res.status(200).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router

