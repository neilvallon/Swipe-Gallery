/**
 * Reformates returning json object into a format we define.
 *
 * @param JSON json 
 * @return JSON
 */
flickrParser = function(json){
	var imageList = []
	$(json.items).each(function(i, image){
		imageList.push({
			'title':image.title,
			'artist':image.author,
			'url':image.link,
			'image':image.media.m});
	})
	return imageList;
}


/**
 * Distributes the number of pixles in a gallery between the images of that gallery.
 * For use as the width of the rollover div that activates each image.
 *
 * @param int imgNum    Number of images in current gallery
 * @param int pxWidth   Width of Current gallery
 * @return funtion(x)   Function takes an index 'x' and returns number of pixles assigned to that index
 */
distributeimages = function(imgNum, pxWidth){
	builder = function(remainder, acumFun){
		if(remainder == 0)
			return acumFun;
		
		// Get the interval of images to skip before adding another pixle.
		// Ceil prevents adding too many.
		var a = Math.ceil(imgNum / remainder)
		
		// Create a new anonymouse function that returns the sum pixles asigned at other intervals with
		// 1 added if the index 'x' is within the current interval as well.
		var newFun = function(x){ return acumFun(x) + (x % a == 0) }
		
		// Update remainder by removing pixles taken care of by this iteration
		// while recusivly adding more layers untill remainder is 0.
		return builder(remainder - Math.floor(imgNum / a), newFun);
	}
	
	// Initalize base function as the number of pixles every image should recieve.
	base = function(x){ return Math.floor(pxWidth / imgNum) };
	return builder(pxWidth % imgNum, base)
}


/**
 * Updates image and title/author info
 *
 * @param DOM domObj    jQuery DOM object of the gallery
 * @param DOM infoBar   jQuery DOM object of the gallerys info bar div
 * @param JSON img      JSON containing information about the image to update with
 * @return void
 */
changeImage = function(domObj, infoBar, img){
	domObj.css('background-image', "URL('"+img.image.replace('_m', '')+"')");
	infoBar.html("<h3>"+img.title+"</h3><h4>"+img.artist+"</h4>");
}


/**
 * Adds the required HTML to the user provided div.
 * This incudes setting up rollover zones and event listeners.
 *
 * @param DOM domObj       jQuery DOM object of the gallery
 * @param JSON[] imgList   Array of image information
 * @return void
 */
renderGallery = function(domObj, imgList){
	// Get function to map image indexes to pixle values
	var distribution = distributeimages(imgList.length, domObj.width());
	
	var hoverContainer = $("<div class='rContainer'></div>");
	var infoContainer = $("<div class='info'></div>");
	infoContainer.css('top', -(domObj.height()-15))
	
	domObj.append(hoverContainer);
	domObj.append(infoContainer);
	
	$(imgList).each(function(i, img){
		// add rollover element for image with a width set to that calculated in distributeimages()
		var hoverTemp = "<div class='rollover' style='width:"+distribution(i+1)+"px;'><\/div>"
		var elm = $(hoverTemp);
		hoverContainer.append(elm);
		
		// Set up event listeners
		elm.click(function(){ window.open(img.url, '_blank'); });
		elm.mouseover(function(){ changeImage(domObj, infoContainer, img); });
		
		changeImage(domObj, infoContainer, img); // This is lazy but it ends up loading the last image
	});
}


/**
 * Recieves remote image information and initalizes each gallery after the page loads
 */
$(document).ready(function(){
	$('.swipeGal').each(function(i, obj){
		var feedid = $(obj).data('feed-id');		
		var url = 'http://ycpi.api.flickr.com/services/feeds/groups_pool.gne?id='+feedid+'&jsoncallback=?';
		
		$.getJSON(url, {format: "json"})
			.done(function(data){
					parsedImages = flickrParser(data);
					renderGallery($(obj), parsedImages)
				});
	});
});
