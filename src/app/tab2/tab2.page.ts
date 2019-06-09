import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, MarkerOptions, Marker, CameraPosition, Environment, Spherical, Polyline } from '@ionic-native/google-maps';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
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
  public distance = 0;
  private trackings = [];
  private staticMaps = [];
  private tmpPostions = [];
  private stacicMapsKey = "____STATIC_MAPS_API_KEY________";
  private staticMapsUrl = 'https://maps.googleapis.com/maps/api/staticmap?size=600x200&path=color:0x0000cc|weight:3|';


  // opcionces de tracking de posición
  private posOptions = {timeout: 3000, enableHighAccuracy: false};
  private options = {frequency: 3000, enableHighAccuracy: true, maximumAge: 0};
  private watch : any;
  private marker : Marker;
  private subs : any;
  private seconds = 0;
  private runClock : any;
  public elapsedTime = '00 : 00 : 00';
  public trackingIsStarted = false;

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
  private polyLine : any;

  constructor(private geolocation: Geolocation, private alertCtrl: AlertController, private storage: Storage, private router: Router, private diagnostic: Diagnostic) {}

  ionViewDidEnter() {
    this.loadMap();
    this.getStartLocation();
    this.loadTrackings();
  }

  ionViewDidLeave() {
    this.map.clear();
    this.getStartLocation();
    this.distance = 0;
    this.seconds = 0;
    this.elapsedTime = '00 : 00 : 00';
    this.trackingIsStarted = false;
    this.map.remove();
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
    this.tmpPostions = [];
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
   * Agrega marcador y posición inicial de polyline
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

    this.map.addPolyline({
      points: [{lat: latitude, lng: longitude}],
      'color' : '#488aff',
      'width': 8,
      'geodesic': true
    }).then((polyline: Polyline) => {
      this.polyLine = polyline;
    });
  }

  /**
   * Inicia trackeo de geolocalización, dibuja polyline, y mueve las cámaras y
   * marker de Google maps de acuerdo a dicha geolocalización.
   * @return
   */
  startTracking() {
    this.trackingIsStarted = true;
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
      this.tmpPostions.push(data.coords.latitude + ',' + data.coords.longitude);
      this.positions.push({lat: data.coords.latitude, lng: data.coords.longitude});
      console.log(data.coords.latitude+ "," + data.coords.longitude)

      if (this.positions.length > 1){
			     this.distance += Spherical.computeDistanceBetween(this.positions[this.positions.length-1], this.positions[this.positions.length-2]);
           console.log(this.distance);
		  };
      this.polyLine.setPoints(this.positions);
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
    this.displayAlert();
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
    * Lee los trackings ya existentes
    * @return [description]
    */
   loadTrackings () {
     this.storage.get('trackings').then((trackings) => {
       this.trackings = trackings.length?trackings:[];
     }).catch((error) => {
       console.log(error);
     });
   }

  /**
   * Procesa los datos obtenidos durante la carrera
   * @return
   */
  processData () {
    var tmpStaticMap = this.staticMapsUrl + this.tmpPostions.join('|') + "&key=" +this.stacicMapsKey;
    this.trackings.unshift({
      trackingDate: new Date(),
      distance: this.distance,
      elapsedTime: this.elapsedTime,
      geojson: this.geojson,
      staticMap: tmpStaticMap
    });
    this.storage.set('trackings', this.trackings);
    this.router.navigate(['/tabs/tab1']);
  }

  /**
   * Presenta alerta de carrera finalizada
   * @return
   */
  async displayAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Carrera finalizada',
      message: 'Felicidades, has finalizado tu carrera actual',
      buttons: [{
        text: 'Aceptar',
        handler: () => {
          this.processData();
          }
        }]
      });
      return await alert.present();
  }
}
