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

distributeimages = function(imgNum, pxWidth){
	builder = function(remainder, acumFun){
		if(remainder == 0)
			return acumFun;
		var a = Math.ceil(imgNum / remainder)
		var newFun = function(x){ return acumFun(x) + (x % a == 0) }
		return builder(remainder - Math.floor(imgNum / a), newFun);
	}
	
	base = function(x){ return Math.floor(pxWidth / imgNum) };
	return builder(pxWidth % imgNum, base)
}

renderGallery = function(domObj, imgList){
	var distribution = distributeimages(imgList.length, domObj.width());
	console.log(distribution)
	c=0;
	for(i=1;i<=imgList.length;i++)
		c += distribution(i);
		console.log(c)
}

distributeimages(201, 454)

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
