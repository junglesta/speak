# Speak

##is this crazy branch?
♡ We speak therefore we are.

⎋ Speak up!

♨ A Volcano of vocabularising 

✌ Haiku 俳句 short poetry 

※ Graphic, Efficient, Rapid Communication Bricks 

⁂ Use me to get a clue and to get the message through!
 
❊ Who? its a second click quest and pleasure! 


## Speak website features

- compressed html [thanks to...](https://github.com/penibelst/jekyll-compress-html)
- Conditional Media Query Mixin [by @sheiko](https://github.com/dsheiko)
- speech-bubbles inspired by [Nicolas Gallagher]( http://nicolasgallagher.com/pure-css-speech-bubbles/)
- svg icons
- no plugins
- https
- inlined vanilla js


##To do

**Urgent:**

- fix index header on mobiles
- svg: 
	- conditional includes `{% if page.categories.geek %}` ...
	- then use svg/def.html like: `{% include svg/use.html id="icn--smile" class="smile" %}`


**Sometime soon:**

- service workers
- xml sitemap
- decent url
- rake task for publishing 


## Dev features
- jekyll
- gh-pages
- + gulp + browsersync for dev time

## Gems dependencies:
- github-pages









## Prerequisites

Node, Npm

## Getting started

#### 0. If you haven't yet, install Bundler + Gulp globally! 
```sh
gem install bundler```

```sh
npm install --global gulp
```
## Dev time

#### 1. In project local dir:
```sh
bundle install
```

#### 2. Install Gulp in project local dir:
```sh
npm install --save-dev gulp
```

#### 3. First run Jekyll like this:
```sh
bundle exec jekyll serve --baseurl ''
```

#### 4. Open a new terminal window and run browsersync via gulp:
```sh
gulp
```
