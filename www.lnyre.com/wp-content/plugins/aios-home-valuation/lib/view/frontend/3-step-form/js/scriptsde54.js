var $ = jQuery;
var AHVDOM = $('.wmhw-form-wrapper');
var AHVMap;

var latestEstimateMarkup;
var threeStepForm = {
    init: function () {
        this.formEvents();
    },

    formCity: $('#city'),
    formStreetAddress: $('#street_address'),


    changePanel: function (step = false) {
        if (step) {
            if (step == 2) {
                $('.wmhw-map-cf-wrap').css('display', 'block');
                $('.wmhw-main-form-wrap').css('display', 'none');
                $('.wmhw-thankyou-wrapper').css('display', 'none');
            }
            if (step == 3) {
                $('.wmhw-map-cf-wrap').css('display', 'none');
                $('.wmhw-main-form-wrap').css('display', 'none');
                $('.wmhw-thankyou-wrapper').css('display', 'block');

                //$('.wmhw-subtitle').text('SEE ESTIMATES BELOW');
            }
        }
    },

    getZestimate: function () {

        if ((this.formStreetAddress.length > 0) && (this.formCity.length > 0)) {
            if ((this.formStreetAddress.val().length > 0) && (this.formCity.val().length > 0)) {
                this.changePanel(2);

                data = {
                    'action': 'hv_get_estimate',
                    'data': {
                        address: threeStepForm.formStreetAddress.val(),
                        city: threeStepForm.formCity.val()
                    }
                };

                $.post(ajaxurl, data, function (response) {

                    AHVDOM.find('.estimate-markup textarea').text(response);
                    //AHVDOM.find('.estimates-preview').html(response);

                    threeStepForm.getMap();
                });
            }
        }
    },

    getMap: function(){
        data = {
            'action': 'hv_get_map',
            'i': {
                address: threeStepForm.formStreetAddress.val() + ' ' + threeStepForm.formCity.val()
            }
        };


        var AHVMap = new google.maps.Map(document.getElementById('wmhw-map'), {
          zoom: 15,
          disableDefaultUI: true,
          draggable: false
        });

        geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': data.i.address}, function(results, status) {
          if (status == 'OK') {
            AHVMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: AHVMap,
                position: results[0].geometry.location,
                title:"You're here!"
            });


          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });

       /* myLatlng = new google.maps.LatLng(data.latitude,data.longitude);

        marker = new google.maps.Marker({
            position: myLatlng,

        });

        marker.setMap(AHVMap);*/

    },

    formEvents: function () {

        AHVDOM.find('.next-btn').click(function () {
            threeStepForm.getZestimate();
        });

        //Email Sent
        document.addEventListener( 'wpcf7mailsent', function( event ) {
           console.log('current cf7 id: ' + event.detail.contactFormId);

           threeStepForm.changePanel(3);
        }, false );

    }
};


$(document).ready(function () {
    threeStepForm.init();
});
