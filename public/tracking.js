var map = L.map('map')
const socket = io();
var marker = {};
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.setView([20.5937, 78.9629], 5);

var popup=L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);


const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  
  function success(pos,userId) {
    const crd = pos.coords;
    // const location = "harsh";
    const location=userId

    // if(marker){
    //   map.removeLayer(marker)
    // }

    if(marker[location]){
      marker[location].setLatLng([crd.latitude,crd.longitude]).setPopupContent(location).update();
    }
    else
    {
       marker[location] = L.marker([crd.latitude,crd.longitude]).bindPopup("<b>"+location+"</b><br>").openPopup().addTo(map);
    }

    socket.emit("user-location",{latitude:crd.latitude,longitude:crd.longitude,locationName:location})
  }
  
  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  function getLocation(){
    if(navigator.geolocation){
      const id=generateRandomId()
        // navigator.geolocation.watchPosition(success, error, options);
        navigator.geolocation.watchPosition(function(pos) {
          success(pos, id); // Pass the random ID to the success function
      }, error, options);
    }
    else{
        console.log("Geolocation is not supported by this browser.")
    }
  }

  function generateRandomId() {
    // Generate a random ID
    var randomId = Math.random().toString(36).substring(2, 9);
    
    // Pass the random ID to the tracking.js file
    return randomId;
}


  let shareLocation=document.getElementById("share-button")
    shareLocation.onclick=function exec(){

    getLocation()
  }

  socket.on("location",(arg)=>{

    if(marker[arg.locationName]){
      console.log("hi")
      console.log(arg)
      marker[arg.locationName].setLatLng([arg.latitude,arg.longitude]).setPopupContent(arg.locationName).update();
     // map.removeLayer(marker[arg.locationName])
    }
    else
    {
      marker[arg.locationName] = L.marker([arg.latitude,arg.longitude]).bindPopup("<b>"+arg.locationName+"</b><br>").openPopup().addTo(map)
    }
   
  })
  
  
  