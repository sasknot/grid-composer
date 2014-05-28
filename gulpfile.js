var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var pkg = require('./package.json');

var paths = {
	images: 'src/images/*.*',
	stylesheets: {
		plugins: [
			'bower_components/jquery-ui/themes/base/minified/jquery.ui.core.min.css',
			'bower_components/jquery-ui/themes/base/minified/jquery.ui.theme.min.css',
			'bower_components/jquery-ui/themes/base/minified/jquery.ui.resizable.min.css',
			'bower_components/jquery-ui/themes/base/minified/jquery.ui.theme.min.css'
		],
		app: 'src/jquery.' + pkg.name + '.css'
	},
	scripts: {
		plugins: [
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.core.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.widget.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.draggable.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.droppable.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.resizable.min.js',
			'bower_components/jquery-ui/ui/minified/jquery.ui.sortable.min.js'
		],
		app: 'src/jquery.' + pkg.name + '.js'
	}
};

gulp.task('css-dist', function() {
	gulp.src(paths.images)
		.pipe(gulp.dest('build/images'));

	gulp.src(paths.stylesheets.plugins)
		.pipe(concat('plugins.min.css'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('build'));

	gulp.src(paths.stylesheets.app)
		.pipe(concat('jquery.' + pkg.name + '.min.css'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('build'));
});

gulp.task('js-hint', function() {
	gulp.src(paths.scripts.app)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('js-dist', function() {
	gulp.src(paths.scripts.plugins)
		.pipe(concat('plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build'));

	gulp.src(paths.scripts.app)
		.pipe(rename('jquery.' + pkg.name + '.min.js'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
	gulp.watch(paths.stylesheets.plugins, ['css-dist']);
	gulp.watch(paths.stylesheets.app, ['css-dist']);
	gulp.watch(paths.scripts.plugins, ['js-hint', 'js-dist']);
	gulp.watch(paths.scripts.app, ['js-hint', 'js-dist']);
});

gulp.task('default', ['css-dist', 'js-hint', 'js-dist', 'watch']);