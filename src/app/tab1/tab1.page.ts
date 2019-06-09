import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public trackings = [];
  public geolocationPermisions = false;

  constructor(private storage: Storage, private diagnostic: Diagnostic) {}

  ionViewDidLoad()  {
    this.loadTrackings();
  }

  ionViewDidEnter()  {
    this.loadTrackings();
    this.requestPermisions();
    this.diagnostic.getLocationAuthorizationStatus()
      .then( (permisionResponse) => {
        this.geolocationPermisions = (permisionResponse == this.diagnostic.permissionStatus.GRANTED || permisionResponse == this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE);
      });
  }

  /**
   * Lee todos los trackings almacenados en la base de datos
   * @return
   */
  loadTrackings() {
    this.storage.get('trackings').then((trackings) => {
      this.trackings = trackings || [];
    });
    console.log(this.trackings);
  }

  /**
   * Solicita permisos de geolocalización
   * @return
   */
  requestPermisions () {
    this.diagnostic.requestLocationAuthorization()
    .then( (status) => {
      switch(status){
          case this.diagnostic.permissionStatus.NOT_REQUESTED:
              this.geolocationPermisions = false;
              break;
          case this.diagnostic.permissionStatus.DENIED:
              this.geolocationPermisions = false;
              break;
          case this.diagnostic.permissionStatus.GRANTED:
              this.geolocationPermisions = true;
              break;
          case this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
              this.geolocationPermisions = true;
              break;
      }
    }).catch( (error) => {
      console.error(error);
    });
  }
}
