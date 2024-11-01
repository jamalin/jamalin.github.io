---
layout: post
title: Javascript in Jekyll&#58; Image Comparison Tool
category: [programming]
tags: [image-processing, javascript, web]
date: 2024-10-30 23:30:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<script src="{{ site.baseurl }}/assets/scripts/simple.compare.tool.js"></script>

<div class="info-div">
Usually, when we compare two images, we inspect them side-by-side. Some tools offer to compare the images via a toggle or slider method. I have implemented them below. This is my beginner's exploration into <b>javascript</b> and html <b>canvas</b> with <b>Jekyll</b>.
</div>

## Implementation
---
#### Method1: Toggle
<section id="sandbox1" style="width:100%; display:inline-flex;">
	<div style="width:75%;">
		<canvas class="canvas" style="border:1px solid #000000;">
		your browser does not seem to support HTML canvas
		</canvas>
	</div>
	<div style="width:25%;">
		<form>
			<fieldset>
				<legend style="font-weight:bold; font-size:smaller;">select an image</legend>
				<input type="radio" id="image1" name="radiogroup" value="1" checked />
				<label for="image1">image 1</label>
				<br>
				<input type="radio" id="image2" name="radiogroup" value="2" />
				<label for="image2">image 2</label>
			</fieldset>
		</form>
	</div>
</section>

<div class="info-div">
Press down / up on the image to interact.
</div>

#### Method2: Slider
<section id="sandbox2" style="width:100%; display:inline-flex;">
	<div style="width:75%;">
		<canvas class="canvas" style="border:1px solid #000000;">
		your browser does not seem to support HTML canvas
		</canvas>
	</div>
	<div style="width:25%;">
		<form>
			<fieldset>
				<legend style="font-weight:bold; font-size:smaller;">select an image</legend>
				<input type="radio" id="image1" name="radiogroup" value="1" checked />
				<label for="image1">image 1</label>
				<br>
				<input type="radio" id="image2" name="radiogroup" value="2" />
				<label for="image2">image 2</label>
			</fieldset>
		</form>
	</div>
</section>

<div class="info-div">
Move the mouse around the image to interact.
</div>

<br>

<div class="note-div">
At first I thought about alpha blending, which might have ended up requiring more work. A glimpse at the <b>drawImage</b> function immediately provides us with a quick and easy option. Crop the images accordingly to the <b>x-position</b> of the mouse.
</div>

<br>

```javascript
// background and foreground are preloaded Image objects
// ctx  = 2D context of the canvas
// w, h = canvas width, canvas height

let x = e.offsetX; // mouse position
let y = e.offsetY;

ctx.drawImage(background, 0, 0, x, h, 0, 0, x, h);
ctx.drawImage(foreground, x, 0, w - x, h, x, 0, w - x, h);
```

## TODO
---
<div class="info-div">
Currently communication between the radio group and the canvas is processed explicitly (via global variable). If we were to have a page with multiple of these, the code would be very broken.
</div>