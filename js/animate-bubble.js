$(document).ready(function(){
    animateDiv();
});

function makeNewPosition(){
    
    // Get viewport dimensions (remove the dimension of the div)
    var height = $(window).height() - 50;
    var width = $(window).width() - 50;
    
    var newHeight = Math.floor(Math.random() * height);
    var newWidth = Math.floor(Math.random() * width);
    
    return [newHeight, newWidth];
}

function animateDiv(){
    var newPosition = makeNewPosition();
    $('.bubble').animate({ top: newPosition[0], left: newPosition[1] }, function(){
      animateDiv();        
    });
    
};