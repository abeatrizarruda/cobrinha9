<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jogo da Cobrinha - meloxw7_</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: sans-serif;
      background: #000;
      color: white;
      text-align: center;
    }
    canvas {
      background: #111;
      display: block;
      margin: 20px auto;
      border: 2px solid #444;
    }
    #lobby, #gameOverScreen {
      display: none;
    }
    #joystick {
      display: none;
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
    .btn {
      padding: 10px 20px;
      margin: 10px;
      font-size: 18px;
      cursor: pointer;
      background-color: #333;
      color: white;
      border: none;
    }
    #watermark {
      position: fixed;
      bottom: 5px;
      right: 10px;
      font-size: 12px;
      opacity: 0.3;
    }
    #scoreDisplay, #rankingDisplay {
      font-size: 18px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div id="watermark">meloxw7_</div>
  <div id="lobby">
    <h1>Jogo da Cobrinha</h1>
    <button class="btn" onclick="startGame()">Iniciar Jogo</button>
    <div id="rankingDisplay"></div>
  </div>

  <div id="gameArea">
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="scoreDisplay">Pontos: 0</div>
    <div id="joystick">
      <button class="btn" onclick="setDirection('up')">▲</button><br>
      <button class="btn" onclick="setDirection('left')">◀</button>
      <button class="btn" onclick="setDirection('down')">▼</button>
      <button class="btn" onclick="setDirection('right')">▶</button>
    </div>
  </div>

  <div id="gameOverScreen">
    <h2>Game Over!</h2>
    <p id="finalScore"></p>
    <input type="text" id="playerName" placeholder="Digite seu nome">
    <button class="btn" onclick="saveScore()">Salvar Pontuação</button>
    <button class="btn" onclick="returnToLobby()">Voltar ao Lobby</button>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scale = 20;
    const rows = canvas.height / scale;
    const columns = canvas.width / scale;
    let snake, apple, powerUps = [], score = 0, direction = 'right', game, invincible = false;

    const colors = ['green', 'yellow', 'blue', 'pink', 'orange', 'cyan'];

    function getRandomColor() {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function randomPosition() {
      return {
        x: Math.floor(Math.random() * columns) * scale,
        y: Math.floor(Math.random() * rows) * scale
      };
    }

    function Snake() {
      this.body = [{ x: 100, y: 100 }];
      this.color = 'lime';

      this.update = function () {
        let head = Object.assign({}, this.body[0]);
        if (direction === 'up') head.y -= scale;
        if (direction === 'down') head.y += scale;
        if (direction === 'left') head.x -= scale;
        if (direction === 'right') head.x += scale;
        this.body.unshift(head);

        if (head.x === apple.x && head.y === apple.y) {
          score++;
          this.color = getRandomColor();
          apple = randomPosition();
          if (Math.random() < 0.1) powerUps.push(randomPosition());
        } else {
          this.body.pop();
        }

        for (let i = 1; i < this.body.length; i++) {
          if (!invincible && head.x === this.body[i].x && head.y === this.body[i].y) {
            endGame();
          }
        }

        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
          if (!invincible) endGame();
        }

        for (let i = 0; i < powerUps.length; i++) {
          if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
            powerUps.splice(i, 1);
            activateInvincibility();
          }
        }
      };

      this.draw = function () {
        for (let i = 0; i < this.body.length; i++) {
          ctx.fillStyle = invincible ? `hsl(${Math.random()*360}, 100%, 50%)` : this.color;
          ctx.fillRect(this.body[i].x, this.body[i].y, scale, scale);
        }
      };
    }

    function drawApple() {
      ctx.fillStyle = 'red';
      ctx.fillRect(apple.x, apple.y, scale, scale);
    }

    function drawPowerUps() {
      for (let i = 0; i < powerUps.length; i++) {
        ctx.fillStyle = 'magenta';
        ctx.fillRect(powerUps[i].x, powerUps[i].y, scale, scale);
      }
    }

    function activateInvincibility() {
      invincible = true;
      setTimeout(() => invincible = false, 5000);
    }

    function setDirection(dir) {
      if ((direction === 'up' && dir === 'down') ||
          (direction === 'down' && dir === 'up') ||
          (direction === 'left' && dir === 'right') ||
          (direction === 'right' && dir === 'left')) return;
      direction = dir;
    }

    function startGame() {
      document.getElementById('lobby').style.display = 'none';
      document.getElementById('gameArea').style.display = 'block';
      document.getElementById('joystick').style.display = 'block';

      snake = new Snake();
      apple = randomPosition();
      powerUps = [];
      score = 0;
      direction = 'right';
      game = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.update();
        snake.draw();
        drawApple();
        drawPowerUps();
        document.getElementById('scoreDisplay').innerText = `Pontos: ${score}`;
      }, 150);
    }

    function endGame() {
      clearInterval(game);
      document.getElementById('gameArea').style.display = 'none';
      document.getElementById('joystick').style.display = 'none';
      document.getElementById('gameOverScreen').style.display = 'block';
      document.getElementById('finalScore').innerText = `Sua pontuação: ${score}`;
    }

    function saveScore() {
      const name = document.getElementById('playerName').value || 'Anônimo';
      const record = { name, score };
      let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
      ranking.push(record);
      ranking.sort((a, b) => b.score - a.score);
      ranking = ranking.slice(0, 5);
      localStorage.setItem('ranking', JSON.stringify(ranking));
      returnToLobby();
    }

    function returnToLobby() {
      document.getElementById('gameOverScreen').style.display = 'none';
      document.getElementById('lobby').style.display = 'block';
      renderRanking();
    }

    function renderRanking() {
      const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
      const display = ranking.map((r, i) => `${i+1}. ${r.name} - ${r.score} pts`).join('<br>');
      document.getElementById('rankingDisplay').innerHTML = `<h3>Ranking</h3>${display}`;
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') setDirection('up');
      if (e.key === 'ArrowDown') setDirection('down');
      if (e.key === 'ArrowLeft') setDirection('left');
      if (e.key === 'ArrowRight') setDirection('right');
    });

    // Inicia no lobby
    document.getElementById('lobby').style.display = 'block';
    renderRanking();
  </script>
</body>
</html>
