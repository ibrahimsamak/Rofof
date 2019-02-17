// Require the fastify framework and instantiate it
const auth = require('./controllers/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
 
const fastify = require('fastify')({
  logger: true
})


// Require external modules
const mongoose = require('mongoose')

// Import Routes
const routes = require('./routes')

// Import Swagger Options
const swagger = require('./config/swagger')

// Register Swagger
fastify.register(require('fastify-swagger'), swagger.options)
fastify.register(require('fastify-formbody'))
// fastify.register(require('fastify-multipart'))
fastify.register(require('fastify-file-upload'))
fastify.register(require('fastify-cors'), {  })

// Connect to DB
mongoose.connect('mongodb://db_user:db_user1@ds149754.mlab.com:49754/gaz', { useNewUrlParser: true })
.then(()=>('connect to db'))
.catch(()=>('err'))

// Loop over each route
routes.forEach((route, index) => {
  fastify.route(route)
})

// Run the server!
const start = async () => {
  try {
    const port = process.env.PORT || 3000
    await fastify.listen(port)
    fastify.swagger()
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
