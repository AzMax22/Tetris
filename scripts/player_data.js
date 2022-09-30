function loadName(){
    document.getElementById('name_player').textContent = localStorage.getItem('username');
}

function addScore(name, score){
    let scores = JSON.parse( localStorage.getItem('scores'));

    console.log(scores)
    if (scores == null) scores = {};
    console.log(scores)
    scores[name] = score;
    console.log(scores)

    localStorage["scores"] = JSON.stringify(scores);
}
