---
layout: post
length: long
title: "Avoid images if possible?"
categories: english geek
author: Boris Smus
goto: www.html5rocks.com/en/mobile/high-dpi/
go: comprehend
---
**Avoid images if possible.**

Before opening this can of worms, remember that the web has many powerful technologies that are largely resolution- and DPI-independent. <!-- more --> Specifically, text, SVG and much of CSS will "just work" because of the automatic pixel scaling feature of the web (via devicePixelRatio).

That said, you can't always avoid raster images. For example, you may be given assets that would be quite hard to replicate in pure SVG/CSS, or you are dealing with a photograph. While you could convert the image into SVG automatically, vectorizing photographs makes little sense because scaled-up versions usually don't look good. 
