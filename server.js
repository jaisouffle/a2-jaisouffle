const http = require('http'),
  fs = require('fs'),
  mime = require('mime'),
  dir = 'public/',
  port = 3000

let appdata = [
  { 'model': 'toyota', 'year': 1999, 'mpg': 23, 'age': new Date().getFullYear() - 1999 },
  { 'model': 'honda', 'year': 2004, 'mpg': 30, 'age': new Date().getFullYear() - 2004 },
  { 'model': 'ford', 'year': 1987, 'mpg': 14, 'age': new Date().getFullYear() - 1987 }
]

const server = http.createServer(function (request, response) {
  if (request.method === 'GET') {
    handleGet(request, response)
  } else if (request.method === 'POST') {
    if (request.url === '/submit') {
      handlePost(request, response)
    } else if (request.url === '/delete') {
      handleDelete(request, response)
    }
  }
})

const handleGet = function (request, response) {
  const filename = dir + request.url.slice(1)

  if (request.url === '/') {
    sendFile(response, 'public/index.html')
  } else if (request.url === '/results') {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(appdata))
  } else {
    sendFile(response, filename)
  }
}

const handlePost = function (request, response) {
  let dataString = ''

  request.on('data', function (data) {
    dataString += data
  })

  request.on('end', function () {
    const data = JSON.parse(dataString)
    console.log("Received data:", data)

    if (data.action === 'add') {
      const age = new Date().getFullYear() - data.year
      const newData = {
        model: data.model,
        year: parseInt(data.year),
        mpg: parseInt(data.mpg),
        age: age
      }
      appdata.push(newData)
      console.log("New row added:", newData)
    } else if (data.action === 'edit') {
      // edit existing entry based on index
      const index = data.index
      console.log("Attempting to edit row at index:", index)

      if (index >= 0 && index < appdata.length) {
        // replace existing row with the new data
        appdata[index] = {
          model: data.model,
          year: parseInt(data.year),
          mpg: parseInt(data.mpg),
          age: new Date().getFullYear() - parseInt(data.year)
        }
        console.log(`Row at index ${index} updated to:`, appdata[index])
      } else {
        console.error('Invalid index for editing:', index)
      }
    }

    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(appdata))
  })
}

const handleDelete = function (request, response) {
  let dataString = ''

  request.on('data', function (data) {
    dataString += data
  })

  request.on('end', function () {
    const data = JSON.parse(dataString)

    if (typeof data.index === 'number' && data.index >= 0 && data.index < appdata.length) {
      appdata.splice(data.index, 1)
      console.log(`Deleted row at index ${data.index}`)
    }

    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(appdata))
  })
}

const sendFile = function (response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function (err, content) {
    if (err === null) {
      response.writeHead(200, { 'Content-Type': type })
      response.end(content)
    } else {
      response.writeHead(404)
      response.end('404 Error: File Not Found')
    }
  })
}

server.listen(process.env.PORT || port)
