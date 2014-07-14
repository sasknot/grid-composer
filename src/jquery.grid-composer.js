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

	var GridComposer = {
		settings: {},

		init: function() {

		},

		getComponent: function( id ) {
			var $component = false;

			$(this).find('.gc-components .gc-component-item').each(function() {
				if( $(this).data('id') == id ) {
					$component = $(this);
					return false;
				}
			});		

			return $component;
		},

		addToGrid: function(item) {
			var $grid = $(this).find('.gc-grid');
			var $clone;
			var settings = GridComposer.settings;

			// Prevent the drop if it is colliding with another element
			if( $grid.find('.gc-components').data('colliding') ) {
				return false;
			}

			if( item.id ) {
				item.reference = GridComposer.getComponent.call(this, item.id);
			}

			$clone = item.reference.clone();

			// Put the id on the cloned element
			$clone.data('id', item.reference.data('id'));

			if( item.data ) {
				$clone.data('data', item.data);
			}

			$clone.removeClass('gc-component-item ui-draggable').addClass('gc-grid-item');

			// Round the left and top positions to the nearest divisor of the grid dimension
			if( item.offsetLeft % settings.dimension > 0 ) {
				item.offsetLeft = Math.round(item.offsetLeft / settings.dimension) * settings.dimension;
			}
			if( item.offsetTop % settings.dimension > 0 ) {
				item.offsetTop = Math.round(item.offsetTop / settings.dimension) * settings.dimension;
			}

			// Set the left and top positions and then append to the grid
			$clone.css({
				left: item.offsetLeft,
				top: item.offsetTop
			}).appendTo($grid);

			// Turn the grid items into draggables
			$grid.children('.gc-grid-item:not(.gc-immobile)').draggable({
				containment: 'parent',
				cursor: 'move',
				grid: [settings.dimension, settings.dimension],
				zIndex: 4,

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

					// Prevent the collision with another element
					if( settings.collision && $(this).hasClass('gc-can-overlay') === false ) {
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
					else {
						$(this).data('last-position', ui.position);
					}
				}
			});

			// Turn the grid items into resizables
			$grid.children('[class*="gc-resize"]:not(.ui-resizable)').each(function(){
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

			if( item.reference ) {
				item.reference.trigger('on-drop', $clone);
			}
		},

		removeFromGrid: function(item) {
			$(item).fadeOut(200, function() {
				$(item).siblings('.gc-trash').removeClass('open');
				$(item).parent().removeClass('gc-grid-with-timer');
				$(item).remove();
			});
		}
	};

	$.fn.gridComposer = function( methodOrOptions ) {

		// If needed, call some methods
		if( typeof( methodOrOptions ) == 'string' ) {
			if( GridComposer[ methodOrOptions ] ) {
				var options = typeof(arguments[1]) === 'object' ? arguments[1] : {};

				return this.each(function() {
					GridComposer[ methodOrOptions ].call( this, options );
				});
			}

			return;
		}

		var settings = $.extend({}, $.fn.gridComposer.defaults, methodOrOptions);

		GridComposer.settings = settings;

		if( !settings.dimension ) {
			$.error('Grid Composer: dimension must be defined');
		}

		// Set the width and height or the columns and lines
		if( settings.columns ) {
			settings.width = settings.columns * settings.dimension;
		}
		else if( settings.width ) {
			if( settings.width % settings.dimension > 0 ) {
				$.error('Grid Composer: width is not divisible by the dimension parameter');
			}

			settings.columns = settings.width / settings.dimension;
		}
		else {
			$.error('Grid Composer: columns or width must be defined to calculate the grid');
		}

		if( settings.lines ) {
			settings.height = settings.lines * settings.dimension;
		}
		else if( settings.height ) {
			if( settings.height % settings.dimension > 0 ) {
				$.error('Grid Composer: width is not divisible by the dimension parameter');
			}

			settings.lines = settings.height / settings.dimension;
		}
		else {
			$.error('Grid omposer: lines or height must be defined to calculate the grid');
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
							.height(component.lines * settings.dimension)
							.data('id', (component.id || 0));

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

						if( settings.collision && $(this).hasClass('gc-can-overlay') === false ) {
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
						}

						$(this).parent().data('colliding', colliding);
					}
				});

				// Create the trash
				var $trash = $('<div></div>').addClass('gc-trash');

				$trash.droppable({
					accept: '.gc-grid-item',
					tolerance: 'touch',
					drop: function(event, ui) {
						GridComposer.removeFromGrid.call(GridComposer, ui.draggable);
					}
				});

				$trash.appendTo($grid);
			}

			// Turn the grid into a droppable
			$grid.droppable({
				accept: '.gc-component-item',
				tolerance: 'fit',
				drop: function(event, ui) {
					var item = {
						reference: ui.draggable,
						offsetLeft: ui.offset.left - $(this).offset().left,
						offsetTop: ui.offset.top - $(this).offset().top
					};

					GridComposer.addToGrid.call($(this).closest('.gc-container')[0], item);
				}
			});

			$grid.appendTo($container);
		});
	};

	$.fn.gridComposer.defaults = {
		showGrid: true,
		collision: false
	};
})(jQuery);