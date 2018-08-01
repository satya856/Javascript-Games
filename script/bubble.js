var Game = function(options) {
  this.bubbles = options.bubbles;
  this.bubblesArr = [];
  this.score = 0;
  this.duration = options.duration;
  
  this.start = function() {
    
    setTimeout(function() {
      this.finish();
    }, this.duration);
    
    for (i = 0; i < this.bubbles; i++) {
      // Wait random amount of time between creating bubbles
      setTimeout(function() {
        var newBubble = new Bubble();
        newBubble.blow();
      }, Math.floor(Math.random() * this.duration - 15000) + 0);
    };
    //Set countdown timer from 16 seconds 
    var seconds_left = this.duration / 1000;
    var interval = setInterval(function() {
      $('#timer_div').html(--seconds_left);

      if (seconds_left <= 0) {
        $('#timer_div').html("GAME OVER");
          clearInterval(interval);
          $('#create').html('Play again?');
          $('#create').show();
      }
    }, 1000);
  };

  this.finish = function() {
    $('#create').html('Play again?');
    $('#create').show();
  };
  
};

//click to start the game and create new bubbles
$('#create').click(function() {
  game.start();
    $('#create').hide();
    $('#timer_div').html("&nbsp;");
})

// Defines what a bubble is
function Bubble(left, top) {
  this.id = game.bubblesArr.length;

  //Animate this bubble
  this.animate = function() {
    $("#bubble-" + this.id).animate({
      top: -90,
    }, Math.floor(Math.random() * 20000) + 1000, "linear")
  }

  this.blow = function() {

    // This function is going to add the bubble to the page
    $('#container').append('<div class="bubble" id="bubble-' + this.id + '"></div>');
    
    game.bubblesArr.push(this);

    $('#bubble-' + this.id).click(function() {
      var num = this.id.replace('bubble-', '');
      game.bubblesArr[num].pop();
    });

    // Randomise the size and position
    var pageWidth = $(document).width();
    $('#bubble-' + this.id).css("left", Math.floor(Math.random() * pageWidth / 100 * 70) + 20);
    var size = Math.floor(Math.random() * 60) + 20 + "px";
    $('#bubble-' + this.id).css("width", size);
    $('#bubble-' + this.id).css("height", size);

    this.animate();
  }

  this.pop = function() {
    $('#bubble-' + this.id).hide();
    game.score++;
    $('#score').html('Score : ' + game.score);
  }
}

var game = new Game({
  bubbles: 50,
  duration: 19000
});