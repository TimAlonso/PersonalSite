$(document).ready(function() {

    var $container = $('.bubble-container');

    for (var i = 0; i < 2; i++) {
        $container.append('<div class="bubble"></div>');
    }

    $('bubble-container').each(function() {

        // Randomise the bubble positions (0 - 100%)
        var randomPosition = Math.floor(Math.random() * 101);
        
        // Randomise the time they start rising (0-15s)
        var randomDelay = Math.floor(Math.random() * 16);
        
        // Randomise their speed (3-8s)
        var randomSpeed = 3 + Math.floor(Math.random() * 9);
        
        // Cache the this selector
        var $this = $(this);
        
        // Apply the new styles
        $this.css({
          'left' : randomPosition + '%',
          
          '-webkit-animation-duration' : randomSpeed + 's',
          '-moz-animation-duration' : randomSpeed + 's',
          '-ms-animation-duration' : randomSpeed + 's',
          'animation-duration' : randomSpeed + 's',
          
          '-webkit-animation-delay' : randomDelay + 's',
          '-moz-animation-delay' : randomDelay + 's',
          '-ms-animation-delay' : randomDelay + 's',
          'animation-delay' : randomDelay + 's'
        });

    });

    animateBubbles();

});