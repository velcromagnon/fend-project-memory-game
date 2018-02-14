/*
 * Create a list that holds all of your cards
 */

// List of all image types
const images = ['fa-star', 'fa-diamond', 'fa-paper-plane-o', 'fa-bolt', 'fa-anchor', 'fa-leaf', 'fa-bomb', 'fa-bicycle'];

// How we define a card.
class Card {
  constructor(image, state) {
    this.image = image;
    this.state = state;
  }
}

let openCards = [];

// Main game functionality.
let game = function() {

  let busy = false; // Make sure a 3rd card cannot be clicked (for mismatches)

  let cards = []; // List of matched cards.

  let numberOfMoves = 0;

  let timerInterval = null; // Need to control when the timer starts and stops.

  let secondsElapsed = 0;
  let firstMoveMade = false;

  let initializeCards = function()
  {
    for (i = 0; i < 16; i++)
    {
      let c = new Card(images[i % 8], 'hidden');
      cards[i] = c;
    }
  };

  /*
   * Display the cards on the page
   *   - shuffle the list of cards using the provided "shuffle" method below
   *   - loop through each card and create its HTML
   *   - add each card's HTML to the page
   */
  let displayCards = function() {
    let html = '';
    for (i = 0; i < cards.length; i++)
    {
      html += '<li class="flip-container">';
      html +=   '<div class="flipper">';
      html +=     '<div class="front card"></div>';
      html +=     '<div class="back card fa ' + cards[i].image + '"></div>';
      html +=   '</div>';
      html += '</li>';
    }

    let deck = window.document.getElementById('deck');
    deck.innerHTML = html;

    // attach click event handlers
    let gridCards = deck.getElementsByTagName('li');
    for (i = 0; i < cards.length; i++) {
      gridCards[i].addEventListener('click', clickCard, false);
    }
  };

  // Shuffle function from http://stackoverflow.com/a/2450976
  let shuffle = function(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    };

    return array;
  };

  // Handle clicks, ensure that only unmatched cards can be clicked, and no more than 3.
  let clickCard = function() {
    // If match attempt in progress, try again.
    if (busy === true)
      return;
    // Cannot click an already matched card.
    let card = this.children[0].children[1];
    if (card.classList.contains('match'))
      return; // Already found.

    // Now we are safe to add the flip animation to the card.
    this.classList.add('flipped');

    if (openCards.length % 2 == 0) { // First of two cards
      if (!firstMoveMade) {
         timerInterval = setInterval(updateTimer, 1000);
         firstMoveMade = true; // Start timer when the first move is made.
      }
      openCards.push(this);
    }
    else if (this != openCards[openCards.length-1]) { // If they are the same card, ignore the click
      // Here they are different, now get the card images
      openCards.push(this);
      let first = openCards[openCards.length-2];
      let second = openCards[openCards.length-1];
      let match = doCardsMatch(first, second);
      DisplayMoves(++numberOfMoves);
      if (match)
        matched(first, second);
      else
        unmatched(first, second);

      UpdateScore();
    }
  };

  // Update score based on number of attempts. Max 16 for 3 star and 24 for 2 star.
  let UpdateScore = function()
  {
    const stars = getStarRating();

    let html = "";
    for (i = 0; i < stars; i++) {
      html += '<li><i class="fa fa-star"></i></li>';
    }
    document.getElementsByClassName('stars')[0].innerHTML = html;
  };

  // Get star rating based on number of moves.
  let getStarRating = function()
  {
    let stars = 3;
    if (numberOfMoves > 16)
      stars = 2;
    if (numberOfMoves > 24)
      stars = 1;
    return stars;
  }

  // Display the number of moves and keep accurate grammar!
  let DisplayMoves = function (numMoves) {
    document.getElementsByClassName("moves")[0].innerHTML = numberOfMoves.toString();
    if (numberOfMoves == 1)
      document.getElementsByClassName("movesText")[0].innerHTML = 'Move';
    else
      document.getElementsByClassName("movesText")[0].innerHTML = 'Moves';
  }

  // Returns true if the two cards have matching symbols.
  let doCardsMatch = function(firstCard, secondCard)
  {
    firstImage = getImage(firstCard);
    secondImage = getImage(secondCard);
    return (firstImage === secondImage);
  };

  // Returns the image for a card (it's used in multiple places)
  let getImage = function(card)
  {
    var image = card.children[0].children[1].classList[3];
    return image;
  };

  // Handler for two cards that don't match
  let unmatched = function(first, second) {
    const firstCard = first.children[0].children[1];
    const secondCard = second.children[0].children[1];
    // Add wobble effect
    first.classList.add('wobble', 'animated');
    second.classList.add('wobble', 'animated');
    // Set colors for mismatch
    firstCard.classList.add('mismatch');
    secondCard.classList.add('mismatch');
    busy = true;

    // Remove wobble effect after a second, go back to base state.
    setTimeout(function() {
      // Set both cards back to unselected status
      first.classList.remove('wobble', 'animated');
      second.classList.remove('wobble', 'animated');
      first.classList.remove('flipped');
      second.classList.remove('flipped');
      // Cards remain red when flip is happening.
      setTimeout(function() {
        // Remove red color and remove cards from list.
        firstCard.classList.remove('mismatch');
        secondCard.classList.remove('mismatch');
        openCards.pop();
        openCards.pop();
        // Wait to be able to click.
        busy = false;
      }, 600);
    }, 1000);
  };

  // Handle the state when both cards match.
  let matched = function(first, second) {
    const firstCard = first.children[0].children[1];
    const secondCard = second.children[0].children[1];
    // Add wobble effect
    first.classList.add('rubberBand', 'animated');
    second.classList.add('rubberBand', 'animated');
    // Set colors for match
    firstCard.classList.add('match');
    secondCard.classList.add('match');

    // Remove wobble effect after a second
    setTimeout(function() {
      // Set both cards now to succesfully found and retain in list.
      lockCardsInPlace(first, second);
      first.classList.remove('rubberBand', 'animated');
      second.classList.remove('rubberBand', 'animated');
      // Show win screen, needs to be here and not after, so the last animation displays.
      if (openCards.length == 16)
      {
        showWinScreen();
      }
    }, 1000);
  };

  // Display win screen when the user has made all matches.
  let showWinScreen = function() {
    const winScreen = window.document.getElementById('win-screen');
    winScreen.classList.add('overlay');
    document.getElementById('win-screen').style.width = '100%';
    winScreen.style.display = 'block';
    let winHtml = '<div class="overlay-content">';
    const demeanor = getDemeanor();
    const starRating = getStarRating();
    if (demeanor == 'normal') {
      winHtml += '<h1>You\'ve won!</h1>';
      winScreen.classList.remove('angelic');
      winScreen.classList.remove('demonic');
    }
    else if (demeanor == 'angelic') {
      winHtml += getAngelicMessage(starRating);
      winScreen.classList.add('angelic');
      winScreen.classList.remove('demonic');
    }
    else {
      winHtml += getDemonicMessage(starRating);
      winScreen.classList.add('demonic');
      winScreen.classList.remove('angelic');
    }

    winHtml += '<div>You used ' + numberOfMoves + ' moves and got a ' + starRating + ' star rating</div>';
    // Get time from window
    const timeString = document.getElementById('timer').innerHTML;
    const timeSeparated = timeString.split(":");
    const hours = parseInt(timeSeparated[0]);
    const minutes = parseInt(timeSeparated[1]);
    const seconds = parseInt(timeSeparated[2]);
    winHtml += '<div>It took you ' + hours + ' hours, ' + minutes + ' minutes, and ' + seconds + ' seconds.</div>';

    winHtml += '<button class="replay"> Play again? </button>';
    winHtml += '</div>'
    winScreen.innerHTML = winHtml;
    document.getElementsByClassName('replay')[0].addEventListener('click', restart, false);
  }

  // Display a 'nice' message.
  let getAngelicMessage = function(starRating) {
    let html = '<h1>';
    let messages =
      [['You had the worst luck ever', 'I\'m sure you\'ll get it next time', 'Well, bless your heart!', 'I know you can do it!', 'Don\'t let anyone slow you down!'],
       ['You should be proud of this win!', 'Great, but you can do even better!', 'You have the power to learn!', 'Never give up!', 'I enjoy playing with you'],
       ['Amazing performance!', 'I\'ve never seen anyone so smart!', 'You must have been your class valedictorian!', 'Genius beyond compare!', 'This game is not worthy of you!']];
    let whichMessage = Math.floor(Math.random() * 5);
    html += messages[starRating-1][whichMessage];
    html += '</h1>';
    return html;
  }

  // Display an 'evil' message.
  let getDemonicMessage = function(starRating) {
    let html = '<h1>';
    let messages =
      [['Were you dropped on your head as a baby?', 'Fetal Alcohol Syndrome, anyone?', 'I never knew an IQ could be negative!', 'Hahahahahaha, you\'re amusing!', 'Move to Texas. "Lone Star" fits you!'],
       ['I know it could be worse, I just don\'t see how', 'Keep trying, you\'ll get one star next', 'Are you guessing randomly?', 'Shakespearean Monkeys must have helped you', 'This game is for the sighted, you know!'],
       ['Incredibly lucky!', 'You hacked into the developer\'s computer!', 'Such blatant cheating!', 'You? You got 3 stars!?!', 'Curses!']];
    let whichMessage = Math.floor(Math.random() * 5);
    html += messages[starRating-1][whichMessage];
    html += '</h1>';
    return html;
  }

  // Determine how nice we will be with our messages!
  let getDemeanor = function() {
    var radios = document.getElementsByName('demeanor');

    if (radios[0].checked)
      return 'normal';
    else if (radios[1].checked)
      return 'angelic';
    else
      return 'demonic';
  };

  let changeGradient = function() {
    console.log("HIHIHI");
    var radios = document.getElementsByName('demeanor');
    console.log(radios);
    if (radios[0].checked) {
      document.getElementById('deck').classList.remove('angelic');
      document.getElementById('deck').classList.remove('demonic');
    }
    else if (radios[1].checked) {
      document.getElementById('deck').classList.add('angelic');
      document.getElementById('deck').classList.remove('demonic');
    }
    else {
      document.getElementById('deck').classList.remove('angelic');
      document.getElementById('deck').classList.add('demonic');
    }
  };

  let hideWinScreen = function() {
    document.getElementById('win-screen').style.width = '0';
  };

  // Set the cards to indicate that they are successfully matched and cannot be selected again.
  let lockCardsInPlace = function(first, second) {
    const firstCard = first.children[0].children[1];
    const secondCard = second.children[0].children[1];
    firstCard.classList.add('match');
    secondCard.classList.add('match');
  };

  let updateTimer = function() {
    secondsElapsed++;

    // Calculate hours, minutes, and seconds and format.
    let tempSeconds = secondsElapsed;
    var seconds = Math.floor(tempSeconds % 60);
    tempSeconds /= 60;
    var minutes = Math.floor(tempSeconds % 60);
    tempSeconds /= 60;
    var hours = Math.floor(tempSeconds % 60);

    // Update the html time padded with zeros
    document.getElementById('timer').innerHTML = padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);
  };

  // pad zeros so time gets displayed properly.
  let padZero = function(number)
  {
    if (number < 10)
      return '0' + number.toString();
    else
      return number.toString();
  }

  // Restart the game.
  let restart = function()
  {
    document.getElementById('timer').innerHTML = '00:00:00';
    clearInterval(timerInterval); // Have to restart timer on next card click.
    init();
    hideWinScreen();
  }

  // Initialize game to new state.
  let init = function() {
    numberOfMoves = 0;
    secondsElapsed = 0;
    firstMoveMade = false;
    openCards = [];
    DisplayMoves(numberOfMoves);
    initializeCards();
    shuffle(cards);
    displayCards();
    UpdateScore(); // Should always be displayed starting at 3 stars.

    // Hook up restart event handler to button.
    const restartButton = document.getElementsByClassName('restart')[0];
    restartButton.addEventListener('click', restart, false);
    const demeanorSelector = document.getElementById("demeanor");
    demeanorSelector.addEventListener('click', changeGradient, false);
  };

  init();
};

game();


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */