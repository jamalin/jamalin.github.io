const base_url = window.location.origin;
const imageset = [
	"/assets/images/電腦視覺/Pasted image 20241023141949.png",
	"/assets/images/電腦視覺/Pasted image 20241023142005.png",
	"/assets/images/電腦視覺/Pasted image 20241023150504.png",
];

var imageArr = [];
var sandbox1;
var sandbox2;
var canvas1;
var canvas2;

function composite(e) {
	var ctx = e.target.getContext("2d");
	var w = e.target.width;
	var h = e.target.height;

	let x = e.offsetX, y = e.offsetY;
	let k = parseInt(sandbox2.querySelector('input[name="radiogroup"]:checked').value);

	ctx.clearRect(0, 0, w, h);

	// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	// crop from s, draw onto d
	ctx.drawImage(imageArr[0], 0, 0, x, h, 0, 0, x, h);
	ctx.drawImage(imageArr[k], x, 0, w - x, h, x, 0, w - x, h);

	ctx.beginPath(); // clear does not work without this
	ctx.moveTo(x, 0);
	ctx.lineTo(x, h);
	ctx.stroke();
	ctx.closePath();
}

window.onload=function() {
	// populate image list
	for (var i = 0; i < imageset.length; i++) {
		buffer = new Image();
		buffer.src = base_url + imageset[i];
		imageArr.push(buffer);
	}

	sandbox1 = document.getElementById("sandbox1");
	sandbox2 = document.getElementById("sandbox2");

	canvas1 = sandbox1.querySelector(".canvas");
	canvas2 = sandbox2.querySelector(".canvas");
	
	imageArr[0].addEventListener("load", function() {
		canvas1.width  = imageArr[0].width;
		canvas2.width  = imageArr[0].width;
		canvas1.height = imageArr[0].height;
		canvas2.height = imageArr[0].height;

		canvas1.getContext("2d").drawImage(imageArr[0], 0, 0, canvas1.width, canvas1.height);
		canvas2.getContext("2d").drawImage(imageArr[0], 0, 0, canvas2.width, canvas2.height);
	}, false);

	canvas1.addEventListener("mousedown", function() {
		let k = parseInt(sandbox1.querySelector('input[name="radiogroup"]:checked').value);

		this.getContext("2d").drawImage(imageArr[k], 0, 0, this.width, this.height);
	}, false);

	canvas1.addEventListener("mouseup", function() {
		this.getContext("2d").drawImage(imageArr[0], 0, 0, this.width, this.height);
	}, false);

	canvas2.addEventListener("mousemove", composite, false)
}