(function () {
  var app = {
    initHomeValUpdates: function () {
      var curUrl = jQuery(location).attr("href");

      if (curUrl.indexOf("/get-a-free-home-valuation/") != -1) {
        jQuery(".whw-anotation").html(
          "You'll receive your free comprehensive home report in just a few minutes. Thank you."
        );
      }
    },

    initFeaturedProperties: function () {
      /* Put featured properties code here */
    },
    initFeaturedCommunities: function () {
      /* Put featured communities code here */
    },
    initTestimonials: function () {
      /* Put testimonials code here */
    },
    initQuickSearch: function () {
      /* Put quick search code here */
    },
    initCustomFunction: function () {
      /* See the pattern? Create more functions like this if needed. */
    },
    featuredListings: function () {
      jQuery(".hp-fl .fl-slider").slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        arrows: true,
        prevArrow: ".fl-arr-prev",
        nextArrow: ".fl-arr-next",
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ],
      });
    },
    initHPCTA: function () {
      var cta = jQuery(".hp-cta .cta-item");
      var ctaBgWrapper = jQuery(".hp-cta .cta-button-wrap");
      var ctaButtonWrapper = jQuery(".hp-cta .cta-button-wrap");

      cta.on("hover", function () {
        jQuery(".hp-cta .cta-bg-hover-wrap .cta-bg-hover").removeClass(
          "active"
        );

        cta.removeClass("active");

        var ctaId = jQuery(this).attr("data-cta-id");
        var activeBg = jQuery(
          '.hp-cta .cta-bg-hover-wrap .cta-bg-hover[data-bg-id="' + ctaId + '"]'
        );

        activeBg.addClass("active");
        jQuery(ctaButtonWrapper).addClass("active");
      });

      ctaBgWrapper.on("mouseleave", function () {
        jQuery(".hp-cta .cta-bg-hover-wrap .cta-bg-hover").removeClass(
          "active"
        );
        jQuery(ctaButtonWrapper).removeClass("active");
      });
    },
    initHeader: function () {
      if (jQuery(window).width() > 991) {
        jQuery(window).scroll(function () {
          if (jQuery(this).scrollTop() > 150 && jQuery(window).width() > 991) {
            jQuery("header.hdr-main").addClass("scrolled");
          } else {
            jQuery("header.hdr-main").removeClass("scrolled");
          }
        });
      }

      jQuery("#nav").navTabDoubleTap();
    },
    initOptimizeVideo: function () {
      jQuery(".slide3").html(
        '<source src="https://player.vimeo.com/external/362677119.hd.mp4?s=6932d802b1e6dc473f4db45d42d62164505220b4&profile_id=175" type="video/mp4">'
      );
      jQuery(".slide6").html(
        '<source src="https://player.vimeo.com/external/366555024.sd.mp4?s=fb9d0c9cc108690d1145971b082fc4f9f023f27c&profile_id=165" type="video/mp4">'
      );
      jQuery(".slide7").html(
        '<source src="https://player.vimeo.com/external/366555085.hd.mp4?s=ab71557aeade8b6bc90fe7a6c19cacc21bf8c95a&profile_id=175" type="video/mp4">'
      );
      jQuery(".slide8").html(
        '<source src="https://player.vimeo.com/external/362678504.hd.mp4?s=3880ebe0e37a67f848ebb3fe1c9eaf8822fffa3c&profile_id=175" type="video/mp4">'
      );
      jQuery(".slide10").html(
        '<source src="https://player.vimeo.com/external/366557563.hd.mp4?s=6b80ac7a36e17c64423d581eca03652e093f7931&profile_id=175" type="video/mp4">'
      );
      jQuery(".slide11").html(
        '<source src="https://player.vimeo.com/external/362677435.hd.mp4?s=3cc26ab8a0d0625b854e3a026ca3b2cb2434bd40&profile_id=175" type="video/mp4">'
      );
      jQuery(".slide12").html(
        '<source src="https://player.vimeo.com/external/362678270.hd.mp4?s=7b62d9550345d88c02d2551b8855fddbbe7d1450&profile_id=175" type="video/mp4">'
      );

      //			jQuery('#main-wrapper').on('touchstart', function() {
      //			  jQuery('.slide3').html('<source src="https://player.vimeo.com/external/362677119.hd.mp4?s=6932d802b1e6dc473f4db45d42d62164505220b4&profile_id=175" type="video/mp4">');
      //				jQuery('.slide6').html('<source src="https://player.vimeo.com/external/366555024.sd.mp4?s=fb9d0c9cc108690d1145971b082fc4f9f023f27c&profile_id=165" type="video/mp4">');
      //				jQuery('.slide7').html('<source src="https://player.vimeo.com/external/366555085.hd.mp4?s=ab71557aeade8b6bc90fe7a6c19cacc21bf8c95a&profile_id=175" type="video/mp4">');
      //				jQuery('.slide8').html('<source src="https://player.vimeo.com/external/362678504.hd.mp4?s=3880ebe0e37a67f848ebb3fe1c9eaf8822fffa3c&profile_id=175" type="video/mp4">');
      //				jQuery('.slide10').html('<source src="https://player.vimeo.com/external/366557563.hd.mp4?s=6b80ac7a36e17c64423d581eca03652e093f7931&profile_id=175" type="video/mp4">');
      //				jQuery('.slide11').html('<source src="https://player.vimeo.com/external/362677435.hd.mp4?s=3cc26ab8a0d0625b854e3a026ca3b2cb2434bd40&profile_id=175" type="video/mp4">');
      //				jQuery('.slide12').html('<source src="https://player.vimeo.com/external/362678270.hd.mp4?s=7b62d9550345d88c02d2551b8855fddbbe7d1450&profile_id=175" type="video/mp4">');
      //			});
      //			jQuery("#main-wrapper").mouseenter(function(){
      //
      //				jQuery('.slide3').html('<source src="https://player.vimeo.com/external/362677119.hd.mp4?s=6932d802b1e6dc473f4db45d42d62164505220b4&profile_id=175" type="video/mp4">');
      //				jQuery('.slide6').html('<source src="https://player.vimeo.com/external/366555024.sd.mp4?s=fb9d0c9cc108690d1145971b082fc4f9f023f27c&profile_id=165" type="video/mp4">');
      //				jQuery('.slide7').html('<source src="https://player.vimeo.com/external/366555085.hd.mp4?s=ab71557aeade8b6bc90fe7a6c19cacc21bf8c95a&profile_id=175" type="video/mp4">');
      //				jQuery('.slide8').html('<source src="https://player.vimeo.com/external/362678504.hd.mp4?s=3880ebe0e37a67f848ebb3fe1c9eaf8822fffa3c&profile_id=175" type="video/mp4">');
      //				jQuery('.slide10').html('<source src="https://player.vimeo.com/external/366557563.hd.mp4?s=6b80ac7a36e17c64423d581eca03652e093f7931&profile_id=175" type="video/mp4">');
      //				jQuery('.slide11').html('<source src="https://player.vimeo.com/external/362677435.hd.mp4?s=3cc26ab8a0d0625b854e3a026ca3b2cb2434bd40&profile_id=175" type="video/mp4">');
      //				jQuery('.slide12').html('<source src="https://player.vimeo.com/external/362678270.hd.mp4?s=7b62d9550345d88c02d2551b8855fddbbe7d1450&profile_id=175" type="video/mp4">');
      //
      //			});
    },
    initScrollButton: function () {
      var headerHeight = jQuery("header.hdr-main").height();

      function scroll(selector) {
        jQuery(selector).on("click", function (e) {
          e.preventDefault();

          if (jQuery(this).attr("data-href") == "hp-banner") {
            jQuery("html, body").animate({ scrollTop: 0 }, 500, "linear");
          }

          jQuery("html, body").animate(
            {
              scrollTop:
                jQuery("." + jQuery(this).attr("data-href")).offset().top -
                headerHeight,
            },
            500,
            "linear"
          );
        });
      }

      scroll(".hp-banner .banner-scroll-down");
      scroll("footer.ftr-main .scroll-up");
    },
    initCTAMobile: function () {
      /*jQuery('.mobile .hp-cta .cta-item').each(function(){
					jQuery(this).click(function(e){
						e.preventDefault();
						console.log(ctadirlink);
						if(jQuery(this).hasClass('tapped-one')){
							var ctadirlink = jQuery(this).attr('href');
							window.location.href = ctadirlink;
						}else{
							jQuery('.mobile .hp-cta .cta-item.tapped-one').removeClass('tapped-one');
						}
						jQuery(this).addClass('tapped-one');
					});
				});*/
    },
  };

  jQuery(document).ready(function () {
    app.initOptimizeVideo();

    app.initHomeValUpdates();

    /* Initialize featured properties */
    app.initFeaturedProperties();

    /* Initialize featured communities */
    app.initFeaturedCommunities();

    /* Initialize testimonials */
    app.initTestimonials();

    /* Initialize quick search */
    app.initQuickSearch();

    /* Initialize featured listings */
    app.featuredListings();

    /* Initialize hp cta */
    app.initHPCTA();

    /* Initialize Header */
    app.initHeader();

    /* Initialize scroll button*/
    app.initScrollButton();

    app.initCTAMobile();
  });

  jQuery(window).on("load", function () {});

  jQuery(window).on("resize", function () {
    /* Initialize Header */
    app.initHeader();
  });
})();
