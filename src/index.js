const Web3 = require('web3');
const contract = require('./build/PokeCatcher.json');

let web3;
let PokeCatcher;

const renderPokemons = async (page, pageSize) => {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }`
  );

  const { results } = await res.json();

  const container = document.getElementById('pokemons');
  container.innerHTML = '';

  const ownedQueries = [];
  const ownerQueries = [];
  for (let i = 0; i < results.length; i++) {
    ownedQueries.push(checkOwnership(results[i].name));
    ownerQueries.push(getOwner(results[i].name));

  }

  const ownedDictionary = await Promise.all(ownedQueries);
  const ownerNames = await Promise.all(ownerQueries);

  console.log(ownedDictionary);

  for (let i = 0; i < results.length; i++) {
    const imgIndex = (i + (page - 1) * pageSize + 1).toString();
    const pad = '000';
    const formattedIndex =
      pad.substring(0, pad.length - imgIndex.length) + imgIndex;

    container.insertAdjacentHTML(
      'beforeend',
      `
      <div class="col">
        <div class="card mt-4" style="width: 18rem;">
          <img 
            src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${formattedIndex}.png"
            class="card-img-top" 
            alt=${results[i].name}>
          <div class="card-body">
            <h5 class="card-title">${results[i].name}</h5>
            <button 
              ${ownedDictionary[i] ? 'disabled' : ''}
              id="${results[i].name}" 
              onclick="capture('${results[i].name}')" 
              class="btn btn-primary">
              ${ownedDictionary[i] ? 'Capturado' : 'Capturar'}
            </button>
            ${ownedDictionary[i] ? `
              <p>${ownerNames[i]}</p>
            ` : ''}
          </div>
        </div>
      </div>
    `
    );
  }
};

const connectWeb3 = async () => {
  let provider;

  //Browser modernos
  if(window.ethereum){
    provider = window.ethereum;
    await window.ethereum.enable();
  }else if(window.web3){
    provider = window.web3.givenProvider;
  }else {
    alert('Por favor instala Metamask');
  }

  web3 = new Web3(provider);
  
};

window.getOwner = async (pokemonName) => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts);
  const owner = await PokeCatcher.methods.getOwned(pokemonName).call({
    from: accounts[0],
  });
  return owner;
};

window.checkOwnership = async (pokemonName) => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts);
  const isOwned = await PokeCatcher.methods.isOwned(pokemonName).call({
    from: accounts[0],
  });
  return isOwned;
};

window.capture = async (pokemonName) => {
  const accounts = await web3.eth.getAccounts();
  const isOwned = await checkOwnership(pokemonName);
  if(isOwned){
    alert("Cuidado este pokemon tiene dueño");
  }else{
    await PokeCatcher.methods.capture(pokemonName).send({
      from: accounts[0],
    });
    alert('Ahora este pokemon es tuyo');
    const pokebutton = document.getElementById(pokemonName);
    pokebutton.disabled = true;

    pokebutton.innerText = 'Capturado';
  }
};

window.onload = async () => {
  await connectWeb3();
  PokeCatcher = new web3.eth.Contract(
    contract.abi,
    contract.networks[5777].address
  );

  console.log(PokeCatcher);

  // State variables
  let pokemonFilters = {
    page: 1,
    pageSize: 20,
  };

  // Initial render
  renderPokemons(pokemonFilters.page, pokemonFilters.pageSize);

  // Listeners
  const pokemonPage = document.getElementById('pokemon-page');
  pokemonPage.onchange = ({ target: { value } }) => {
    pokemonFilters.page = Number(value);
  };

  const updatePokemonsButton = document.getElementById('update-pokemons');
  updatePokemonsButton.addEventListener('click', () =>
    renderPokemons(pokemonFilters.page, pokemonFilters.pageSize)
  );
};
