/*!
 * Copyright (c) 2014 Neil Vallon (http://neil.vallon.me)
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */

(function($){
	$.fn.swipeGallery = function(){
		/**
		 * Reformates returning json object into a format we define.
		 *
		 * @param JSON json 
		 * @return JSON
		 */
		var flickrParser = function(json){
			var imageList = [];
			$(json.items).each(function(){
				imageList.push({
					'title': this.title,
					'artist': this.author,
					'url': this.link,
					'image': this.media.m
				});
			});
			
			return imageList;
		};
		
		
		/**
		 * Distributes the number of pixles in a gallery between the images of that gallery.
		 * For use as the width of the rollover div that activates each image.
		 *
		 * @param int imgNum    Number of images in current gallery
		 * @param int pxWidth   Width of Current gallery
		 * @return funtion(x)   Function takes an index 'x' and returns number of pixles assigned to that index
		 */
		var distributeimages = function(imgNum, pxWidth){
			var builder, base;
			builder = function(remainder, acumFun){
				var a, newFun;
				if(remainder === 0){
					return acumFun;
				}
				
				// Get the interval of images to skip before adding another pixle.
				// Ceil prevents adding too many.
				a = Math.ceil(imgNum / remainder);
				
				// Create a new anonymouse function that returns the sum pixles asigned at other intervals with
				// 1 added if the index 'x' is within the current interval as well.
				newFun = function(x){ return acumFun(x) + (x % a === 0); };
		
				// Update remainder by removing pixles taken care of by this iteration
				// while recusivly adding more layers untill remainder is 0.
				return builder(remainder - Math.floor(imgNum / a), newFun);
			};
			
			// Initalize base function as the number of pixles every image should recieve.
			base = function(){ return Math.floor(pxWidth / imgNum); };
			return builder(pxWidth % imgNum, base);
		};
		
		
		/**
		 * Updates image and title/author info
		 *
		 * @param DOM domObj    jQuery DOM object of the gallery
		 * @param DOM infoBar   jQuery DOM object of the gallerys info bar div
		 * @param JSON img      JSON containing information about the image to update with
		 * @return void
		 */
		var changeImage = function(domObj, infoBar, img){
			domObj.css('background-image', "URL('" + img.image.replace('_m', '') + "')");
			infoBar.html("<h3>" + img.title + "</h3><h5>" + img.artist + "</h5>");
		};
		
		
		/**
		 * Adds the required HTML to the user provided div.
		 * This incudes setting up rollover zones and event listeners.
		 *
		 * @param DOM domObj       jQuery DOM object of the gallery
		 * @param JSON[] imgList   Array of image information
		 * @return void
		 */
		var renderGallery = function(domObj, imgList){
			var distribution, hoverContainer, infoContainer;
			
			hoverContainer = $("<div class='rContainer'></div>");
			infoContainer = $("<div class='info'></div>").css('top', -domObj.height());
			
			domObj.append([hoverContainer, infoContainer]);
			
			// Display first image
			changeImage(domObj, infoContainer, imgList[0]);
			
			$(window).resize(function(){
				// Clear old rollover elements
				hoverContainer.html('');
				
				// Get function to map image indexes to pixle values
				distribution = distributeimages(
					imgList.length, Math.floor(domObj.width())
				);
				
				$(imgList).each(function(j, img){
					// add rollover element for image with a width set to that calculated in distributeimages()
					var elm = $("<span class='rollover'></span>")
						.css('width', distribution(j+1))
						.css('height', domObj.height())
						.click(function(){ window.open(img.url, '_blank'); })
						.mouseover(function(){ changeImage(domObj, infoContainer, img); });
				
					hoverContainer.append(elm);
					
					// Preload Image
					var i = new Image();
					i.src = img.image.replace('_m', '');
				});
			}).trigger('resize');
			
		};
		
		
		/**
		 * Recieves remote image information and initalizes each gallery after the page loads
		 */
		return this.each(function(i, obj){
			var feedid, url;
			feedid = $(obj).data('feed-id');
			url = 'https://api.flickr.com/services/feeds/groups_pool.gne?id='+feedid+'&jsoncallback=?';
			
			$.getJSON(url, {format: "json"})
				.done(function(data){
					var parsedImages = flickrParser(data);
					renderGallery($(obj), parsedImages);
				});
		});
		
	};
}(jQuery));
