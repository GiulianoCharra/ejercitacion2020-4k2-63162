import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquiposService } from '../../services/equipos.service';
import { ModalDialogService } from '../../services/modal-dialog.service';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css']
})
export class EquiposComponent implements OnInit {
  EstadoRead: Boolean = false;
  Titulo = "Equipos";

  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };

  AccionABMC = "L"; // inicialmente inicia en el listado de articulos (buscar con parametros)
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };

  Lista: Equipo[] = [];
  SinBusquedasRealizadas = true;
  FormFiltro: FormGroup;
  FormReg: FormGroup;
  submitted = false;

  constructor(
    public formBuilder: FormBuilder,
    //private articulosService: MockArticulosService,
    private EquiposServicio: EquiposService,
    //private articulosFamiliasService: ArticulosFamiliasService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.Buscar();
    this.FormFiltro = this.formBuilder.group({});
    this.FormReg = this.formBuilder.group({
      NombreEquipo: [
        "",
        [Validators.required, Validators.minLength(2), Validators.maxLength(55)]
      ],
      IdEquipo: [
        null,
        [Validators.required, Validators.pattern("[0-9]{1,7}")]
      ],
      EquipoRanking: [
        null,
        [Validators.required, Validators.pattern("[0-9]{1,7}")]
      ]
    });
  }

  Agregar() {
    this.AccionABMC = "A";
    this.FormReg.reset();
    this.submitted = false;
    this.FormReg.markAsUntouched();
    this.FormReg.controls.IdEquipo.markAsPristine;
  }

  // Buscar segun los filtros, establecidos en FormReg
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.EquiposServicio.get().subscribe((res: Equipo[]) => {
      this.Lista = res;
    });
  }

  // Obtengo un registro especifico según el Id
  BuscarPorId(Emp, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.EquiposServicio.getById(Emp.IdEquipo).subscribe((res: any) => {
      this.FormReg.patchValue(res);
      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split("-");
      this.FormReg.controls.FechaFundacion.patchValue(
        arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
      );
      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Emp) {
    this.BuscarPorId(Emp, "C");
  }

  // comienza la modificacion, luego la confirma con el metodo Grabar
  Modificar(Emp) {
    this.EstadoRead = true;
    this.submitted = false;
    this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
    this.FormReg.controls.IdEquipo.disabled;
    this.BuscarPorId(Emp, "M");
  }

  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (this.AccionABMC == "A") {
      this.EquiposServicio.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert("Registro agregado correctamente.");
        this.Buscar();
      });
    } else {
      if ((this.AccionABMC = "M")) {
        // modificar put
        this.EquiposServicio
          .put(itemCopy.IdEquipo, itemCopy)
          .subscribe((res: any) => {
            this.Volver();
            this.modalDialogService.Alert("Registro modificado correctamente.");
            this.Buscar();
          });
      }
    }
  }

  // representa la baja logica
  Eliminar(Emp) {
    this.modalDialogService.Confirm(
      "Esta seguro de Eliminar este registro?",
      undefined,
      undefined,
      undefined,
      () =>
        this.EquiposServicio
          .delete(Emp.IdEquipo)
          .subscribe((res: any) => this.Buscar()),
      null
    );
  }

  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
    this.EstadoRead = false;
  }
}