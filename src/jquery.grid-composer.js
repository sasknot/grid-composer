/**
 * jQuery Grid Composer
 *   
 *  @package    app.js
 *  @category   jquery plugin
 *  @author     Rafael F. Silva <rafaelfsilva1@gmail.com>
 *  @copyright  
 *  @link       /src/jquery.grid-composer.js
 *  @since      0.0.0
**/

(function($) {
	'use strict';

	$.fn.gridComposer = function( options ) {
		var settings = $.extend({}, $.fn.gridComposer.defaults, options);

		if( settings.columns && settings.lines ) {
			settings.width = settings.columns * settings.dimension;
			settings.height = settings.lines * settings.dimension;
		}
		else if( settings.width && settings.height ) {
			settings.columns = settings.width / settings.dimension;
			settings.lines = settings.height / settings.dimension;
		}
		else {
			$.error('Grid Composer: columns and lines or width and height must be defined to calculate the grid');
		}

		return this.each(function() {
			var $container = $(this);
			var $components = $container.find('.gc-components');
			var $grid = $('<div></div>').addClass('gc-grid');

			$container.addClass('gc-container');
			$grid.width(settings.width).height(settings.height);

			if( settings.showGrid ) {
				var $gridHelper = $('<div></div>').addClass('gc-grid-helper');

				for( var i = 0; i < (settings.columns * settings.lines); i++ ) {
					$('<div></div>').width(settings.dimension).height(settings.dimension).appendTo($gridHelper);
				}

				$gridHelper.appendTo($grid);
			}

			$components.children().draggable({
				helper: 'clone'
			});

			$grid.droppable({
				accept: '.gc-component-item',
				drop: function(event, ui) {
					var $clone = $(ui.draggable).clone();
					var left = ui.position.left;
					var top = ui.position.top - ui.helper.parent().height();

					$clone.removeClass('gc-component-item ui-draggable').addClass('gc-grid-item');

					if( left % settings.dimension > 0 ) {
						left = Math.round(left / settings.dimension) * settings.dimension;
					}

					if( top % settings.dimension > 0 ) {
						top = Math.round(top / settings.dimension) * settings.dimension;
					}

					$clone.css({
						position: 'absolute',
						left: left,
						top: top
					});

					$(this).append($clone);

					// Draggable grid items

					$(this).children('*:not(.gc-grid-helper)').draggable({
						containment: 'parent',
						cursor: 'move',
						grid: [settings.dimension, settings.dimension]
					});

					// Resizable grid items

					$(this).children('.gc-resize').resizable({
						containment: 'parent',
						handles: 'e, s, se',
						grid: settings.dimension
					});

					$(this).children('.gc-resize-horz').resizable({
						containment: 'parent',
						handles: 'e',
						grid: settings.dimension
					});

					$(this).children('.gc-resize-vert').resizable({
						containment: 'parent',
						handles: 's',
						grid: settings.dimension
					});
				}
			});

			$grid.appendTo($container);
		});
	};

	$.fn.gridComposer.defaults = {
		showGrid: true
	};
})(jQuery);