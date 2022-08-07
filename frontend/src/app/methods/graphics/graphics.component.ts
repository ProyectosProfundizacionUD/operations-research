import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css'],
})
export class GraphicsComponent implements OnInit {
  //first form variables
  simplexType: string = 'default';
  variablesCount: number = 0;
  restrictionsCount: number = 0;
  //generated form variables
  showGeneratedFields: boolean = false;
  equations: any = [];
  variablesCountList: any = [];

  constructor(private _utils: UtilsService) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.equations = [];
      this.variablesCountList = [];
      let equationTemplate = '{';
      for (let j = 0; j < this.variablesCount; j++) {
        equationTemplate += `"X${j + 1}": 0,`;
        this.variablesCountList.push(`X${j + 1}`);
      }
      equationTemplate += '"op": "=",';
      equationTemplate += '"result": 0';
      equationTemplate += '}';

      console.log(JSON.parse(equationTemplate));

      for (let i = 0; i < this.restrictionsCount; i++) {
        this.equations.push(JSON.parse(equationTemplate));
      }

      this.showGeneratedFields = true;
    }
  }

  startSimplex() {
    console.log(this.equations);

    switch (this.simplexType) {
      case 'Minimización':
        this.Minimizacion();
        break;
      case 'Maximización':
        this.Maximizacion();
        break;
    }
  }

  Maximizacion() {
    console.log('maxi');
  }
  Minimizacion() {
    console.log('mini');
  }

  validations() {
    if (
      this.simplexType == 'default' ||
      this.variablesCount == 0 ||
      this.variablesCount == undefined ||
      this.restrictionsCount == 0 ||
      this.restrictionsCount == undefined
    ) {
      this._utils.openSnackBarError(
        'Debe ingresar correctamente todos los campos'
      );
      return false;
    }
    return true;
  }
}
