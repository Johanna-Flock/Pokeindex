let allPkms = []; 

let currentPkms = []; 

let BASE_URL = `https://pokeapi.co/api/v2/pokemon/`

let PokeDetails = {}; 

let allResults = []; 

let evoChain = {}; 

let pokeEvolution = []; 
let indexPokeEvo = []; 

function init() {
  let path = `?limit=20&offset=0`
  getPokemons(path);
}

async function getPokemons(path) {
  try {
    let response = await fetch(BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results 
    allResults = allResults.concat(results); 
    loadPokes(results)
    await pokeDetails(allResults)
    renderPokes();
  } catch (error) {
    console.error("Ups, loading has not worked - please try again", error)
  }
}

function loadPokes(results) {
  for (let i = 0; i < results.length; i++) {
    let pokeName = results[i].name.charAt(0).toUpperCase() + results[i].name.slice(1);
    allPkms.push(pokeName) 
  }
}

async function pokeDetails(allResults) {
  const offset = Object.keys(PokeDetails).length
  for (let i = offset; i < allResults.length; i++) {
    const detailResponse = await fetch(allResults[i].url);
    const pokeDetail = await detailResponse.json();
    PokeDetails[i] = pokeDetail 
  }
}

function renderPokes() {
  document.getElementById("button").innerHTML=""; 
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  for (let i = 0; i < allPkms.length; i++) {
    const type1 = PokeDetails[i].types[1];
    showPokemon(i,type1)
  }
  renderButton()
}

function filterAndShowNames(filterWord) {
  document.getElementById("button").innerHTML=""; 
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  if (filterWord.length < 3) { renderPokes() }
  else {
    currentPkms = allPkms.filter(name => name.toLowerCase().startsWith(filterWord.toLowerCase()));
    if (currentPkms.length === 0) {
      renderButton()
      document.getElementById("feedback2").classList.remove("d_none")
      document.getElementById("load_Pokes").classList.add("d_none");
    } else {
      renderPokesSearch();
    }
  }
}

function renderPokesSearch() {
  let contentRef = document.getElementById("names")
  contentRef.innerHTML = "";
  for (let index = 0; index < currentPkms.length; index++) {
    const name = currentPkms[index]
    const i = allPkms.findIndex(p => p.toLowerCase() === name.toLowerCase());
    if (i === -1) continue; 
    else {
    const type1 = PokeDetails[i].types[1];
    showPokemon(i,type1)}
  }
}

function renderMorePokes() {
  const offset = Object.keys(PokeDetails).length;
  let path = `?limit=20&offset=${offset}`
  getMorePokemons(path);
}

async function getMorePokemons(path) {
 toggleUserFeedback ()
  try {
    let response = await fetch(BASE_URL + path)
    let responseAsJson = await response.json()
    let results = responseAsJson.results 
    allResults = allResults.concat(results); 
    loadPokes(results)
    await pokeDetails(allResults)
  } catch (error) {
    console.error("Ups, loading has not worked - please try again", error)
  } finally {
    checkFilter()
   toggleUserFeedback ()
  }
}

function toggleUserFeedback () {
document.getElementById('loading').classList.toggle('d_none');
document.getElementById("button").classList.toggle('d_none')
}

function checkFilter() {
  let input = document.getElementById("search").value;
  if (input.length >= 3) {
    currentPkms = allPkms.filter(name =>
      name.toLowerCase().startsWith(input.toLowerCase()));
    renderPokesSearch();
    document.getElementById("userfeedback").classList.remove("d_none")
    document.getElementById("load_Pokes").classList.add("d_none")
  } else {
    renderPokes();
  }
}

function renderPokeDetails(i) {
  let abilities = getAbilities(i)
  const type1 = PokeDetails[i].types[1];
  getTemplatePokeDetails(i,type1)
  renderMainTemplate(i, abilities)
  document.getElementById("main").classList.add("current_folder")
}

function getAbilities(i) {
  let abilitiesPoke = [];
  if (PokeDetails[i].abilities[0]) abilitiesPoke.push(PokeDetails[i].abilities[0].ability.name)
  if (PokeDetails[i].abilities[1]) abilitiesPoke.push(PokeDetails[i].abilities[1].ability.name)
  if (PokeDetails[i].abilities[2]) abilitiesPoke.push(PokeDetails[i].abilities[2].ability.name)
  return abilitiesPoke
}

function renderMain(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  const type1 = PokeDetails[i].types[1];
  getTemplatePokeDetails(i,type1)
  let abilities = getAbilities(i)
  renderMainTemplate(i, abilities)
  document.getElementById("main").classList.add("current_folder")
}

function renderStat(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
   const type1 = PokeDetails[i].types[1];
  getTemplatePokeDetails(i,type1)
  renderStatTemplate(i)
  document.getElementById("stat").classList.add("current_folder")
}

async function fetchEvoAndRender(i, event) {
  preventBubbling(event)
  document.getElementById("blue_overlay").innerHTML = "";
  const type1 = PokeDetails[i].types[1];
  getTemplatePokeDetails(i,type1)
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
    console.error("Ups, loading the evolution-chain has failed - please try again", error)}
  getEvoArray();
}

async function getEvoChainId(name) {
  try {
    const evoChainIdResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
    const evoChainIdData = await evoChainIdResponse.json();
    const evoChainUrl = evoChainIdData.evolution_chain.url
    const getId = evoChainUrl.split('/').filter(Boolean);
    let evoChainId = getId[getId.length - 1]
    return evoChainId}
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

function findIndexOfEvoPokes() {
  indexPokeEvo = [];
  let iFirstPoke = allPkms.findIndex(p => p === pokeEvolution[0])
  indexPokeEvo.push(iFirstPoke)
  pokeEvolution[1] ? indexPokeEvo.push(allPkms.findIndex(p => p === pokeEvolution[1])) : null;
  pokeEvolution[2] ? indexPokeEvo.push(allPkms.findIndex(p => p === pokeEvolution[2])) : null;
}

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
  userFeedback()
  renderPokeDetails(i)
  return;
  }
  followUpSearchRight(i)
}

function followUpSearchRight(i) {
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
    userFeedback()
    renderPokeDetails(i)
    return;}
    followUpSearchLeft(i)
  }

function followUpSearchLeft(i) {
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
    renderPokeDetails(index)} 
}

function continuePokeLeft(i) {
  i--
  if (i === -1) {
    i = allPkms.length - 1
    renderPokeDetails(i)
  } else { renderPokeDetails(i) }
}

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