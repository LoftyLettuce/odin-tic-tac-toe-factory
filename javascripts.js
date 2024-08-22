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
  let position = new Position(0, 0);
  let getPosition = function(){
    return (new Position(position.x, position.y));
  }
  
  let manualPlay = function(pos){
    position.x = pos.x;
    position.y = pos.y;
    map.board[pos.x][pos.y]  = token;
  }
  let autoPlay = function(){
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
            map.board[i][u] = token;
            position.x = i; position.y = u;
          }
        }
      }
    }
  }
  let play = function(pos){
    if (name === "com")
    {
      autoPlay(pos);
    }
    else
    {
      manualPlay(pos);
    }
  }
  function isWin(){
    function Check(name){
      this.name = name;
      this.status = true;
    }
    let collumn = new Check("collumn");
    let row  = new Check("row");
    let slash = new Check("slash");
    let backslash = new Check("backslash");
    let ratio = Math.abs(position.x - position.y);
    for (let i = 0, range = map.board.length; i < range; i++)
    {
      row.status = row.status && (map.board[position.x][(position.y+i)%range] === map.board[position.x][position.y]);
      collumn.status = collumn.status && (map.board[(position.x+i)%range][position.y] === map.board[position.x][position.y]);
      slash.status = slash.status 
        && (map.board[(position.x+i)%range][(position.y+i)%range] === map.board[position.x][position.y]) 
        && ratio === Math.abs((position.x+i)%range-(position.y+i)%range); ///keep the check stay in its line
      backslash.status = backslash.status 
        && (map.board[(position.x+i)%range][(position.y+range-i)%range] === map.board[position.x][position.y]) //+range so they always stay at positive numbers
        && range-1 === Math.abs((position.x+i)%range+(position.y+range-i)%range);
    };
    return(collumn.status || row.status || slash.status || backslash.status);
  }
  return {name, token, isWin, play, getPosition};
}
  let Game = (function(){
    let rows;
    let resetBoard = [];
    function announceResult(displayText)
    {
      let resultBoard = document.getElementById("resultBoard");
      resultBoard.textContent = displayText;
    }
    function disPlay(){
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
      let player1  = Player(document.getElementById("player1").value, "x");
      let player2 = Player(document.getElementById("player2").value, "o");
      let turn = player1;
      map.draw();
      disPlay();
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
              disPlay();
              if (turn.isWin())
              {
                announceResult(`${turn.name} win!!!`);
                reset();
                disPlay();
                return;
              }
              else{
                turn = (player1 === turn)?player2 : player1;
                if (turn.name === "com")
                {

                  turn.play(null);
                  disPlay();
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