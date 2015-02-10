// create marker collection
Markers = new Meteor.Collection('markers');

Meteor.subscribe('markers');

Template.map.rendered = function() {
  L.Icon.Default.imagePath = 'packages/leaflet/images';

  var map = L.map('map', {
    doubleClickZoom: false
  }).setView([50.9438, 6.9403], 13);

  L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
      attribution: '<a href="http://content.stamen.com/dotspotting_toner_cartography_available_for_download">Stamen Toner</a>, <a href="http://www.openstreetmap.org/">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  }).addTo(map);

  map.on('dblclick', function(event) {
    document.getElementById("position").innerHTML = event.latlng.lat + ", "+event.latlng.lng;
    console.log(event.latlng)
    Markers.insert({latlng: event.latlng});
  });

  var query = Markers.find();
  query.observe({
    added: function(document) {
      var marker = L.marker(document.latlng).addTo(map)
        .on('click', function(event) {
          map.removeLayer(marker);
          Markers.remove({_id: document._id});
        });
    },
    removed: function(oldDocument) {
      layers = map._layers;
      var key, val;
      for (key in layers) {
        val = layers[key];
        if (val._latlng) {
          if (val._latlng.lat === oldDocument.latlng.lat && val._latlng.lng === oldDocument.latlng.lng) {
            map.removeLayer(val);
          }
        }
      }
    }
  });
};

var crd, data;

setInterval(function() {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  function success(pos) {
    crd = pos.coords;
    console.log(pos);
    var div = document.getElementById("position");
    div.innerHTML= crd.latitude+", " + crd.longitude +", "+ crd.accuracy;
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}, 30000);

localStorage.setItem('data', '');



if (Meteor.isClient) {
  UI.body.events({
    'click #record': function (e) {
      e.preventDefault();
      console.log("You pressed the record  button");
      var lpo, data, pos;
      setInterval(function() {
        Meteor.call("checkLpo", function(err, response) {
            lpo = EJSON.parse(response).data.current;
        });
        data = localStorage.getItem('data');
        pos = document.getElementById("position").innerHTML;
        if ((pos == "")||(pos=="no Position, pleas mark one")) {
          document.getElementById("position").innerHTML = "no Position, pleas mark one";
        }
        else {
          data +=new Date()+", "+ pos +", "+ lpo +"\r\n";
          localStorage.setItem('data', data);
        }
      }, 10000);
    }
  });
  UI.body.events({
    'click #save': function (e) {
      e.preventDefault();
      console.log("You pressed save the button");
        var blob = new Blob([localStorage.getItem('data')], {type: "text/plain;charset=utf-8"});
        var dt = new Date();
        var timestamp = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
        saveAs(blob, "FeinstaubDaten_"+timestamp+".txt");
    }
  });

}



