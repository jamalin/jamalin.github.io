---
layout: post
title: Bilateral Guided Upsampling
category: [computational photography]
tags: [bilateral, filter, image-processing]
date: 2024-11-29 00:30:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<div class="info-div">
Some image processing operations requires heavy computations which is not adequate for consumer products where we desire immediate feedback. What if we can process the images at a lower resolution then map the operation back, significantly reducing computation? This paper describes a method to do so.
</div>

![Figure]({{"assets/images/電腦視覺/Pasted image 20240926160049.png"|center|relative_url}})
**Figure 1.** The steps involved: a) downsample hi-res to lo-res, b) apply operator to lo-res, c) fit the lo-res pair to bilateral space, and lastly d) fit the hi-res output.

## Premise
---
#### Affine Model
![Figure]({{"assets/images/電腦視覺/Pasted image 20241102133457.png"|center|relative_url}})
**Figure 2.** Comparison of patch size, box color corresponds to the regions shown in the image.

<div class="info-div">
<mark>Affine model approximates the input / output relationship</mark> well at small scales. In the figure above it shows the approximation for three scales. The red box is 128 x 128. As the scale grows, the relationship deviates.
</div>

<div class="echo-div">
The 3D array can be treated as a type of bilateral grid that stores affine models instead of colors. Given any input position and intensity, we can trilinearly interpolate into it to retrieve an appropriate affine model that will tell us the output intensity.
</div>
-*Bilateral Guided Upsampling* p03

<div class="echo-div">
To handle color inputs and outputs, we could use a 5D bilateral grid, which stores a 3x4 affine matrix from input to output color at each (x, y, r, g, b) cell. However, this space is too large ...
We use a 3D grid, where the z coordinate corresponds to luminance, but within each cell, we store a 3x4 affine matrix (1x4 for operators that map color to gray).
</div>
-*Bilateral Guided Upsampling* p03
###### gray to gray
$1 \times 2 \ \textrm{matrix}$
###### color to gray
$1 \times 4 \ \textrm{matrix}$
###### color to color
$3 \times 4 \ \textrm{matrix}$

<div class="note-div">
Same as bilateral grid, map RGB to I to find z. At (x, y, z) the cell stores a corresponding 3x4 affine model. The paper use the mapping 0.25 x R + 0.50 x G + 0.25 B.
</div>

## Global Optimization
---
![Figure]({{"assets/images/電腦視覺/Pasted image 20240926124105.png"|center|relative_url}})

**Data Term**
- ensures affine model accurately reproduce the low-resolution output image

**Smoothness Term**
- encourages affine model to vary smoothly across both spatial dimension $(x, y)$ and intensity $z$
- prevents introduction of artifacts (e.g., false edges or noise amplification)
- $\lambda_x, \lambda_y, \lambda_z = 1, 1, 4 \times 10\mathbf{E}\neg{6}$

<div class="echo-div">
<b>&gamma;</b> collects all the unknowns into a w x h x d x 3 x 4 element vector, <b>S</b><sup>T</sup> is the slicing matrix incorporating trilinear interpolation, and <b>A</b> is the matrix that applies the per-pixel 3x4 matrix to each input pixel. <b>&beta;</b> is the low-resolution output image we seek to match. Note that <b>S</b><sup>T</sup> depends on the low-resolution input luminance, and <b>A</b> is simply the low-resolution input image replicated and reshaped to left-multiply each color transform.
</div>
-*Bilateral Guided Upsampling* p04

Solvable by Linear Least Squares but **slow** so the authors proposed the approximation below.

## Fast Approximation
---
The procedure is similar to that of the bilateral grid following **splat, blur, and slice** stages.

<mark>Breakdown the problem to many smaller overlapping ones</mark> $\rightarrow$ affine model per cell

$\beta, \alpha$ are the output and input RGB values at pixel $i$

$$\beta = M \alpha \rightarrow \begin{bmatrix} \beta_{1i} \\ \beta_{2i} \\ \beta_{3i} \end{bmatrix} = M \begin{bmatrix} \alpha_{1i} \\ \alpha_{2i} \\ \alpha_{3i} \\ 1 \end{bmatrix}$$

$M$ is the unknown (i.e., the affine model) which we solve by

$$M \alpha \alpha^T = \beta \alpha^T$$

$\alpha \alpha^T$ is known as the Gram matrix

#### Splat
- Iterate through $(x, y)$ and accumulate $\alpha \alpha^T$ and $\beta \alpha^T$ into the corresponding $z$
- There will be 22 distinct values: 10 from $\alpha \alpha^T$ and 12 from $\beta\alpha^T$

