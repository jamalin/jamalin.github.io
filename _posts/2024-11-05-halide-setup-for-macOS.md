---
layout: post
title: Halide setup for VSCode on macOS
category: [programming]
tags: [halide, vscode]
date: 2024-11-05 23:20:00 +/-0000
math: true
published: true
---

<link rel="stylesheet" href="/assets/blogutil.css">

<div class="info-div">
Compile and execute <b>Halide</b> program in <b>VSCode</b> on <b>macOS</b>. Halide is a programming language designed for image processing. It's strength is in <b>memory locality</b> and <b>vectorized computation</b> (CPU and GPU) giving programmers the flexibility to modify schedules without being burdened in re-writing large amounts of code.
</div>

## Installation
---
Installation on **macOS**
```
brew install halide
```

Installation path will be something like **/usr/local/Cellar/halide/version/**

## Configuration
---
<mark>comments are shown for instruction purpose only, remove them in actual file</mark>

```bash
# c_cpp_properties.json
{
	"configuration": [
		{
			# tells Intellisense where to look
			"includePath": [
				"halide_path/include",
				"halide_path/share/tools"
			],
			# queries the system for libpng's header and library path
			"compilerArgs": ["`libpng-config --cflags --ldflags`"],
		}
	]
}
```

#### Compiler Options
```bash
# tasks.json
{
	"tasks": [
		{
			# insert the following under "args"
			"args": [
				"${file}",
				"-fdiagnostics-color=always",
				"-g",
				# location of header files
				"-I halide_path/include",
				# contain utilities to read and write images
				"-I halide_path/share/tools",
				# location of library
				"-L halide_path/lib",
				# Halide library
				"-lHalide",
				"-ljpeg",
				"-lpng",
				"-o",
				"${fileDirname}/${fileBasenameNoExtension}",
				# most important
				"-std=c++17"
			]
		}
	]
}
```

The line with <font color="#AA0000">-std=c++17</font> is most important as latest **Halide** version is built off it.