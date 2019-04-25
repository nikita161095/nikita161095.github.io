var id_old;
function openbox(id){
  display = document.getElementById(id).style.display;
  if(id_old != null){
     document.getElementById(id_old).style.display='none';
  }
  id_old = id;
  if(display=='none'){
     document.getElementById(id).style.display='table-row';
  }else{
     document.getElementById(id).style.display='none';
  }
}

function sh_bus_num(){
  $("#times").html("");
  document.getElementById('tab').style.display='table';
}

  var a = [];
  var lat = [];
  var lon = [];
  var bus_number;

  function get_number(n){
    $("span").text(n + " bus route");
    document.getElementById('tab').style.display='none';
    bus_number = n;
    get_times('outbound');
  }

  function get_times(way) {
    myMap.geoObjects.removeAll();
    var route = bus_number + '/route/sequence/' + way;
      $.ajax({
          type: 'GET',
          url: 'https://api.tfl.gov.uk/line/' + route,
          dataType: 'json',
          success: function (data) {
              $("#times").html("");
              var output = "<div id=stoppoint>";
              for (var i in data.stopPointSequences) {
                  for (var k in data.stopPointSequences[i].stopPoint) {
                      a[k] = data.stopPointSequences[i].stopPoint[k].id;
                      lat[k] = data.stopPointSequences[i].stopPoint[k].lat;
                      lon[k] = data.stopPointSequences[i].stopPoint[k].lon;
                      pm_line(k, data.stopPointSequences[i].stopPoint[k].name);
                      output += "<div id=name_station onclick= get_stop(" + k + ")>" + data.stopPointSequences[i].stopPoint[k].name + "</div>";
                  }
              }
              output += "</div>";
              document.getElementById("times").innerHTML = output;
          }
      });
  }

  function get_stop(num){
    var num_id = a[num] + '/arrivals';
        $.ajax({
            type: 'GET',
            url: 'https://api.tfl.gov.uk/StopPoint/' + num_id,
            dataType: 'json',
            success: function (data) {
                $("#station").html("");
                var sorted_1 = data.sort(function (a, b) {
                   if (a.timeToStation > b.timeToStation) {
                       return 1;
                   }
                   if (a.timeToStation < b.timeToStation) {
                       return -1;
                   }
                   return 0;
                })

                var sorted_2 = data.sort(function (a, b) {
                   if (a.lineName > b.lineName) {
                       return 1;
                   }
                   if (a.lineName < b.lineName) {
                       return -1;
                   }
                   return 0;
                })

                var output = "<div>";
                output += "<p id=time_st_name>" + data[0].stationName + "</p>" + "<br>";
                pm(num, data[0].stationName);
                for (var i in data) {
                  time = parseInt(data[i].timeToStation / 60);
                  time < 1 ? time = "due" : time = time + " min";
                  if(i == 0 || data[i].lineName != data[i-1].lineName){
                    output += "<br>" + data[i].lineName  + " : " + " " + time;
                  }else {
                    output += " / " + time;
                  }
                }
                output += "</div>";
                output += "<button id=refresh class='button button-rounded button-highlight' onclick=get_stop(" + num + ")>refresh</button>"
                document.getElementById("station").innerHTML = output;
            }
        });
    }

    var myMap
    ymaps.ready(init);
    function init(num){
        myMap = new ymaps.Map("map", {
              center: [51.5074, 0.0278],
            zoom: 9
        });
    }

    function pm(num, s){
      myMap.geoObjects.removeAll();
      var myPlacemark = new ymaps.Placemark([lat[num], lon[num]], {
          hintContent: s,
          balloonContent: s
      });
      myMap.geoObjects.add(myPlacemark);
      myMap.setBounds(myMap.geoObjects.getBounds(), {checkZoomRange:true}).then(function(){
        if(myMap.getZoom() > 15) myMap.setZoom(15);
      });
    }

    function pm_line(k, s){
      var myPlacemark1 = new ymaps.Placemark([lat[k], lon[k]], {
          hintContent: s,
          balloonContent: s
      });
      myMap.geoObjects.add(myPlacemark1);
      myMap.setBounds(myMap.geoObjects.getBounds(), {checkZoomRange:true}).then(function(){
        if(myMap.getZoom() > 15) myMap.setZoom(15);
      });
    }
