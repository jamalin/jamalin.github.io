---
layout: post
title: Dark Channel
category: [computational photography]
tags: [dehaze, image-processing]
date: 2024-10-26 23:02:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<div class="info-div">
Image dehazing is a technique to improve visibility from degradation introduced by atmospheric phenomena (i.e., haze or fog). Specifically this research is based on the investigation and exploitation of the <b>dark channel prior</b>.
</div>

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023141949.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023142005.png"|center|relative_url}}) |

**Figure 1.** source image and recovered haze-free image

## Premise
---

$$\mathbf{I}(\text{x}) = \mathbf{J}(\text{x}) \cdot t(\text{x}) + \mathbf{A} \cdot (1 - t(\text{x}))$$

<div class="note-div">
<b>I</b> is the observed intensity (i.e., image). <b>J</b> is the scene radiance. A simple understanding of <b>J</b> is the brightness in the scene before captured and converted to the pixel brightness. <b>A</b> is the global atmospheric light, a constant term. Lastly, <i>t</i> is the transmission map. From the definition above, we see that when <i>t</i> is 1, there is zero influence from <b>A</b>.
</div>

<br>
**Direct Attenuation**
<div class="info-div">
Assuming the atmosphere is homogenous, we define transmission as: <i>t</i>(x) = e<sup>-&beta;<i>d</i>(x)</sup>, where &beta; is the scattering coefficient and <i>d</i> is the scene depth. It should be clear that <b>J</b> is <b>attenuated</b> as <i>d</i> increases. The second term on the right of the equation is also known as <b>airlight</b>.
</div>

#### Dark Channel

<div class="echo-div">
The dark channel prior is based on the following observation on outdoor haze-free images: In most of the nonsky patches, at least one color channel has some pixels whose intensity are very low and close to zero. Equivalently, the minimum intensity in such a patch is close to zero.
</div>
-*Dark Channel Prior* p03

$$J^{\textrm{dark}}(\text{x}) = \underset{\text{y} \in \Omega(\text{x})}{\min} \left( \underset{c \in {R, G, B}}{\min} J^c(\text{y}) \right)$$

For haze-free images, $J^{\textrm{dark}} \rightarrow 0$

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023141949.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023150504.png"|center|relative_url}}) |

**Figure 2.** source and corresponding dark channel

#### Transmission
![Figure]({{"assets/images/電腦視覺/Pasted image 20241023151950.png"|center|relative_url}})

<div class="echo-div">
Geometrically, the haze imaging equation means that in RGB color space, the vectors <b>A</b>, <b>I</b>(x), and <b>J</b>(x) are coplanar and their endpoints are collinear ... The transmission <i>t</i> is the ratio of two line segments.
</div>
-*Dark Channel Prior* p02

$$t(\text{x}) = \frac{\left\| \mathbf{A} - \mathbf{I}(\text{x}) \right\|}{\left\| \mathbf{A} - \mathbf{J}(\text{x}) \right\|} = \frac{A^c -I^c(\text{x})}{A^c - J^c(\text{x})}, \quad c \in \{R, G, B\}$$

<mark>In fact, the scene radiance $J$ is haze-free, which leads to:</mark>

$$\tilde{t}(\text{x}) = 1 - \frac{I^c(\text{x})}{A^c}$$

Furthermore, incorporating the **dark channel prior**

$$\tilde{t}(\text{x}) = 1 - \omega \underset{\text{y} \in \Omega(\text{x})}{\min} \left( \underset{c}{\min} \frac{I^c(\text{y})}{A^c} \right)$$

$\omega$ is included to keep a little haze for distant objects

$\omega = 0.95$ by default for the paper

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023150504.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023155908.png"|center|relative_url}}) |

**Figure 3.** dark channel and corresponding transmission map

#### Atmospheric Light
<div class="info-div">
We need to estimate this to complete the equation for <b>transmission</b>. The authors suggested a method, though simple, works for most cases: "Identify the top 0.1 percent brightest pixels in the dark channel." For the corresponding pixels in <i>I</i> pick the brightest. That will be our <b>A</b>.
</div>

## Solution
---
To recover the scene radiance (i.e., haze-free image)

$$\mathbf{J}(\text{x}) = \frac{\mathbf{I}(\text{x}) - \mathbf{A}}{\max(\tilde{t}(\text{x}), t_0)} + \mathbf{A}$$

the **transmission** is protected by a lower bound $t_0 = 0.1$

**Refinement**
<div class="info-div">
Before we recover the scene radiance we need to process the transmission map. The authors suggested soft matting or guided filtering. The result is compared below.
</div>

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023155908.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023160946.png"|center|relative_url}}) |

**Figure 4.** transmission map and the refined version

## Reference
---
*Guided Image Filtering*<br>
Kaiming He, Jian Sun, and Xiaoou Tang

*Single Image Haze Removal using Dark Channel Prior*<br>
Kaiming He, Jian Sun, and Xiaoou Tang