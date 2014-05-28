/*!
 * jQuery Grid Composer
 *   
 *  @package    app.js
 *  @category   jquery plugin
 *  @author     Rafael F. Silva <rafaelfsilva1@gmail.com>
 *  @copyright  
 *  @link       /src/jquery.grid-composer.js
 *  @since      0.0.0
**/

var jqGCTimer = false;

(function($) {
	'use strict';

	$.fn.gridComposer = function( options ) {
		var settings = $.extend({}, $.fn.gridComposer.defaults, options);

		// Set the width and height or the columns and lines
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

		// Iterate over the selected elements
		return this.each(function() {
			var $container = $(this);
			var $grid = $('<div></div>').addClass('gc-grid');

			// Define the container
			$container.addClass('gc-container').width(settings.width);

			$grid.width(settings.width).height(settings.height);

			// Build the background grid
			if( settings.showGrid ) {
				var $gridHelper = $('<div></div>').addClass('gc-grid-helper');

				for( var i = 0; i < (settings.columns * settings.lines); i++ ) {
					$('<div></div>').width(settings.dimension).height(settings.dimension).appendTo($gridHelper);
				}

				$gridHelper.appendTo($grid);
			}

			// Build the components
			if( settings.components && settings.components.length > 0 ) {
				var $components = $('<div></div>').addClass('gc-components');

				$.each(settings.components, function(index, component) {
					if( component.lines && component.columns ) {
						var $item;

						$item = $('<div></div>')
							.addClass('gc-component-item')
							.width(component.columns * settings.dimension)
							.height(component.lines * settings.dimension);

						$.each(component.elements, function(index, element) {
							var $image = $('<img />').attr({ src: element.image, alt: '', title: '' });

							if( element.css ) {
								$image.css(element.css);
							}

							$item.append($image);
						});

						if( component.overlay ) {
							$item.addClass('gc-can-overlay');
						}

						if( component.immobile ) {
							$item.addClass('gc-immobile');
						}

						if( component.resize && component.resize.length > 0 ) {
							$item.addClass('gc-resize-' + component.resize.join('-'));
						}

						if( component.onDrop ) {
							$item.on('on-drop', component.onDrop);
						}

						$item.appendTo($components);
					}
					else {
						$.error('Grid Composer: component ' + component.name + ' must have a columns and lines number defined');
					}
				});

				// Append the component container to the main container
				$components.appendTo($container);

				// Turn the components into draggables, being able to clone them
				$components.children().draggable({
					helper: 'clone',
					revert: function( $droppable ) {
						if( !$droppable ) {
							return true;
						}

						if( $droppable.siblings('.gc-components').data('colliding') ) {
							return true;
						}
					},

					// See if the current dragging element is colling with another into the droppable
					drag: function(event, ui) {
						var colliding = false;
						var dropping = {
							x: ui.offset.left,
							y: ui.offset.top,
							w: $(ui.helper).width(),
							h: $(ui.helper).height()
						};

						$(this).closest('.gc-container').find('.gc-grid .gc-grid-item:not(.gc-can-overlay)').each(function() {
							var dropped = {
								x: $(this).offset().left,
								y: $(this).offset().top,
								w: $(this).width(),
								h: $(this).height()
							};

							colliding = function(e,t){return!(e.y+e.h<=t.y||e.y>=t.y+t.h||e.x+e.w<=t.x||e.x>=t.x+t.w);}(dropping,dropped);

							if( colliding ) {
								return false;
							}
						});

						$(this).parent().data('colliding', colliding);
					}
				});

				// Create the trash
				var $trash = $('<div></div>').addClass('gc-trash');

				$trash.droppable({
					accept: '.gc-grid-item',
					drop: function(event, ui) {
						ui.draggable.fadeOut(200, function() {
							$(this).siblings('.gc-trash').removeClass('open');
							$(this).parent().removeClass('gc-grid-with-timer');

							$(this).remove();
						});
					}
				});

				$trash.appendTo($grid);
			}

			// Turn the grid into a droppable
			$grid.droppable({
				accept: '.gc-component-item',
				tolerance: 'fit',
				drop: function(event, ui) {

					// Prevent the drop if it is colliding with another element
					if( $(this).closest('.gc-container').find('.gc-components').data('colliding') ) {
						return false;
					}

					var $clone = $(ui.draggable).clone();
					var left = ui.offset.left - $(this).offset().left;
					var top = ui.offset.top - $(this).offset().top;

					$clone.removeClass('gc-component-item ui-draggable').addClass('gc-grid-item');

					// Round the left and top positions to the nearest divisor of the grid dimension
					if( left % settings.dimension > 0 ) {
						left = Math.round(left / settings.dimension) * settings.dimension;
					}
					if( top % settings.dimension > 0 ) {
						top = Math.round(top / settings.dimension) * settings.dimension;
					}

					// Set the left and top positions and then append to the grid
					$clone.css({
						left: left,
						top: top
					}).appendTo(this);

					// Turn the grid items into draggables
					$(this).children('.gc-grid-item:not(.gc-immobile)').draggable({
						containment: 'parent',
						cursor: 'move',
						grid: [settings.dimension, settings.dimension],

						// Prevent the collision with another element
						drag: function( event, ui ) {
							var lastPosition = $(this).data('last-position');

							if(
								!lastPosition
								|| (
									lastPosition.left != ui.position.left
									|| lastPosition.top != ui.position.top
								)
							) {
								if( jqGCTimer ) {
									clearTimeout(jqGCTimer);
								}
								jqGCTimer = false;

								$(this).siblings('.gc-trash').removeClass('open');
								$(this).parent().removeClass('gc-grid-with-timer');
							}
							else {
								var onSide = (ui.position.left + $(this).width()) == $(this).parent().width();

								if( onSide ) {
									if( !jqGCTimer ) {
										jqGCTimer = setTimeout(function() {
											var $grid = $('.gc-container .gc-grid.gc-grid-with-timer');

											if( $grid.length > 0 ) {
												$grid.find('.gc-trash').addClass('open');
											}

											$grid.removeClass('gc-grid-with-timer');
											jqGCTimer = false;
										}, 500);

										$(this).parent().addClass('gc-grid-with-timer');
									}
								}
								else {
									if( jqGCTimer ) {
										clearTimeout(jqGCTimer);
									}
									jqGCTimer = false;

									$(this).siblings('.gc-trash').removeClass('open');
									$(this).parent().removeClass('gc-grid-with-timer');
								}
							}

							if( $(this).hasClass('gc-can-overlay') === false ) {
								var colliding = false;
								var dragging = {
									x: ui.position.left,
									y: ui.position.top,
									w: $(this).width(),
									h: $(this).height()
								};

								$(this).addClass('gc-dragging');

								$(this).siblings('.gc-grid-item:not(.gc-can-overlay)').each(function() {
									$(this).removeClass('gc-dragging');

									var draggable = {
										x: $(this).position().left,
										y: $(this).position().top,
										w: $(this).width(),
										h: $(this).height()
									};

									// Calculate if the dragging element is colliding with this draggable one with this magic formula
									colliding = function(e,t){return!(e.y+e.h<=t.y||e.y>=t.y+t.h||e.x+e.w<=t.x||e.x>=t.x+t.w);}(dragging,draggable);

									if( colliding ) {
										return false;
									}
								});

								// Return the current position to the last valid position
								if( colliding ) {
									ui.position = $(this).data('last-position');
								}

								// Store the current position
								else {
									$(this).data('last-position', ui.position);
								}
							}
						}
					});

					// Turn the grid items into resizables
					$(this).children('[class*="gc-resize"]:not(.ui-resizable)').each(function(){
						var theClass = $(this).attr('class').match(/gc-resize[-a-z]*/)[0].split('-');

						if( theClass.length > 2 ) {
							var directions = theClass.slice(2).join(', ');

							$(this).resizable({
								containment: 'parent',
								handles: directions,
								grid: settings.dimension,
								minWidth: $(this).width(),
								minHeight: $(this).height(),
								maxWidth: 500,
								maxHeight: 500
							});
						}
					});

					$(ui.draggable).trigger('on-drop', $clone);
				}
			});

			$grid.appendTo($container);
		});
	};

	$.fn.gridComposer.defaults = {
		showGrid: true
	};
})(jQuery);