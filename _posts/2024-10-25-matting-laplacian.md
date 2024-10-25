---
layout: post
title: Matting Laplacian
category: [computational photography]
tags: [image-processing, matting]
date: 2024-10-25 17:42:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<div class="info-div">
Image matting is a technique to isolate or extract a foreground object from an image. To be more precise, <b>accurately</b> isolate or extract. Look at the hair strands of the koala below for example.
</div>

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241022183629.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241022183657.png"|center|relative_url}}) |
| -------------------------------------------- | -------------------------------------------- |
| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023124425.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023124456.png"|center|relative_url}}) |

**Figure 1.** top row: source and user constraints, bottom row: alpha matte and masked result

## Premise
---
The image matting model is given as

$$\mathbf{I}_i = \alpha_i \mathbf{F}_i + (1 - \alpha_i) \mathbf{B}_i \quad \textrm{for} \ i \in \{R,G,B\}$$

<div class="info-div">
where <b>F</b> is the foreground, <b>B</b> is the background, and &alpha; is what's called the <b>opacity</b>. For a binary map where &alpha; is 1, <b>I</b> retains all information from <b>F</b>, otherwise <b>B</b>.
</div>

#### Derivation
The authors began by expressing $\alpha$ as a linear function of $I$ within a small window $\omega$<br>
<mark>The assumption is that $\alpha$ is constant over this window</mark><br>
\$$\alpha_i \approx a I_i + b \quad \forall i \in \omega$$

$a = \frac{1}{F - B}$ and $b = -\frac{B}{F - B}$

$\alpha \approx \frac{I}{F - B} - \frac{B}{F - B} \rightarrow \alpha (F - B) \approx I - B \rightarrow \alpha F + (1 - \alpha) B \approx I$

<br>

<b>Cost Function</b>

$$J(\alpha, a, b) = \underset{j \in I}{\sum} \left( \underset{i \in \omega_j}{\sum} (\alpha_i - a_j I_i - b_j)^2 + \epsilon a^2_j \right)$$

$j$ is a pixel location and $\omega_j$ is a $3 \times 3$ window around $j$

<mark>To solve the cost function</mark> $J(\alpha) = \underset{a,b}{\min} J(\alpha, a, b) = \alpha^T \textrm{L} \alpha$ <mark>where</mark>

\$$\textrm{L}_{ij} = \sum \limits_{k\\|(i,j) \in \omega_k} \left[ \delta_{ij} - \frac{1}{\\|\omega_k\\|} \left(1 + \frac{1}{\frac{\epsilon}{\\|\omega_k\\|} + \sigma^2_k} (\textbf{I}_i - \mu_k)(\textbf{I}_j - \mu_k) \right) \right]$$

This is the single channel case, below we generalize it for $k$ specifically $k \in \{R, G, B\}$

\$$\textrm{L}_{ij} = \sum \limits_{k\\|(i,j) \in \omega_k} \left[ \delta_{ij} - \frac{1}{\\|\omega_k\\|} \left(1 + (\textbf{I}_i - \mu_k)^T(\Sigma_k + \frac{\epsilon}{\\|\omega_k\\|} I_3)^{-1}(\textbf{I}_j - \mu_k) \right) \right]$$

<br>

$\textrm{L}$ is a $\textrm{N}$ by $\textrm{N}$ matrix, <mark>also known as the Matting Laplacian</mark>, where $\textrm{N} =$ height $\times$ stride

$\text{I}_3$ is a $3 \times 3$ identity matrix

<br>

<b>Breakdown</b>

$k\|(i, j) \in \omega_k \rightarrow$ within the neighborhood of $\omega_k$ at $i, j$

$\omega_k$ is a window of size $d^2 = (2r + 1)^2$ and $d = 3 \rightarrow \|\omega_k\| = 9$

<br>

<div class="note-div">
Note that we are not simply evaluating at just <i>i, j</i>. In this case, when we hold <i>i</i> and iterate <i>j</i>, we have 9 terms. In total then, we have 9 x 9 terms prior the summation. Every variable is constant except <b>I</b><sub>i</sub> and <b>I</b><sub>j</sub>.
</div>

<br>

1. $\mathbf{I}_k, \quad k \in \{i, j\}$ is a $3 \times 1$ column vector, the $RGB$ values at $k$

2. $\mu_k$ is a $3 \times 1$ mean vector for the colors in $\omega_k$

	$$\mu_k = \begin{bmatrix} \mu_\textbf{X} \\ \mu_\textbf{Y} \\ \mu_\textbf{Z} \end{bmatrix}$$

	where $\textbf{X, Y, Z}$ corresponds to the $R, G, B$ values

