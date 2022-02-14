( function( $ ) {

	function ajax_agent_listings() {
		var load_button = $( '#agent_load_listings' ),
			get_id = $( 'body' ).attr( 'class' ),
			get_id = get_id.split( ' ' ),
			page_id = '';
		
		for (var i = get_id.length - 1; i >= 0; i--) {
			var body_class = get_id[i];
			if ( body_class.indexOf( 'postid-' ) !== -1 ) {
				page_id =  body_class.replace( 'postid-', '' );
			}
		}

		load_button.on( 'click', function() {
			$.post( ajaxurl, {
				'action' : 'agent_listings_ajax',
				'count' : $( '.aios_listings_from_ajax' ).length,
				'pageid' : page_id
			}, function( response ) {
				var posts = JSON.parse( response );
				for ( var i = 0; i < posts.length; i++ ) {
					if ( posts[i] == 0 ) {
						load_button.fadeOut();
					} else {
						var agent_listings = $( posts[i] );
						$( agent_listings ).insertBefore( load_button );
						setTimeout( function(){
							$( '.aios_listings_from_ajax' ).animate({ opacity: 1 }, 1000, 'linear');
						}, 200 );
					}
				}
			} );
		} );

		// Trigger click function for button
		$count_trigger = 0;
		if ( $count_trigger == 0 ) {
			load_button.trigger( 'click' );
			$count_trigger++;
		}
	}

	$( document ).ready( function() {
		ajax_agent_listings();
	} );

} )( jQuery );