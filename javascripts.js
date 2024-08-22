function Position(x, y){
  this.x = x;
  this.y = y;
}
let map = function(){
  let board = [];
  function draw(){
    let size = 3;
    for (let row = 0; row < size; row++)
    {
      board[row] = [];
      for (let collumn = 0; collumn < size; collumn++)
      {
        board[row].push(" ");
      }
    }
  }
  function isFull(){
    return !(board.some((row) => (
      row.some((cell)=>
        cell === " "
      )
    )));
  }
  return {board, draw, isFull};
}();

function Player(name, token){
  this.name = name;
  this.token = token;
  this.position = new Position(0, 0);
}
Player.prototype.autoPlay = function()
{
  let totalEmptyCells = 0;
  for (let i = 0; i < map.board.length; i++)
  {
    let row = map.board[i].filter((cell)=>cell === " ");
    if (row.length > 0)
    {
      totalEmptyCells += row.length;
    }
  }
  let move = Math.ceil(Math.random()*totalEmptyCells);
  for (let i = 0; i < map.board.length; i++)
  {
    for (let u = 0; u < map.board.length; u++)
    {
      if (map.board[i][u] === " ")
      {
        move--;
        if (move === 0)
        {
          map.board[i][u] = this.token;
          this.position.x = i; this.position.y = u;
        }
      }
    }
  }
}
Player.prototype.manualPlay = function(pos){
  this.position.x = pos.x;
  this.position.y = pos.y;
  map.board[pos.x][pos.y]  = this.token;
}
Player.prototype.play = function(pos){
  if (this.name === "com")
  {
    this.autoPlay(pos);
  }
  else
  {
    this.manualPlay(pos);
  }
}
Player.prototype.isWin = function(){
  function Check(name){
    this.name = name;
    this.status = true;
  }
  let collumn = new Check("collumn");
  let row  = new Check("row");
  let slash = new Check("slash");
  let backslash = new Check("backslash");
  let ratio = Math.abs(this.position.x - this.position.y);
  for (let i = 0, range = map.board.length; i < range; i++)
  {
    row.status = row.status && (map.board[this.position.x][(this.position.y+i)%range] === map.board[this.position.x][this.position.y]);
    collumn.status = collumn.status && (map.board[(this.position.x+i)%range][this.position.y] === map.board[this.position.x][this.position.y]);
    slash.status = slash.status 
      && (map.board[(this.position.x+i)%range][(this.position.y+i)%range] === map.board[this.position.x][this.position.y]) 
      && ratio === Math.abs((this.position.x+i)%range-(this.position.y+i)%range); ///keep the check stay in its line
    backslash.status = backslash.status 
      && (map.board[(this.position.x+i)%range][(this.position.y+range-i)%range] === map.board[this.position.x][this.position.y]) //+range so they always stay at positive numbers
      && range-1 === Math.abs((this.position.x+i)%range+(this.position.y+range-i)%range);
  };
  return(collumn.status || row.status || slash.status || backslash.status);
}
let Game = (function(){
  let rows;
  let resetBoard = [];
  function announceResult(displayText)
  {
    let resultBoard = document.getElementById("resultBoard");
    resultBoard.textContent = displayText;
  }
  function displayMap(){
    rows = document.querySelector("tbody").children;
    for (let i = 0; i < map.board.length; i++)
    {
      for(let u = 0; u < map.board.length; u++)
      {
        rows[i].children[u].querySelector("button").textContent = map.board[i][u];
      }
    }
  }
  function reset(){
    for (let i = 0; i < resetBoard.length; i++)
    {
      resetBoard[i]();
    }
  }
  function play(){
    let player1  = new Player(document.getElementById("player1").value, "x");
    let player2 = new Player(document.getElementById("player2").value, "o");
    let turn = player1;
    map.draw();
    displayMap();
    announceResult("");
    for (let i = 0; i < rows.length; i++)
    {
      for (let u = 0; u < rows.length; u++)
      {
        let cell = rows[i].children[u].querySelector("button");
        let cellPos = new Position(i, u);
        function changingTurn(){
          if (cell.textContent === " ")
          {
            turn.play(cellPos);
            displayMap();
            if (turn.isWin())
            {
              announceResult(`${turn.name} win!!!`);
              reset();
              return;
            }
            else{
              turn = (player1 === turn)?player2 : player1;
              if (turn.name === "com")
              {

                turn.play(null);
                displayMap();
                if (turn.isWin())
                {
                  announceResult(`${turn.name} win!!!`);
                  reset();
                  return;
                }
                turn = (player1 === turn)?player2 : player1;
              }
            }
            if (map.isFull())
            {
              announceResult("Tie!!");
              reset();
              return;
            } 
          }  
        }
        cell.addEventListener("click", changingTurn);
        resetBoard.push(function()
        {
          cell.removeEventListener("click", changingTurn);
        })
      }
    }
  }
  return {play};
})();
window.addEventListener("load", function(){
  let playButton = this.document.getElementById("play-button");
  playButton.addEventListener("click", function(){
    if (document.getElementById("player1").checkValidity() && document.getElementById("player2").checkValidity())
    {  
      Game.play();
    }
  })
})