function Position(x, y){
  this.x = x;
  this.y = y;
}
let input = new Position(0, 0);

function Player(name, token){
  let position = new Position(0, 0);
  let getPosition = function(){
    return (new Position(position.x, position.y));
  }
  
  let manualPlay = function(board, pos){
    position.x = pos.x;
    position.y = pos.y;
    board[pos.x][pos.y]  = token;
  }
  let autoPlay = function(board){
    let totalEmptyCells = 0;
    for (let i = 0; i < board.length; i++)
    {
      let row = board[i].filter((cell)=>cell === " ");
      if (row.length > 0)
      {
        totalEmptyCells += row.length;
      }
    }
    let move = Math.ceil(Math.random()*totalEmptyCells);
    console.log(`move: ${move}`);
    for (let i = 0; i < board.length; i++)
    {
      for (let u = 0; u < board.length; u++)
      {
        if (board[i][u] === " ")
        {
          move--;
          if (move === 0)
          {
            board[i][u] = token;
            position.x = i; position.y = u;
          }
        }
      }
    }
  }
  let play = function(board, pos){
    console.log(`its ${name} turn!!`)
    if (name === "com")
    {
      autoPlay(board);
    }
    else
    {
      manualPlay(board, pos);
    }
  }
  return {name, token, play, getPosition};
}

let Game = (function(doc){
  let board = [];
  let rows = null;
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
    board.some((row) => {
      row.some((cell)=>
        cell === " "
      )
    })
  }
  function winCheck(pos){
    function Check(name){
      this.name = name;
      this.status = true;
    }
    let collumn = new Check("collumn");
    let row  = new Check("row");
    let slash = new Check("slash");
    let backslash = new Check("backslash");
    let ratio = Math.abs(pos.x - pos.y);
    for (let i = 0, range = board.length; i < range; i++)
    {
      row.status = row.status && (board[pos.x][(pos.y+i)%range] === board[pos.x][pos.y]);
      collumn.status = collumn.status && (board[(pos.x+i)%range][pos.y] === board[pos.x][pos.y]);
      slash.status = slash.status 
        && (board[(pos.x+i)%range][(pos.y+i)%range] === board[pos.x][pos.y]) 
        && ratio === Math.abs((pos.x+i)%range-(pos.y+i)%range); ///keep the check stay in its line
      backslash.status = backslash.status 
        && (board[(pos.x+i)%range][(pos.y+range-i)%range] === board[pos.x][pos.y]) //+range so they always stay at positive numbers
        && range-1 === Math.abs((pos.x+i)%range+(pos.y+range-i)%range);
    };
    if( collumn.status || row.status || slash.status || backslash.status)
    {
      console.log("Win!!!");
    };
  }
  function disPlay(){
    console.table(board);
    rows = doc.querySelector("tbody").children;
    for (let i = 0; i < board.length; i++)
    {
      for(let u = 0; u < board.length; u++)
      {
        rows[i].children[u].querySelector("button").textContent = board[i][u];
      }
    }
  }
  function play(){
    let player1  = Player("player1", "x");
    let player2 = Player("com", "o");
    let turn = player1;
    draw();
    disPlay();
    for (let i = 0, s = 0; i < rows.length; i++)
    {
      for (let u = 0; u < rows.length; u++)
      {
        s++;
        let index = s-1; /// calculate the position of the element
        let cell = rows[i].children[u].querySelector("button");
        cell.addEventListener("click", function(){
          if (cell.textContent === " ")
          {
            turn.play(board, new Position(Math.floor(index/3), index%3));
            winCheck(turn.getPosition());
            turn = (player1 === turn)?player2 : player1;
            if (turn.name === "com")
            {
              turn.play(board, null);
              console.log(turn.getPosition());
              winCheck(turn.getPosition());
              turn = (player1 === turn)?player2 : player1;
            }
            disPlay();
          }
        })
      }
    }
  }
  return {play, board};
})(document);
window.addEventListener("load", function(){
  Game.play();
})