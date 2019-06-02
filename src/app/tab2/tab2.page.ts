import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, CameraPosition, Environment } from '@ionic-native/google-maps';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public map: GoogleMap;
  public element: HTMLElement;
  private posOptions = {timeout: 10000, enableHighAccuracy: false};
  private longitude = 0;
  private latitude = 0;

  constructor(public googleMaps: GoogleMaps) {}

  ionViewDidEnter() {
    this.loadMap();
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
	       // Now you can add elements to the map like the marker
	     }
	  ).catch(error =>{
        console.log(error);
    });
  }
}
