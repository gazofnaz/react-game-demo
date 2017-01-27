/**
 * React.js
 *
 * Because maintainable code means fewer paydays for developers
 *
 * 
 */

// Left hand box - target to reach
var StarsFrame = React.createClass({

  render: function() {
    
    var stars = [];
    
    for(var i=0; i<this.props.numberOfStars; i++){
      stars.push(
          <span className="glyphicon glyphicon-star"></span>
        );
    }
    
    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
  }
  
});

// Equals button - check the answer is correct
var ButtonFrame = React.createClass({

  render: function() {
    
    var disabled;
    var button;
    var correct = this.props.correct;
    
    // only render the button if something is selected
    disabled = (this.props.selectedNumbers.length === 0);
    
    // check if the answer is correct using click handler with checkAnswer method
    switch(correct){
      case true:
        button = (
          <button className="btn btn-success btn-large"
                  onClick={this.props.acceptAnswer}><span className="glyphicon glyphicon-ok"></span></button>
        );
        break;
      case false:
        button = (
          <button className="btn btn-danger btn-large"><span className="glyphicon glyphicon-remove"></span></button>
        );
        break;
      default:
        button = (
          <button className="btn btn-primary btn-large" disabled={disabled}
                  onClick={this.props.checkAnswer}>=</button>
        );
    }
    
    return (
      <div id="button-frame">
        {button}
        <br/><br/>
        <button className="btn btn-xs btn-warning" onClick={this.props.redraw} disabled={this.props.redraws === 0}>
          <span className="glyphicon glyphicon-refresh"></span>
          &nbsp;
          {this.props.redraws}
        </button>
      </div>
    );
  }
  
});

// Right hand box
var AnswerFrame = React.createClass({

  render: function() {
    
    var props = this.props;
    var selectedNumbers = props.selectedNumbers.map(function(i){
      return (
        <div className="number" onClick={props.unselectNumber.bind(null,i)}>{i}</div>
      )
    });
    
    return (
      <div id="answer-frame">
        <div className="well">
          {selectedNumbers}  
        </div>
      </div>
    );
  }
  
});

// Available numbers
var NumbersFrame = React.createClass({

  render: function() {
    
    // Print all numbers from 1 to 9
    var numbers = [];
    var className;
    var selectedNumbers = this.props.selectedNumbers;
    var selectedNumber = this.props.selectedNumber;
    var usedNumbers = this.props.usedNumbers;
    
    for(var i=1; i<=9; i++){
      className = "number " + (selectedNumbers.indexOf(i)>=0 ? 'selected ' : '');
      className += (usedNumbers.indexOf(i)>=0 ? 'used' : '');
      
      numbers.push(
        // Bind is a nice trick to prevent calling the method at runtime, and only call it on click
        <div className={className} onClick={selectedNumber.bind(null, i)}>{i}</div>  
      );
    }
    
    return (
      <div id="numbers-frame">
        <div className="well">
          {numbers}
        </div>
      </div>
    );
  }
  
});

// Message to show on completion
var DoneFrame = React.createClass({
  
  render: function() {
    return(
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button className="btn btn-default" onClick={this.props.resetGame}>Play Again</button>
      </div>
    )
  }
  
});

