let allPkms = []; //all Pokes, which are loaded

let currentPkms = []; //all Pokes, which are searched

let BASE_URL = `https://pokeapi.co/api/v2/pokemon/`

let PokeDetails = {}; //object with PokeDetails

let allResults = []; //all loaded pkms with char(0).lowerCase

let evoChain = {}; //object Evo-chain

let pokeEvolution = []; //array with current loaded poke-evolution; first is 0
let indexPokeEvo = []; //array with index in PokeDetails of current loaded poke-evolution

function init() {
  let path = `?limit=20&offset=0`
  getPokemons(path);
}

// fetch the namesOfPokes
async function getPokemons(path) {
  try {
    let response = await fetch(BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results //Hier wird das results array aus json in ein array hineingeladen
    allResults = allResults.concat(results); //das sind dann alle Pokemons 
    loadPokes(results)
    await pokeDetails(allResults)
    renderPokes();
  } catch (error) {
    console.error("Ups, loading has not worked - please try again", error)
  }
}

// char(0).upperCase for the loaded Pkms
function loadPokes(results) {
  for (let i = 0; i < results.length; i++) {
    let pokeName = results[i].name.charAt(0).toUpperCase() + results[i].name.slice(1);
    allPkms.push(pokeName) //array with names (char0 - upperCase)
  }
}

//fetch PokeDetails and add to object PokeDetails
async function pokeDetails(allResults) {
  const offset = Object.keys(PokeDetails).length
  for (let i = offset; i < allResults.length; i++) {
    const detailResponse = await fetch(allResults[i].url);
    const pokeDetail = await detailResponse.json();
    PokeDetails[i] = pokeDetail //Object
  }
}

// render all loaded Pokes
function renderPokes() {
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  for (let i = 0; i < allPkms.length; i++) {
    showPokemon(i)
  }
  renderButton()
}

//search and put to currentPkms
function filterAndShowNames(filterWord) {
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  if (filterWord.length < 3) { renderPokes() }
  else {
    currentPkms = allPkms.filter(name => name.toLowerCase().startsWith(filterWord.toLowerCase()));
    if (currentPkms.length === 0) {
      document.getElementById("feedback").classList.remove("d_none")
      document.getElementById("load_Pokes").classList.add("highlight");
    } else {
      renderPokesSearch();
    }
  }
}

//show found Pokes
function renderPokesSearch() {
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  for (let index = 0; index < currentPkms.length; index++) {
    const name = currentPkms[index]
    const i = allPkms.findIndex(p => p.toLowerCase() === name.toLowerCase());
    if (i === -1) continue; // if there`s no suitable index
    else showPokemon(i)
  }
  renderButton()
}

//load more Pokes
function renderMorePokes() {
  const offset = Object.keys(PokeDetails).length;
  let path = `?limit=20&offset=${offset}`
  getMorePokemons(path);
}

async function getMorePokemons(path) {
  document.getElementById('loading').classList.remove('d_none');
  document.getElementById("button").classList.add('d_none')
  try {
    let response = await fetch(BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results //Hier wird das results array aus json in ein array hineingeladen
    allResults = allResults.concat(results); //das sind dann alle Pokemons 
    loadPokes(results)
    await pokeDetails(allResults)
  } catch (error) {
    console.error("Ups, loading has not worked - please try again", error)
  } finally {
    checkFilter()
    document.getElementById('loading').classList.add('d_none');
    document.getElementById("button").classList.remove('d_none')
  }
}

//check filter
function checkFilter() {
  let input = document.getElementById("search").value;
  if (input.length >= 3) {
    currentPkms = allPkms.filter(name =>
      name.toLowerCase().startsWith(input.toLowerCase()));
    renderPokesSearch();
    document.getElementById("userfeedback").classList.remove("d_none")
    document.getElementById("load_Pokes").classList.add("highlight")
  } else {
    renderPokes();
  }
}

//render PokeDetails
function renderPokeDetails(i) {
  let abilities = getAbilities(i)
  getTemplatePokeDetails(i)
  renderMainTemplate(i, abilities)
  document.getElementById("main").classList.add("current_folder")
}

function getAbilities(i) {
  let abilitiesPoke = [];
  if (PokeDetails[i].abilities[0]) {
    abilitiesPoke.push(PokeDetails[i].abilities[0].ability.name)
  }
  if (PokeDetails[i].abilities[1]) {
    abilitiesPoke.push(PokeDetails[i].abilities[1].ability.name)
  }
  if (PokeDetails[i].abilities[2]) {
    abilitiesPoke.push(PokeDetails[i].abilities[2].ability.name)
  }
  return abilitiesPoke
}

//function to show main
function renderMain(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  getTemplatePokeDetails(i)
  let abilities = getAbilities(i)
  renderMainTemplate(i, abilities)
  document.getElementById("main").classList.add("current_folder")
}

//function to show stat
function renderStat(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  getTemplatePokeDetails(i)
  renderStatTemplate(i)
  document.getElementById("stat").classList.add("current_folder")
}

//functions for evolution
//main-function
async function fetchEvoAndRender(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  getTemplatePokeDetails(i)
  await fetchEvo(i)
  findIndexOfEvoPokes()
  renderEvoTemplate(i)
  document.getElementById("evo").classList.add("current_folder")
}

async function fetchEvo(i) {
  let name = allPkms[i].charAt(0).toLowerCase() + allPkms[i].slice(1)
  try {
    let Id = await getEvoChainId(name)
    await getEvoChain(Id)
  }
  catch (error) {
    console.error("Ups, loading the evolution-chain has failed - please try again", error)
  }
  getEvoArray();
}

async function getEvoChainId(name) {
  try {
    const evoChainIdResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
    const evoChainIdData = await evoChainIdResponse.json();
    const evoChainUrl = evoChainIdData.evolution_chain.url
    const getId = evoChainUrl.split('/').filter(Boolean);
    let evoChainId = getId[getId.length - 1]
    return evoChainId
  }
  catch (error) {
    console.error("Ups, loading the evolution-id has failed - please try again", error)
  }
}

async function getEvoChain(Id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${Id}/`)
    const evoChainData = await response.json();
    evoChain = evoChainData.chain
  }
  catch (error) {
    console.error("Ups, loading the evolution-chain has failed - please try again", error)
  }
}

function getEvoArray() {
  pokeEvolution = [];
  const firstPoke = evoChain.species.name
  pokeEvolution.push(firstPoke.charAt(0).toUpperCase() + firstPoke.slice(1))
  evoChain.evolves_to[0]?.species?.name ?
    pokeEvolution.push(
      evoChain.evolves_to[0].species.name.charAt(0).toUpperCase() +
      evoChain.evolves_to[0].species.name.slice(1)) : null;
  evoChain.evolves_to[0]?.evolves_to[0]?.species?.name ?
    pokeEvolution.push(
      evoChain.evolves_to[0].evolves_to[0].species.name.charAt(0).toUpperCase() +
      evoChain.evolves_to[0].evolves_to[0].species.name.slice(1)) : null;
}

//find index of EvoPokes
function findIndexOfEvoPokes() {
  indexPokeEvo = [];
  let iFirstPoke = allPkms.findIndex(p => p === pokeEvolution[0])
  indexPokeEvo.push(iFirstPoke)
  pokeEvolution[1] ? indexPokeEvo.push(allPkms.findIndex(p => p === pokeEvolution[1])) : null;
  pokeEvolution[2] ? indexPokeEvo.push(allPkms.findIndex(p => p === pokeEvolution[2])) : null;
}

//show nextPoke
function nextPokeRight(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  pokeEvolution = [];
  let input = document.getElementById("search").value;
  if (input.length >= 3) {
    checkSearchRight(i)
  }
  else {
    continuePokeRight(i)}
}

function checkSearchRight(i) {
  if (currentPkms.length ===1) { 
  document.getElementById("blue_overlay").innerHTML +=`
  <div id="feedback_details" class="userfeedback user"> There is only one Pokémon in your search! <strong> Search or load more Pokémons to view more details. </strong></div>
  ` 
  renderPokeDetails(i)
  return;}
  let currentName = allPkms[i]
  let currentI = currentPkms.indexOf(currentName)
  currentI++
  if (currentI < currentPkms.length) {
    let currentPoke = currentPkms[currentI]
    let index = allPkms.indexOf(currentPoke)
    renderPokeDetails(index)
  } else {
    let currentPoke = currentPkms[0]
    let index = allPkms.indexOf(currentPoke)
    renderPokeDetails(index)}
}

function continuePokeRight(i) {
  i++
  if (i < allPkms.length) { renderPokeDetails(i) }
  else {
    i = 0
    renderPokeDetails(i)
  }
}

function nextPokeLeft(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  pokeEvolution = [];
  let input = document.getElementById("search").value;
  if (input.length >= 3) {
    checkSearchLeft(i)
  }
  else {
    continuePokeLeft(i)
  }
}

function checkSearchLeft(i) {
  if (currentPkms.length ===1) { 
     document.getElementById("blue_overlay").innerHTML +=`
    <div id="feedback_details" class="userfeedback user"> There is only one Pokémon in your search! <strong> Search or load more Pokémons to view more details. </strong></div>
    `
    renderPokeDetails(i)
    return;}
  let currentName = allPkms[i]
  let currentI = currentPkms.indexOf(currentName)
  currentI--
  if (currentI === -1) {
    let currentPoke = currentPkms[currentPkms.length - 1]
    let index = allPkms.indexOf(currentPoke)
    renderPokeDetails(index)
  } else {
    let currentPoke = currentPkms[currentI]
    let index = allPkms.indexOf(currentPoke)
    renderPokeDetails(index)} }

function continuePokeLeft(i) {
  i--
  if (i === -1) {
    i = allPkms.length - 1
    renderPokeDetails(i)
  } else { renderPokeDetails(i) }
}

//prevent event bubbling + open/close
function preventBubbling(event) {
  event.stopPropagation()
}

function showDetails(i) {
  document.getElementById("names").classList.add("d_none")
  document.getElementById("button").classList.add("d_none")
  document.getElementById("blue_overlay").classList.remove("d_none")
  document.getElementById("body").classList.add("noscroll")
  renderPokeDetails(i)
}

function closeDialogue() {
  document.getElementById("blue_overlay").innerHTML = "";
  document.getElementById("blue_overlay").classList.add("d_none")
  document.getElementById("body").classList.remove("noscroll")
  document.getElementById("names").classList.remove("d_none")
  document.getElementById("button").classList.remove("d_none")
  pokeEvolution = [];
  indexPokeEvo = [];
}