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

$(document).ready(function(){
	$('.swipeGal').each(function(i, obj){
		var feedid = $(obj).data('feed-id');		
		var url = 'http://ycpi.api.flickr.com/services/feeds/groups_pool.gne?id='+feedid+'&jsoncallback=?';
		
		$.getJSON(url, {format: "json"})
			.done(function(data){
					parsedImages = flickrParser(data);
					//console.log(parsedImages);
				});
	});
});
