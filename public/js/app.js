// alert("Hola");
import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");

  //limpiar alerrtas
  let alertas = document.querySelector(".alertas");

  if (alertas) {
    limpiarAlertas();
  }

  if (skills) {
    skills.addEventListener("click", agregarSkill);
    skillsSeleccionados();
  }

  const vacantesListado = document.querySelector(".panel-administracion");
  if (vacantesListado) {
    vacantesListado.addEventListener("click", accionesListado);
  }
});
const skills = new Set();
const agregarSkill = (e) => {
  if (e.target.tagName === "LI") {
    // console.log("si");
    if (e.target.classList.contains("activo")) {
      e.target.classList.remove("activo");
      skills.delete(e.target.textContent);
    } else {
      skills.add(e.target.textContent);
      e.target.classList.add("activo");
    }
  }
  //   console.log(skills);
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};

const skillsSeleccionados = () => {
  const seleccionadas = Array.from(
    document.querySelectorAll(".lista-conocimientos .activo")
  );
  seleccionadas.forEach((selecionada) => {
    skills.add(selecionada.textContent);
  });
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
  // console.log(seleccionadas);
};

const limpiarAlertas = () => {
  let alertas = document.querySelector(".alertas");
  const interval = setInterval(() => {
    console.log("limpiando..");
    if (alertas.children.length > 0) {
      alertas.removeChild(alertas.children[0]);
    } else if (alertas.children.length == 0) {
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
  }, 2000);
};

//eliminar vacantes
const accionesListado = (e) => {
  e.preventDefault();
  // console.log(e);

  if (e.target.dataset.eliminar) {
    // console.log(e.target.dataset.eliminar);
    // console.log("eliminado......");
    Swal.fire({
      title: "Confirmar eliminacion",
      text: "Una vez eliminada no se puede recuperar",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar",
      cancelButtonText: "No, Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

        axios
          .delete(url, { params: { url } })
          .then(function (respuesta) {
            if (respuesta.status === 200) {
              Swal.fire("Eliminado", respuesta.data, "success");

              console.log(e.target);
              e.target.parentElement.parentElement.parentElement.removeChild(
                e.target.parentElement.parentElement
              );
            }
          })
          .catch(() => {
            Swal.fire({
              type: "error",
              title: "Hubo un error",
              text: "No se pudo eliminar",
            });
          });

        // Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  } else if (e.target.tagName == "A") {
    window.location.href = e.target.href;
  }
};
