var API = require('./API');
var markerClicked;
var curAddress;
var curTime;
var map;
var point;
var directionsDisplay;

function initialiseOrder() {
    initialiseMap();

    $('#inputName').bind('input', function () {
        nameVal()
    });

    $('#inputPhone').bind('input', function () {
        phoneVal()
    });

    $('#inputAddress').bind('input', function () {
        addressVal()
    });

    $('#next').click(function () {
        if ($('.has-success').length == 3) {
            var order_data = {
                name: nameInput.val(),
                number: phoneInput.val(),
                address: addressInput.val()
            }

            // console.log(order_data);
            API.createOrder(order_data, function (err, data) {
                if (err) {
                    alert('Error creating order');
                } else {
                    // $('#liqpay').attr("style", "");

                    alert('Order created');
                    // console.log(data);
                }
            });
        }
        else {
            nameVal();
            phoneVal();
            addressVal();
            alert($('.has-error').innerHTML);
        }
    });
}


function initialiseMap() {
    //Тут починаємо працювати з картою
    var mapProp = {
        center: new google.maps.LatLng(50.464379, 30.519131),
        zoom: 15
    };
    var html_element = document.getElementById("googleMap");
    map = new google.maps.Map(html_element, mapProp);
    //Карта створена і показана

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true, suppressInfoWindows: true});

    point = new google.maps.LatLng(50.464379, 30.519131);
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: "assets/images/map-icon.png"
    });

    google.maps.event.addDomListener(window, 'load', initialiseMap);

    google.maps.event.addListener(map, 'click', function (me) {
        var coordinates = me.latLng;
    });

    google.maps.event.addListener(map, 'click', function (me) {
        var coordinates = me.latLng;
        geocodeLatLng(coordinates, function (err, address) {
            if (!err) {
                //Дізналися адресу
                //console.log(address);
                curAddress = address;
                $('.order-summary-address').html("<b>Адреса доставки:</b> " + address);
                addressInput.val(address);
                addressVal();
            } else {
                console.log(address);
            }
        });

    });
}


function geocodeLatLng(latlng, callback) {
//Модуль за роботу з адресою
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'location': latlng}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[1]) {
            var address = results[1].formatted_address;
            callback(null, address);
        } else {
            callback(new Error("Can't	find	address"));
        }
    });
}


function geocodeAddress(address, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            var coordinates = results[0].geometry.location;
            curAddress = address;
            $('.order-summary-address').html("<b>Адреса доставки:</b> " + curAddress);
            if (markerClicked != null) markerClicked.setMap(null);
            markerClicked = new google.maps.Marker({
                position: coordinates,
                map: map,
                icon: "assets/images/home-icon.png"
            });
            calculateRoute(point, coordinates, function (err, response) {
                if (!err) {
                    directionsDisplay.setDirections(response);
                    curTime = response.routes[0].legs[0].duration.text;
                    $('.order-summary-time').html("<b>Приблизний час доставки:</b> " + curTime);
                } else {
                    console.log("Помилка");
                    callback(new Error());
                }
            })
            callback(null, coordinates);
        } else {
            callback(new Error("Can	not	find the	address"));
        }
    });
}

function calculateRoute(A_latlng, B_latlng, callback) {
    var directionService = new google.maps.DirectionsService();
    directionService.route({
        origin: A_latlng,
        destination: B_latlng,
        travelMode: google.maps.TravelMode["DRIVING"]
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            // var leg = response.routes[0].legs[0];
            // {duration: leg.duration}
            callback(null, response);
        } else {
            callback(new Error("Can	not	find direction"));
        }
    });
}

var nameInput = $('#inputName');
var nameGroup = $('.name-group');
var nameHelp = $('.name-help-block');

function nameVal() {
    var regExp = /^[a-zA-Z-А-ЯЁЇІЄЇа-яіїєё']+$/;
    if (nameInput.val().match(regExp)) {
        nameGroup.removeClass('has-error');
        nameGroup.addClass('has-success');
        nameHelp.attr("style", "display:none;");
        return true;
    } else {
        nameGroup.removeClass('has-success');
        nameGroup.addClass('has-error');
        nameHelp.attr("style", "");
        return false;
    }
}


var phoneInput = $('#inputPhone');
var phoneGroup = $('.phone-group');
var phoneHelp = $('.phone-help-block');

function phoneVal() {
    var regExp = new RegExp("^(\\+38){0,1}0[0-9]{9}$");
    if (phoneInput.val().match(regExp)) {
        phoneGroup.removeClass('has-error');
        phoneGroup.addClass('has-success');
        phoneHelp.attr("style", "display:none;");
        return true;
    } else {
        phoneGroup.removeClass('has-success');
        phoneGroup.addClass('has-error');
        phoneHelp.attr("style", "");
        return false;
    }
}

var addressInput = $('#inputAddress');
var addressGroup = $('.address-group');
var addressHelp = $('.address-help-block');

function addressVal() {
    var address = addressInput.val();
    geocodeAddress(address, function (err, coordinates) {
        if (!err) {
            addressGroup.removeClass('has-error');
            addressGroup.addClass('has-success');
            addressHelp.attr("style", "display:none;");
            curAddress = address;

            return true;

        } else {
            $('.order-summary-address').html("<b>Адреса доставки:</b> невідома");
            addressGroup.removeClass('has-success');
            addressGroup.addClass('has-error');
            addressHelp.attr("style", "");
            console.log(curAddress);
            return false;
        }
    });
}


exports.initialiseOrder = initialiseOrder;