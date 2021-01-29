import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={'square' + (props.isWinner ? ' highlight' : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

// 

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square 
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWinner={this.props.winner.includes(i)}
      />
    );
  }

  render() {
    const cells = (rowNum) => 
      [...Array(3).keys()].map((j) => this.renderSquare((rowNum * 3) + j));

    const rows = [...Array(3).keys()].map((rowNum) =>
      <div className="board-row" key={'row' + rowNum}>
        {cells(rowNum)}
      </div>
    );

    return (
      <div>
      <div>{this.state}</div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.state.winner) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    fetch("https://b3ocryhgu0.execute-api.us-east-2.amazonaws.com/default/calculateWinner?squares=" + JSON.stringify(squares))
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            history: history.concat([{
              squares: squares,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            winner: result
          });
        }
      )
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (this.state.winner) {
      status = 'Winner: ' + current.squares[this.state.winner[0]];
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winner={this.state.winner || []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        <div>{this.state.date}</div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
