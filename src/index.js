import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import router from './routes/web.js'
dotenv.config()

const app = express()
const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/src/uploads', express.static('src/uploads'));
app.use('/api/v1', router)


app.listen(port, () => {
    console.log('Server is running on port', port)
})