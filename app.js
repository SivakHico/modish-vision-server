import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import 'dotenv/config'
import citiesRoutes from './routes/cities.js'
import developersRoutes from './routes/developers.js'
import usersRoutes from './routes/users.js'
import cors from 'cors'
import authJwt from './helpers/jwt.js'
import errorHandler from './helpers/error-handler.js'
const PORT = process.env.PORT || 3000
const api = process.env.API_URL
const connectDB = process.env.CONNECT_DB
const app = express()
import jwt from 'jsonwebtoken'

app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(morgan('tiny'))
// app.use(authJwt())
app.use(errorHandler)

// does the user have a authorization token? if so, verify it
app.use((req, res, next) => {
    console.log('req.headers.authorization', req.headers.authorization)
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.secret)
                req.token = decoded
                next()
            } catch (error) {
                console.log('error >>>>>>>>>>', error)
                next()
            }
        } else {
            next()
        }
    } else {
        next()
    }
})

app.use(`${api}/cities`, citiesRoutes)
app.use(`${api}/developers`, developersRoutes)
app.use(`${api}/users`, usersRoutes)

mongoose
    .connect(connectDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'linkthem'
    })
    .then(() => {
        console.log('DataBase Connection is Ready...')
    })
    .catch((err) => {
        console.log(err)
    })

app.listen(PORT, () => {
    console.log(`The Server is running now on port ${PORT}`)
})
