//Funcion para mostrar y ocultar el loader
window.onload = function() {
  // Muestra el loader cuando la ventana se carga
  showLoader();
  footer.style.display = "none";
  pag.style.display = "none";

  // Oculta el loader después de 4 segundos
  setTimeout(function() {
    hideLoader();
  }, 2500);

  // Carga la primera página de Pokémon
  setTimeout(function() {
    fetchAndRenderPage(currentPage);
    footer.style.display = "block";
    pag.style.display = "block";
  }, 3000);
};

// Mostrar el loader
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "block";
  }
}

// Ocultar el loader
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

const apiUrl = "https://pokeapi.co/api/v2/pokemon/";
let divPrincipal = document.getElementById("principal");
let currentPage = 1;
const elementsPerPage = 21; // Número de elementos por página
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const searchForm = document.getElementById("search-form");
const pokemonInput = document.getElementById("pokemon-input");
const divPokemon = document.getElementById("div-search");
const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
const pag = document.getElementById("pagination");
const footer = document.getElementById("footer");
let totalElements = 0; // Variable para almacenar el número total de elementos

// Función para cargar y mostrar una página específica de Pokémon
const fetchAndRenderPage = async page => {
  try {
    const offset = (page - 1) * elementsPerPage;
    const res = await fetch(
      `${apiUrl}?limit=${elementsPerPage}&offset=${offset}`
    );
    const data = await res.json();

    if (data && data.results) {
      const pokemons = data.results;
      totalElements = data.count;

      divPrincipal.innerHTML = "";

      pokemons.forEach(el => {
        const uri = el.url;
        const divider = uri.split("/");
        const pokemonId = divider[divider.length - 2];
        divPrincipal.innerHTML += `
            <div class="card m-3" style="width: 26rem;">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" class="card-img-top" alt="...">
              <div class="card-body">
                <h5 class="card-title"><b>${el.name.toUpperCase()}</b></h5>
                <p class="card-text">Pokedex: #${pokemonId}</p>        
                <div class="container text-center">
                  <!-- Button trigger modal -->
                  <button type="button" class="btn btn-primary" data-id="${pokemonId}" onclick="showPokemonDetails(${pokemonId})" data-toggle="modal" data-target="#exampleModal">
                    Details
                  </button>
                </div>
              </div>
            </div>        
        `;
      });

      // Llama a la función para actualizar el estado de los botones de paginación
      updatePaginationButtons();
    } else {
      divPrincipal.innerHTML += `
        <div class="alert alert-danger" role="alert">
          No valid data was found in the API response.
        </div>      
        `;
    }
  } catch (error) {
    console.log("There was an error: ", error);
  }
};

// Manejadores de eventos para los botones de paginación
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndRenderPage(currentPage);
    scrollToTop();
  }
});

nextButton.addEventListener("click", () => {
  const maxPage = Math.ceil(totalElements / elementsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    fetchAndRenderPage(currentPage);
    scrollToTop();
  }
});

// Función para actualizar el estado de los botones de paginación
function updatePaginationButtons() {
  const maxPage = Math.ceil(totalElements / elementsPerPage);
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === maxPage || maxPage === 0;
}

// Llama a esta función después de cargar y mostrar una nueva página
function afterPageLoad() {
  // Actualiza el estado de los botones de paginación
  updatePaginationButtons();
}

// Para volver a la parte superior de la ventana
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth" // Para hacer el desplazamiento suave
  });
}

//Busqueda de pokemon
searchForm.addEventListener("submit", async e => {
  e.preventDefault(); //Evitamos el comportamiento por defecto del formulario

  const searchType = pokemonInput.value.trim().toLowerCase();

  //Realizamos la busqueda
  const pokemonData = await buscarPokemon(searchType);

  if (!pokemonData) {
    Swal.fire({
      icon: "error",
      text: "0 results found"
    });
  } else {
    divPokemon.innerHTML = `    
    <div class="card m-3" style="width: 26rem;">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title"><b>${pokemonData.name.toUpperCase()}</b></h5>
        <p class="card-text">Pokedex: #${pokemonData.id}</p>  
        <p class="card-text">Abilities: ${pokemonData.abilities.join(", ")}</p>
        <p class="card-text">Types: ${pokemonData.types.join(", ")}</p>       
        <div class="container text-center">
          <!-- Button trigger modal -->
          <button type="button" class="btn btn-primary" data-id="${pokemonData.id}" onclick="showPokemonDetails(${pokemonData.id})" data-toggle="modal" data-target="#exampleModal">
            Details
          </button>
        </div>
      </div>
    </div>`;

    divPokemon.id = "divBusqueda";

    // Agrega el botón de cierre dinámicamente al div de búsqueda
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn btn-danger close-btn";
    closeButton.innerHTML = "x";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right = "0";
    closeButton.style.margin = "5px";

    // Agrega un manejador de eventos para cerrar el div al hacer clic en el botón de cierre
    closeButton.addEventListener("click", () => {
      divPokemon.innerHTML = ""; // Oculta el div de búsqueda
    });

    // Agrega el botón de cierre al div de búsqueda
    divPokemon.appendChild(closeButton);
    pokemonInput.value = "";
  }
});

async function buscarPokemon(term) {
  try {
    // Construir la URL de la API con el término de búsqueda (nombre o ID)
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${term.toLowerCase()}`;

    // Realizar una solicitud GET a la API
    const response = await fetch(apiUrl);

    // Verificar si la respuesta es exitosa (código de estado 200)
    if (response.status === 200) {
      // Parsear la respuesta JSON
      const data = await response.json();

      // Extraer la información relevante del Pokémon
      const pokemon = {
        name: data.name,
        id: data.id,
        abilities: data.abilities.map(ability => ability.ability.name),
        types: data.types.map(type => type.type.name),
        stats: data.stats.map(stat => ({
          name: stat.stat.name,
          base_stat: stat.base_stat
        }))
      };

      // Devolver los datos del Pokémon encontrado
      return pokemon;
    } else if (response.status === 404) {
      // Si el Pokémon no se encuentra, devolver null
      return null;
    } else {
      // Manejar otros códigos de estado de error
      throw new Error(`Request error: Code ${response.status}`);
    }
  } catch (error) {
    // Manejar errores de red u otros errores
    console.error(error);
    throw error;
  }
}

//Funcion para dibujar el cuerpo del modal con el detalle
async function showPokemonDetails(pokemonId) {
  const term = String(pokemonId);
  try {
    const pokemonData = await buscarPokemon(term);

    if (!pokemonData) {
      // Si no se encuentra el Pokémon, muestra un SweetAlert y no abre el modal
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No details found."
      });
      return;
    }

    // Si se encontraron detalles, abre el modal y muestra la información
    const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
    modal.show();

    const pokemonDetalle = document.getElementById("div-detalles");
    pokemonDetalle.innerHTML = `
      <h5>${pokemonData.name.toUpperCase()}</h5>
      <p>Pokedex: #${pokemonData.id}</p>
      <p><b>Abilities:</b> ${pokemonData.abilities.join(", ")}</p>
      <p><b>Types:</b> ${pokemonData.types.join(", ")}</p>
      <h6>Stats:</h6>       
        <table class="table table-striped">
        <thead>
          <tr>
            <th>Stat</th>
            <th>Base Stat</th>
          </tr>
        </thead>
        <tbody>
          ${pokemonData.stats
            .map(
              stat => `<tr>
                  <td>${stat.name}</td>
                  <td>${stat.base_stat}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    // Si ocurre un error al buscar los detalles, muestra un mensaje de error
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was a problem loading Pokémon details."
    });
  }
}