$$\alpha \alpha^T =
\begin{bmatrix}
\alpha_1 \alpha_1 & \alpha_1 \alpha_2 & \alpha_1 \alpha_3 & \alpha_1 \\
\alpha_2 \alpha_1 & \alpha_2 \alpha_2 & \alpha_2 \alpha_3 & \alpha_2 \\
\alpha_3 \alpha_1 & \alpha_3 \alpha_2 & \alpha_3 \alpha_3 & \alpha_3 \\
\alpha_1 & \alpha_2 & \alpha_3 & 1 \\
\end{bmatrix}
$$

We just need to keep track of either upper or lower triangle of the matrix.

$$\beta \alpha^T =
\begin{bmatrix}
\beta_1 \alpha_1 & \beta_1 \alpha_2 & \beta_1 \alpha_3 & \beta_1 \\
\beta_2 \alpha_1 & \beta_2 \alpha_2 & \beta_2 \alpha_3 & \beta_2 \\
\beta_3 \alpha_1 & \beta_3 \alpha_2 & \beta_3 \alpha_3 & \beta_3 \\
\end{bmatrix}
$$

Keep all values here

#### Blur
- Enforce smoothness by blurring across $(x, y, z)$ with a 7-tap separable filter
- The kernel has to have a strong central lobe: the paper used the formula  $1 / (r + 1)^3$
- This turns independent least squares problems to overlapping ones

<div class="echo-div">
Some cells may still be <b>under-constrained</b> after this inpainting. We therefore instead solve a modified system where <b>under-constrained</b> cells degrade towrards <b>&gamma;</b>, a robust ratio between the average output luminance and the average input luminance over the pixels that contributed to the cell:
</div>
-*Bilateral Guided Upsampling* p05

$$M (\alpha \alpha^T + \lambda I) = \beta \alpha^T + \gamma (\lambda I)$$

$\lambda = 10^{-6} ((\alpha \alpha^T)_{44} + 1)$ 

<div class="note-div">
Recall &alpha;<sub>4i</sub> = 1, so each time we accumulate (&alpha;&alpha;<sup>T</sup>)<sub>44</sub> is just counting. This is analogous to the homogenous term that we divide by for bilateral grid.
</div>
<br>
What is $\gamma$ here?
<div class="note-div">
The idea is that in the absence of sufficient data (in under-constrained cells) to determine the precise affine transformation, a reasonable assumption is that the output luminance should be roughly proportional to the the input luminance.
</div>

Regularization by pushing towards average gain

$\textrm{gain = average output luminance / average input luminance}$

$$
\gamma =
\begin{bmatrix}
gain & 0 & 0 & 0 \\
0 & gain & 0 & 0 \\
0 & 0 & gain & 0 \\
0 & 0 & 0 & gain \\
\end{bmatrix}
$$

These are readily available from the <mark>last column</mark> of the matrices defined in the **splat** section.

#### Slice
- With the high-resolution input as a guidance image, **trilinear interpolate** the output

<div class="note-div">
This is the most exhaustive stage of the algorithm. For a 2560x1536 image, it typically takes over 10 seconds on my system. Whilst both <b>splat</b> and <b>slice</b> only takes a fraction of a second. I've implemented interpolation using shader on the gpu and that takes roughly 0.2 s.
</div>

## Implementation
---
Default parameters
- 8x downsampling between *hi-res* and *lo-res*
- 8 intensity bins
- 16x16 spatial bins in the low-resolution inputs
- $\lambda = 1\mathbf{E}\neg3$ and $\epsilon = 1\mathbf{E}\neg1$
	- $\epsilon$ is  a regularization term used in calculating the *gain*

H and W are height and stride of the *lo-res* image
- create a grid of size H/16 x W/16 x 8 cells
- each cell stores a 3x4 affine matrix
<br>
<div class="note-div">
Comparison of the approach and running <b>CLAHE</b> at original resolution. <b>CLAHE</b> isn't really computational heavy but easy to implement :)
</div>
<br>
![Figure]({{"assets/images/電腦視覺/Pasted image 20241128235836.png"|center|relative_url}})
**Figure 3.** *hi-res* source and fitted *hi-res* output

![Figure]({{"assets/images/電腦視覺/Pasted image 20241129000006.png"|center|relative_url}})
**Figure 4.** comparison of CLAHE at *hi-res* and fitted *hi-res* output

<div class="note-div">
Clearly, running the operation at high-resolution, there is more contrast. If we viewed the image at original size, we would also see a lot of noise in the background. The fitted version however is much smoother in the background. This would need more investigation in the future, as I've only used default parameters.
</div>

## Reference
---
*Bilateral Guided Upsampling*<br>
Jiawen Chen, Andrew Adams, Neal Wadhwa, and Samuel W. Hasinoff
<br><br>
*Real-time Edge-Aware Image Processing with the Bilateral Grid*<br>
Jiawen Chen, Sylvain Paris, and Fredo Durand