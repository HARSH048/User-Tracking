var map = L.map('map')
const socket = io();
var marker = {};
const routeId = generateRandomId();
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
  
  function success(pos, userId) {
    const crd = pos.coords;
    // const location = "harsh";
    const location = userId;

    if (marker[location]) {
      marker[location]
        .setLatLng([crd.latitude, crd.longitude])
        .setPopupContent(location)
        .update();
    } else {
      marker[location] = L.marker([crd.latitude, crd.longitude])
        .bindPopup("<b>" + location + "</b><br>")
        .openPopup()
        .addTo(map);
    }

    socket.emit("user-location", {
      latitude: crd.latitude,
      longitude: crd.longitude,
      locationName: location,
    });
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  function getLocation() {
    if (navigator.geolocation) {
      const id = generateRandomId();
      // navigator.geolocation.watchPosition(success, error, options);
      navigator.geolocation.watchPosition(
        function (pos) {
          success(pos, id); // Pass the random ID to the success function
        },
        error,
        options
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  function generateRandomId() {
    // Generate a random ID
    var randomId = Math.random().toString(36).substring(2, 9);

    // Pass the random ID to the tracking.js file
    return randomId;
  }

  let shareLocation = document.getElementById("share-button");
  shareLocation.onclick = function exec() {
    const keys=Object.keys(marker)
    keys.forEach(element => {
      map.removeLayer(marker[element]);
      delete marker[element]
    });
    getLocation();
  };

  socket.on("location", (arg) => {
    if (marker[arg.locationName]) {
      marker[arg.locationName]
        .setLatLng([arg.latitude, arg.longitude])
        .setPopupContent(arg.locationName)
        .update();
      // map.removeLayer(marker[arg.locationName])
    } else {
      marker[arg.locationName] = L.marker([arg.latitude, arg.longitude])
        .bindPopup("<b>" + arg.locationName + "</b><br>")
        .openPopup()
        .addTo(map);
    }
  });

  async function getAddress(address) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;

      let response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else response = await response.json();

      if (response && response.length > 0) {
        const lat = response[0].lat;
        const lang = response[0].lon;

        if (marker[routeId]) {
          marker[routeId]
            .setLatLng([lat, lang])
            .setPopupContent(address)
            .update();
        } else {
          marker[routeId] = L.marker([lat, lang])
            .addTo(map)
            .bindPopup(address)
            .openPopup();
        }
      } else {
        console.error("Address not found");
        alert("Address not found. Please enter a valid address.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "An error occurred while geocoding the address. Please try again later."
      );
    }
  }

  document
    .getElementById("searchButton")
    .addEventListener("click", function () {
      var address = document.getElementById("locationInput").value;
      if (address.trim() !== "") {
        getAddress(address);
      } else {
        alert("Please enter a location.");
      }
    });
  
  
  