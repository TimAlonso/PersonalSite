## Personal Site

This repo holds my personal site.

### Prerequisites

1. [Docker and Docker-Compose](https://www.docker.com/get-started)
3. Visual Studio Code

### Local

Clone repo
```
git clone git@github.com:TimAlonso/timalonso.github.io.git
cd timalonso.github.io
```

> Note: Open the directory and in Visual Studio Code terminal, enter `bash`

Run Docker-Compose
```
docker-compose up
```

The site should now be loclaly available on `http://0.0.0.0:4000/`

#### Drafts

In order to render your drafts locally
```
bundle exec jekyll serve --drafts
```