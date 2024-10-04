---
layout: post
title: Bilateral Grid
category: [computational photography]
tags: [bilateral, filter, image-processing]
date: 2024-10-04 22:42:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<div class="info-div">
The bilateral grid is a three dimensional space <b>(i, j, k)</b>, where <b>(i, j)</b> correspond to pixel position in the image, while <b>k</b> corresponds to a reference measure (i.e., image intensity or RGB vector). It is a technique that offer significant speed-up for large bilateral kernels.
</div>

## Premise
---
#### Bilateral Filter
$$\begin{align}
f(I)_p &= \frac{1}{W_p} \sum_{q \in N(p)} g_{\sigma_\text{S}}(||p - q||) g_{\sigma_\text{R}}(|I_p - I_q|) I_q \\
W_p &= \sum_{q \in N(p)} g_{\sigma_\text{S}}(||p - q||) g_{\sigma_\text{R}}(|I_p - I_q|)
\end{align}$$

where $g$ is the [[Gaussian Filter]]
- $\sigma_\text{S} \rightarrow$ **spatial**
	- stronger smoothing further from pixel $p$
- $\sigma_\text{R} \rightarrow$ **range**
	- favor nearby intensities
	- edge-preserving

<div class="note-div">
The range weight prevents pixels on one side of a strong edge from influencing pixels on the other side since they have different values.
</div>

#### Homogeneous Intensity

$$\begin{pmatrix} W_p I_p \\ W_p \end{pmatrix} = \sum_{q \in N(p)} g_{\sigma_\text{S}}(||p - q||) g_{\sigma_\text{R}}(|I_p - I_q|) \begin{pmatrix} W_q I_q \\ W_q \end{pmatrix}$$
but $W_q$ is just 1

<div class="note-div">
In this manner we can derive the normalization factor in the same pass. Final result is just the top term divided by the bottom term.
</div>

## Process
---
Given an image $I$ normalized to $[0, 1]$

![Figure]({{"assets/images/電腦視覺/Pasted image 20241003235733.png"|center|relative_url}})
**Figure 1.** Example of 1-D signal.

#### Initialization
$\Gamma(i, j, k) = (0, 0)$

<div class="note-div">
Each <b>(i, j, k)</b> location stores a N-dimensional vector. In the case of a grayscale image, it is the term (W<sub>q</sub>I, W<sub>q</sub>) presented above. For color image, it will be a 4-D vector.
</div>

#### Splat
Project image onto the bilateral grid

\$$\Gamma([\text{x}/\text{S}_\text{S}], [\text{y}/\text{S}_\text{S}], [I(\text{x},\text{y})/\text{S}_\text{R}]) \mathrel{+}= (I(\text{x},\text{y}), 1)$$ 

- $[\cdot]$ is the closest-integer operator
- note $W_q$ here is explicitly set to $1$

<div class="note-div">
sampling rate
<ul>
<li>S<sub>S</sub> controls the amount of smoothing</li>
<li>S<sub>R</sub> controls the degree of edge preservation</li>
</ul>
</div>

#### Blur
For Bilateral filtering, just apply three 1-D Gaussian filters separately

<div class="note-div">
when we apply the filters, treat each plane as a N-channel image
<ul>
<li><b>(i, j)</b> directions apply the <b>spatial</b> filter</li>
<li><b>k</b> direction apply the <b>range</b> filter</li>
</ul>
</div>

#### Slice
Extract $$M$$ (a 2D map) by accessing the grid at $$(\text{x}/\text{S}_\text{S}, \text{y}/\text{S}_\text{S}, E(\text{x}, \text{y})/\text{S}_\text{R})$$

<div class="note-div">
<ul>
<li><i>E</i> is the reference image or guide</li>
<li>reconstruct <i>M</i> via <b>Trilinear Interpolation</b></li>
<li>depth of <i>M</i> is 2, result is <i>M</i>[0] / <i>M</i>[1]</li>
	<ul>
	<li>recall the section on <b>Homogeneous Intensity</b></li>
	<li>recall the difference if image representation is RGB</li>
	</ul>
</ul>
</div>

#### Trilinear Interpolation
Equivalent to a 3D lookup table

## Application
---
#### Smoothing
![Figure]({{"assets/images/電腦視覺/Pasted image 20240925220745.png"|center|relative_url}})
![Figure]({{"assets/images/電腦視覺/Pasted image 20240928144132.png"|center|relative_url}})
**Figure 2.** Example grayscale and color.

<div class="note-div">
There's actually some trick involve here for processing color. Map RGB to grayscale for the index but store RGB at the node. This works because source and reference are of the same domain. Furthermore, we are only inspecting a local area. Different RGB values might map to the same luminance.
</div>

#### Local Histogram Equalization
![Figure]({{"assets/images/電腦視覺/Pasted image 20240925221042.png"|center|relative_url}})
![Figure]({{"assets/images/電腦視覺/Pasted image 20240928150104.png"|center|relative_url}})
**Figure 3.** Example grayscale and color.

1. splat by $$\Gamma([\text{x}/\text{S}_\text{S}], [\text{y}/\text{S}_\text{S}], [I(\text{x},\text{y})/\text{S}_\text{R}]) \mathrel{+}= 1$$ , each cell is equivalent to a local histogram
2. process box filter along the **spatial** dimensions only
3. perform **histogram equalization** along the **range** dimension
4. splice for reconstruction

## Reference
---
*A Fast Approximation of the Bilateral Filter using a Signal Processing Approach*<br>
Sylvain Paris and Fredo Durand
<br><br>
*Real-time Edge-Aware Image Processing with the Bilateral Grid*<br>
Jiawen Chen, Sylvain Paris, and Fredo Durand