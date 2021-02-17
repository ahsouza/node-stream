const
 express = require('express'),
 fs = require('fs'),
 path = require('path'),
 app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.send({message: 'Bem vindo a aplicação Node.js Stream Vídeo'})
})

app.get('/filmes/romance/2020/por_lugares_incriveis', function(req, res) {
  const path = 'movies/romance/por_lugares_incriveis.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(3000, function () {
  console.log('Server on port 3000!')
})
