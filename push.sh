#!/bin/bash 
wintersmith build
git add .
git add -u .
git commit -m "new blog post"
git push origin master
git push -u github master