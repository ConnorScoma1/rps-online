// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBHCoWWp3x4nmH2Th5YeS6VTsOfTL99Ar0",
    authDomain: "rps-online-fbad4.firebaseapp.com",
    databaseURL: "https://rps-online-fbad4.firebaseio.com",
    projectId: "rps-online-fbad4",
    storageBucket: "rps-online-fbad4.appspot.com",
    messagingSenderId: "669051267276",
    appId: "1:669051267276:web:ca154a50e21c6085"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();

  var NUM_PLAYERS = 2;
  // _The root of your game data (consider adding /<unique id>/ if you have multiple game instances)._
  
  var GAME_LOCATION = 'https://rps-online-fbad4.firebaseio.com"';
  // _A location under GAME\_LOCATION that will store the list of players who have joined the game (up to MAX\_PLAYERS)._
  var PLAYERS_LOCATION = 'player_list';
  var PLAYER_DATA_LOCATION = 'player_data';
  // Store scores
  var PLAYER_SCORES_LOCATION = 'player_scores';
  // _Return a persistent user id.  This will be used to assign users the same player data if they refresh._
  function getMyUserId() {
      return prompt('Username?', 'Guest');
  }
  // setRPS is called when a player presses Rock, Paper, or Scissors. It takes a player number, user ID, and either rock, paper, or scissors to set the player's choice.
  function setRPS(myPlayerNumber, myUserId, myRPS) {
  // Create playerDataRef set to the Firebase location of the input player.
      var playerDataRef = new Firebase(GAME_LOCATION).
          child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
  // Change game state to 'picked' and set rock, paper, or scissors.
      playerDataRef.set({userId: myUserId, state: 'picked', rps: myRPS});
  }
  // didYouWin is called after both players have made their selections. It takes your choice and your opponent's choice as arguments.
  function didYouWin(yourRPS, opponentRPS) {
  // Run traditional rock, paper, scissors logic and return whether you won, lost, or had a draw.
      switch(yourRPS) {
      case 'rock':
        switch(opponentRPS) {
              case 'rock':
                  return 'draw';
              case 'paper':
                  return 'lose';
              case 'scissors':
                  return 'win';
          }
        break;
      case 'paper':
          switch(opponentRPS) {
              case 'rock':
                  return 'win';
              case 'paper':
                  return 'draw';
              case 'scissors':
                  return 'lose';
          }
        break;
      case 'scissors':
          switch(opponentRPS) {
              case 'rock':
                  return 'lose';
              case 'paper':
                  return 'win';
              case 'scissors':
                  return 'draw';
          }
          break;
      }
   }
  // _Called after player assignment completes._
  // playGame is called to start the initial game and games after "Play Again" has been pressed by both players. If the game is full, an alert pops up saying you can't join.
  function playGame(myPlayerNumber, myUserId) {
    if (myPlayerNumber === null) {
      alert('Game is full.  Can\'t join. :-(');
    }
  // If there's a spot, join the game and reset the HTML elements.
    else {
        $("#status").empty();
        $("#scoreboard").empty();
        $("#players-list").empty();
        $("#status").css("display", "block");
        $("#players").html("<ul id='players-list'"+
            "style='list-style-type:none'></ul>");
  // Create Firebase data references for your specific player data, all of the player data, and all of the score data. Disconnecting deletes your player data. Score data is persistent.
      var playerDataRef = new Firebase(GAME_LOCATION).
          child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
      var allPlayersDataRef = new Firebase(GAME_LOCATION).
          child(PLAYER_DATA_LOCATION);
      var playerScoresRef = new Firebase(GAME_LOCATION).
          child(PLAYER_SCORES_LOCATION);
  // The opponent player number is set to the opposite of your player number.
      var opponentPlayerNumber = myPlayerNumber === 0 ? 1 : 0;
  // Check if the the player name is new. If it is, add and set their win/loss record to 0, 0. If it's not new, do nothing and use the stored win/loss record.
      playerScoresRef.on('value', function(snapshot) {
        if (snapshot.val() === null) {
          playerScoresRef.child(myUserId).set([0, 0]);
        } else if (!(myUserId in snapshot.val())) {
          playerScoresRef.child(myUserId).set([0, 0]);
        }
      });
  // Remove your player data when you disconnect. There are currently issues with disconnecting after picking but before the opponent has picked.
      playerDataRef.removeOnDisconnect();
  // Set your player data to your user ID, the game state to start, and no selection yet for rock, paper, or scissors.
      playerDataRef.set({userId: myUserId, state: 'start', rps: 'none'});
  // Change the text in the status element to a waiting message while waiting for a second player to join.
      $("#status").html("Waiting for second player...");
  // Every time a value is changed in the player data, this function is run with a snapshot of the player data.
      allPlayersDataRef.on('value', function(snapshot) {
  // Check if both players are in the game by checking their game states.
          if (snapshot.val().length === 2 &&
          snapshot.val()[0].state === 'start' &&
          snapshot.val()[1].state === 'start' ) {
  // Create the rock, paper, scissors buttons. Hide the kids, this is ugly.
              $("#status").html("<input type='button' value='Rock' " +
              "id='button_rock'" + "onclick='setRPS(" + myPlayerNumber +
              ", \"" + myUserId + "\", \"rock\")'/>" +
              "<input type='button' value='Paper' id='button_paper' onclick='setRPS(" +
              myPlayerNumber + ", \"" + myUserId + "\", \"paper\")'/><input type='button'" +
              "value='Scissors' id='button_scissors' onclick='setRPS(" + myPlayerNumber +
              ", \"" + myUserId + "\", \"scissors\")'/>");
          }
      });
  // Take snapshot of player scores when a value changes. Values will change after every game unless it's a draw.
      playerScoresRef.on('value', function(snapshot) {
      // Empty the scoreboard before repopulating.
          $("#scoreboard").empty();
      // Cycle through the player scores snapshot and append a new list item for each player with their wins and losses. This also checks to find your name so it can be highlighted.
          snapshot.forEach(function(childSnapshot) {
              if(childSnapshot.name() === myUserId) {
                  $("#scoreboard").append("<li class='your-score'>" +
                  childSnapshot.name() + ": " + childSnapshot.val()[0]  + " wins, " +
                  childSnapshot.val()[1] + " losses</li>");
              } else {
                  $("#scoreboard").append("<li>" + childSnapshot.name() +
                  ": " + childSnapshot.val()[0]  + " wins, " + childSnapshot.val()[1] +
                  " losses</li>");
              }
          });
      });
  // Run the following function each time a child of the current player data changes.
      allPlayersDataRef.on('child_changed', function(childSnapshot, prevChildName) {
  // Run the following function the first time current player data changes.
        allPlayersDataRef.once('value', function(nameSnapshot) {
  // Set your player information. Set opponent player information. This is done using the snapshot in the function in .once().
          var y = nameSnapshot.val();
          var opponentPlayerNumber = myPlayerNumber === 0 ? 1 : 0;
          var yourRPS = nameSnapshot.val()[myPlayerNumber].rps;
          var opponentRPS = nameSnapshot.val()[opponentPlayerNumber].rps;
  // Check if you have picked and the opponent hasn't. If you've picked, change status text to a waiting message.
          if(yourRPS !== 'none' && opponentRPS === 'none' &&
          nameSnapshot.val()[myPlayerNumber].state === 'picked')  {
              $("#status").css("display", "block");
              $("#status").html("Waiting for second player to pick...");
          }
  // Check if both players have picked.
          if(y[0].rps !== 'none' && y[1].rps !== 'none') {
  // Turn off function that draws the rock, paper, scissors buttons.
              allPlayersDataRef.off('value', function(snapshot) {
                  if (snapshot.val().length === 2) {
  // Clear the status text. Clear the players list. Display your pick and your opponent's pick.
                      $("#status").empty();
                      $("#status").append("<input type='button' " +
                      "value='Rock' id='button_rock' onclick='setRPS(" +
                      myPlayerNumber + ", \"" + myUserId +
                      "\", \"rock\")'/><input type='button' value='Paper' " +
                      "id='button_paper' onclick='setRPS(" +
                      myPlayerNumber + ", \"" + myUserId +
                      "\", \"paper\")'/><input type='button' value='Scissors' " +
                      "id='button_scissors' onclick='setRPS(" + myPlayerNumber +
                      ", \"" + myUserId +
                      "\", \"scissors\")'/>");
                  }
              });
              $("#status").empty();
              $("#players").html("<ul id='players-list' style='list-style-type:none'></ul>");
              $("#players-list").append("<li>You picked: " + yourRPS + "</li>");
              $("#players-list").append("<li>" +
              nameSnapshot.val()[opponentPlayerNumber].userId +
              " picked: " + opponentRPS + "</li>");
  // Call didYouWin() to check if you won or lost.
              $("#players-list").append("<li>You " + didYouWin(yourRPS, opponentRPS) + "!");
  // Empty the scoreboard to prepare to repopulate it with updated scores.
              $("#scoreboard").empty();
  //The first time the player scores change, repopulate the scoreboard.
              playerScoresRef.once('value', function(snapshot) {
  // Cycle through the player scores snapshot using forEach() and append list items to the score board. Again, check to find and highlight your score.
                  snapshot.forEach(function(childSnapshot) {
                      if(childSnapshot.name() === myUserId) {
                          $("#scoreboard").append("<li class='your-score'>" +
                          childSnapshot.name() + ": " + childSnapshot.val()[0]  +
                          " wins, " + childSnapshot.val()[1] + " losses</li>");
                      } else {
                          $("#scoreboard").append("<li>" + childSnapshot.name() +
                          ": " + childSnapshot.val()[0]  + " wins, " +
                          childSnapshot.val()[1] + " losses</li>");
                      }
                  });
              });
  // Initialize variables for your wins and losses. These will be used to increment the persistent player scores data.
              var currentWins,
                  currentLosses;
  // Check if you've picked.
              if (nameSnapshot.val()[myPlayerNumber].state === 'picked') {
  // Run this function when your score has changed. This happens after a game completes.
                  playerScoresRef.child(myUserId).on('value', function(snapshot) {
                    currentWins = snapshot.val()[0];
                    currentLosses = snapshot.val()[1];
                  });
  // Check if you won and increment the wins. If you lost, increment the losses. Draws are not recorded.
                  if(didYouWin(yourRPS, opponentRPS) === 'win') {
                      playerScoresRef.child(myUserId).set([currentWins + 1, currentLosses]);
                  } else if (didYouWin(yourRPS, opponentRPS) === 'lose') {
                      playerScoresRef.child(myUserId).set([currentWins, currentLosses + 1]);
                  }
              }
  // Display a new button to allow you to to play again.
              $("#players-list").append("<input type='button' value='Play Again' " +
              "id='button_restart' onclick='playGame(" + myPlayerNumber +
              ", \"" + myUserId + "\")'/>");
  // Set game state to finished and set rock, paper, or scissors.
              playerDataRef.set({
                  userId: myUserId, 
                  state: 'finished', 
                  rps: yourRPS
                });
          }
        });
      });
    }
  }
  // _Use transaction() to assign a player number, then call playGame()._
  function assignPlayerNumberAndPlayGame() {
    var myUserId = getMyUserId();
    var playerListRef = new Firebase(GAME_LOCATION).
        child(PLAYERS_LOCATION);
      playerListRef.transaction(function(playerList) {
      var i;
  // _Initialize playerList if we need to._
      if (playerList === null) {
        playerList = {};
      }
      var joinedGame = false;
      for(i = 0; i < NUM_PLAYERS; i++) {
        if (playerList[i] === myUserId) {
            alert("Already in the game.");
          return; // _Already in the game. Abort transaction._
        }
        else if (!(i in playerList) && !joinedGame) {
          // _Open spot. Join game_
          playerList[i] = myUserId;
  // _Don't return playerList until after the loop, in case we find out we're already assigned a spot._
          joinedGame = true;
          break;
        }
      }
      if (joinedGame) {
        return playerList;
      }
  // _Couldn't join.  Abort transaction by returning nothing._
    }, function (success, transactionResultSnapshot) {
  // _Transaction has completed.  See if we're in the game._
      var myPlayerNumber = null,
          resultPlayerList = transactionResultSnapshot.val();
      for(var i = 0; i < NUM_PLAYERS; i++) {
        if (resultPlayerList[i] === myUserId) {
  // _I got into the game._
          myPlayerNumber = i;
          break;
        }
      }
      playerListRef.child(myPlayerNumber).removeOnDisconnect();
      playGame(myPlayerNumber, myUserId);
    });
  }
  assignPlayerNumberAndPlayGame();
  