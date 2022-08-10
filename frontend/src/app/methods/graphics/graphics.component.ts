import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css'],
})
export class GraphicsComponent implements OnInit {
  //first form variables
  simplexType: string = 'default'; //default
  variablesCount: number = 2;
  restrictionsCount: number = 0; //0
  operationEquation: any = {};
  restrictionPoints: any = [];

  showGeneratedFields: boolean = false;
  equations: any = [];
  variablesCountList: any = [];

  points: any = [];

  data: any = {};
  resultsMatrix: any = {}
  showResultsTable: boolean = false;
  selectedIndex: number = 0;


  constructor(private _utils: UtilsService) {}

  ngOnInit(): void {}

  generateFields() {
    if (this.validations()) {
      this.equations = [];
      this.variablesCountList = [];
      let operationEquationTemplate = '';
      let equationTemplate = '{';
      for (let j = 0; j < this.variablesCount; j++) {
        equationTemplate += `"X${j + 1}": 0,`;
        this.variablesCountList.push(`X${j + 1}`);
      }
      operationEquationTemplate = equationTemplate;
      operationEquationTemplate += `"type":"${this.simplexType.substring(
        0,
        3
      )} Z: "}`;
      equationTemplate += '"op": "=",';
      equationTemplate += '"result": 0';
      equationTemplate += '}';

      this.operationEquation = JSON.parse(operationEquationTemplate);
      for (let i = 0; i < this.restrictionsCount; i++) {
        this.equations.push(JSON.parse(equationTemplate));
      }

      this.showGeneratedFields = true;
    }
  }
  start() {
    this.restrictionPoints = []
    let x1 = 0, x2 = 0;

    for (let i = 0; i < this.equations.length; i++) {
      // * Despejamos x2
      x1 =
        this.equations[i].X1 != undefined && this.equations[i].X1 != 0
          ? this.equations[i].result / this.equations[i].X1
          : 0;
      // * Despejamos x2
      x2 =
        this.equations[i].X2 != undefined && this.equations[i].X2 != 0
          ? this.equations[i].result / this.equations[i].X2
          : 0;
      this.restrictionPoints.push([x1, x2]);
    }
    console.log("puntos para graficar");    
    console.log(this.restrictionPoints);

    console.log("equations");
    console.log(this.equations);

    console.log("operationEquation");
    console.log(this.operationEquation);   

    this.data.type = this.simplexType;
    this.data.restrictions = this.equations;
    this.data.equation = this.operationEquation;
    
    this._utils.linearSystem(this.data).subscribe(
      (res) =>{
        this.resultsMatrix = res;
        this.showResultsTable = true;
        console.log(res);
        
        this._utils.openSnackBarSuccesfull("Proceso exitoso!");
      },
      (err) => this._utils.openSnackBarError("Ha ocurrido un error con el proceso")
    )
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
