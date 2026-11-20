---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
tags: []
description: ""
build:
  publishResources: false  # não publica o original das imagens (só as versões geradas)
---

<!--
  Imagens: coloque o arquivo nesta pasta, ao lado do index.md, e escreva
  ![descrição](foto.jpg#media "Legenda opcional")
  Tamanhos: #pequena #media #grande (padrão) #cheia #original #300w #200h #300w,200h
-->
