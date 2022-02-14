( function() {
	
	jQuery.fn.videoSlideshow = function(settings) {
		
		settings = jQuery.extend({
			'slides':'>div',
			'fx':'fade',
			'speed':1000,
			'timeout':4000,
			'audio':false
		},settings);
		
		jQuery(this).each( function(i,v) {
			
			new VideoSlideshow(jQuery(v),settings);
			
		});
	
	}
	
	function VideoSlideshow(object,settings) {
		
		var target = jQuery(object);
		var slides = target.find(settings.slides);
		var interval;
        var duplicatedForContinuity = false;
		var slideTimeout;
		
		function __construct() {
            
            /* If there is only one slide, duplicate it to allow continuity */
            if ( slides.length == 1 ) {
                slides.eq(0).clone().appendTo(target);
                slides = target.find(settings.slides)
                duplicatedForContinuity = true;
            }
            
			/* Turn off preloading to save bandwidth */
			// target.find("video").attr("preload","none");
			
			/* Pause all videos to save bandwidth */
			target.find("video").trigger("pause");
			
			/* Add preloader class */
			slides.addClass("video-slide");
			
			/* Mute videos */
			if ( !settings.audio ) {
				target.find("video").prop("muted",true);
			}
			
			/* Determine timeout */
			
			var timeout = settings.timeout;
			
			if ( supportsAutoplay() ) {
				timeout = 0;
			}
			else if ( duplicatedForContinuity ) {
				timeout = 0;
			}
			
			/* Intialize Cycle */
			target.cycle({
				'fx':settings.fx,
				'slides':slides,
				'timeout': timeout, 
				'speed':settings.speed
			});
            
            /* Remove extra pager button if duplicatedForContinuity */
            target.on( 'cycle-post-initialize', function(event, optionHash) {
                console.log(optionHash);
            });
			
			/* Set posters as backgrounds if autoplay not supported */
			if ( !supportsAutoplay() ) {
				slides.find("video").each( function(i,v) {
					
					jQuery(v).css("opacity",0);
					
					var poster = jQuery(v).attr("preload");
					var slide = jQuery(v).parents(".video-slide");
					
					slide.css({
						'background-image':'url('+poster+')'
					});
					
					slide.removeClass("buffering");
					
				});
			}else{
				slides.find("video").each( function() {
					
					image = jQuery(this).attr('preload');
					jQuery(this).css({
						'background-image':'url('+image+')',
						'background-repeat':'no-repeat',
						'background-size':'cover'
					});
					
					// slide.removeClass("buffering");
					
				});
			}
			
			/* Play video on every transition */
			target.on( 'cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
				
				var video = jQuery(incomingSlideEl).find("video");
				var previousVideo = jQuery(outgoingSlideEl).find("video");
								
				video.addClass("current-video");
				previousVideo.removeClass("current-video");
				
				target.find("video").not(previousVideo).trigger("pause");		
				
				/* Restart video */
				if ( video.length > 0 ) {
					clearTimeout(slideTimeout);
					playVideo( video );
				}
				/* If different media type, move after specified timeout */
				else {
					loadImage( jQuery(incomingSlideEl).find(".cycloneslider-img-js") );
					slideTimeout = setTimeout( function() {
						target.cycle("next");
					},settings.timeout);
				}
					
			});
			
			/* Play first video on page load */
			var firstVideo = target.children("div").eq(0).find("video");
			if ( firstVideo.length > 0 ) {
				firstVideo.addClass("current-video");
				playVideo( firstVideo );
			}
			/* If different media type, move after specified timeout */
			else {
				loadImage( target.children("div").eq(0).find(".cycloneslider-img-js") );
				slideTimeout = setTimeout( function() {
					target.cycle("next");
				},settings.timeout);
			}
			
			/* Video events */
			
			target.find("video").bind('timeupdate', function(e){
			
				var video = jQuery(e.currentTarget);
				var duration = video[0].duration;
				var currentTime = video[0].currentTime;
				var allowance = settings.speed/1000;
				
				if ( ( duration - currentTime )	< allowance && video.hasClass("current-video") && isVideoReady(video) ) {
					target.cycle('next');	
				}		
				
			});
			
			target.find("video").bind('waiting', function(e){
				
				var video = jQuery(e.currentTarget);
				video.parents(".video-slide").addClass("buffering");
				
			});
			
			target.find("video").bind('canplaythrough canplay', function(e){
				
				var video = jQuery(e.currentTarget);
				video.parents(".video-slide").removeClass("buffering");
				
			});
			
		}
		
		function playVideo(video) {
			
			/* Don't play video if autoplay is unsupported */
			// if ( !supportsAutoplay() ) { return; }
			
			/* 	Set preload to auto to ensure that video plays on Mac Webkit browsers. 
				If it is set to 'none', the video doesn't play even if the 'play' event is triggered. */
			// video.attr("preload","auto");
			
			/* Play the video */
			video.trigger("play");
			
			if( isVideoReady(video) ) {
				console.log("Rewinding " + video.find("source").attr("src"));
				video[0].currentTime = 0;
			}
		
		}
		
		function supportsAutoplay() {
			return true;
			// if( 	navigator.userAgent.match(/Android/i)
			// 		|| navigator.userAgent.match(/webOS/i)
			// 		|| navigator.userAgent.match(/iPhone/i)
			// 		|| navigator.userAgent.match(/iPad/i)
			// 		|| navigator.userAgent.match(/iPod/i)
			// 		|| navigator.userAgent.match(/BlackBerry/i)
			// 		|| navigator.userAgent.match(/Windows Phone/i)
			// ){
			// 	return false;
			// }
			// else {
			// 	return true;
			// }
		}
		
		function isVideoReady(video) {
			console.log( video.get(0).readyState );
			return jQuery.inArray( video.get(0).readyState, [3,4] ) > -1;
		}
		
		function loadImage(image) {
			
			if ( image.length < 1 ) { return; }
			
			var src = jQuery(image).attr("data-src");
			jQuery(image).attr("src",src);
			
		}
		
		__construct();
		
	}
	
})();