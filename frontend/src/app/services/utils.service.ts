import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  env: String = '';
  message: string = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  durationInSeconds: number = 2;
  constructor(private _snackBar: MatSnackBar, private _httpClient: HttpClient) { 
    this.env =  environment.apiEndpoint;
  }

  linearSystem(data: any){
    return this._httpClient.post<any>(`${ this.env }methods`, data);
  }

  openSnackBarSuccesfull(text:string) {
    this.message = text;
    this._snackBar.open(this.message, 'X', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      panelClass: ['style-snackBarTrue'],
    });
  }
  openSnackBarSuccesfullWithDuration(text:string, duration: number) {
    this.message = text;
    this._snackBar.open(this.message, 'X', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: duration * 1000,
      panelClass: ['style-snackBarTrue'],
    });
  }

  openSnackBarError(text:string) {
    this.message = text;
    this._snackBar.open(this.message, 'X', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      panelClass: ['style-snackBarFalse'],
    });
  }

}