// Main Component
var Game = React.createClass({
  
  // state variables, allows the application to maintain a global state
  getInitialState: function(){
    return {
      selectedNumbers: [],
      numberOfStars: this.randomNumber(),
      usedNumbers: [],
      redraws: 5,
      correct: null,
      doneStatus: null
    };
  },
  
  // reset everything after game over
  resetGame: function(){
    this.replaceState(this.getInitialState());
  },

  // if number is clicked, set the value in selected states variable
  selectedNumber: function(clickedNumber){
    // check number was not already clicked
    // and prevent previously used numbers from being clicked
    if( this.state.selectedNumbers.indexOf(clickedNumber) < 0
        && this.state.usedNumbers.indexOf(clickedNumber) < 0){
      // store new array, reset correct so use can change their answer
      this.setState(
        { 
          selectedNumbers: this.state.selectedNumbers.concat(clickedNumber),
          correct: null
        }
      );  
    }
  },
  
  // ability to untick a number
  unselectNumber: function(clickedNumber){
    
    var selectedNumbers = this.state.selectedNumbers;
    // get pointer to number
    var indexOfNumber = selectedNumbers.indexOf(clickedNumber);
    // remove number from array
    selectedNumbers.splice(indexOfNumber,1);
    // store new array, reset correct so use can change their answer
    this.setState(
      { 
        selectedNumbers: selectedNumbers ,
        correct: null
      }); 
    
  },
  
  // calculate the given answer total
  sumOfSelectedNumbers: function(){
    return this.state.selectedNumbers.reduce(function(p,n){
      return p+n;
    }, 0 )
  },
  
  // check the answer is correct by comparing to the given answer
  checkAnswer: function(){
    var correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState({ correct: correct });
  },

  // separate operation to check answer so the user can make a change and to set numbers as used
  acceptAnswer: function(){
    // set the current crop of numbers to usedNumbers
    var usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    // reset the selectedNumbers array.
    // updated the usedNumbers array.
    // reset correct so the user can continue
    // upload a new number of random stars
    this.setState({
      selectedNumbers: [],
      usedNumbers: usedNumbers,
      correct: null,
      numberOfStars: this.randomNumber()
    }, function(){
      this.updateDoneStatus();
    });
    // second parameter is for a function that can be called after all the states have been updated
  },
  
  // allow user to cheat and get some new numbers
  redraw: function(){
    // only allow redraws if we have some remaining.
    if(this.state.redraws > 0){
      this.setState({
        numberOfStars: this.randomNumber(),
        correct: null,
        selectedNumbers: [],
        redraws: this.state.redraws -1
      }, function(){
        this.updateDoneStatus();
      });
    }
  },
  
  // Method to calculate remaining solutions
  possibleSolutions: function(){
    
    var numberOfStars = this.state.numberOfStars;
    var possibleNumbers = [];
    var usedNumbers = this.state.usedNumbers;
    
    // Ghetto loop through all numbers
    for (var i=1; i<=9; i++){
      if(usedNumbers.indexOf(i) < 0 ){
        // if number has not yet been used, add it to the remaining possible numbers
        possibleNumbers.push(i);
      }
    }
    
    return this.possibleCombinationSum(possibleNumbers, numberOfStars );
    
  },
  
  // copy paste code. js and numbers = fun times
  // https://gist.github.com/samerbuna/aa1f011a6e42d6deba46
  possibleCombinationSum: function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return this.possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize);
    for (var i = 1; i < combinationsCount ; i++ ) {
      var combinationSum = 0;
      for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  },
  
  // Display the final message
  updateDoneStatus: function(){
    // all the numbers got used so you won
    if(this.state.usedNumbers.length === 9 ){
      this.setState({doneStatus: 'You Won!'});
      return; // why?
    }
    // Game is failed
    if(!this.possibleSolutions() && this.state.redraws === 0){
      this.setState({doneStatus: 'Game Over!'});
      return; // why?
    }
  },
  
  // fix reuse of random number code
  randomNumber: function(){
    // random()*9 = 0 to 8.99
    // floor + 1 = 1 to 9
    // javascript + numbers = v.great (actual: ReferenceError)
    return Math.floor( Math.random() * 9 ) + 1;
  },

  render: function() {
    
    var selectedNumbers = this.state.selectedNumbers;
    var numberOfStars = this.state.numberOfStars;
    var usedNumbers = this.state.usedNumbers;
    var redraws = this.state.redraws;
    var correct = this.state.correct;
    var doneStatus = this.state.doneStatus;
    
    // we only display numbers if there is no doneStatus, and only display the status if the game is not finished
    var bottomFrame;
    
    if(doneStatus){
      bottomFrame = <DoneFrame  doneStatus={doneStatus}
                                resetGame={this.resetGame}/>;
    }
    else{
      bottomFrame = <NumbersFrame selectedNumbers={selectedNumbers}
                      selectedNumber={this.selectedNumber}
                      usedNumbers={usedNumbers}/>;
    }
    
    return (
      <div>
        <h1>Play Nine</h1>
        <hr />
        <div className="clearfix">
        
          <StarsFrame numberOfStars={numberOfStars}/>
          
          <ButtonFrame selectedNumbers={selectedNumbers} 
                       correct={correct}
                       checkAnswer={this.checkAnswer}
                       acceptAnswer={this.acceptAnswer}
                       redraw={this.redraw}
                       redraws={redraws}/>
                       
          <AnswerFrame selectedNumbers={selectedNumbers}
                       unselectNumber={this.unselectNumber}/>
                       
        </div>
        
        {bottomFrame}
        
      </div>
    );
  }
  
});

ReactDOM.render(
  <Game />,
  document.getElementById('container')
);
