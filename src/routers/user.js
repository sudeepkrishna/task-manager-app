const express = require("express")
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

//API for user login
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user,token})
    }
    catch(e){
        res.status(401).send()
    }
})

//API for user logout
router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.status(200).send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send() 
    }
    catch(e){
        res.status(500).send()
    }
})
//API to get user
router.get('/users/me', auth, async (req, res) => { 
    res.send(req.user)
})

//API to write a new user to db
router.post('/users', async (req, res) => {
    const user = new User(req.body)   //while saving, always save a model of a db collection.  
    try{     
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

//API to update a user
router.patch('/users/me', auth, async (req, res) => {
    const requestedUpdates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isAllowed = requestedUpdates.every((update) => allowedUpdates.includes(update))
    if(!isAllowed){
        return res.status(400).send('Update not allowed')
    }
    try{
        const user = req.user
        //updating each field of matched user with updated value
        requestedUpdates.forEach((update) => {
          user[update] = req.body[update]
        })
        await user.save()
        res.status(200).send(user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

//API to delete a user
router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove()
        res.status(200).send(req.user)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router