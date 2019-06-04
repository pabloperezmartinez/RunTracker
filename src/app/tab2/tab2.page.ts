import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, MarkerOptions, Marker, CameraPosition, Environment, Spherical } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public map: GoogleMap;
  public element: HTMLElement;
  private longitude = 0;
  private latitude = 0;
  private distance = 0;

  // opcionces de tracking de posición
  private posOptions = {timeout: 10000, enableHighAccuracy: false};
  private options = {frequency: 3000, enableHighAccuracy: true, maximumAge: 0};
  private watch : any;
  private marker : Marker;
  private subs : any;
  private seconds = 0;
  private runClock : any;
  public elapsedTime = '00 : 00 : 00';

  //inicialización de objeto JSON donde se almacenarán las coordenadas durante el tracking
  private geojson = {
    type: 'feature',
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: []
    }
  };
  private positions = [];

  constructor(private geolocation: Geolocation) {}

  ionViewDidEnter() {
    this.loadMap();
    this.getStartLocation();
  }

  ionViewDidLeave() {
    this.map.clear();
    this.getStartLocation();
    this.distance = 0;
    this.seconds = 0;
    this.elapsedTime = '00 : 00 : 00';
  }

  /**
   * Carga el mapa de Google
   * @return
   */
  loadMap() {
    this.element = document.getElementById('map');
    this.map = GoogleMaps.create(this.element, {});
    this.map.one(GoogleMapsEvent.MAP_READY).then(
	     () => {
	       console.log('Map is ready!');
	     }
	  ).catch(error =>{
        console.log(error);
    });
  }

  /**
   * Obtiene localización inicial al cargar componente y mueve el foco del mapa a dicha posición y agrega el respectivo marcador
   * @return
   */
  getStartLocation() {
	   this.geolocation.getCurrentPosition(this.posOptions)
     .then((resp) => {
       this.latitude = resp.coords.latitude;
	     this.longitude = resp.coords.longitude;

       let position: CameraPosition<any> = {
         target: {
           lat: this.latitude,
           lng: this.longitude
	      },
	      zoom: 17,
	      tilt: 14
	    };

	    this.map.moveCamera(position);
      this.putMarker(this.latitude, this.longitude);
	   })
     .catch((error) => {
	     console.log('Error getting location', error.message);
	   });
  }

  /**
   * Agrega marcador
   * @param  latitude  Latitud
   * @param  longitude longitud
   * @return
   */
  putMarker(latitude, longitude) {
    let markerOptions: MarkerOptions = {
       position: {
         lat: latitude,
         lng: longitude
       },
       title: 'Yo',
       icon: {
           url: 'assets/common/run.png'
       }
    };
    this.map.addMarker(markerOptions).then((marker: Marker) => {
      this.marker = marker;
      console.log("ok");
    });
  }

  /**
   * Inicia trackeo de geolocalización, dibuja polyline, y mueve las cámaras y
   * marker de Google maps de acuerdo a dicha geolocalización.
   * @return
   */
  startTracking() {
    this.watch = this.geolocation.watchPosition();
    this.startTimer();
    this.subs = this.watch.subscribe((data) => {
      this.geojson.geometry.coordinates.push([data.coords.latitude, data.coords.longitude]);

      let cameraPosition: CameraPosition<any> = {
        target: {
          lat: data.coords.latitude,
          lng: data.coords.longitude
        },
        zoom: 18,
        tilt: 20
      };
      this.map.moveCamera(cameraPosition);

      this.positions.push({lat: data.coords.latitude, lng: data.coords.longitude});
      console.log(data.coords.latitude+ "," + data.coords.longitude)

      if (this.positions.length > 1){
			     this.distance += Spherical.computeDistanceBetween(this.positions[this.positions.length-1], this.positions[this.positions.length-2]);
           console.log(this.distance);
		  };

      this.map.addPolyline({
        points: this.positions,
        'color' : '#488aff',
        'width': 8,
        'geodesic': true
      });
      this.marker.setPosition({lat: data.coords.latitude, lng: data.coords.longitude});
    });
  }

  /**
   * Detiene todas las actividades de geolocalización y guarda datos trackeados
   * @return
   */
  stopTracking() {
    this.subs.unsubscribe();
    this.stopTimer();
  }

  /**
   * Inicializa cronómetro de carrera
   * @return
   */
  startTimer () {
    this.runClock = setInterval(() => {
	    this.elapsedTime = moment().hour(0).minute(0).second(this.seconds++).format('HH : mm : ss');
	  }, 1000)
  }

  /**
   * Detiene cronómetro
   * @return
   */
  stopTimer () {
	        clearInterval(this.runClock);
	 }

  /**
   * Procesa los datos obtenidos durante la carrera
   * @return
   */
  processData() {

  }
}
