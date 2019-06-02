import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, MarkerOptions, Marker, CameraPosition, Environment } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Component } from '@angular/core';

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
  private posOptions = {timeout: 10000, enableHighAccuracy: false};

  constructor(public googleMaps: GoogleMaps, private geolocation: Geolocation) {}

  ionViewDidEnter() {
    this.loadMap();
    this.getStartLocation();
  }

  /**
   * Carga el mapa de Google
   * @return
   */
  loadMap() {
    this.element = document.getElementById('map');
    this.map = this.googleMaps.create(this.element, {});
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
      console.log("ok");
    });
  }
}
