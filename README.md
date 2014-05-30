grid-composer
=============

A plugin for putting elements in a grid.


Installation
-------------

1. Make sure you have Node.js installed, or else download and install from [nodejs.org](http://nodejs.org)
2. If you do not have [Bower](http://bower.io/) installed yet, run the following command and install it globally:

	`npm install -g bower`

3. Run the following commands in terminal to install gulp, it's plugins, external jQuery plugins and build the minified files:

	`npm install` 

	`bower install` 

	`gulp` 

Now you are ready to code and make awesome tricks!


Documentation
--------------

## Parameters

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Default</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>dimension</td>
			<td>Space that each square in the grid will occupy.</td>
			<td>--</td>
		</tr>
		<tr>
			<td>columns</td>
			<td>Number of columns of the grid. May be passed as width as well.</td>
			<td>--</td>
		</tr>
		<tr>
			<td>lines</td>
			<td>Number of lines of the grid. May be passed as height as well.</td>
			<td>--</td>
		</tr>
		<tr>
			<td>width</td>
			<td>Width of the grid. Consider passing a value divisible by the dimension parameter.</td>
			<td>--</td>
		</tr>
		<tr>
			<td>height</td>
			<td>Height of the grid. Consider passing a value divisible by the dimension parameter.</td>
			<td>--</td>
		</tr>
		<tr>
			<td>components</td>
			<td>
				Elements to be inserted into the grid. <br><br>Parameters:
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>id</td>
							<td>A Unique identifier.</td>
						</tr>
						<tr>
							<td>name</td>
							<td>A name for appering in the tooltip.</td>
						</tr>
						<tr>
							<td>elements</td>
							<td>An array containing which images should be put inside.
								<table>
									<thead>
										<tr>
											<th>Name</th>
											<th>Description</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>image</td>
											<td>An URL to the image.</td>
										</tr>
										<tr>
											<td>css</td>
											<td>An object with CSS styles (optional).</td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
						<tr>
							<td>columns</td>
							<td>Number of columns that will occupy in the grid.</td>
						</tr>
						<tr>
							<td>lines</td>
							<td>Number of lines that will occupy in the grid.</td>
						</tr>
						<tr>
							<td>resize</td>
							<td>An array with the coordinates that will be resizable.</td>
						</tr>
						<tr>
							<td>overlay</td>
							<td>Whether it can be overlayed or not.</td>
						</tr>
						<tr>
							<td>immobile</td>
							<td>Whether it can be draggable or not.</td>
						</tr>
						<tr>
							<td>onDrop</td>
							<td>Callback for dropping the component into the grid. Return event and the current component as parameters to the function.</td>
						</tr>
					</tbody>
				</table>
			</td>
			<td>--</td>
		</tr>
		<tr>
			<td>showGrid</td>
			<td></td>
			<td>true</td>
		</tr>
	</tbody>
</table>