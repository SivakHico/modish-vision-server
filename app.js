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

app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)

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
