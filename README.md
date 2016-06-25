# Speak

![Alt text](hack_yeah.png)
![Alt text](can_only_create_the_future.png)
![Alt text](deploy_or_die.png)

♡ We speak therefore we are.

⎋ Speak up!

♨ A Volcano of vocabularising

✌ Haiku 俳句 short poetry

※ Graphic, Efficient, Rapid Communication Bricks

⁂ Use me to get a clue and to get the message through!

❊ Who? its a second click quest and pleasure!


## Speak website v.0.10.4 features

- Site content licensed under a [Creative Commons Attribution 4.0 International license.](http://creativecommons.org/licenses/by/4.0/)
- Conditional Media Query Mixin [by @sheiko](https://github.com/dsheiko)
- Speech-bubbles inspired by [Nicolas Gallagher]( http://nicolasgallagher.com/pure-css-speech-bubbles/)
- Compressed html [thanks to...](https://github.com/penibelst/jekyll-compress-html)
- Zero plugins
- Web app standalone functionality with chrome (android only :().
- Inlined svg icons
- 100% vanilla js
- Open graph metas
- Twitter cards
- Data driven navigation
- Page titles that make sense
- Understandable body tags sentences
- Selected keyword (categories) navigation
- random quote on home via js
- use `font: caption;` (no more webfont.js async) to leverage [operating system fonts](http://codepen.io/dope/pen/YyxKBj)

## To do

**Urgent:**

- home with latest 12 posts, under the random one.
- travis-ci tests
- jekyll sitemap
- phantom generated twitter cards (png|gif|jpg?)

**Sometime soon:**

- turn speechbubble css into svg
- share links (fb, g+, twitter) in single (page bottom)
- double kudos: love|hate
- smooth transitions
- https + service workers
- print.css

**Maybe:**

- contribute form
- decent urls
- rakefile to gh-pages (then dev on master via github Desktop)

## Setup

Default branch: gh-pages | Master branch: for development.

## Dev features

- jekyll (github version)
- gh-pages
- gulp browsersync

## Gems dependencies:

- github-pages

## Prerequisites

Node, Npm

## Getting started

#### 0. If you haven't yet, install Bundler + Gulp globally!

```sh
gem install bundler
```

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

(optional)
#### 4. Open a new terminal window and run browsersync via gulp:

```sh
gulp
```
