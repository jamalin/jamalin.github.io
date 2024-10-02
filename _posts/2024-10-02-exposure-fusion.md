---
layout: post
title: Exposure Fusion
category: [computational photography]
tags: [fusion, hdr]
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

![Figure]({{"assets/images/電腦視覺/Pasted image 20240724194354.png"|center|relative_url}})
<div class="info-div">
Given an exposure sequence as shown above, <b>exposure fusion</b> is a technique to combine the desired portion from each image. For example, in the normal exposure (shown in the middle) we fixed the saturated region by combining the information from the lower exposure (shown on the left). Basically what we are doing is HDR merging in the pixel domain instead of the radiance domain. Since only merging is involve, no calibration nor tonemapping is involved.
</div>
![Figure]({{"assets/images/電腦視覺/Pasted image 20240724201057.png"|center|relative_url}})

## Metrics
---
![Figure]({{"assets/images/電腦視覺/Pasted image 20240724200212.png"|center|relative_url}})

<div class="note-div">
<b>Contrast</b><br>
<ul>
<li>apply Laplacian filter to the luminance of each exposure</li>
<li>take the absolute value of the response</li>
<li>normalized to range [0, 1] for illustration</li>
</ul>
</div>

![Figure]({{"assets/images/電腦視覺/Pasted image 20240724195914.png"|center|relative_url}})

<div class="note-div">
<b>Saturation</b><br>
<ul>
<li>several ways to obtain this</li>
<li>here we convert RGB to HSV and take the S channel</li>
<li>normalized to range [0, 1] for illustration</li>
</ul>
</div>

![Figure]({{"assets/images/電腦視覺/Pasted image 20240724201324.png"|center|relative_url}})

<div class="note-div">
<b>Well-exposedness</b><br>
<ul>
<li>apply a lookup based on the Gaussian distribution to the luminance of each exposure</li>
<li>could also devise separate lookups for different exposures</li>
</ul>
</div>

$$\text{Gaussian} = \textbf{exp}(-\frac{(i - 0.5)^2}{2 \sigma^2})$$

<div class="info-div">
For each exposure, we denote by <i>k</i> in the formula below, obtain three weight maps according to the defined measures. Merge the weight maps. We could choose to strengthen or weaken certain measures by adjusting the associated &#x3C9; parameter.
</div>

\$$W_{ij,k} = (C_{ij,k})^{\omega_C} \times (S_{ij,k})^{\omega_S} \times (E_{ij,k})^{\omega_E}$$

<div class="info-div">
At each pixel location <i>i,j</i> we need the weights (across exposures) to sum to 1. Normalize them accordingly below.
</div>

\$$\hat{W}_{ij,k} = \left[\sum_{k'=1}^{N} W_{ij,k'}\right]^{-1} W_{ij,k}$$

![Figure]({{"assets/images/電腦視覺/Pasted image 20240724201345.png"|center|relative_url}})

<div class="info-div">
Final weight maps. Brighter pixels indicate more emphasis.<br><br>
Blend each exposure <i>k</i> with corresponding weights. Sum them and we have the fusion result.
</div>

\$$R_{ij} = \sum_{k=1}^{N} \hat{W}_{ij,k}I_{ij,k}$$

## Multi-resolution Blending
---
<div class="info-div">
Naive blending will produce seams where there are sharp variations in weight maps. The authors proposed to use multi-resolution blending. Exposures are decomposed to Laplacian pyramids and the weights are decomposed to Gaussian pyramids.
</div>

![Figure]({{"assets/images/電腦視覺/Pasted image 20240724220608.png"|center|relative_url}})

## Reference
---
*Exposure Fusion*<br>
Tom Mertens, Jan Kautz, and Frank Van Reeth