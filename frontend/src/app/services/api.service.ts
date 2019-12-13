import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  getTreeData(): Observable<any> {
    let apiURL = environment.API_URL + '/v1/tree';

    return this.http.get(apiURL)
      .pipe(map(res => res));
  }
}
