// Global Vars
let width = 224,
    height = 224,
    filter = 'none',
    streaming = false;

// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

// Global Var
var ctx = canvas.getContext('2d');
var data = [];
var timer;
var startStopFlag=null;

// Get media stream
navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(function(stream) {
    // Link to the video source
    video.srcObject = stream;
    // Play video
    video.play();
  })
  .catch(function(err) {
    console.log(`Error: ${err}`);
  });

  // Play when ready
  video.addEventListener('canplay', function(e) {
    if(!streaming) {
      // Set video / canvas height
      height = video.videoHeight / (video.videoWidth / width);

      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);

      streaming = true;
    }
  }, false);

upButton.addEventListener("click", function(e){startStop(e)});
downButton.addEventListener("click", function(e){startStop(e)});
leftButton.addEventListener("click", function(e){startStop(e)});
rightButton.addEventListener("click", function(e){startStop(e)});

// Take picture from canvas
  function takePicture(label) {
    // Create canvas
    const context = canvas.getContext('2d');
    if(width && height) {
      // set canvas props
      canvas.width = width;
      canvas.height = height;
      // Draw an image of the video on the canvas
      // fill horizontally
      var hRatio = (canvas.width / video.videoWidth) * video.videoHeight;
      ctx.drawImage(video, 0,0, canvas.width, hRatio);

      // Create image from the canvas
      const imgUrl = canvas.toDataURL('image/png');

      // Create img element
      const img = document.createElement('img');

      // Set img src
      img.setAttribute('src', imgUrl);


      // Add image to data
      data.push({"x":{"filepath":imgUrl},"y":{"label":label}});
      // Add image to photos
      photos.appendChild(img);
    }
  }

  video.addEventListener('play', function () {
    var $this = this; //cache
    (function loop() {
        if (!$this.paused && !$this.ended) {
            var hRatio = (canvas.width / video.videoWidth) * video.videoHeight;
            ctx.drawImage($this, 0,0, canvas.width, hRatio);
            setTimeout(loop, 1000 / 20); // drawing at 20fps
        }
    })();
}, 0);

function Start(e){
    (function loop() {
        if (!video.paused && !video.ended ) {

            takePicture(e.target.id);
            timer = setTimeout(loop, 1000 / 20); // drawing at 20fps
        }
    })();
    startStopFlag=1;
    e.target.value = "Stop";
    e.target.innerText="stop";
    var elems = document.getElementsByClassName("label");
    for(var i = 0; i < elems.length; i++) {
        if(elems[i] !=e.target){
            elems[i].disabled = true;
        } 
        
    }
}

function Stop(e){
    clearTimeout(timer);
    e.target.value = "Start";
    e.target.innerText=e.target.id;
    var elems = document.getElementsByClassName("label");
    for(var i = 0; i < elems.length; i++) {
        elems[i].disabled = false;
    }
    startStopFlag=null;

}

startStop = function(e){
  if(startStopFlag != null){
      Stop(e);
  } else {
      Start(e);
  }
}