// this variables are referencing to the html tags classes
const form = document.querySelector(".form");
const input = document.querySelector(".input-search");
const power = document.querySelector(".power");
const buttonPrev = document.querySelector(".btn-prev");
const buttonNext = document.querySelector(".btn-next");
const pokemonData = document.querySelector(".pokemon-data");
const pokemonInfo = document.querySelector(".pokemon-info");
const pokemonImage = document.querySelector(".pokemon-image");
const pokemonEvolutions = document.querySelector(".pokemon-evolutions");

//this function fetch pokemon evolutions from the api and combine it
const fetchPokemonEvolution = (url) => {
  return new Promise(async (resolve) => {
    let dbRes = await fetch(url);
    const db = await dbRes.json();

    let dbChain = await fetch(db.evolution_chain.url);
    const data = await dbChain.json();

    let api = `https://pokeapi.co/api/v2/pokemon/`;
    let evol = [];
    if (data.chain) {
      const e1 = fetch(`${api}${data.chain.species.name}/`);
      evol.push(e1);

      if (data.chain.evolves_to[0]) {
        const e2 = fetch(`${api}${data.chain.evolves_to[0].species.name}/`);
        evol.push(e2);

        if (data.chain.evolves_to[0].evolves_to[0]) {
          const e3 = fetch(
            `${api}${data.chain.evolves_to[0].evolves_to[0].species.name}/`
          );
          evol.push(e3);
        }
      }
    }

    Promise.all(evol)
      .then((res) => Promise.all(res.map((value) => value.json())))
      .then((dataList) => {
        const sprites = dataList.map((v) => v.sprites.front_default);
        const names = dataList.map((n) => n.name);
        resolve({ sprites, names });
      });
  });
};

// this function render all handle and all changes to pokemon
const renderPokemon = async (pokemon) => {
  const pokemonName = document.querySelector(".pokemon-name");
  const pokemonType = document.querySelector(".pokemon-types");
  const pokemonNumber = document.querySelector(".pokemon-number");
  const pokemonHeight = document.querySelector(".pokemon-height");
  const pokemonWeight = document.querySelector(".pokemon-weight");

  pokemonType.innerHTML = "";
  pokemonName.innerHTML = "Loading...";

  //fetching api
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
  const data = response.status == 200 && (await response?.json());

  if (data) {
    // fetching Evolutions
    const result = await fetchPokemonEvolution(data?.species?.url);

    pokemonImage.style.display = "flex";

    // assigning data to tags
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonHeight.innerHTML = data.height;
    pokemonWeight.innerHTML = data.weight;

    // assigning types into pokemon type row
    for (let i = 0; i < data.types.length; i++) {
      let p = document.createElement("p");
      p.className = "pokemon-type";
      p.innerHTML = `${data.types[i].type.name}, `;
      pokemonType.appendChild(p);
    }

    //clearing pokemonEvolutions before adding new fesh data
    pokemonEvolutions.innerHTML = "";

    //assigning pokemon image
    pokemonImage.src =
      data["sprites"]["versions"]["generation-v"]["black-white"]["animated"][
        "front_default"
      ];
    input.value = "";
    searchPokemon = data.id;

    //assigning types into pokemon type row
    for (let i = 0; i < result?.names?.length; i++) {
      let div = document.createElement("div");
      let img = document.createElement("img");
      let p = document.createElement("p");
      p.innerHTML = result.names[i];
      img.src = result.sprites[i];
      div.className = "evolution-box";
      div.appendChild(img);
      div.appendChild(p);
      pokemonEvolutions.appendChild(div);
    }
  } else {
    //if no data showing this error
    pokemonImage.style.display = "none";
    pokemonName.innerHTML = "Not found :c";
    pokemonNumber.innerHTML = "";
    pokemonEvolutions.innerHTML = "";
  }
};

//this always listen for clicks on submit button
form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPokemon(input.value.toLowerCase());
});

//this always listen for clicks on previous button
buttonPrev.addEventListener("click", () => {
  if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
  }
});

//this always listen for clicks on next button
buttonNext.addEventListener("click", () => {
  searchPokemon += 1;
  renderPokemon(searchPokemon);
});

//this always listen for clicks on power on off button
power.addEventListener("click", () => {
  //if power on if runs
  if (power.alt === "power-on") {
    power.alt = "power-off";
    power.src = "./images/off.png";
    pokemonImage.style.display = "none";
    pokemonData.style.display = "none";
    pokemonInfo.style.display = "none";
    pokemonEvolutions.style.display = "none";
  } else {
    //if power off else runs
    power.alt = "power-on";
    power.src = "./images/on.png";
    pokemonData.style.display = "flex";
    pokemonImage.style.display = "block";
    pokemonInfo.style.display = "block";
    pokemonEvolutions.style.display = "flex";
  }
});

// calling this function when page loads first time
let searchPokemon = 1;
renderPokemon(searchPokemon);
