---
layout: post
title: Neural Network Visualization
category: [deep learning]
tags: [pytorch, visualization]
date: 2025-09-04 23:32:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

Visualizing convolution activations (features) and filters (weights) using VGG16 as example.

## Activations
---
```python
import matplotlib.pyplot as plt
import numpy as np
import skimage

import torch
import torchvision

net = torchvision.models.vgg16(weights=torchvision.models.VGG16_Weights.DEFAULT)
net_layers = {}
```
<br>
<div class="info-div">
VGG16 is comprised of 13 convolution layers and 3 classifiers. We can access the name of each convolution layer using the line below:
</div>

```python
print(net.features)

"""
( 0): Conv2d ...
( 1): ReLU   ...
( 2): Conv2d ...
( 3): ReLU   ...
( 4): MaxPool2d
( 5): Conv2d ...
...
(28): Conv2d ...
"""
```
<br>
<div class="info-div">
To access the first convolution we can call <b>net.features[0]</b>. But this just isn't intuitive for the rest. So we extract and store them in another dict as below:
</div>

```python
for key, layer in enumerate(net.features):
    if isinstance(layer, torch.nn.Conv2d):
        net_layers[key] = layer
```

```python
transform = torchvision.transforms.Compose([
    torchvision.transforms.ToPILImage(),
    torchvision.transforms.Resize((224, 224)),
    torchvision.transforms.ToTensor(),
    # following normalization values are for ImageNet
    torchvision.transforms.Normalize(
        mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
    )
])

caller = getattr(skimage.data, 'astronaut')
image  = caller()
image  = image.astype(np.float32) / 255.0
image_tensor = transform(image)
```

![Figure]({{"assets/images/深度學習/Pasted image 20250904164908.png"|center|relative_url}})

```python
activations = {}
def get_activation(name):
    def hook(module, x, y):
        activations[name] = y.detach()
    return hook

num = 0 # change this to visualize different layers
key, layer = list(net_layers.item())[num]
print(f"registering hook to layer {key}: {layer}")

handle = layer.register_forward_hook(get_activations(f'conv{key}'))

net.eval()
with torch.no_grad():
    _ = net(image_tensor.unsqueeze(0))

handle.remove()
```

<div class="info-div">
We can register multiple hooks. Instead of the method above we can do:<br>
handle0 = net.features[0].register_forward_hook(get_activations('conv0'))<br>
handle2 = net.features[2].register_forward_hook(get_activations('conv2'))<br>
</div>

<div class="note-div">
<i>evaluate model here</i><br>
What the hook does is invoke the <i>Callable</i> at the end of each module's respective forward function. The <i>Callable</i> must have arguments of <i>model</i>, <i>input</i>, <i>output</i>. We store the <i>output</i> to <i>activations</i>.
</div>

<div class="info-div">
handle2.remove()<br>
handle0.remove()<br>
</div>

```python
def optimal_grid(N):
    """ compute optimal grid size for N images """
    n_cols = int(np.ceil(np.sqrt(N)))
    n_rows = int(np.ceil(N / n_cols))
    return n_cols, n_rows

activation = activations[f'conv{key}'][0, :, :, :]
opt_rows, opt_cols = optimal_grid(activation.shape[0])

activation = torch.split(activation, 1, dim=0)

grid = torchvision.utils.make_grid(
    list(activation), nrow=opt_rows, padding=1, pad_value=1.0, normalize=True
)

plt.figure(figsize=(32, 16))
plt.imshow(grid.permute(1, 2, 0))
plt.axis('off')
plt.show()
```

![Figure]({{"assets/images/深度學習/Pasted image 20250904165806.png"|center|relative_url}})

<div class="info-div">
These are outputs from the 64 channels of the first convolution layer. Most of them seem to be edge detectors, which is consistent in detecting low level features. It is apparent that some are more sensitive to the color red (such as row 6, col 8).
</div>

![Figure]({{"assets/images/深度學習/Pasted image 20250904165931.png"|center|relative_url}})

<div class="info-div">
These are outputs from the 512 channels of the eighth convolution layer. Of interest is row 8, col 13 which seems to have detected the face.
</div>

![Figure]({{"assets/images/深度學習/Pasted image 20250904172705.png"|center|relative_url}})

## Filters
---
```python
for layer in net.features:
	if isinstance(layer, torch.nn.Conv2d):
		weights = layer.weight.data.numpy()
		fig, axes = plt.subplots(8, 8, figsize=(12, 6))
		for i, ax in enumerate(axes.flat):
			if i < weights.shape[0]:
				ax.imshow(weights[i, 0, :, :], cmap='gray')
				ax.axis('off)
		plt.show()
		break # visualize only the first Conv2d layer
```

![Figure]({{"assets/images/深度學習/Pasted image 20250904232622.png"|center|relative_url}})