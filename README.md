## Personal Site

This repo holds my personal site.

### Prerequisites

1. [Ruby development environment](https://jekyllrb.com/docs/installation/windows/#installation-via-bash-on-windows-10)
2. Jekyll and [bundler](https://jekyllrb.com/docs/ruby-101/#bundler) gems
3. Visual Studio Code

### Local

Clone repo
```
git clone git@github.com:TimAlonso/timalonso.github.io.git
cd timalonso.github.io
```
> Note: Open the directory and in Visual Studio Code terminal, enter `bash`

Build the site and make it available on a local server
```
bundle exec jekyll serve
```
The site should now be available on `http://127.0.0.1:4000`

#### Drafts

In order to render your drafts locally
```
bundle exec jekyll serve --drafts
```