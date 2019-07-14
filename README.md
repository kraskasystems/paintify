# Paintify

##Project structure - directories
dist - bundled build<br>
doc/jsdoc - documentation<br>
src - sourcefiles


### Project setup and usage

Pull the project to update your local repo `git pull origin master` or clone is
into a empty folder `git clone https://r-n-d.informatik.hs-augsburg.de:8080/javascript-ss19/paintify.git`.

Run `npm i` to install dependencies.

Useful commands:<br>
`npm run dev`   - executes webpack in development mode<br>
`npm run prod`  - executes webpack for production<br>
`npm run watch` - executes webpack and watches the files<br>
`npm run serve` - use a webpack dev server on port 9000<br>
`npm run lint`  - check if you are using our conventions<br>
`npm run jsdoc` - create a documentation based on your docstrings

### HTML and CSS editing:

+ To edit the html file work in `src/static/index.html` (html-webpack-plugin is used for dist)
+ To edit css rules edit only `src/css/style.css`

## Font-Awesome support

To keep package size low icons have to be imported specifically.
Usage flow:

1. Go to `index.js`
2. Extend icon import `import { faCoffee } from '@fortawesome/free-solid-svg-icons';` and add your icon
3. Add icon to library `library.add( faCoffee );` -> comma separated ( faCoffee, fa..., fa...)
4. Go to your html file e.g. index.html and use your icon as `<i class="fas fa-coffee"></i>`

## Paintify config file
The config file found in `src/config/paintify.config.json` is needed to define colors and deliver Ids for UI HTML Elements.

See documentation for further assistance.