3. $\Sigma_k$ is a $3 \times 3$ covariance matrix

	$$\Sigma_k = \begin{bmatrix} \textrm{K}_\textbf{XX} & \textrm{K}_\textbf{XY} & \textrm{K}_\textbf{XZ} \\ \textrm{K}_\textbf{YX} & \textrm{K}_\textbf{YY} & \textrm{K}_\textbf{YZ} \\ \textrm{K}_\textbf{ZX} & \textrm{K}_\textbf{ZY} & \textrm{K}_\textbf{ZZ} \end{bmatrix}$$

	note:

	\$$\textrm{K}_\textbf{XY} = \textrm{K}_\textbf{YX} = \textrm{E}[\textbf{XY}] - \mu_\textbf{X} \mu_\textbf{Y}$$
	
	<br>

	suppose $\textbf{X} = \{R_1, \cdots R_9 \}$ and $\textbf{Y} = \{G_1, \cdots G_9 \}$

	$\mu_\textbf{X} = \frac{R_1 + \cdots + R_9}{9}$ 
	
	$\mu_\textbf{Y} = \frac{G_1 + \cdots + G_9}{9}$
	
	$\textrm{E}[\textbf{XY}] = \frac{R_1 G_1 + \cdots + R_9 G_9}{9}$

4. Lastly ...

	$\delta_{ij}$ is the Kronecker delta (in our case, simply a $9 \times 9$ identity matrix)
	
	$\epsilon = 10^{-7}$ 


#### Solution
Finally the author's solved for $\alpha = \textrm{argmin} \ \alpha^T \textrm{L} \alpha + \lambda (\alpha^T - b^T_S) D_S (\alpha - b_S)$

$$(\textrm{L} + \lambda D_S) \alpha = \lambda b_S$$

<div class="note-div">
<i>D</i> is a diagonal matrix with the same size as L and b<sub>S</sub> is a vector of length N. They define the user constraints discussed below.
</div>

## Application
---
#### Matting
For the direct application with user interaction (scribbling areas as foreground and background).

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023130817.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241022183657.png"|center|relative_url}}) |

**Figure 2.** user constraints and corresponding alpha values

$D_S$ has the diagonal entries being the mask and $b_S$ are the scribbles (alpha values) <mark>isolated</mark>

In this case, $b_S$ is actually just like $D_S$. The black scribbles are absorbed.

<mark>Only evaluate $\textrm{L}_{ij}$ where the mask is non-zero</mark>

The authors suggested $\lambda = 200$

#### Dehaze
The goal here is to refine the **transmission map**

| ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023131609.png"|center|relative_url}}) | ![Figure]({{"assets/images/電腦視覺/Pasted image 20241023131623.png"|center|relative_url}}) |

**Figure 3.** transmission map and refined result

$D_S$ has the diagonal entries being all ones and $b_S$ is the transmission map on the left

The authors suggested $\lambda = 1\mathbf{E}\neg4$

## Implementation
---
Only covering the essential steps

```python
from numpy.lib.strided_tricks import sliding_window_view

# TODO: pad source here, or dimension will be truncated

k = 3
filter = np.ones((k, k)) / (k * k)
source = sliding_window_view(source, filter.shape, axis=(0, 1), writeable=False)
```
this yields a view $(\text{h, w, c, k, k})$ to each patch which we can easily index

```python
# mean of each patch
M = np.mean(source, axis=(3,4)) #=> (h, w, c)
# build the covariance matrix K in similar fashion
K = ...
Kinv = np.linalg.inv(K + (epsilon / k**2) * np.eye(3)) #=> (h, w, 3, 3)
```

recall $(i, j) \in \omega_k$ means $\textrm{L}_{ij}$ will be a summation of 9 x 9 products

```python
v = []
i = []
j = []
# within the patch
# Ii @ (y,x) => (k x k, c)
# Ij @ (y,x) => (c, k x k)

# index map for building i and j
indM = np.arange(height * stride).reshape((height, stride))

# [-1 0 1]
oy, ox = np.ogrid[-k//2:k//2+1,-k//2:k//2+1]

for y in range(height):
	for x in range(stride):
		# build the indices
		ind = indM[max(0, min(height-1, y+oy)), max(0, min(stride-1, x+ox))]
		ind = ind.ravel()
		...
		
		data = np.eye(9) - (1.0 / k**2) * Ii @ Kinv @ Ij #=> (9, 9)
		v.extend(data.ravel())
		i.extend(np.tile(ind, k**2).ravel())
		j.extend(np.repeat(ind, k**2).ravel())

v = np.asarray(v, dtype=np.float64)
i = np.asarray(i, dtype=np.int32)
j = np.asarray(j, dtype=np.int32)
```

$\textbf{v, i, j}$ used in constructing the sparse matrix where $\textbf{i, j}$ are the col, row index respectively

$\textbf{v}$ is the data corresponding to position $(\textbf{j, i})$

```python
from scipy.sparse import csr_matrix

# (data, (row, col))
L = csr_matrix((v, (j,i)), shape=(height * stride, height * stride))
```
**see also**: coo_matrix(), csc_matrix(), to_dense()

<mark>The summation is left out since it is implicitly part of the matrix construction</mark>

## Reference
---
*A Closed-Form Solution to Natural Image Matting*<br>
Anat Levin, Dan Lischinski, and Yair Weiss
<br><br>
*Single Image Haze Removal using Dark Channel Prior*<br>
Kaiming He, Jian Sun, and Xiaoou Tang