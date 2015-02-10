// marker collection
Markers = new Meteor.Collection('markers');
Meteor.publish("markers", function () {
  return Markers.find();
});

var connectHandler = WebApp.connectHandlers;

 Meteor.methods({
    checkLpo: function () {

        this.unblock();
        var data;
        var res = HTTP.call("GET", "http://192.168.4.1/");
        return res.content;
    }
});

