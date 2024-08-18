function Position(x, y){
  this.x = x;
  this.y = y;
}
function Player(name, token){
  let position = new Position(0, 0);
  let getPosition = function(){
    return (new Position(position.x, position.y));
  }
  let manualPlay = function(board){
    position.x = prompt("row?");
    position.y = prompt("collumn?");
    board[position.x][position.y] = token;
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
    let move = Math.round(Math.random()*totalEmptyCells);
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
            console.log(i, u);
          }
        }
      }
    }
  }
  let play = function(board){
    if (name !== "com")
    {
      manualPlay(board);
    }
    else
    {
      autoPlay(board);
    }
  }
  return {name, token, play, getPosition};
}

let Game = (function(){
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
        && ratio === Math.abs((pos.x+i)%range-(pos.y+range-i)%range);
    };
    return collumn.status || row.status || slash.status || backslash.status;
  }
  function disPlay(){
    console.table(board);
  }
  function play(){
    let player1  = Player("player1", "x");
    let player2 = Player("com", "o");
    let turn = null;
    draw();
    do
    {
      turn = (turn === player1)?player2:player1;
      if (isFull())
      {
        console.log(`It's a tie!!!`);
        return;
      }
      turn.play(board);
      disPlay();
    }
    while (!winCheck(turn.getPosition()));
    console.log(`${turn.name} win!!!`);
  }
  return {play, board};
})();
