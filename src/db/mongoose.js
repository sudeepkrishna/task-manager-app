const mongoose = require("mongoose")

//CONNECT TO A DB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})


