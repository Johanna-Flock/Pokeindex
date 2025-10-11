function showPokemon (i) {
    const type1 = PokeDetails[i].types[1];
     document.getElementById("names").innerHTML += `
    <div class="pokecards ${PokeDetails[i].types[0].type.name}" onclick="showDetails(${i})">
    <h2 class="poke_names">${allPkms[i]}</h2>
    <img src="${PokeDetails[i].sprites.front_default}" class="img_size" alt="">
    <div class="poke_types">
    <img src="./img/${PokeDetails[i].types[0].type.name}.jpg" class="type_img_size" alt="">
    ${type1 ? '<img src="./img/' + type1.type.name + '.jpg" class="type_img_size" alt="">' : ''}
    </div>
    </div>
    `;
}

function renderButton() {
    let contenRef= document.getElementById("button")
    contenRef.innerHTML = ""; 
    document.getElementById("button").innerHTML += `
    <button class="btn" onclick="renderMorePokes()">Show more Pokémon</button>
    `
}

function getTemplatePokeDetails (i) {
    const type1 = PokeDetails[i].types[1];
    document.getElementById("blue_overlay").innerHTML +=`
    <div class="detail_pokemon border-${PokeDetails[i].types[0].type.name}" onclick="preventBubbling(event)">
    <header class="${PokeDetails[i].types[0].type.name} ">
    <h2 class="poke_names">${allPkms[i]}</h2>
    </header>
    <div class="background-dark w100 d_flex pad_btm">
    <img src="./img/${PokeDetails[i].types[0].type.name}.jpg" class="type_detail" alt="">
    <img src="${PokeDetails[i].sprites.other.home.front_default}" class="detail_img" alt="">
    ${type1 ? '<img src="./img/' + type1.type.name + '.jpg" class="type_detail" alt="">' : ''}
    </div>
    <div class="folder_bar">
    <img src="./img/left-arrow.png" class="arrow" onclick= "nextPokeLeft(${i},event)"> </img>
    <div class="btn-group" role="group" aria-label="Basic example">
    <button type="button" id="main" class="btn folder" onclick="renderMain(${i},event)">MAIN</button>
    <button type="button" id="stat" class="btn folder" onclick="renderStat(${i},event)">STAT</button>
    <button type="button" id="evo" class="btn folder" onclick="fetchEvoAndRender(${i},event)">EVO</button>
    </div>
    <img src="./img/right-arrow.png" class="arrow" onclick= "nextPokeRight(${i},event)"> </img>
    </div>
    `
}

function renderMainTemplate(i, abilities) {
    document.getElementById("blue_overlay").innerHTML +=`
    <div class="main_details" id="main_details"> 
    <ul class="list-group main_list">
    <li class="list-group-item main_row">height: ${PokeDetails[i].height} </li>
    <li class="list-group-item main_row">weight: ${PokeDetails[i].weight}</li>
    <li class="list-group-item main_row">abilities: ${abilities} </li>
    </ul>
    <img src="${PokeDetails[i].sprites.other.dream_world.front_default}" class="img_dream" alt="">
    </div>
    `
}

function renderStatTemplate(i) {
    document.getElementById("blue_overlay").innerHTML +=`
    <div class="stat_details"> 
    <ul class="list-group stat_list">
    <li class="list-group-item stat_row">hp:
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped" role="progressbar" style="width: ${PokeDetails[i].stats[0].base_stat}%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[0].base_stat}</div>
    </div> 
    </li>
    <li class="list-group-item stat_row">attack: 
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${PokeDetails[i].stats[1].base_stat}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[1].base_stat}</div>
    </div>
    </li>
    <li class="list-group-item stat_row">defense:
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: ${PokeDetails[i].stats[2].base_stat}%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[2].base_stat}</div>
    </div>
    </li>
    <li class="list-group-item stat_row">special-attack:
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped bg-warning" role="progressbar" style="width: ${PokeDetails[i].stats[3].base_stat}%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[3].base_stat}</div>
    </div>
    </li>
    <li class="list-group-item stat_row">special-defense:
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped bg-danger" role="progressbar" style="width: ${PokeDetails[i].stats[4].base_stat}%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[4].base_stat}</div>
    </div>
    </li>
    <li class="list-group-item stat_row">speed:
    <div class="progress stat_progress">
    <div class="progress-bar progress-bar-striped bg-dark" role="progressbar" style="width: ${PokeDetails[i].stats[5].base_stat}%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">${PokeDetails[i].stats[5].base_stat}</div>
    </div>
    </li>
    </ul>
    </div>
  `
}


function renderEvoTemplate() {
    document.getElementById("blue_overlay").innerHTML +=`
    <div class="evo_details"> 
    ${indexPokeEvo[0]=== -1? `<p class="name_style"> ${pokeEvolution[0]} </p>`:`</img> <img src="${PokeDetails[indexPokeEvo[0]].sprites.other.home.front_default}" class="detail_img" alt="">` }
    ${indexPokeEvo[1] && indexPokeEvo[1] !== -1 ? `<img src="./img/dot-arrow.png" class="evo_arrow"></img> <img src="${PokeDetails[indexPokeEvo[1]].sprites.other.home.front_default}" class="detail_img" alt="">`: "" }
    ${indexPokeEvo[2] && indexPokeEvo[2] !== -1? `<img src="./img/dot-arrow.png" class="evo_arrow"></img> <img src="${PokeDetails[indexPokeEvo[2]].sprites.other.home.front_default}" class="detail_img" alt="">`: "" }
    </div>
    `
}